'use client';

import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

function RecordPurchaseContent() {
  const {
    setActiveModal,
    products,
    preselectedProductId,
    setPreselectedProductId,
    executePurchase,
  } = useStockFlow();
  const { t } = useLanguage();

  const initialTargetId = preselectedProductId || products[0]?.id || '';
  const initialProd = products.find((p) => p.id === initialTargetId);

  const [productId, setProductId] = useState<string>(initialTargetId);
  const [quantityCartons, setQuantityCartons] = useState<number>(10);
  const [costPerCarton, setCostPerCarton] = useState<number>(initialProd ? initialProd.costPerCarton : 0);
  const [supplierName, setSupplierName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProduct = products.find((p) => p.id === productId);
  const totalCost = (quantityCartons || 0) * (costPerCarton || 0);

  const handleClose = () => {
    setActiveModal(null);
    setPreselectedProductId(null);
  };

  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    const prod = products.find((p) => p.id === newProductId);
    if (prod) {
      setCostPerCarton(prod.costPerCarton);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});

    const result = await executePurchase({
      productId,
      quantityCartons,
      costPerCarton,
      supplierName: supplierName.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      handleClose();
    } else if (result.validationErrors) {
      setErrors(result.validationErrors);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-purchase-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 id="record-purchase-title" className="text-base font-bold text-slate-900 tracking-tight">
                {t.purchase.title}
              </h2>
              <p className="text-[11px] text-slate-500">{t.purchase.subtitle}</p>
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
          {errors.general && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Product Selection */}
          <div>
            <label htmlFor="purchase-product" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.purchase.chooseProduct} <span className="text-rose-500">*</span>
            </label>
            <select
              id="purchase-product"
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku}) — {t.purchase.currentStock}: {p.currentStockCartons} {t.inventory.cartons}
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.productId}
              </p>
            )}
            {selectedProduct && (
              <p className="text-[11px] text-slate-500 mt-1">
                {t.purchase.currentStock}:{' '}
                <span className="font-semibold text-slate-900 font-mono">
                  {selectedProduct.currentStockCartons} {t.inventory.cartons}
                </span>
              </p>
            )}
          </div>

          {/* Quantity in Cartons */}
          <div>
            <label htmlFor="purchase-quantity" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.purchase.howManyCartons} <span className="text-rose-500">*</span>
            </label>
            <input
              id="purchase-quantity"
              type="number"
              inputMode="numeric"
              min="1"
              value={quantityCartons || ''}
              onChange={(e) => setQuantityCartons(parseInt(e.target.value, 10) || 0)}
              placeholder="e.g. 50"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
            {errors.quantityCartons && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.quantityCartons}
              </p>
            )}
          </div>

          {/* Cost per Carton */}
          <div>
            <label htmlFor="purchase-cost" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.purchase.costPerCarton}
            </label>
            <input
              id="purchase-cost"
              type="number"
              inputMode="decimal"
              min="0"
              value={costPerCarton || ''}
              onChange={(e) => setCostPerCarton(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
            />
            {errors.costPerCarton && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.costPerCarton}
              </p>
            )}
          </div>

          {/* Total Cost Display */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">{t.purchase.totalCost}</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">
              {totalCost.toLocaleString()} {t.purchase.etb}
            </span>
          </div>

          {/* Optional Supplier Note (strictly reference only, no supplier balance/debt) */}
          <div>
            <label htmlFor="purchase-supplier" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.purchase.supplierNote}
            </label>
            <input
              id="purchase-supplier"
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder={t.purchase.supplierPlaceholder}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
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
                  <span>{t.purchase.submitting}</span>
                </>
              ) : (
                <span>{t.purchase.submit}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RecordPurchaseModal() {
  const { activeModal, preselectedProductId } = useStockFlow();

  if (activeModal !== 'purchase') return null;

  return <RecordPurchaseContent key={preselectedProductId || 'default'} />;
}
