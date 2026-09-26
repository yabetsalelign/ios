'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Customer,
  CustomerFinancialSummary,
  CustomerLedgerEntry,
  InventoryTransaction,
  Product,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY_TRANSACTIONS,
  INITIAL_PRODUCTS,
  INITIAL_USER,
  RAW_CUSTOMER_TRANSACTIONS,
} from '../data/syntheticSeed';
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
  validatePurchase,
  validateSale,
} from '../domain/validation/validators';
import { generateTransactionReference } from '../domain/transactions/referenceGenerator';

export type ActiveTab = 'home' | 'inventory' | 'customers' | 'reports' | 'activity' | 'more';
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
  login: (role: UserRole, email?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
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

  // Development Preview Mode
  isPreviewMobileFrame: boolean;
  setIsPreviewMobileFrame: (val: boolean | ((prev: boolean) => boolean)) => void;

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
}

const StockFlowContext = createContext<StockFlowContextValue | undefined>(undefined);

export function StockFlowProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate persisted auth state once on mount (avoids SSR/client mismatch)
  useEffect(() => {
    try {
      const active = localStorage.getItem('sf_auth_active');
      const savedRole = localStorage.getItem('sf_user_role');
      if (active === 'true') {
        setIsAuthenticated(true);
      }
      if (savedRole === 'warehouse') {
        setCurrentUser({
          id: 'usr-2',
          name: 'Dawit Haile',
          email: 'dawit@stockflow.app',
          role: 'warehouse',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80',
        });
      }
    } catch {
      // Ignored
    }
    setIsHydrated(true);
  }, []);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<string | null>(null);
  const [preselectedProductId, setPreselectedProductId] = useState<string | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<TransactionSuccessFeedback | null>(null);
  const [isPreviewMobileFrame, setIsPreviewMobileFrame] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = React.useCallback((notification: Omit<ToastNotification, 'id'>) => {
    setToast({ ...notification, id: `toast-${Date.now()}` });
    // Auto-dismiss after 4 seconds
    setTimeout(() => setToast(null), 4000);
  }, []);

  const dismissToast = React.useCallback(() => {
    setToast(null);
  }, []);

  // Dynamic In-Memory Collections (Ready for Supabase repository integration)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [rawTransactions, setRawTransactions] = useState<RawLedgerTransaction[]>(RAW_CUSTOMER_TRANSACTIONS);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(INITIAL_INVENTORY_TRANSACTIONS);

  const login = (role: UserRole, email?: string) => {
    const user: User = role === 'manager'
      ? {
          id: 'usr-1',
          name: 'Alex Morgan',
          email: email || 'alex@stockflow.app',
          role: 'manager',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
        }
      : {
          id: 'usr-2',
          name: 'Dawit Haile',
          email: email || 'dawit@stockflow.app',
          role: 'warehouse',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80',
        };

    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab('home');
    setSelectedCustomerId(null);
    setSelectedProductId(null);
    try {
      localStorage.setItem('sf_auth_active', 'true');
      localStorage.setItem('sf_user_role', role);
    } catch {
      // Ignored
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsProfileOpen(false);
    setActiveTab('home');
    setSelectedCustomerId(null);
    setSelectedProductId(null);
    try {
      localStorage.removeItem('sf_auth_active');
    } catch {
      // Ignored
    }
  };

  const switchRole = (role: UserRole) => {
    login(role);
    if (role === 'warehouse' && (activeTab === 'customers' || activeTab === 'reports')) {
      setActiveTab('home');
    }
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
      incomingCartons: incomingCartons || 185,
      outgoingCartons: outgoingCartons || 74,
      lowStockCount,
    };
  }, [products, customers, rawTransactions, inventoryTransactions]);

  // ==========================================
  // TRANSACTION WORKFLOW 1: RECORD SALE
  // ==========================================
  const executeSale = async (input: SaleFormInput) => {
    // 1. Role permission enforcement
    if (currentUser.role !== 'manager') {
      return { success: false, validationErrors: { general: 'Unauthorized: Only Managers can record sales.' } };
    }

    // 2. Build stock lookup map for pure validator
    const stockMap = new Map<string, { name: string; currentStockCartons: number }>();
    products.forEach((p) => stockMap.set(p.id, { name: p.name, currentStockCartons: p.currentStockCartons }));

    // 3. Pure domain validation
    const validation = validateSale(input, stockMap);
    if (!validation.isValid) {
      return { success: false, validationErrors: validation.errors };
    }

    // 4. Calculations
    const totalAmount = calculateSaleSubtotal(input.items);
    const { creditRemaining } = calculateSaleOutstanding(totalAmount, input.amountPaid);
    const saleRef = generateTransactionReference('SALE');
    const customer = customers.find((c) => c.id === input.customerId);
    const customerName = customer ? customer.name : 'Unknown Customer';
    const customerSummary = calculateCustomerFinancials(input.customerId, rawTransactions);
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    // 5. Update Inventory (Decrement cartons for all items in sale)
    const updatedProducts = [...products];
    const newInvTxs: InventoryTransaction[] = [];
    const itemDescriptions: string[] = [];

    input.items.forEach((item) => {
      const prodIndex = updatedProducts.findIndex((p) => p.id === item.productId);
      if (prodIndex !== -1) {
        const prod = updatedProducts[prodIndex];
        const newStock = calculateStockAfterSale(prod.currentStockCartons, item.quantityCartons);
        updatedProducts[prodIndex] = {
          ...prod,
          currentStockCartons: newStock,
        };

        itemDescriptions.push(`${item.quantityCartons} cartons ${prod.name}`);

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

    // 6. Update Customer Ledger
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

    // If upfront payment was made, append immediate payment record
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

    // Atomic State Commit
    setProducts(updatedProducts);
    setRawTransactions((prev) => [...prev, ...newLedgerTxs]);
    setInventoryTransactions((prev) => [...newInvTxs, ...prev]);

    // Provide feedback
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
    if (currentUser.role !== 'manager') {
      return { success: false, validationErrors: { general: 'Unauthorized: Only Managers can record payments.' } };
    }

    const customerSummary = calculateCustomerFinancials(input.customerId, rawTransactions);
    const validation = validateCustomerPayment(input, customerSummary.outstandingBalance);
    if (!validation.isValid) {
      return { success: false, validationErrors: validation.errors };
    }

    const payRef = generateTransactionReference('PAY');
    const customer = customers.find((c) => c.id === input.customerId);
    const customerName = customer ? customer.name : 'Customer';
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

    const purRef = generateTransactionReference('PUR');

    // Update Product Stock in Cartons
    let updatedProductName = '';
    let previousStock = 0;
    let newStock = 0;

    const updatedProducts = products.map((p) => {
      if (p.id === input.productId) {
        updatedProductName = p.name;
        previousStock = p.currentStockCartons;
        newStock = calculateStockAfterPurchase(p.currentStockCartons, input.quantityCartons);
        return {
          ...p,
          currentStockCartons: newStock,
        };
      }
      return p;
    });

    const newInvTx: InventoryTransaction = {
      id: `inv-${Date.now()}-${input.productId}`,
      referenceNumber: purRef,
      productId: input.productId,
      productName: updatedProductName,
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
        `Product: ${updatedProductName}`,
        `Cartons Received: +${input.quantityCartons} cartons`,
        `Previous Stock: ${previousStock} cartons`,
        `New Total Stock: ${newStock} cartons`,
        `Customer Debt Balances: Strictly unaffected (no financial changes)`,
      ],
    });

    return { success: true, reference: purRef };
  };

  const value: StockFlowContextValue = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    switchRole,
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
    isPreviewMobileFrame,
    setIsPreviewMobileFrame,
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
