import {
  Customer,
  CustomerFinancialSummary,
  CustomerLedgerEntry,
  InventoryTransaction,
  Product,
  User,
} from '../types';

/**
 * SYNTHETIC DEVELOPMENT SEED DATA
 *
 * NOTE: These entries represent synthetic test data designed to mirror
 * the visual and mathematical properties shown in the StockFlow UI reference.
 * They are not hardcoded production constraints.
 */

export const INITIAL_USER: User = {
  id: 'usr-1',
  name: 'Alex Morgan',
  email: 'alex@stockflow.app',
  role: 'manager',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Shower Gel',
    sku: 'SH-001',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&auto=format&fit=crop&q=80',
    category: 'Cosmetics & Personal Care',
    currentStockCartons: 150,
    unit: 'carton',
    piecesPerCarton: 24,
    sellingPricePerCarton: 2500,
    costPerCarton: 1900,
    lowStockThresholdCartons: 50,
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Soap Bar',
    sku: 'SP-002',
    image: 'https://images.unsplash.com/photo-1607006314392-e4210d73f4e3?w=200&auto=format&fit=crop&q=80',
    category: 'Personal Care',
    currentStockCartons: 85,
    unit: 'carton',
    piecesPerCarton: 48,
    sellingPricePerCarton: 2800,
    costPerCarton: 2100,
    lowStockThresholdCartons: 40,
    createdAt: '2025-01-12T09:30:00Z',
  },
  {
    id: 'prod-3',
    name: 'Conditioning Shampoo',
    sku: 'SH-003',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&auto=format&fit=crop&q=80',
    category: 'Personal Care',
    currentStockCartons: 42,
    unit: 'carton',
    piecesPerCarton: 12,
    sellingPricePerCarton: 3000,
    costPerCarton: 2300,
    lowStockThresholdCartons: 50, // Below threshold -> Low Stock
    createdAt: '2025-01-15T11:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'Stainless Water Bottle',
    sku: 'WB-004',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&auto=format&fit=crop&q=80',
    category: 'Household',
    currentStockCartons: 120,
    unit: 'carton',
    piecesPerCarton: 20,
    sellingPricePerCarton: 1800,
    costPerCarton: 1300,
    lowStockThresholdCartons: 30,
    createdAt: '2025-01-20T14:15:00Z',
  },
  {
    id: 'prod-5',
    name: 'Fast-Charge Power Bank',
    sku: 'PB-005',
    image: 'https://images.unsplash.com/photo-1609592424368-8e6727c95e1e?w=200&auto=format&fit=crop&q=80',
    category: 'Electronics',
    currentStockCartons: 60,
    unit: 'carton',
    piecesPerCarton: 10,
    sellingPricePerCarton: 4500,
    costPerCarton: 3400,
    lowStockThresholdCartons: 20,
    createdAt: '2025-02-01T10:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'Wireless Headphones',
    sku: 'WH-001',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    category: 'Electronics',
    currentStockCartons: 150,
    unit: 'carton',
    piecesPerCarton: 24,
    sellingPricePerCarton: 2800,
    costPerCarton: 2000,
    lowStockThresholdCartons: 75,
    createdAt: '2025-02-05T13:45:00Z',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'ABC Trading',
    phone: '+251 91 234 5678',
    address: 'Merkato Zone 3, Addis Ababa',
    notes: 'Primary wholesale buyer for personal care products',
    createdAt: '2025-01-05T10:00:00Z',
  },
  {
    id: 'cust-2',
    name: 'Mame Shop',
    phone: '+251 92 876 5432',
    address: 'Piassa Commercial Center, Addis Ababa',
    notes: 'Prompt cash payer, frequent small orders',
    createdAt: '2025-01-18T14:30:00Z',
  },
  {
    id: 'cust-3',
    name: 'XYZ Wholesale',
    phone: '+251 93 111 2233',
    address: 'Kality Industrial Zone, Addis Ababa',
    notes: 'Regional bulk distributor',
    createdAt: '2025-02-01T09:00:00Z',
  },
  {
    id: 'cust-4',
    name: 'Reta Retail',
    phone: '+251 94 444 5566',
    address: 'Bole Medhanealem, Addis Ababa',
    notes: 'Retail chain outlet #2',
    createdAt: '2025-02-12T16:20:00Z',
  },
];

