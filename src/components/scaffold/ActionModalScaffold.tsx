'use client';

import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';

export default function ActionModalScaffold() {
  const { scaffoldAction, setScaffoldAction } = useStockFlow();

  if (!scaffoldAction) return null;

  const titles: Record<string, { title: string; subtitle: string; details: string }> = {
    sale: {
      title: 'Record Sale',
      subtitle: 'Multi-Product Sale + Customer Ledger Form',
      details:
        'Phase 2 Form Scaffold: Will support selecting customer, adding multiple products in cartons, automatic total calculation in ETB, partial payment toggle, and remaining credit calculation before atomic submission.',
    },
    purchase: {
      title: 'Record Purchase',
      subtitle: 'Physical Inventory Receiving Form',
      details:
        'Phase 2 Form Scaffold: Will record incoming carton quantities, unit cost per carton, total cost, and immediately update inventory cartons without creating unrequested supplier debt.',
    },
    payment: {
      title: 'Record Customer Payment',
      subtitle: 'Independent Ledger Settlement Form',
      details:
        'Phase 2 Form Scaffold: Will allow selecting customer, displaying current outstanding balance, inputting payment amount (Cash, Telebirr, Bank Transfer), and dynamically computing new balance without altering stock.',
    },
    add_product: {
      title: 'Add Product',
      subtitle: 'Product Catalog Specification',
      details:
        'Phase 2 Form Scaffold: Will allow inputting product name, SKU, category, initial carton count, selling price per carton, and optional pieces-per-carton metadata.',
    },
  };

  const info = titles[scaffoldAction] || {
    title: 'Transaction Form',
    subtitle: 'Phase 2 Architecture',
    details: 'This form will be built in Phase 2.',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">{info.title}</h3>
            <p className="text-xs text-slate-500">{info.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setScaffoldAction(null)}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800 mb-1">Phase 1 Boundary Notice</p>
            <p>{info.details}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setScaffoldAction(null)}
          className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          Got it (Continue Reviewing Phase 1 Views)
        </button>
      </div>
    </div>
  );
}
