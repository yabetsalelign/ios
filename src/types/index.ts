export type UserRole = 'manager' | 'warehouse';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  image: string;
  category: string;
  currentStockCartons: number; // Primary unit is CARTONS
  unit: 'carton';
  piecesPerCarton?: number; // Optional supporting metadata
  sellingPricePerCarton: number;
  costPerCarton: number;
  lowStockThresholdCartons: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantityCartons: number; // Strictly in cartons
  pricePerCarton: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'telebirr' | 'bank_transfer' | 'credit';

export interface Sale {
  id: string;
  referenceNumber: string; // e.g. "SALE-1042"
  customerId: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  amountPaid: number;
  creditAmount: number;
  paymentMethod: PaymentMethod;
  dueDate?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface CustomerPayment {
  id: string;
  referenceNumber: string; // e.g. "PAY-1018"
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'cash' | 'telebirr' | 'bank_transfer';
  reference?: string; // Receipt / Transaction No.
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  referenceNumber: string; // e.g. "PUR-2005"
  productId: string;
  productName: string;
  quantityCartons: number; // Strictly cartons
  costPerCarton: number;
  totalCost: number;
  supplierName?: string; // Optional record name only, no supplier balance/accounting
  createdBy: string;
  createdAt: string;
}

export type InventoryTransactionType = 'purchase' | 'sale' | 'adjustment';

export interface InventoryTransaction {
  id: string;
  referenceNumber: string;
  productId: string;
  productName: string;
  type: InventoryTransactionType;
  quantityCartons: number; // Positive for incoming, negative for outgoing
  relatedSaleId?: string;
  relatedPurchaseId?: string;
  timeAgo: string;
  createdAt: string;
}

export type LedgerEntryType = 'Sale' | 'Payment' | 'Adjustment';

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  referenceNumber: string;
  type: LedgerEntryType;
  description: string;
  amount: number; // Sales are positive debt (+), Payments are negative (-), Adjustments reflect delta
  runningBalance: number; // Calculated dynamically from historical sequence
  paymentMethod?: string;
}

export interface CustomerFinancialSummary {
  customerId: string;
  totalSales: number;
  totalPaid: number;
  outstandingBalance: number; // Total Sales - Total Paid
  transactionCount: number;
}
