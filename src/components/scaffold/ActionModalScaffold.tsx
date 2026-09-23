'use client';

import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

/**
 * ActionModalScaffold — Shows a modal for the "Add Product" action
 * which is scheduled for catalog extension in Phase 3.
 */
export default function ActionModalScaffold() {
  const { activeModal, setActiveModal } = useStockFlow();
  const { t } = useLanguage();

  // Only handle the `add_product` scaffold — other modals are handled by dedicated components
  if (activeModal !== 'add_product') return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scaffold-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 id="scaffold-modal-title" className="text-base font-bold text-slate-900">
              {t.addProduct.title}
            </h3>
            <p className="text-xs text-slate-500">{t.addProduct.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800 mb-1">{t.addProduct.comingSoon}</p>
            <p>{t.addProduct.comingSoonDetail}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveModal(null)}
          className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm active:scale-[0.99]"
        >
          {t.addProduct.gotIt}
        </button>
      </div>
    </div>
  );
}
