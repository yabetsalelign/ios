'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Customer,
  CustomerFinancialSummary,
  CustomerLedgerEntry,
  InventoryTransaction,
  Product,
  ProductFormInput,
  User,
} from '../types';
import {
  calculateCustomerFinancials,
  RawLedgerTransaction,
} from '../domain/calculations/ledger';
import {
  calculateStockAfterPurchase,
  calculateStockAfterSale,
} from '../domain/calculations/inventory';
import {
  calculateSaleOutstanding,
  calculateSaleSubtotal,
} from '../domain/calculations/sales';
import {
  CustomerPaymentFormInput,
  PurchaseFormInput,
  SaleFormInput,
  validateCustomerPayment,
  validateProduct,
  validatePurchase,
  validateSale,
} from '../domain/validation/validators';
import { generateTransactionReference } from '../domain/transactions/referenceGenerator';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { ProfileRow } from '../lib/supabase/types';

// Blank user — auth state is unauthenticated until Supabase session is established
const BLANK_USER: User = { id: '', name: '', email: '', role: 'warehouse', avatarUrl: '' };

export type ActiveTab = 'home' | 'inventory' | 'customers' | 'reports';
export type ActiveModal = 'sale' | 'purchase' | 'payment' | 'add_product' | null;

export interface TransactionSuccessFeedback {
  type: 'sale' | 'payment' | 'purchase';
  reference: string;
  title: string;
  details: string[];
}

export interface ToastNotification {
  id: string;
  type: 'sale' | 'payment' | 'purchase' | 'info';
  title: string;
  message: string;
}

