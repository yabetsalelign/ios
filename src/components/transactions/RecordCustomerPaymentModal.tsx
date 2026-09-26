'use client';

import React, { useState, useMemo } from 'react';
import { X, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

function RecordCustomerPaymentContent() {
  const {
    setActiveModal,
    customers,
    preselectedCustomerId,
    setPreselectedCustomerId,
    getCustomerSummary,
    executePayment,
  } = useStockFlow();
  const { t } = useLanguage();

  const [customerId, setCustomerId] = useState<string>(() => preselectedCustomerId || customers[0]?.id || '');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [reference, setReference] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentSummary = useMemo(() => {
    return customerId ? getCustomerSummary(customerId) : null;
  }, [customerId, getCustomerSummary]);

  const outstanding = currentSummary ? currentSummary.outstandingBalance : 0;
  const newBalance = Math.max(0, outstanding - (amount || 0));

  const handleClose = () => {
    setActiveModal(null);
    setPreselectedCustomerId(null);
  };

  const handleQuickPreset = (percent: number) => {
    if (outstanding > 0) {
      setAmount(Math.round(outstanding * percent));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});

    const result = await executePayment({
      customerId,
      amount,
      paymentMethod,
      reference,
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
      aria-labelledby="record-payment-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 id="record-payment-title" className="text-base font-bold text-slate-900 tracking-tight">
                {t.payment.title}
              </h2>
              <p className="text-[11px] text-slate-500">{t.payment.subtitle}</p>
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

          {/* Customer Selection */}
          <div>
            <label htmlFor="payment-customer" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.payment.chooseCustomer} <span className="text-rose-500">*</span>
            </label>
            <select
              id="payment-customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
            >
              {customers.map((c) => {
                const sum = getCustomerSummary(c.id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} — {t.payment.currentOwes}: {sum.outstandingBalance.toLocaleString()} {t.payment.etb}
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
          </div>

          {/* Current Outstanding Balance Display */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">{t.payment.currentOwes}</span>
            <span className="text-base font-extrabold text-rose-700 font-mono">
              {outstanding.toLocaleString()} {t.payment.etb}
            </span>
          </div>

          {/* Payment Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="payment-amount" className="text-xs font-semibold text-slate-700">
                {t.payment.amountPaid} <span className="text-rose-500">*</span>
              </label>
              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleQuickPreset(0.5)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(1)}
                  className="px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold"
                >
                  100%
                </button>
              </div>
            </div>

            <input
              id="payment-amount"
              type="number"
              inputMode="decimal"
              min="1"
              max={outstanding}
              value={amount === 0 ? '' : amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 15000"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
            {errors.amount && (
              <p className="text-[11px] text-rose-600 mt-1 leading-tight flex items-start gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{errors.amount}</span>
              </p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label htmlFor="customer-payment-method" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.payment.paymentMethod} <span className="text-rose-500">*</span>
            </label>
            <select
              id="customer-payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium"
            >
              <option value="Cash">Cash</option>
              <option value="Telebirr">Telebirr</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
            {errors.paymentMethod && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.paymentMethod}
              </p>
            )}
          </div>

          {/* Reference / Receipt No. (Optional) */}
          <div>
            <label htmlFor="payment-reference" className="block text-xs font-semibold text-slate-700 mb-1">
              {t.payment.referenceNo}
            </label>
            <input
              id="payment-reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t.payment.referencePlaceholder}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
            />
          </div>

          {/* New Balance Preview */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">{t.payment.newBalance}</span>
            <span className="text-base font-extrabold text-emerald-900 font-mono">
              {newBalance.toLocaleString()} {t.payment.etb}
            </span>
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
                  <span>{t.payment.submitting}</span>
                </>
              ) : (
                <span>{t.payment.submit}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RecordCustomerPaymentModal() {
  const { activeModal, preselectedCustomerId } = useStockFlow();

  if (activeModal !== 'payment') return null;

  return <RecordCustomerPaymentContent key={preselectedCustomerId || 'default'} />;
}
