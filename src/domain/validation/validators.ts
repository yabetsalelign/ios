/**
 * Pure validation functions for transaction workflows.
 * Returns boolean isValid and accessible error messages.
 */

export interface SaleItemFormInput {
  productId: string;
  quantityCartons: number;
  pricePerCarton: number;
}

export interface SaleFormInput {
  customerId: string;
  items: SaleItemFormInput[];
  amountPaid: number;
  paymentMethod?: string;
  dueDate?: string;
  notes?: string;
}

export interface CustomerPaymentFormInput {
  customerId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

export interface PurchaseFormInput {
  productId: string;
  quantityCartons: number;
  costPerCarton: number;
  supplierName?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a Sale before submission.
 */
export function validateSale(
  input: SaleFormInput,
  productStockMap: Map<string, { name: string; currentStockCartons: number }>
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.customerId || input.customerId.trim() === '') {
    errors.customerId = 'chooseCustomer';
  }

  if (!input.items || input.items.length === 0) {
    errors.items = 'addOneProduct';
  } else {
    // Validate each item
    input.items.forEach((item, index) => {
      if (!item.productId) {
        errors[`item_${index}_product`] = 'chooseProduct';
        return;
      }

      const productInfo = productStockMap.get(item.productId);
      if (!productInfo) {
        errors[`item_${index}_product`] = 'productNotFound';
        return;
      }

      if (!item.quantityCartons || item.quantityCartons <= 0) {
        errors[`item_${index}_quantity`] = 'enterCartons';
      } else if (!Number.isInteger(item.quantityCartons)) {
        errors[`item_${index}_quantity`] = 'cartonsWholeNumber';
      } else if (item.quantityCartons > productInfo.currentStockCartons) {
        errors[`item_${index}_quantity`] = `insufficientStock|${productInfo.currentStockCartons}`;
      }

      if (item.pricePerCarton < 0) {
        errors[`item_${index}_price`] = 'priceNegative';
      }
    });
  }

  const totalSaleAmount = input.items.reduce(
    (sum, it) => sum + Math.max(0, it.quantityCartons || 0) * Math.max(0, it.pricePerCarton || 0),
    0
  );

  if (input.amountPaid < 0) {
    errors.amountPaid = 'amountPaidNegative';
  } else if (input.amountPaid > totalSaleAmount) {
    errors.amountPaid = `amountPaidExceedsTotal|${input.amountPaid}|${totalSaleAmount}`;
  }

  if (input.amountPaid > 0 && (!input.paymentMethod || input.paymentMethod.trim() === '')) {
    errors.paymentMethod = 'choosePaymentMethod';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a Customer Payment before submission.
 */
export function validateCustomerPayment(
  input: CustomerPaymentFormInput,
  currentOutstandingBalance: number
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.customerId || input.customerId.trim() === '') {
    errors.customerId = 'chooseCustomer';
  }

  if (currentOutstandingBalance <= 0) {
    errors.amount = 'noOutstandingBalance';
  } else if (!input.amount || input.amount <= 0) {
    errors.amount = 'enterPaymentAmount';
  } else if (input.amount > currentOutstandingBalance) {
    errors.amount = `paymentExceedsBalance|${currentOutstandingBalance}`;
  }

  if (!input.paymentMethod || input.paymentMethod.trim() === '') {
    errors.paymentMethod = 'choosePaymentMethod';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a Purchase before submission.
 */
export function validatePurchase(
  input: PurchaseFormInput,
  productExists: boolean
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.productId || input.productId.trim() === '') {
    errors.productId = 'chooseProduct';
  } else if (!productExists) {
    errors.productId = 'productNotFound';
  }

  if (!input.quantityCartons || input.quantityCartons <= 0) {
    errors.quantityCartons = 'enterCartons';
  } else if (!Number.isInteger(input.quantityCartons)) {
    errors.quantityCartons = 'cartonsWholeNumber';
  }

  if (input.costPerCarton < 0) {
    errors.costPerCarton = 'costNegative';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates Product creation and edit form inputs.
 */
export function validateProduct(
  input: {
    name: string;
    sku: string;
    barcode?: string;
    description?: string;
    category?: string;
    image?: string;
    piecesPerCarton?: number;
    sellingPricePerCarton: number;
    costPerCarton: number;
    lowStockThresholdCartons?: number;
  },
  existingProducts: Array<{ id: string; sku: string; barcode?: string | null }>,
  currentProductId?: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim() === '') {
    errors.name = 'productNameRequired';
  }

  if (!input.sku || input.sku.trim() === '') {
    errors.sku = 'skuRequired';
  } else {
    const cleanSku = input.sku.trim().toLowerCase();
    const isDuplicateSku = existingProducts.some(
      (p) => p.sku.toLowerCase() === cleanSku && p.id !== currentProductId
    );
    if (isDuplicateSku) {
      errors.sku = 'skuDuplicate';
    }
  }

  if (input.barcode && input.barcode.trim() !== '') {
    const cleanBarcode = input.barcode.trim().toLowerCase();
    const isDuplicateBarcode = existingProducts.some(
      (p) => p.barcode && p.barcode.trim().toLowerCase() === cleanBarcode && p.id !== currentProductId
    );
    if (isDuplicateBarcode) {
      errors.barcode = 'barcodeDuplicate';
    }
  }

  if (
    input.sellingPricePerCarton === undefined ||
    input.sellingPricePerCarton === null ||
    Number.isNaN(Number(input.sellingPricePerCarton)) ||
    Number(input.sellingPricePerCarton) < 0
  ) {
    errors.sellingPricePerCarton = 'priceNegative';
  }

  if (
    input.costPerCarton === undefined ||
    input.costPerCarton === null ||
    Number.isNaN(Number(input.costPerCarton)) ||
    Number(input.costPerCarton) < 0
  ) {
    errors.costPerCarton = 'costNegative';
  }

  if (input.piecesPerCarton !== undefined && input.piecesPerCarton !== null && !Number.isNaN(Number(input.piecesPerCarton))) {
    if (Number(input.piecesPerCarton) <= 0 || !Number.isInteger(Number(input.piecesPerCarton))) {
      errors.piecesPerCarton = 'piecesPositiveInteger';
    }
  }

  if (input.lowStockThresholdCartons !== undefined && input.lowStockThresholdCartons !== null && !Number.isNaN(Number(input.lowStockThresholdCartons))) {
    if (Number(input.lowStockThresholdCartons) < 0 || !Number.isInteger(Number(input.lowStockThresholdCartons))) {
      errors.lowStockThresholdCartons = 'thresholdNonNegativeInteger';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