interface StockFlowContextValue {
  currentUser: User;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isFirstTimeSetup: boolean;
  invitedEmail: string | null;
  completeFirstTimeSetup: (password: string) => Promise<{ success: boolean; error?: string }>;
  requestAccountSetup: (email: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void> | void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;

  // Modals & Navigation
  isQuickActionOpen: boolean;
  setIsQuickActionOpen: (open: boolean) => void;
  activeModal: ActiveModal;
  setActiveModal: (modal: ActiveModal) => void;
  preselectedCustomerId: string | null;
  setPreselectedCustomerId: (id: string | null) => void;
  preselectedProductId: string | null;
  setPreselectedProductId: (id: string | null) => void;

  // Transaction Feedback (Lightweight Non-blocking Toasts)
  toast: ToastNotification | null;
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  dismissToast: () => void;
  successFeedback: TransactionSuccessFeedback | null;
  setSuccessFeedback: (feedback: TransactionSuccessFeedback | null) => void;

  // Data & Calculations
  products: Product[];
  customers: Customer[];
  rawTransactions: RawLedgerTransaction[];
  inventoryTransactions: InventoryTransaction[];
  getCustomerSummary: (customerId: string) => CustomerFinancialSummary;
  getCustomerLedgerData: (customerId: string) => {
    entries: CustomerLedgerEntry[];
    summary: CustomerFinancialSummary;
  };
  metrics: {
    totalInventoryValueETB: number;
    totalCustomerCreditETB: number;
    inStockCartons: number;
    incomingCartons: number;
    outgoingCartons: number;
    lowStockCount: number;
  };

  // Transaction Actions
  executeSale: (input: SaleFormInput) => Promise<{ success: boolean; reference?: string; validationErrors?: Record<string, string> }>;
  executePayment: (input: CustomerPaymentFormInput) => Promise<{ success: boolean; reference?: string; validationErrors?: Record<string, string> }>;
  executePurchase: (input: PurchaseFormInput) => Promise<{ success: boolean; reference?: string; validationErrors?: Record<string, string> }>;

  // Customer Actions
  saveCustomer: (input: {
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) => Promise<{ success: boolean; customer?: Customer; validationErrors?: Record<string, string> }>;

  // Product Actions
  saveProduct: (
    input: ProductFormInput,
    productId?: string
  ) => Promise<{ success: boolean; product?: Product; validationErrors?: Record<string, string> }>;
}

const StockFlowContext = createContext<StockFlowContextValue | undefined>(undefined);

export function StockFlowProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(BLANK_USER);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState<boolean>(false);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<string | null>(null);
  const [preselectedProductId, setPreselectedProductId] = useState<string | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<TransactionSuccessFeedback | null>(null);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = useCallback((notification: Omit<ToastNotification, 'id'>) => {
    setToast({ ...notification, id: `toast-${Date.now()}` });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Runtime data — starts empty; populated from Supabase after authentication
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rawTransactions, setRawTransactions] = useState<RawLedgerTransaction[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);

  // ==========================================
  // LOAD REAL DATA FROM SUPABASE
  // ==========================================
  const loadSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      // 1. Products — stock levels come from v_product_stock view
      const [{ data: productRows }, { data: stockRows }] = await Promise.all([
        (supabase.from('products') as any).select(
          'id, name, sku, barcode, description, category, image_url, pieces_per_carton, selling_price_per_carton, cost_per_carton, low_stock_threshold_cartons, created_at'
        ).order('created_at', { ascending: false }),
        (supabase.from('v_product_stock') as any).select('product_id, current_stock_cartons'),
      ]);

      if (productRows) {
        const stockMap = new Map<string, number>();
        (stockRows ?? []).forEach((s: any) => stockMap.set(s.product_id, Number(s.current_stock_cartons)));
        const mapped: Product[] = productRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          sku: r.sku,
          barcode: r.barcode ?? undefined,
          description: r.description ?? undefined,
          category: r.category ?? 'General',
          image: r.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80',
          currentStockCartons: stockMap.get(r.id) ?? 0,
          unit: 'carton' as const,
          piecesPerCarton: r.pieces_per_carton ?? undefined,
          sellingPricePerCarton: Number(r.selling_price_per_carton),
          costPerCarton: Number(r.cost_per_carton),
          lowStockThresholdCartons: r.low_stock_threshold_cartons ?? 10,
          createdAt: r.created_at,
        }));
        setProducts(mapped);
      }

      // 2. Customers
      const { data: customerRows } = await (supabase.from('customers') as any)
        .select('id, name, phone, address, notes, created_at')
        .order('name', { ascending: true });

      if (customerRows) {
        const mapped: Customer[] = customerRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          phone: r.phone ?? '',
          address: r.address ?? '',
          notes: r.notes ?? undefined,
          createdAt: r.created_at,
        }));
        setCustomers(mapped);
      }

      // 3. Ledger transactions (for customer financial summaries)
      const { data: ledgerRows } = await (supabase.from('ledger_transactions') as any)
        .select('id, customer_id, reference_number, type, description, amount, payment_method, created_at')
        .order('created_at', { ascending: true });

      if (ledgerRows) {
        const mapped: RawLedgerTransaction[] = ledgerRows.map((r: any) => ({
          id: r.id,
          customerId: r.customer_id,
          date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          referenceNumber: r.reference_number,
          type: r.type as 'Sale' | 'Payment' | 'Adjustment',
          description: r.description ?? '',
          amount: Number(r.amount),
          paymentMethod: r.payment_method ?? undefined,
          createdAt: r.created_at,
        }));
        setRawTransactions(mapped);
      }

      // 4. Inventory transactions (for logbook / activity feed)
      const { data: invRows } = await (supabase.from('inventory_transactions') as any)
        .select('id, reference_number, product_id, type, quantity_cartons, related_sale_id, related_purchase_id, created_at')
        .order('created_at', { ascending: false })
        .limit(200);

      if (invRows) {
        // Build a name lookup from already-loaded products
        // (products state may not be updated yet in closure; use productRows directly)
        const nameMap = new Map<string, string>();
        (productRows ?? []).forEach((p: any) => nameMap.set(p.id, p.name));

        const now = Date.now();
        const mapped: InventoryTransaction[] = invRows.map((r: any) => {
          const diff = now - new Date(r.created_at).getTime();
          const minutes = Math.floor(diff / 60000);
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);
          const timeAgo = days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : minutes > 0 ? `${minutes}m ago` : 'Just now';
          return {
            id: r.id,
            referenceNumber: r.reference_number,
            productId: r.product_id,
            productName: nameMap.get(r.product_id) ?? r.product_id,
            type: r.type as 'purchase' | 'sale' | 'adjustment',
            quantityCartons: Number(r.quantity_cartons),
            relatedSaleId: r.related_sale_id ?? undefined,
            relatedPurchaseId: r.related_purchase_id ?? undefined,
            timeAgo,
            createdAt: r.created_at,
          };
        });
        setInventoryTransactions(mapped);
      }
    } catch (err) {
      console.error('Failed to load Supabase runtime data:', err);
    }
  }, []);

  // ==========================================
  // AUTH STATE HYDRATION
  // ==========================================
  useEffect(() => {
    let isMounted = true;

    const applyProfile = (profile: ProfileRow, email: string) => {
      if (!isMounted) return;
      setCurrentUser({
        id: profile.id,
        name: profile.full_name,
        email,
        role: profile.role,
        avatarUrl: profile.avatar_url || (profile.role === 'manager'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80'),
      });
      setIsAuthenticated(true);
    };

    const checkIsInviteOrRecoveryUrl = () => {
      if (typeof window === 'undefined') return false;
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      return (
        hash.includes('type=invite') ||
        hash.includes('type=recovery') ||
        search.includes('type=invite') ||
        search.includes('type=recovery')
      );
    };

    const initAuth = async () => {
      try {
        const isInvite = checkIsInviteOrRecoveryUrl();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error fetching Supabase session:', sessionError);
        }
        if (session?.user && isMounted) {
          if (isInvite) {
            setIsFirstTimeSetup(true);
            setInvitedEmail(session.user.email || null);
          } else {
            const { data: profile, error: profileError } = (await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()) as { data: ProfileRow | null; error: any };

            if (profile) {
              applyProfile(profile, session.user.email || '');
              await loadSupabaseData();
            } else if (profileError) {
              console.error('Error loading profile during session restore:', profileError);
            }
          }
        }
      } catch (err) {
        console.error('Error during Supabase session initialization:', err);
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && checkIsInviteOrRecoveryUrl())) {
        if (session?.user) {
          setIsFirstTimeSetup(true);
          setInvitedEmail(session.user.email || null);
        }
      } else if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        if (!isFirstTimeSetup) {
          try {
            const { data: profile } = (await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()) as { data: ProfileRow | null; error: any };

            if (profile) {
              applyProfile(profile, session.user.email || '');
              await loadSupabaseData();
            }
          } catch (err) {
            console.error('Failed to load profile on auth change:', err);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear all runtime data on sign-out
        setIsAuthenticated(false);
        setIsFirstTimeSetup(false);
        setInvitedEmail(null);
        setCurrentUser(BLANK_USER);
        setProducts([]);
        setCustomers([]);
        setRawTransactions([]);
        setInventoryTransactions([]);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isFirstTimeSetup, loadSupabaseData]);

  const completeFirstTimeSetup = async (password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanPassword = password.trim();
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: cleanPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Failed to set password.' };
      }

      // Clear tokens from URL bar cleanly
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Fetch profile to verify role from database
      const { data: profile } = (await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()) as { data: ProfileRow | null; error: any };

      if (profile) {
        setCurrentUser({
          id: profile.id,
          name: profile.full_name,
          email: data.user.email || '',
          role: profile.role,
          avatarUrl: profile.avatar_url || (profile.role === 'manager'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80'),
        });
      }

      setIsFirstTimeSetup(false);
      setIsAuthenticated(true);
      setActiveTab('home');
      await loadSupabaseData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error completing setup' };
    }
  };

  // ==========================================
  // ACCOUNT SETUP / RECOVERY (existing Auth account)
  // ==========================================
  // Sends a Supabase password-reset email so an existing Auth account can
  // establish or replace its password without creating a duplicate user.
  //
  // Security guarantees:
  //   - Never creates a second Auth user for an already-registered email.
  //   - Always returns generic success copy to avoid account-enumeration leaks.
  //   - Does not accept, store, or forward a role value.
  //   - The recovery link and token are validated entirely by Supabase Auth.
  //   - The redirect URL must match an allowed redirect configured in Supabase.
  const requestAccountSetup = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }

    try {
      // resetPasswordForEmail works for existing accounts and sends a secure
      // recovery link. For non-existent emails Supabase silently no-ops,
      // so the response cannot be used to enumerate accounts.
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        // Redirect back to the same app root so onAuthStateChange can detect
        // the PASSWORD_RECOVERY event and show the Create Password screen.
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      });

      if (error) {
        // Surface only unexpected/transport errors; do not expose "user not found"
        // messages from Supabase as they would be an enumeration oracle.
        console.error('requestAccountSetup error:', error);
      }

      // Always return a generic success so the UI can show a safe message.
      // Whether the email exists or not, the user-facing copy is identical.
      return { success: true };
    } catch (err: any) {
      console.error('requestAccountSetup unexpected error:', err);
      // Do not expose internal details to the caller.
      return { success: true };
    }
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password?.trim() || '';

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Authentication failed: No user returned.' };
      }

      // Role comes ONLY from profiles.role in Supabase
      const { data: profile, error: profileErr } = (await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()) as { data: ProfileRow | null; error: any };

      if (profileErr || !profile) {
        return { success: false, error: 'User profile not found in database.' };
      }

      setCurrentUser({
        id: profile.id,
        name: profile.full_name,
        email: data.user.email || cleanEmail,
        role: profile.role,
        avatarUrl: profile.avatar_url || (profile.role === 'manager'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80'),
      });
      setIsAuthenticated(true);
      setActiveTab('home');
      setSelectedCustomerId(null);
      setSelectedProductId(null);
      // Load real Supabase data immediately after successful login
      await loadSupabaseData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication error' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    // Runtime data is cleared by the SIGNED_OUT listener above.
    // Reset UI state here.
    setIsProfileOpen(false);
    setActiveTab('home');
    setSelectedCustomerId(null);
    setSelectedProductId(null);
  };

  const getCustomerLedgerData = (customerId: string) => {
    const result = calculateCustomerFinancials(customerId, rawTransactions);
    return {
      entries: result.entries as CustomerLedgerEntry[],
      summary: {
        customerId: result.customerId,
        totalSales: result.totalSales,
        totalPaid: result.totalPaid,
        outstandingBalance: result.outstandingBalance,
        transactionCount: result.transactionCount,
      },
    };
  };

  const getCustomerSummary = (customerId: string): CustomerFinancialSummary => {
    return getCustomerLedgerData(customerId).summary;
  };

  // Dynamically computed metrics across products & customer ledgers
  const metrics = useMemo(() => {
    const inStockCartons = products.reduce((acc, p) => acc + p.currentStockCartons, 0);

    const totalInventoryValueETB = products.reduce(
      (acc, p) => acc + p.currentStockCartons * p.costPerCarton,
      0
    );

    const totalCustomerCreditETB = customers.reduce((acc, c) => {
      const summary = calculateCustomerFinancials(c.id, rawTransactions);
      return acc + (summary.outstandingBalance > 0 ? summary.outstandingBalance : 0);
    }, 0);

    const lowStockCount = products.filter(
      (p) => p.currentStockCartons <= p.lowStockThresholdCartons
    ).length;

    // Incoming from purchase transactions
    const incomingCartons = inventoryTransactions
      .filter((t) => t.type === 'purchase')
      .reduce((acc, t) => acc + t.quantityCartons, 0);

    // Outgoing from sale transactions (stored as negative or absolute)
    const outgoingCartons = inventoryTransactions
      .filter((t) => t.type === 'sale')
      .reduce((acc, t) => acc + Math.abs(t.quantityCartons), 0);

    return {
      totalInventoryValueETB,
      totalCustomerCreditETB,
      inStockCartons,
      incomingCartons,
      outgoingCartons,
      lowStockCount,
    };
  }, [products, customers, rawTransactions, inventoryTransactions]);

  // ==========================================
  // TRANSACTION WORKFLOW 1: RECORD SALE
  // ==========================================
  const executeSale = async (input: SaleFormInput) => {
    // 1. Role permission enforcement (Manager and Warehouse can record sales)
    if (currentUser.role !== 'manager' && currentUser.role !== 'warehouse') {
      return { success: false, validationErrors: { general: 'Unauthorized: Only Managers and Warehouse staff can record sales.' } };
    }

    // 2. Build stock lookup map for pure validator
    const stockMap = new Map<string, { name: string; currentStockCartons: number }>();
    products.forEach((p) => stockMap.set(p.id, { name: p.name, currentStockCartons: p.currentStockCartons }));

    // 3. Pure domain validation (runs client-side regardless of Supabase config)
    const validation = validateSale(input, stockMap);
    if (!validation.isValid) {
      return { success: false, validationErrors: validation.errors };
    }

    // 4. Pre-compute display values (used for feedback in both paths)
    const totalAmount = calculateSaleSubtotal(input.items);
    const { creditRemaining } = calculateSaleOutstanding(totalAmount, input.amountPaid);
    const customer = customers.find((c) => c.id === input.customerId);
    const customerName = customer ? customer.name : 'Unknown Customer';
    const customerSummary = calculateCustomerFinancials(input.customerId, rawTransactions);
    const itemDescriptions: string[] = input.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return `${item.quantityCartons} cartons ${prod?.name ?? item.productId}`;
    });

    // ── SUPABASE PATH ──────────────────────────────────────────────────────────
    if (isSupabaseConfigured) {
      try {
        // Call record_sale RPC — auth.uid() is resolved server-side from the session.
        // No client-supplied user ID or role is passed.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await supabase.rpc('record_sale', {
          p_customer_id: input.customerId,
          p_items: input.items.map((item) => ({
            product_id: item.productId,
            quantity_cartons: item.quantityCartons,
            price_per_carton: item.pricePerCarton,
          })),
          p_amount_paid: input.amountPaid,
          p_payment_method: input.paymentMethod || 'Cash',
          p_notes: input.notes ?? undefined,
        } as any);

        if (error) {
          return { success: false, validationErrors: { general: error.message } };
        }

        const result = data as { success: boolean; reference: string; total_amount: number; amount_paid: number; credit_amount: number };
        const saleRef = result.reference;

        // Optimistically update local in-memory stock so UI reflects new stock instantly
        const updatedProducts = products.map((p) => {
          const soldItem = input.items.find((i) => i.productId === p.id);
          if (!soldItem) return p;
          return { ...p, currentStockCartons: calculateStockAfterSale(p.currentStockCartons, soldItem.quantityCartons) };
        });
        setProducts(updatedProducts);

        setSuccessFeedback({
          type: 'sale',
          reference: saleRef,
          title: 'Sale Recorded Successfully',
          details: [
            `Reference: ${saleRef}`,
            `Customer: ${customerName}`,
            `Cartons Sold: ${itemDescriptions.join('; ')}`,
            `Total Amount: ${result.total_amount.toLocaleString()} ETB`,
            `Amount Paid: ${result.amount_paid.toLocaleString()} ETB (${input.paymentMethod || 'Cash'})`,
            `Credit Remaining: ${result.credit_amount.toLocaleString()} ETB`,
            `Remaining Product Stock: ${updatedProducts.filter(p => input.items.some(i => i.productId === p.id)).map(p => `${p.name} (${p.currentStockCartons} cartons)`).join(', ')}`,
          ],
        });

        await loadSupabaseData();

        return { success: true, reference: saleRef };
      } catch (err: any) {
        return { success: false, validationErrors: { general: err.message || 'Unexpected error recording sale.' } };
      }
    }

    // ── LOCAL / DEV FALLBACK PATH (Supabase not configured) ───────────────────
    const saleRef = generateTransactionReference('SALE');
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const updatedProducts = [...products];
    const newInvTxs: InventoryTransaction[] = [];

    input.items.forEach((item) => {
      const prodIndex = updatedProducts.findIndex((p) => p.id === item.productId);
      if (prodIndex !== -1) {
        const prod = updatedProducts[prodIndex];
        updatedProducts[prodIndex] = {
          ...prod,
          currentStockCartons: calculateStockAfterSale(prod.currentStockCartons, item.quantityCartons),
        };
        newInvTxs.push({
          id: `inv-${Date.now()}-${item.productId}`,
          referenceNumber: saleRef,
          productId: prod.id,
          productName: prod.name,
          type: 'sale',
          quantityCartons: -item.quantityCartons,
          timeAgo: 'Just now',
          createdAt: new Date().toISOString(),
        });
      }
    });

    const newLedgerTxs: RawLedgerTransaction[] = [
      {
        id: `tx-sale-${Date.now()}`,
        customerId: input.customerId,
        date: today,
        referenceNumber: saleRef,
        type: 'Sale',
        description: itemDescriptions.join(', '),
        amount: totalAmount,
        createdAt: new Date().toISOString(),
      },
    ];

    if (input.amountPaid > 0) {
      const payRef = generateTransactionReference('PAY');
      newLedgerTxs.push({
        id: `tx-pay-${Date.now()}`,
        customerId: input.customerId,
        date: today,
        referenceNumber: payRef,
        type: 'Payment',
        description: `Upfront payment via ${input.paymentMethod || 'Cash'} for ${saleRef}`,
        amount: -input.amountPaid,
        paymentMethod: input.paymentMethod || 'Cash',
        createdAt: new Date().toISOString(),
      });
    }

    setProducts(updatedProducts);
    setRawTransactions((prev) => [...prev, ...newLedgerTxs]);
    setInventoryTransactions((prev) => [...newInvTxs, ...prev]);

    setSuccessFeedback({
      type: 'sale',
      reference: saleRef,
      title: 'Sale Recorded Successfully',
      details: [
        `Reference: ${saleRef}`,
        `Customer: ${customerName}`,
        `Cartons Sold: ${itemDescriptions.join('; ')}`,
        `Total Amount: ${totalAmount.toLocaleString()} ETB`,
        `Amount Paid: ${input.amountPaid.toLocaleString()} ETB (${input.paymentMethod || 'Cash'})`,
        `Customer Remaining Balance: ${(customerSummary ? customerSummary.outstandingBalance + creditRemaining : creditRemaining).toLocaleString()} ETB`,
        `Remaining Product Stock: ${updatedProducts.filter(p => input.items.some(i => i.productId === p.id)).map(p => `${p.name} (${p.currentStockCartons} cartons)`).join(', ')}`,
      ],
    });

    return { success: true, reference: saleRef };
  };

  // ==========================================
  // TRANSACTION WORKFLOW 2: RECORD CUSTOMER PAYMENT
  // ==========================================
  const executePayment = async (input: CustomerPaymentFormInput) => {
    // Manager and Warehouse staff can record customer payments
    if (currentUser.role !== 'manager' && currentUser.role !== 'warehouse') {
      return { success: false, validationErrors: { general: 'Unauthorized: Only Managers and Warehouse staff can record payments.' } };
    }

    const customerSummary = calculateCustomerFinancials(input.customerId, rawTransactions);

    if (currentUser.role === 'manager') {
      const validation = validateCustomerPayment(input, customerSummary.outstandingBalance);
      if (!validation.isValid) {
        return { success: false, validationErrors: validation.errors };
      }
    } else {
      // For warehouse staff, financial ledger is restricted by RLS.
      // We validate required fields client-side; authoritative balance check runs in the backend RPC.
      if (!input.customerId || input.customerId.trim() === '') {
        return { success: false, validationErrors: { customerId: 'chooseCustomer' } };
      }
      if (!input.amount || input.amount <= 0) {
        return { success: false, validationErrors: { amount: 'enterPaymentAmount' } };
      }
      if (!input.paymentMethod || input.paymentMethod.trim() === '') {
        return { success: false, validationErrors: { paymentMethod: 'choosePaymentMethod' } };
      }
    }

    const customer = customers.find((c) => c.id === input.customerId);
    const customerName = customer ? customer.name : 'Customer';

    // ── SUPABASE PATH ──────────────────────────────────────────────────────────
    if (isSupabaseConfigured) {
      try {
        // Call record_customer_payment RPC — auth.uid() is resolved server-side.
        // The RPC internally enforces manager-only and prohibits direct ledger INSERT.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await supabase.rpc('record_customer_payment', {
          p_customer_id: input.customerId,
          p_amount: input.amount,
          p_payment_method: input.paymentMethod,
          p_notes: input.reference ?? undefined,
        } as any);

        if (error) {
          return { success: false, validationErrors: { general: error.message } };
        }

        const result = data as { success: boolean; reference: string; amount: number; remaining_balance: number };
        const payRef = result.reference;
        const newBalance = result.remaining_balance;

        const details = [
          `Reference: ${payRef}`,
          `Customer: ${customerName}`,
          `Amount Received: ${result.amount.toLocaleString()} ETB`,
          `Payment Method: ${input.paymentMethod}${input.reference ? ` (${input.reference})` : ''}`,
        ];
        if (currentUser.role === 'manager') {
          details.push(`Previous Balance: ${customerSummary.outstandingBalance.toLocaleString()} ETB`);
          details.push(`Remaining Balance: ${newBalance.toLocaleString()} ETB`);
        }
        details.push(`Physical Inventory: Strictly unaffected (financial ledger update only)`);

        setSuccessFeedback({
          type: 'payment',
          reference: payRef,
          title: 'Payment Recorded Successfully',
          details,
        });

        await loadSupabaseData();

        return { success: true, reference: payRef };
      } catch (err: any) {
        return { success: false, validationErrors: { general: err.message || 'Unexpected error recording payment.' } };
      }
    }

    // ── LOCAL / DEV FALLBACK PATH (Supabase not configured) ───────────────────
    const payRef = generateTransactionReference('PAY');
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const newPaymentTx: RawLedgerTransaction = {
      id: `tx-pay-${Date.now()}`,
      customerId: input.customerId,
      date: today,
      referenceNumber: payRef,
      type: 'Payment',
      description: input.reference
        ? `Payment via ${input.paymentMethod} (Ref: ${input.reference})`
        : `Payment via ${input.paymentMethod}`,
      amount: -input.amount,
      paymentMethod: input.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    // Customer payment updates ledger ONLY. Inventory is strictly untouched.
    setRawTransactions((prev) => [...prev, newPaymentTx]);

    const newBalance = customerSummary.outstandingBalance - input.amount;

    setSuccessFeedback({
      type: 'payment',
      reference: payRef,
      title: 'Payment Recorded Successfully',
      details: [
        `Reference: ${payRef}`,
        `Customer: ${customerName}`,
        `Amount Received: ${input.amount.toLocaleString()} ETB`,
        `Payment Method: ${input.paymentMethod}${input.reference ? ` (${input.reference})` : ''}`,
        `Previous Balance: ${customerSummary.outstandingBalance.toLocaleString()} ETB`,
        `Remaining Balance: ${newBalance.toLocaleString()} ETB`,
        `Physical Inventory: Strictly unaffected (financial ledger update only)`,
      ],
    });

    return { success: true, reference: payRef };
  };

  // ==========================================
  // TRANSACTION WORKFLOW 3: RECORD PURCHASE
  // ==========================================
  const executePurchase = async (input: PurchaseFormInput) => {
    const productExists = products.some((p) => p.id === input.productId);
    const validation = validatePurchase(input, productExists);
    if (!validation.isValid) {
      return { success: false, validationErrors: validation.errors };
    }

    const product = products.find((p) => p.id === input.productId);
    const productName = product?.name ?? '';
    const previousStock = product?.currentStockCartons ?? 0;

    // ── SUPABASE PATH ──────────────────────────────────────────────────────────
    if (isSupabaseConfigured) {
      try {
        // Call record_purchase RPC — auth.uid() is resolved server-side.
        // No client-supplied user ID or role is passed.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await supabase.rpc('record_purchase', {
          p_product_id: input.productId,
          p_quantity_cartons: input.quantityCartons,
          p_cost_per_carton: input.costPerCarton,
          p_supplier_name: input.supplierName ?? undefined,
        } as any);

        if (error) {
          return { success: false, validationErrors: { general: error.message } };
        }

        const result = data as { success: boolean; reference: string; quantity_cartons: number; total_cost: number };
        const purRef = result.reference;
        const newStock = calculateStockAfterPurchase(previousStock, input.quantityCartons);

        // Optimistically update local in-memory stock
        setProducts((prev) =>
          prev.map((p) =>
            p.id === input.productId ? { ...p, currentStockCartons: newStock } : p
          )
        );

        setSuccessFeedback({
          type: 'purchase',
          reference: purRef,
          title: 'Stock Added Successfully',
          details: [
            `Reference: ${purRef}`,
            `Product: ${productName}`,
            `Cartons Received: +${result.quantity_cartons} cartons`,
            `Previous Stock: ${previousStock} cartons`,
            `New Total Stock: ${newStock} cartons`,
            `Customer Debt Balances: Strictly unaffected (no financial changes)`,
          ],
        });

        await loadSupabaseData();

        return { success: true, reference: purRef };
      } catch (err: any) {
        return { success: false, validationErrors: { general: err.message || 'Unexpected error recording purchase.' } };
      }
    }

    // ── LOCAL / DEV FALLBACK PATH (Supabase not configured) ───────────────────
    const purRef = generateTransactionReference('PUR');
    const newStock = calculateStockAfterPurchase(previousStock, input.quantityCartons);

    const updatedProducts = products.map((p) => {
      if (p.id === input.productId) {
        return { ...p, currentStockCartons: newStock };
      }
      return p;
    });

    const newInvTx: InventoryTransaction = {
      id: `inv-${Date.now()}-${input.productId}`,
      referenceNumber: purRef,
      productId: input.productId,
      productName: productName,
      type: 'purchase',
      quantityCartons: input.quantityCartons,
      timeAgo: 'Just now',
      createdAt: new Date().toISOString(),
    };

    // Purchase updates inventory ONLY. Customer balances remain strictly untouched.
    setProducts(updatedProducts);
    setInventoryTransactions((prev) => [newInvTx, ...prev]);

    setSuccessFeedback({
      type: 'purchase',
      reference: purRef,
      title: 'Stock Added Successfully',
      details: [
        `Reference: ${purRef}`,
        `Product: ${productName}`,
        `Cartons Received: +${input.quantityCartons} cartons`,
        `Previous Stock: ${previousStock} cartons`,
        `New Total Stock: ${newStock} cartons`,
        `Customer Debt Balances: Strictly unaffected (no financial changes)`,
      ],
    });

    return { success: true, reference: purRef };
  };

  // ==========================================
  // PRODUCT ACTION: CREATE OR EDIT PRODUCT
  // ==========================================
  const saveProduct = async (
    input: ProductFormInput,
    productId?: string
  ): Promise<{ success: boolean; product?: Product; validationErrors?: Record<string, string> }> => {
    // 1. Role permission enforcement (Manager only can create/edit products)
    if (currentUser.role !== 'manager') {
      return {
        success: false,
        validationErrors: { general: 'Unauthorized: Only Managers can create or edit products.' },
      };
    }

    // 2. Pure domain validation
    const validation = validateProduct(input, products, productId);
    if (!validation.isValid) {
      return { success: false, validationErrors: validation.errors };
    }

    const cleanName = input.name.trim();
    const cleanSku = input.sku.trim().toUpperCase();
    const cleanBarcode = input.barcode?.trim() || null;
    const cleanDescription = input.description?.trim() || null;
    const cleanCategory = input.category?.trim() || 'General';
    const fallbackImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80';
    const cleanImage = input.image?.trim() || fallbackImage;
    const cleanPieces = input.piecesPerCarton || 24;
    const cleanSellingPrice = Number(input.sellingPricePerCarton);
    const cleanCostPrice = Number(input.costPerCarton);
    const cleanThreshold = input.lowStockThresholdCartons !== undefined && input.lowStockThresholdCartons !== null
      ? Number(input.lowStockThresholdCartons)
      : 10;

    // ── SUPABASE PATH ──────────────────────────────────────────────────────────
    if (isSupabaseConfigured) {
      try {
        if (productId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase
            .from('products') as any)
            .update({
              name: cleanName,
              sku: cleanSku,
              barcode: cleanBarcode,
              description: cleanDescription,
              category: cleanCategory,
              image_url: cleanImage,
              pieces_per_carton: cleanPieces,
              selling_price_per_carton: cleanSellingPrice,
              cost_per_carton: cleanCostPrice,
              low_stock_threshold_cartons: cleanThreshold,
            })
            .eq('id', productId)
            .select()
            .single();

          if (error) {
            return { success: false, validationErrors: { general: error.message } };
          }

          let updatedProd: Product | undefined;
          setProducts((prev) =>
            prev.map((p) => {
              if (p.id === productId) {
                updatedProd = {
                  ...p,
                  name: data.name,
                  sku: data.sku,
                  barcode: data.barcode || undefined,
                  description: data.description || undefined,
                  category: data.category || cleanCategory,
                  image: data.image_url || cleanImage,
                  piecesPerCarton: data.pieces_per_carton || cleanPieces,
                  sellingPricePerCarton: Number(data.selling_price_per_carton),
                  costPerCarton: Number(data.cost_per_carton),
                  lowStockThresholdCartons: data.low_stock_threshold_cartons,
                };
                return updatedProd;
              }
              return p;
            })
          );

          showToast({
            type: 'info',
            title: 'Product Updated',
            message: `${cleanName} (${cleanSku}) was updated successfully.`,
          });

          return { success: true, product: updatedProd };
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase
            .from('products') as any)
            .insert({
              name: cleanName,
              sku: cleanSku,
              barcode: cleanBarcode,
              description: cleanDescription,
              category: cleanCategory,
              image_url: cleanImage,
              pieces_per_carton: cleanPieces,
              selling_price_per_carton: cleanSellingPrice,
              cost_per_carton: cleanCostPrice,
              low_stock_threshold_cartons: cleanThreshold,
              created_by: currentUser.id,
            })
            .select()
            .single();

          if (error) {
            return { success: false, validationErrors: { general: error.message } };
          }

          const newProd: Product = {
            id: data.id,
            name: data.name,
            sku: data.sku,
            barcode: data.barcode || undefined,
            description: data.description || undefined,
            category: data.category || cleanCategory,
            image: data.image_url || cleanImage,
            currentStockCartons: 0, // Stock is derived transactionally; new product starts at 0 cartons
            unit: 'carton',
            piecesPerCarton: data.pieces_per_carton || cleanPieces,
            sellingPricePerCarton: Number(data.selling_price_per_carton),
            costPerCarton: Number(data.cost_per_carton),
            lowStockThresholdCartons: data.low_stock_threshold_cartons,
            createdAt: data.created_at,
          };

          setProducts((prev) => [newProd, ...prev]);

          showToast({
            type: 'info',
            title: 'Product Created',
            message: `${cleanName} (${cleanSku}) was added to catalog.`,
          });

          return { success: true, product: newProd };
        }
      } catch (err: any) {
        return {
          success: false,
          validationErrors: { general: err.message || 'Unexpected error saving product.' },
        };
      }
    }

    // ── LOCAL / DEV FALLBACK PATH (Supabase not configured) ───────────────────
    if (productId) {
      let updatedProd: Product | undefined;
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            updatedProd = {
              ...p,
              name: cleanName,
              sku: cleanSku,
              barcode: cleanBarcode || undefined,
              description: cleanDescription || undefined,
              category: cleanCategory,
              image: cleanImage,
              piecesPerCarton: cleanPieces,
              sellingPricePerCarton: cleanSellingPrice,
              costPerCarton: cleanCostPrice,
              lowStockThresholdCartons: cleanThreshold,
            };
            return updatedProd;
          }
          return p;
        })
      );

      showToast({
        type: 'info',
        title: 'Product Updated',
        message: `${cleanName} (${cleanSku}) was updated successfully.`,
      });

      return { success: true, product: updatedProd };
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: cleanName,
        sku: cleanSku,
        barcode: cleanBarcode || undefined,
        description: cleanDescription || undefined,
        category: cleanCategory,
        image: cleanImage,
        currentStockCartons: 0, // Stock is strictly 0 until a purchase transaction is recorded
        unit: 'carton',
        piecesPerCarton: cleanPieces,
        sellingPricePerCarton: cleanSellingPrice,
        costPerCarton: cleanCostPrice,
        lowStockThresholdCartons: cleanThreshold,
        createdAt: new Date().toISOString(),
      };

      setProducts((prev) => [newProd, ...prev]);

      showToast({
        type: 'info',
        title: 'Product Created',
        message: `${cleanName} (${cleanSku}) was added to catalog.`,
      });

      return { success: true, product: newProd };
    }
  };

  // ==========================================
  // CUSTOMER ACTION: CREATE CUSTOMER
  // ==========================================
  const saveCustomer = async (input: {
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
  }): Promise<{ success: boolean; customer?: Customer; validationErrors?: Record<string, string> }> => {
    const cleanName = input.name.trim();
    if (!cleanName) {
      return {
        success: false,
        validationErrors: { name: 'Customer name is required.' },
      };
    }

    const cleanPhone = input.phone?.trim() || null;
    const cleanAddress = input.address?.trim() || null;
    const cleanNotes = input.notes?.trim() || null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase
          .from('customers') as any)
          .insert({
            name: cleanName,
            phone: cleanPhone,
            address: cleanAddress,
            notes: cleanNotes,
          })
          .select()
          .single();

        if (error) {
          return { success: false, validationErrors: { general: error.message } };
        }

        const newCust: Customer = {
          id: data.id,
          name: data.name,
          phone: data.phone || '',
          address: data.address || '',
          notes: data.notes || undefined,
          createdAt: data.created_at,
        };

        setCustomers((prev) => {
          const updated = [...prev.filter((c) => c.id !== newCust.id), newCust];
          return updated.sort((a, b) => a.name.localeCompare(b.name));
        });

        showToast({
          type: 'info',
          title: 'Customer Created',
          message: `${cleanName} was added to customer directory.`,
        });

        return { success: true, customer: newCust };
      } catch (err: any) {
        return {
          success: false,
          validationErrors: { general: err.message || 'Unexpected error creating customer.' },
        };
      }
    }

    // Local / Dev fallback
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: cleanName,
      phone: cleanPhone || '',
      address: cleanAddress || '',
      notes: cleanNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    setCustomers((prev) => {
      const updated = [...prev, newCust];
      return updated.sort((a, b) => a.name.localeCompare(b.name));
    });

    showToast({
      type: 'info',
      title: 'Customer Created',
      message: `${cleanName} was added to customer directory.`,
    });

    return { success: true, customer: newCust };
  };

  const value: StockFlowContextValue = {
    currentUser,
    isAuthenticated,
    isHydrated,
    isFirstTimeSetup,
    invitedEmail,
    completeFirstTimeSetup,
    requestAccountSetup,
    login,
    logout,
    isProfileOpen,
    setIsProfileOpen,
    activeTab,
    setActiveTab,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedProductId,
    setSelectedProductId,
    isQuickActionOpen,
    setIsQuickActionOpen,
    activeModal,
    setActiveModal,
    preselectedCustomerId,
    setPreselectedCustomerId,
    preselectedProductId,
    setPreselectedProductId,
    successFeedback,
    setSuccessFeedback,
    products,
    customers,
    rawTransactions,
    inventoryTransactions,
    getCustomerSummary,
    getCustomerLedgerData,
    metrics,
    toast,
    showToast,
    dismissToast,
    executeSale,
    executePayment,
    executePurchase,
    saveCustomer,
    saveProduct,
  };

  return <StockFlowContext.Provider value={value}>{children}</StockFlowContext.Provider>;
}

export function useStockFlow() {
  const context = useContext(StockFlowContext);
  if (!context) {
    throw new Error('useStockFlow must be used within a StockFlowProvider');
  }
  return context;
}