/**
 * RAW LEDGER TRANSACTIONS FOR ABC TRADING
 *
 * Chronological order (oldest to newest):
 * 1. Jan 10: Sale 152,500 ETB (Opening bulk supply)
 * 2. Jan 25: Payment -135,000 ETB
 *    Subtotal before April: 17,500 ETB
 * 3. Apr 06: Payment -5,000 ETB (Running: 12,500 ETB)
 * 4. Apr 08: Sale +20,000 ETB (10 cartons Soap) -> Running: 32,500 ETB
 * 5. Apr 10: Sale +12,500 ETB (5 cartons Shower Gel) -> Running: 45,000 ETB
 * 6. Apr 12: Payment -10,000 ETB (Bank Transfer) -> Running: 35,000 ETB
 *
 * Total Sales: 152,500 + 20,000 + 12,500 = 185,000 ETB
 * Total Paid: 135,000 + 5,000 + 10,000 = 150,000 ETB
 * Outstanding: 185,000 - 150,000 = 35,000 ETB
 */
export const RAW_CUSTOMER_TRANSACTIONS: Array<{
  id: string;
  customerId: string;
  date: string;
  referenceNumber: string;
  type: 'Sale' | 'Payment' | 'Adjustment';
  description: string;
  amount: number; // positive for sale, negative for payment
  paymentMethod?: string;
}> = [
  // --- ABC Trading ---
  {
    id: 'tx-101',
    customerId: 'cust-1',
    date: 'Jan 10, 2025',
    referenceNumber: 'SALE-1010',
    type: 'Sale',
    description: 'Initial wholesale order (61 cartons varied cosmetics)',
    amount: 152500,
  },
  {
    id: 'tx-102',
    customerId: 'cust-1',
    date: 'Jan 25, 2025',
    referenceNumber: 'PAY-1002',
    type: 'Payment',
    description: 'Commercial Bank of Ethiopia Transfer',
    amount: -135000,
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'tx-103',
    customerId: 'cust-1',
    date: 'Apr 06, 2025',
    referenceNumber: 'PAY-1015',
    type: 'Payment',
    description: 'Cash deposit at warehouse',
    amount: -5000,
    paymentMethod: 'Cash',
  },
  {
    id: 'tx-104',
    customerId: 'cust-1',
    date: 'Apr 08, 2025',
    referenceNumber: 'SALE-1038',
    type: 'Sale',
    description: '10 cartons Soap Bar',
    amount: 20000,
  },
  {
    id: 'tx-105',
    customerId: 'cust-1',
    date: 'Apr 10, 2025',
    referenceNumber: 'SALE-1042',
    type: 'Sale',
    description: '5 cartons Shower Gel',
    amount: 12500,
  },
  {
    id: 'tx-106',
    customerId: 'cust-1',
    date: 'Apr 12, 2025',
    referenceNumber: 'PAY-1018',
    type: 'Payment',
    description: 'Telebirr merchant transfer',
    amount: -10000,
    paymentMethod: 'Telebirr',
  },

  // --- Mame Shop (Fully Settled: Outstanding 0 ETB) ---
  {
    id: 'tx-201',
    customerId: 'cust-2',
    date: 'Mar 15, 2025',
    referenceNumber: 'SALE-1020',
    type: 'Sale',
    description: '25 cartons Water Bottle',
    amount: 45000,
  },
  {
    id: 'tx-202',
    customerId: 'cust-2',
    date: 'Mar 15, 2025',
    referenceNumber: 'PAY-1009',
    type: 'Payment',
    description: 'Full cash payment upon delivery',
    amount: -45000,
    paymentMethod: 'Cash',
  },
  {
    id: 'tx-203',
    customerId: 'cust-2',
    date: 'Apr 02, 2025',
    referenceNumber: 'SALE-1035',
    type: 'Sale',
    description: '17 cartons Soap Bar',
    amount: 47500,
  },
  {
    id: 'tx-204',
    customerId: 'cust-2',
    date: 'Apr 02, 2025',
    referenceNumber: 'PAY-1014',
    type: 'Payment',
    description: 'Telebirr instant transfer',
    amount: -47500,
    paymentMethod: 'Telebirr',
  },

  // --- XYZ Wholesale (Outstanding 22,500 ETB) ---
  {
    id: 'tx-301',
    customerId: 'cust-3',
    date: 'Feb 10, 2025',
    referenceNumber: 'SALE-1015',
    type: 'Sale',
    description: '50 cartons Water Bottle',
    amount: 90000,
  },
  {
    id: 'tx-302',
    customerId: 'cust-3',
    date: 'Feb 20, 2025',
    referenceNumber: 'PAY-1006',
    type: 'Payment',
    description: 'Bank Transfer (Awash Bank)',
    amount: -67500,
    paymentMethod: 'Bank Transfer',
  },

  // --- Reta Retail (Outstanding 5,000 ETB) ---
  {
    id: 'tx-401',
    customerId: 'cust-4',
    date: 'Mar 28, 2025',
    referenceNumber: 'SALE-1030',
    type: 'Sale',
    description: '10 cartons Conditioning Shampoo',
    amount: 30000,
  },
  {
    id: 'tx-402',
    customerId: 'cust-4',
    date: 'Mar 28, 2025',
    referenceNumber: 'PAY-1011',
    type: 'Payment',
    description: 'Partial Cash Payment',
    amount: -25000,
    paymentMethod: 'Cash',
  },
];

