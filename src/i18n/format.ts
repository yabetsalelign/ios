import type { Translations } from './translations';

export function formatEtb(amount: number, etbLabel: string): string {
  return `${amount.toLocaleString()} ${etbLabel}`;
}

export function paymentMethodLabel(method: string | undefined, t: Translations): string {
  const normalized = (method || '').trim().toLowerCase().replace(/[\s_]+/g, '');
  if (normalized === 'telebirr') return t.common.telebirr;
  if (normalized === 'banktransfer') return t.common.bankTransfer;
  if (normalized === 'cash') return t.common.cash;
  if (!method) return t.common.cash;
  return method;
}

export function validationMessage(code: string, t: Translations): string {
  const [key, a, b] = code.split('|');
  switch (key) {
    case 'chooseCustomer':
      return t.validation.chooseCustomer;
    case 'addOneProduct':
      return t.validation.addOneProduct;
    case 'chooseProduct':
      return t.validation.chooseProduct;
    case 'productNotFound':
      return t.validation.productNotFound;
    case 'enterCartons':
      return t.validation.enterCartons;
    case 'cartonsWholeNumber':
      return t.validation.cartonsWholeNumber;
    case 'insufficientStock':
      return t.validation.insufficientStock(Number(a) || 0);
    case 'priceNegative':
      return t.validation.priceNegative;
    case 'amountPaidNegative':
      return t.validation.amountPaidNegative;
    case 'amountPaidExceedsTotal':
      return t.validation.amountPaidExceedsTotal(Number(a) || 0, Number(b) || 0);
    case 'choosePaymentMethod':
      return t.validation.choosePaymentMethod;
    case 'noOutstandingBalance':
      return t.validation.noOutstandingBalance;
    case 'enterPaymentAmount':
      return t.validation.enterPaymentAmount;
    case 'paymentExceedsBalance':
      return t.validation.paymentExceedsBalance(Number(a) || 0);
    case 'costNegative':
      return t.validation.costNegative;
    case 'unauthorized':
      return t.validation.unauthorized;
    default:
      return code;
  }
}
