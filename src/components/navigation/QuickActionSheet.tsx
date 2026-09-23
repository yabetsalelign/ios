'use client';

import React, { useEffect } from 'react';
import { X, ShoppingBag, PlusCircle, CreditCard, PackagePlus, ArrowRight } from 'lucide-react';
import { QuickActionType, useStockFlow } from '../../context/StockFlowContext';

export default function QuickActionSheet() {
  const { isQuickActionOpen, setIsQuickActionOpen, currentUser, setScaffoldAction } = useStockFlow();

  const isManager = currentUser.role === 'manager';

  // Handle ESC key for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isQuickActionOpen) {
        setIsQuickActionOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickActionOpen, setIsQuickActionOpen]);

  if (!isQuickActionOpen) return null;

  const handleSelectAction = (action: QuickActionType) => {
    setIsQuickActionOpen(false);
    setScaffoldAction(action);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-action-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        onClick={() => setIsQuickActionOpen(false)}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      {/* Sheet Modal Container */}
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 border border-slate-100"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)' }}
      >
        {/* iOS Drag Handle Bar */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="quick-action-title" className="text-lg font-bold text-slate-900 tracking-tight">
              What do you want to record?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Select a business transaction to continue</p>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickActionOpen(false)}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>

        {/* Action List */}
        <div className="mt-4 space-y-2.5">
          {/* Action 1: Record Sale (Manager Only) */}
          {isManager && (
            <button
              type="button"
              onClick={() => handleSelectAction('sale')}
              className="w-full text-left p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/40 hover:border-blue-200 transition-all flex items-center gap-3.5 group active:scale-[0.99]"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 stroke-[2.2px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-900">Record Sale</h3>
                <p className="text-xs text-slate-500">Stock outgoing + customer ledger update</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          )}

          {/* Action 2: Record Purchase / Add Stock */}
          <button
            type="button"
            onClick={() => handleSelectAction('purchase')}
            className="w-full text-left p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all flex items-center gap-3.5 group active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5 stroke-[2.2px]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-slate-900 group-hover:text-emerald-900">Record Purchase</h3>
              <p className="text-xs text-slate-500">Incoming stock in cartons (no supplier debt)</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Action 3: Record Customer Payment (Manager Only) */}
          {isManager && (
            <button
              type="button"
              onClick={() => handleSelectAction('payment')}
              className="w-full text-left p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-amber-50/40 hover:border-amber-200 transition-all flex items-center gap-3.5 group active:scale-[0.99]"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5 stroke-[2.2px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-amber-900">Record Customer Payment</h3>
                <p className="text-xs text-slate-500">Update ledger balance (does not affect stock)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          )}

          {/* Action 4: Add Product (Manager Only) */}
          {isManager && (
            <button
              type="button"
              onClick={() => handleSelectAction('add_product')}
              className="w-full text-left p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 transition-all flex items-center gap-3.5 group active:scale-[0.99]"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <PackagePlus className="w-5 h-5 stroke-[2.2px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm text-slate-900">Add Product</h3>
                  <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                    Manager only
                  </span>
                </div>
                <p className="text-xs text-slate-500">Create new SKU with carton metrics</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
