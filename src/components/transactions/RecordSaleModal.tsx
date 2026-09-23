'use client';

import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, AlertCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { SaleItemFormInput } from '../../domain/validation/validators';
import { calculateLineTotal, calculateSaleOutstanding, calculateSaleSubtotal } from '../../domain/calculations/sales';

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
  const initialProd = products[0];
  const [items, setItems] = useState<SaleItemFormInput[]>([
    { productId: initialProd?.id || '', quantityCartons: 1, pricePerCarton: initialProd?.sellingPricePerCarton || 0 },
  ]);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived financial calculations
  const totalAmount = useMemo(() => calculateSaleSubtotal(items), [items]);
  const { creditRemaining } = useMemo(() => calculateSaleOutstanding(totalAmount, amountPaid), [totalAmount, amountPaid]);

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
  };

  const handleQuantityChange = (index: number, val: string) => {
    const num = parseInt(val, 10);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      quantityCartons: isNaN(num) ? 0 : num,
    };
    setItems(updated);
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

  const selectedCustomerSummary = customerId ? getCustomerSummary(customerId) : null;

  return (
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
              <span>{errors.general}</span>
            </div>
          )}

          {/* Customer Selector */}
          <div>
            <label htmlFor="sale-customer" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.sale.chooseCustomer} <span className="text-rose-500">*</span>
            </label>
            <select
              id="sale-customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
            >
              {customers.map((c) => {
                const sum = getCustomerSummary(c.id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} — {t.sale.currentOwes}: {sum.outstandingBalance.toLocaleString()} {t.sale.etb}
                  </option>
                );
              })}
            </select>
            {errors.customerId && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.customerId}
              </p>
            )}
            {selectedCustomerSummary && (
              <p className="text-[11px] text-slate-500 mt-1">
                {t.sale.currentOwes}:{' '}
                <span className="font-semibold text-rose-600 font-mono">
                  {selectedCustomerSummary.outstandingBalance.toLocaleString()} {t.sale.etb}
                </span>
              </p>
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
                {errors.items}
              </p>
            )}

            {/* Product Item Cards */}
            <div className="space-y-3">
              {items.map((item, idx) => {
                const selectedProd = products.find((p) => p.id === item.productId);
                const lineTotal = calculateLineTotal(item.quantityCartons, item.pricePerCarton);
                const productError = errors[`item_${idx}_product`];
                const quantityError = errors[`item_${idx}_quantity`];

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

                    {/* Product Selection */}
                    <div>
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (SKU: {p.sku}) — {p.currentStockCartons} {t.inventory.cartons} {t.inventory.inStock}
                          </option>
                        ))}
                      </select>
                      {productError && (
                        <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {productError}
                        </p>
                      )}
                    </div>

                    {/* Quantity & Unit Price Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          {t.sale.howManyCartons}
                        </label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max={selectedProd ? selectedProd.currentStockCartons : undefined}
                          value={item.quantityCartons || ''}
                          onChange={(e) => handleQuantityChange(idx, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold"
                        />
                        {quantityError && (
                          <p className="text-[10px] text-rose-600 mt-0.5 leading-tight flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span>{quantityError}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          {t.sale.pricePerCarton} ({t.sale.etb})
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
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
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
                  {t.sale.amountPaid} ({t.sale.etb})
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
                    <span>{errors.amountPaid}</span>
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
                    {errors.paymentMethod}
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

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
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
  );
}

export default function RecordSaleModal() {
  const { activeModal, preselectedCustomerId } = useStockFlow();

  if (activeModal !== 'sale') return null;

  return <RecordSaleContent key={preselectedCustomerId || 'default'} />;
}
