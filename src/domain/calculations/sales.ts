/**
 * Pure calculation functions for sales transactions.
 * Completely decoupled from React/Next.js.
 */

export interface LineItemCalculationInput {
  quantityCartons: number;
  pricePerCarton: number;
}

/**
 * Calculates the line total for a single product item.
 */
export function calculateLineTotal(quantityCartons: number, pricePerCarton: number): number {
  if (quantityCartons < 0 || pricePerCarton < 0) return 0;
  return quantityCartons * pricePerCarton;
}

/**
 * Calculates the total sale amount from an array of line items.
 */
export function calculateSaleSubtotal(items: LineItemCalculationInput[]): number {
  return items.reduce((sum, item) => sum + calculateLineTotal(item.quantityCartons, item.pricePerCarton), 0);
}

/**
 * Calculates the remaining credit debt for a sale given the total amount and amount paid.
 * Ensures creditRemaining does not drop below 0.
 */
export function calculateSaleOutstanding(totalAmount: number, amountPaid: number): {
  creditRemaining: number;
  isFullyPaid: boolean;
} {
  const safeTotal = Math.max(0, totalAmount);
  const safePaid = Math.max(0, Math.min(amountPaid, safeTotal));
  const creditRemaining = safeTotal - safePaid;

  return {
    creditRemaining,
    isFullyPaid: creditRemaining === 0 && safeTotal > 0,
  };
}
