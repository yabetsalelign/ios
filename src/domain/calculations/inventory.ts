/**
 * Pure calculation functions for inventory stock changes.
 * All units are strictly CARTONS.
 */

/**
 * Calculates updated stock in cartons after a sale dispatch.
 * Prevents negative inventory.
 */
export function calculateStockAfterSale(currentStockCartons: number, quantitySoldCartons: number): number {
  const result = currentStockCartons - quantitySoldCartons;
  return Math.max(0, result);
}

/**
 * Calculates updated stock in cartons after receiving a purchase.
 */
export function calculateStockAfterPurchase(currentStockCartons: number, quantityPurchasedCartons: number): number {
  return currentStockCartons + Math.max(0, quantityPurchasedCartons);
}

/**
 * Checks if requested cartons are available in stock.
 */
export function hasSufficientStock(currentStockCartons: number, requestedCartons: number): boolean {
  return requestedCartons > 0 && currentStockCartons >= requestedCartons;
}
