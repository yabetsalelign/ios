/**
 * Pure customer ledger calculation functions.
 * Calculates financial totals and running balances deterministically
 * based on historical chronological transactions.
 */

export interface RawLedgerTransaction {
  id: string;
  customerId: string;
  date: string;
  referenceNumber: string;
  type: 'Sale' | 'Payment' | 'Adjustment';
  description: string;
  amount: number; // positive for sale, negative for payment
  paymentMethod?: string;
  createdAt?: string;
}

export interface ComputedLedgerEntry extends RawLedgerTransaction {
  runningBalance: number;
}

export interface CustomerFinancialsResult {
  customerId: string;
  totalSales: number;
  totalPaid: number;
  outstandingBalance: number;
  transactionCount: number;
  entries: ComputedLedgerEntry[];
}

/**
 * Derives running balances and financial summaries from raw transaction history.
 * Positive amounts (Sales) add to debt; negative amounts (Payments) reduce debt.
 */
export function calculateCustomerFinancials(
  customerId: string,
  transactions: RawLedgerTransaction[]
): CustomerFinancialsResult {
  const customerTxs = transactions.filter((t) => t.customerId === customerId);

  let running = 0;
  let totalSales = 0;
  let totalPaid = 0;

  // Process in chronological order (oldest to newest) to maintain running balance integrity
  const entriesAscending: ComputedLedgerEntry[] = customerTxs.map((tx) => {
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
      ...tx,
      runningBalance: running,
    };
  });

  return {
    customerId,
    totalSales,
    totalPaid,
    outstandingBalance: totalSales - totalPaid,
    transactionCount: customerTxs.length,
    entries: [...entriesAscending].reverse(), // Newest on top for user display
  };
}
