'use client';

import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, AlertCircle, ShoppingBag, Loader2, UserPlus, Search } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { SaleItemFormInput } from '../../domain/validation/validators';
import { calculateLineTotal, calculateSaleOutstanding, calculateSaleSubtotal } from '../../domain/calculations/sales';
import { validationMessage } from '../../i18n/format';
import CustomerFormModal from '../customers/CustomerFormModal';

function RecordSaleContent() {
  const {
    setActiveModal,
    customers,
    products,
    preselectedCustomerId,
    setPreselectedCustomerId,
    getCustomerSummary,
    executeSale,
  } = useStockFlow();
  const { t } = useLanguage();

  const [customerId, setCustomerId] = useState<string>(() => preselectedCustomerId || customers[0]?.id || '');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState<boolean>(false);
  const [productSearches, setProductSearches] = useState<Record<number, string>>({});

  const initialProd = products[0];
  const [items, setItems] = useState<SaleItemFormInput[]>([
    {
      productId: initialProd?.id || '',
      quantityCartons: 1,
      pricePerCarton: initialProd?.sellingPricePerCarton || 0,
    },
  ]);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived financial calculations
  const totalAmount = useMemo(() => calculateSaleSubtotal(items), [items]);
  const { creditRemaining } = useMemo(
    () => calculateSaleOutstanding(totalAmount, amountPaid),
    [totalAmount, amountPaid]
  );

  // Filtered customer list by search query
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId),
    [customers, customerId]
  );
  const selectedCustomerSummary = customerId ? getCustomerSummary(customerId) : null;

  // Validation state: must be disabled or blocked when conditions fail
  const isSaleValid = useMemo(() => {
    if (!customerId || customerId.trim() === '') return false;
    if (!items || items.length === 0) return false;

    for (const item of items) {
      if (!item.productId || item.productId.trim() === '') return false;
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) return false;
      if (
        !item.quantityCartons ||
        item.quantityCartons <= 0 ||
        !Number.isInteger(item.quantityCartons)
      ) {
        return false;
      }
      if (item.quantityCartons > prod.currentStockCartons) {
        return false;
      }
      if (
        item.pricePerCarton === undefined ||
        item.pricePerCarton === null ||
        isNaN(item.pricePerCarton) ||
        item.pricePerCarton < 0
      ) {
        return false;
      }
    }

    if (isNaN(totalAmount) || totalAmount <= 0) return false;
    if (amountPaid < 0 || amountPaid > totalAmount) return false;
    if (amountPaid > 0 && (!paymentMethod || paymentMethod.trim() === '')) return false;

    return true;
  }, [customerId, items, products, totalAmount, amountPaid, paymentMethod]);

  const handleClose = () => {
    setActiveModal(null);
    setPreselectedCustomerId(null);
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const prod = products.find((p) => p.id === newProductId);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId: newProductId,
      pricePerCarton: prod ? prod.sellingPricePerCarton : 0,
    };
    setItems(updated);
    // Clear product error for this index
    if (errors[`item_${index}_product`] || errors[`item_${index}_quantity`]) {
      const newErrors = { ...errors };
      delete newErrors[`item_${index}_product`];
      delete newErrors[`item_${index}_quantity`];
      setErrors(newErrors);
    }
  };

  const handleQuantityChange = (index: number, val: string) => {
    const num = parseInt(val, 10);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      quantityCartons: isNaN(num) ? 0 : num,
    };
    setItems(updated);
    if (errors[`item_${index}_quantity`]) {
      const newErrors = { ...errors };
      delete newErrors[`item_${index}_quantity`];
      setErrors(newErrors);
    }
  };

  const handlePriceChange = (index: number, val: string) => {
    const num = parseFloat(val);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      pricePerCarton: isNaN(num) ? 0 : num,
    };
    setItems(updated);
  };

  const handleAddItem = () => {
    const available = products.find((p) => !items.some((it) => it.productId === p.id)) || products[0];
    setItems([
      ...items,
      {
        productId: available?.id || '',
        quantityCartons: 1,
        pricePerCarton: available?.sellingPricePerCarton || 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handlePresetPayment = (type: 'full' | 'half' | 'zero') => {
    if (type === 'full') setAmountPaid(totalAmount);
    else if (type === 'half') setAmountPaid(Math.floor(totalAmount / 2));
    else if (type === 'zero') setAmountPaid(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Strict validation check before submission
    if (!customerId || customerId.trim() === '') {
      setErrors({ customerId: 'chooseCustomer' });
      return;
    }

    const newErrors: Record<string, string> = {};

    items.forEach((item, idx) => {
      if (!item.productId) {
        newErrors[`item_${idx}_product`] = 'chooseProduct';
        return;
      }
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        newErrors[`item_${idx}_product`] = 'productNotFound';
        return;
      }
      if (!item.quantityCartons || item.quantityCartons <= 0) {
        newErrors[`item_${idx}_quantity`] = 'enterCartons';
      } else if (!Number.isInteger(item.quantityCartons)) {
        newErrors[`item_${idx}_quantity`] = 'cartonsWholeNumber';
      } else if (item.quantityCartons > prod.currentStockCartons) {
        newErrors[`item_${idx}_quantity`] = `insufficientStock|${prod.currentStockCartons}`;
      }
    });

    if (totalAmount <= 0) {
      newErrors.general = 'saleTotalZero';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await executeSale({
      customerId,
      items,
      amountPaid,
      paymentMethod: amountPaid > 0 ? paymentMethod : undefined,
      notes,
    });

    setIsSubmitting(false);

    if (result.success) {
      handleClose();
    } else if (result.validationErrors) {
      setErrors(result.validationErrors);
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-sale-title"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
      >
        <div
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 id="record-sale-title" className="text-base font-bold text-slate-900 tracking-tight">
                  {t.sale.title}
                </h2>
                <p className="text-[11px] text-slate-500">{t.sale.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close form"
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-4 flex-1">
            {/* General Errors Banner */}
            {errors.general && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{validationMessage(errors.general, t)}</span>
              </div>
            )}

            {/* Customer Selector with Search & Quick Add */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="sale-customer" className="block text-xs font-semibold text-slate-700">
                  {t.sale.chooseCustomer} <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 active:scale-95 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ {t.sale.addCustomer}</span>
                </button>
              </div>

              {/* Customer Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder={t.sale.searchCustomer}
                  className="w-full bg-slate-50/90 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
                />
              </div>

              <select
                id="sale-customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
              >
                <option value="">-- {t.sale.chooseCustomer} --</option>
                {filteredCustomers.map((c) => {
                  const sum = getCustomerSummary(c.id);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''} — {t.sale.currentOwes}: {sum.outstandingBalance.toLocaleString()} {t.sale.etb}
                    </option>
                  );
                })}
              </select>

              {errors.customerId && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {validationMessage(errors.customerId, t)}
                </p>
              )}

              {/* Selected Customer Compact Confirmation */}
              {selectedCustomer && (
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-slate-900 truncate">{selectedCustomer.name}</span>
                    {selectedCustomer.phone && (
                      <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                        {selectedCustomer.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[11px] text-slate-500">{t.sale.currentOwes}:</span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        selectedCustomerSummary && selectedCustomerSummary.outstandingBalance > 0
                          ? 'text-rose-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {(selectedCustomerSummary?.outstandingBalance ?? 0).toLocaleString()} {t.sale.etb}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Product Items Header */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {t.sale.products} ({items.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.sale.addProduct}</span>
                </button>
              </div>

              {errors.items && (
                <p className="text-[11px] text-rose-600 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationMessage(errors.items, t)}
                </p>
              )}

              {/* Product Item Cards */}
              <div className="space-y-3">
                {items.map((item, idx) => {
                  const selectedProd = products.find((p) => p.id === item.productId);
                  const lineTotal = calculateLineTotal(item.quantityCartons, item.pricePerCarton);
                  const productError = errors[`item_${idx}_product`];
                  const quantityError = errors[`item_${idx}_quantity`];

                  // Product search filter per line item
                  const pSearch = productSearches[idx] || '';
                  const filteredProducts = products.filter((p) => {
                    if (!pSearch.trim()) return true;
                    const q = pSearch.toLowerCase();
                    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
                  });

                  return (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {t.sale.item} #{idx + 1}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            aria-label={`Remove item ${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Product Search & Selection */}
                      <div className="space-y-1.5">
                        <div className="relative">
                          <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={productSearches[idx] || ''}
                            onChange={(e) =>
                              setProductSearches((prev) => ({ ...prev, [idx]: e.target.value }))
                            }
                            placeholder={t.sale.searchProduct}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                          />
                        </div>

                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-medium"
                        >
                          <option value="">-- Choose a product --</option>
                          {filteredProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {p.currentStockCartons} {t.inventory.cartons} {t.inventory.inStock} (SKU: {p.sku})
                            </option>
                          ))}
                        </select>

                        {productError && (
                          <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationMessage(productError, t)}
                          </p>
                        )}

                        {/* Selected Product Info Badge (Product name prominent, SKU secondary) */}
                        {selectedProd && (
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 text-xs space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-bold text-slate-900 truncate">{selectedProd.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono flex-shrink-0">SKU: {selectedProd.sku}</div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                              <span
                                className={
                                  selectedProd.currentStockCartons <= 0
                                    ? 'text-rose-600 font-bold'
                                    : 'text-slate-600 font-medium'
                                }
                              >
                                {t.sale.inStock}:{' '}
                                <strong className="font-mono text-slate-900">
                                  {selectedProd.currentStockCartons} {t.inventory.cartons}
                                </strong>
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-600 font-medium">
                                {t.sale.price}:{' '}
                                <strong className="font-mono text-slate-900">
                                  {selectedProd.sellingPricePerCarton.toLocaleString()} {t.sale.etb}/
                                  {t.inventory.cartons}
                                </strong>
                              </span>
                            </div>
                            {selectedProd.currentStockCartons <= 0 && (
                              <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 pt-0.5">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{t.sale.outOfStock} (0 {t.inventory.cartons})</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity & Unit Price Row */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                            {t.sale.howManyCartons}
                          </label>
                          {(() => {
                            const isExceedingStock = Boolean(
                              selectedProd && item.quantityCartons > selectedProd.currentStockCartons
                            );
                            return (
                              <>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min="1"
                                  value={item.quantityCartons || ''}
                                  onChange={(e) => handleQuantityChange(idx, e.target.value)}
                                  className={`w-full bg-white border ${
                                    isExceedingStock || quantityError
                                      ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/40 text-rose-900'
                                      : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'
                                  } rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 transition-all`}
                                />
                                {isExceedingStock && selectedProd && (
                                  <p className="text-[10px] text-rose-600 font-semibold mt-1 leading-tight flex items-start gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                    <span>
                                      {t.validation.insufficientStock(selectedProd.currentStockCartons)}
                                    </span>
                                  </p>
                                )}
                                {!isExceedingStock && quantityError && (
                                  <p className="text-[10px] text-rose-600 mt-0.5 leading-tight flex items-start gap-1">
                                    <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                    <span>{validationMessage(quantityError, t)}</span>
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                            {t.sale.pricePerCarton}
                          </label>
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            value={item.pricePerCarton || ''}
                            onChange={(e) => handlePriceChange(idx, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold"
                          />
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-xs">
                        <span className="text-slate-500">{t.sale.lineSubtotal}</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {lineTotal.toLocaleString()} {t.sale.etb}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sale Total Display */}
            <div data-total-summary className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">{t.sale.totalSale}</span>
              <span className="text-lg font-extrabold tracking-tight font-mono">
                {totalAmount.toLocaleString()} {t.sale.etb}
              </span>
            </div>

            {/* Payment Section */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                {t.sale.paymentTerms}
              </label>

              {/* Presets: Paid in Full, Partial, Credit */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetPayment('full')}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    amountPaid === totalAmount && totalAmount > 0
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t.sale.paidInFull}
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetPayment('half')}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    amountPaid > 0 && amountPaid < totalAmount
                      ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t.sale.partial}
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetPayment('zero')}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    amountPaid === 0
                      ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t.sale.fullCredit}
                </button>
              </div>

              {/* Upfront Payment Input & Method */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="amount-paid-input" className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    {t.sale.amountPaid}
                  </label>
                  <input
                    id="amount-paid-input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max={totalAmount}
                    value={amountPaid === 0 ? '' : amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                  />
                  {errors.amountPaid && (
                    <p className="text-[10px] text-rose-600 mt-1 leading-tight flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>{validationMessage(errors.amountPaid, t)}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="payment-method-select" className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    {t.sale.paymentMethod}
                  </label>
                  <select
                    id="payment-method-select"
                    disabled={amountPaid <= 0}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-medium disabled:opacity-50 disabled:bg-slate-100"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Telebirr">Telebirr</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                  {errors.paymentMethod && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationMessage(errors.paymentMethod, t)}
                    </p>
                  )}
                </div>
              </div>

              {/* Credit Remaining Calculation Preview */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900">{t.sale.stillOwes}</span>
                <span className="font-extrabold text-amber-900 font-mono">
                  {creditRemaining.toLocaleString()} {t.sale.etb}
                </span>
              </div>

              {/* Optional Notes */}
              <div>
                <label htmlFor="sale-notes" className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                  {t.sale.notes}
                </label>
                <input
                  id="sale-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.sale.notesPlaceholder}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
                />
              </div>
            </div>

            {/* Submit Action Button (Disabled when invalid) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !isSaleValid}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.sale.submitting}</span>
                  </>
                ) : (
                  <span>{t.sale.submit}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Quick Add Customer Modal Overlay (preserves sale state) */}
      <CustomerFormModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onCustomerCreated={(newCust) => {
          setCustomerId(newCust.id);
          setCustomerSearch(newCust.name);
          setIsAddCustomerOpen(false);
        }}
      />
    </>
  );
}

export default function RecordSaleModal() {
  const { activeModal, preselectedCustomerId } = useStockFlow();

  if (activeModal !== 'sale') return null;

  return <RecordSaleContent key={preselectedCustomerId || 'default'} />;
}
