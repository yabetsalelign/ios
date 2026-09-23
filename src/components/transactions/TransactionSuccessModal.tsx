'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

export default function TransactionSuccessModal() {
  const { successFeedback, setSuccessFeedback } = useStockFlow();
  const { t } = useLanguage();

  if (!successFeedback) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
        {/* Animated Success Badge */}
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5px]" />
        </div>

        <h3 id="success-title" className="text-base font-bold text-slate-900">
          {successFeedback.title}
        </h3>
        <p className="text-xs font-mono font-semibold text-blue-600 mt-0.5">
          {successFeedback.reference}
        </p>

        {/* Detailed Breakdown List */}
        <div className="my-4 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-left text-xs space-y-1.5 divide-y divide-slate-100">
          {successFeedback.details.map((detail, idx) => (
            <div key={idx} className="pt-1.5 first:pt-0 text-slate-700 font-medium leading-snug">
              {detail}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSuccessFeedback(null)}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.99]"
        >
          {t.success.done}
        </button>
      </div>
    </div>
  );
}
