/**
 * Deterministic transaction reference generator.
 * Produces unique, sequential business references matching the StockFlow convention.
 */

let saleSequence = 1043;
let paymentSequence = 1019;
let purchaseSequence = 2006;
let invTxSequence = 5;

export function generateTransactionReference(type: 'SALE' | 'PAY' | 'PUR' | 'INV'): string {
  switch (type) {
    case 'SALE':
      saleSequence += 1;
      return `SALE-${saleSequence}`;
    case 'PAY':
      paymentSequence += 1;
      return `PAY-${paymentSequence}`;
    case 'PUR':
      purchaseSequence += 1;
      return `PUR-${purchaseSequence}`;
    case 'INV':
      invTxSequence += 1;
      return `INV-TX-${invTxSequence}`;
  }
}
