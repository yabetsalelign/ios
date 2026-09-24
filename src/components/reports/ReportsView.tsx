'use client';

import React from 'react';
import { Users, Download, AlertTriangle, CheckCircle2, Package } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ReportsView() {
  const { customers, getCustomerSummary, products, setActiveModal, setPreselectedProductId } = useStockFlow();
  const { t } = useLanguage();

  // Section 1: Customer Balances – sorted by outstanding desc
  const customerBalances = customers
    .map((c) => ({ ...c, summary: getCustomerSummary(c.id) }))
    .sort((a, b) => b.summary.outstandingBalance - a.summary.outstandingBalance);

  const customersWithDebt = customerBalances.filter((c) => c.summary.outstandingBalance > 0);

  // Section 2: Products sorted by selling price (revenue proxy) – top 5
  const productBestSellers = products
    .slice()
    .sort((a, b) => b.sellingPricePerCarton * (b.piecesPerCarton || 24) - a.sellingPricePerCarton * (a.piecesPerCarton || 24))
    .slice(0, 5);

  // Section 3: Low Stock Report
  const lowStockProducts = products
    .filter((p) => p.currentStockCartons <= p.lowStockThresholdCartons)
    .sort((a, b) => a.currentStockCartons - b.currentStockCartons);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.reports.title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{t.reports.subtitle}</p>
      </div>

      {/* ── Section 1: Customer Balances ────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-rose-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">{t.reports.customersWhoOwe}</h2>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 bg-white shadow-2xs transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-2xs overflow-hidden">
          {customersWithDebt.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">{t.reports.allCustomersSettled}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span className="col-span-5">Customer</span>
                <span className="col-span-4 text-right">Total Sales</span>
                <span className="col-span-3 text-right">Owes</span>
              </div>
              {customersWithDebt.map((c, i) => (
                <div key={c.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs hover:bg-slate-50/60 transition-colors">
                  <div className="col-span-5 flex items-center gap-2 min-w-0">
                    <span className="text-slate-400 font-semibold w-4 flex-shrink-0">{i + 1}.</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{c.phone}</p>
                    </div>
                  </div>
                  <div className="col-span-4 text-right">
                    <p className="font-semibold text-slate-700 font-mono tabular-nums">
                      {c.summary.totalSales.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">ETB</p>
                  </div>
                  <div className="col-span-3 text-right">
                    <p className="font-bold text-rose-700 font-mono tabular-nums">
                      {c.summary.outstandingBalance.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">ETB</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Section 2: Best-Selling Products ────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">{t.reports.salesSummaries}</h2>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 bg-white shadow-2xs transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="col-span-5">Product</span>
              <span className="col-span-4 text-right">Sell Price</span>
              <span className="col-span-3 text-right">Stock</span>
            </div>
            {productBestSellers.map((p, i) => {
              const isLow = p.currentStockCartons <= p.lowStockThresholdCartons;
              return (
                <div key={p.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs">
                  <div className="col-span-5 flex items-center gap-2 min-w-0">
                    <span className="text-slate-400 font-semibold w-4 flex-shrink-0">{i + 1}.</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                    </div>
                  </div>
                  <div className="col-span-4 text-right">
                    <p className="font-bold text-slate-900 font-mono tabular-nums">
                      {p.sellingPricePerCarton.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">ETB / ctn</p>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.currentStockCartons === 0
                        ? 'bg-rose-50 text-rose-700'
                        : isLow
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {p.currentStockCartons} ctn
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: Low Stock / Reorder List ─────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">{t.reports.lowStockReorder}</h2>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 bg-white shadow-2xs transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-2xs overflow-hidden">
          {lowStockProducts.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">{t.reports.allStockHealthy}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockProducts.map((p) => {
                const isOut = p.currentStockCartons === 0;
                return (
                  <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Min: {p.lowStockThresholdCartons} ctn · Has: {p.currentStockCartons} ctn</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOut ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {isOut ? t.inventory.outOfStock : t.inventory.lowStock}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPreselectedProductId(p.id);
                          setActiveModal('purchase');
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-2.5 py-1 bg-blue-50 hover:bg-blue-100 transition-colors whitespace-nowrap"
                      >
                        {t.reports.reorderNow}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