/**
 * Computes deterministic customer ledger entries with accurate running balances.
 * Sorts transactions chronologically to calculate running balances,
 * then returns them reversed (most recent first) for UI display.
 */
export function computeCustomerLedger(customerId: string): {
  entries: CustomerLedgerEntry[];
  summary: CustomerFinancialSummary;
} {
  const customerTxs = RAW_CUSTOMER_TRANSACTIONS.filter((t) => t.customerId === customerId);

  let running = 0;
  let totalSales = 0;
  let totalPaid = 0;

  const entriesAscending: CustomerLedgerEntry[] = customerTxs.map((tx) => {
    if (tx.type === 'Sale') {
      running += tx.amount;
      totalSales += tx.amount;
    } else if (tx.type === 'Payment') {
      running += tx.amount; // tx.amount is negative
      totalPaid += Math.abs(tx.amount);
    } else if (tx.type === 'Adjustment') {
      running += tx.amount;
    }

    return {
      id: tx.id,
      customerId: tx.customerId,
      date: tx.date,
      referenceNumber: tx.referenceNumber,
      type: tx.type,
      description: tx.description,
      amount: tx.amount,
      runningBalance: running,
      paymentMethod: tx.paymentMethod,
    };
  });

  return {
    entries: [...entriesAscending].reverse(), // Newest on top
    summary: {
      customerId,
      totalSales,
      totalPaid,
      outstandingBalance: totalSales - totalPaid,
      transactionCount: customerTxs.length,
    },
  };
}

export const INITIAL_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'inv-tx-1',
    referenceNumber: 'PUR-2005',
    productId: 'prod-1',
    productName: 'Shower Gel',
    type: 'purchase',
    quantityCartons: 50,
    timeAgo: '2h ago',
    createdAt: '2025-04-12T10:00:00Z',
  },
  {
    id: 'inv-tx-2',
    referenceNumber: 'SALE-1042',
    productId: 'prod-2',
    productName: 'Soap Bar',
    type: 'sale',
    quantityCartons: -10,
    timeAgo: '4h ago',
    createdAt: '2025-04-12T08:00:00Z',
  },
  {
    id: 'inv-tx-3',
    referenceNumber: 'PUR-2004',
    productId: 'prod-6',
    productName: 'Wireless Headphones',
    type: 'purchase',
    quantityCartons: 20,
    timeAgo: '6h ago',
    createdAt: '2025-04-12T06:00:00Z',
  },
  {
    id: 'inv-tx-4',
    referenceNumber: 'SALE-1038',
    productId: 'prod-3',
    productName: 'Conditioning Shampoo',
    type: 'sale',
    quantityCartons: -8,
    timeAgo: '1d ago',
    createdAt: '2025-04-11T14:00:00Z',
  },
];
