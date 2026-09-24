'use client';

import React, { useEffect } from 'react';
import { X, ShoppingBag, PlusCircle, CreditCard, PackagePlus, ArrowRight } from 'lucide-react';
import { ActiveModal, useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

export default function QuickActionSheet() {
  const { isQuickActionOpen, setIsQuickActionOpen, currentUser, setActiveModal } = useStockFlow();
  const { t } = useLanguage();
  const isManager = currentUser.role === 'manager';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isQuickActionOpen) setIsQuickActionOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickActionOpen, setIsQuickActionOpen]);

  if (!isQuickActionOpen) return null;

  const handleSelectAction = (modal: ActiveModal) => {
    setIsQuickActionOpen(false);
    setActiveModal(modal);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-action-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={() => setIsQuickActionOpen(false)}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 border border-slate-100"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)' }}
      >
        {/* Drag Handle */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" aria-hidden="true" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="quick-action-title" className="text-lg font-bold text-slate-900 tracking-tight">
              {t.quickAction.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{t.quickAction.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickActionOpen(false)}
            aria-label={t.common.close}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>

        {/* Action List */}
        <div className="mt-4 space-y-2.5">
          {isManager && (
            <button
              type="button"
              onClick={() => handleSelectAction('sale')}
              className="w-full text-left p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center gap-4 group active:scale-[0.99]"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 stroke-[2.2px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-900">{t.quickAction.sell}</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t.quickAction.sellSub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSelectAction('purchase')}
            className="w-full text-left p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all flex items-center gap-4 group active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5 stroke-[2.2px]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-slate-900 group-hover:text-emerald-900">{t.quickAction.addStock}</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t.quickAction.addStockSub}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {isManager && (
            <button
              type="button"
              onClick={() => handleSelectAction('payment')}
              className="w-full text-left p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-amber-50/50 hover:border-amber-200 transition-all flex items-center gap-4 group active:scale-[0.99]"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5 stroke-[2.2px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-amber-900">{t.quickAction.customerPaid}</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t.quickAction.customerPaidSub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </button>
          )}

          {isManager && (
            <div
              className="w-full text-left p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 opacity-60 flex items-center gap-4 cursor-not-allowed select-none"
              title="Catalog creation will be supported in Phase 3"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-200/80 text-slate-500 flex items-center justify-center flex-shrink-0">
                <PackagePlus className="w-5 h-5 stroke-[2px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm text-slate-600">{t.quickAction.newProduct}</h3>
                  <span className="text-[10px] font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                    Phase 3
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{t.quickAction.newProductSub}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
