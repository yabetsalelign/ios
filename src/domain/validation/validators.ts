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
    errors.customerId = 'Please select a customer';
  }

  if (!input.items || input.items.length === 0) {
    errors.items = 'Please add at least one product to the sale';
  } else {
    // Validate each item
    input.items.forEach((item, index) => {
      if (!item.productId) {
        errors[`item_${index}_product`] = 'Product selection is required';
        return;
      }

      const productInfo = productStockMap.get(item.productId);
      if (!productInfo) {
        errors[`item_${index}_product`] = 'Selected product not found in catalog';
        return;
      }

      if (!item.quantityCartons || item.quantityCartons <= 0) {
        errors[`item_${index}_quantity`] = 'Quantity must be greater than 0 cartons';
      } else if (!Number.isInteger(item.quantityCartons)) {
        errors[`item_${index}_quantity`] = 'Carton quantity must be a whole number';
      } else if (item.quantityCartons > productInfo.currentStockCartons) {
        errors[`item_${index}_quantity`] = `Insufficient stock: only ${productInfo.currentStockCartons} cartons available`;
      }

      if (item.pricePerCarton < 0) {
        errors[`item_${index}_price`] = 'Price cannot be negative';
      }
    });
  }

  const totalSaleAmount = input.items.reduce(
    (sum, it) => sum + Math.max(0, it.quantityCartons || 0) * Math.max(0, it.pricePerCarton || 0),
    0
  );

  if (input.amountPaid < 0) {
    errors.amountPaid = 'Amount paid cannot be negative';
  } else if (input.amountPaid > totalSaleAmount) {
    errors.amountPaid = `Amount paid (${input.amountPaid.toLocaleString()} ETB) cannot exceed sale total (${totalSaleAmount.toLocaleString()} ETB)`;
  }

  if (input.amountPaid > 0 && (!input.paymentMethod || input.paymentMethod.trim() === '')) {
    errors.paymentMethod = 'Payment method is required when an upfront payment is made';
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
    errors.customerId = 'Please select a customer';
  }

  if (currentOutstandingBalance <= 0) {
    errors.amount = 'Customer has no outstanding balance to pay';
  } else if (!input.amount || input.amount <= 0) {
    errors.amount = 'Payment amount must be greater than 0 ETB';
  } else if (input.amount > currentOutstandingBalance) {
    errors.amount = `Payment amount (${input.amount.toLocaleString()} ETB) cannot exceed outstanding balance (${currentOutstandingBalance.toLocaleString()} ETB)`;
  }

  if (!input.paymentMethod || input.paymentMethod.trim() === '') {
    errors.paymentMethod = 'Please select a payment method';
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
    errors.productId = 'Please select a product';
  } else if (!productExists) {
    errors.productId = 'Selected product not found in catalog';
  }

  if (!input.quantityCartons || input.quantityCartons <= 0) {
    errors.quantityCartons = 'Quantity must be greater than 0 cartons';
  } else if (!Number.isInteger(input.quantityCartons)) {
    errors.quantityCartons = 'Carton quantity must be a whole number';
  }

  if (input.costPerCarton < 0) {
    errors.costPerCarton = 'Cost per carton cannot be negative';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
