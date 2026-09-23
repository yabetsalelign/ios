'use client';

import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ReportsView() {
  const { customers, getCustomerSummary, products } = useStockFlow();
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.reports.title}</h1>
          <p className="text-xs text-slate-500">{t.reports.subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Apr 1, 2025 - Apr 30, 2025</span>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-2xs">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t.reports.totalSales}</p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1 font-mono">185,000</p>
          <div className="flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold mt-1">
            <TrendingUp className="w-3 h-3 stroke-[2.5px]" />
            <span>12%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-2xs">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t.reports.totalPaid}</p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1 font-mono">150,000</p>
          <div className="flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold mt-1">
            <TrendingUp className="w-3 h-3 stroke-[2.5px]" />
            <span>10%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-2xs">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t.reports.totalOwed}</p>
          <p className="text-base sm:text-lg font-bold text-rose-700 mt-1 font-mono">35,000</p>
          <div className="flex items-center gap-0.5 text-[10px] text-rose-600 font-semibold mt-1">
            <TrendingUp className="w-3 h-3 stroke-[2.5px]" />
            <span>8%</span>
          </div>
        </div>
      </div>

      {/* Top Customers by Due Balance */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.reports.topCustomers}</h2>
          <span className="text-[11px] font-semibold text-blue-600">{t.reports.viewAll}</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {customers.map((c, i) => {
            const sum = getCustomerSummary(c.id);
            return (
              <div key={c.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-400 w-4">{i + 1}.</span>
                  <span className="font-semibold text-slate-800">{c.name}</span>
                </div>
                <div className="font-bold font-mono text-slate-900">
                  {sum.outstandingBalance.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ETB</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory Breakdown by Cartons */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.reports.topStock}</h2>
          <span className="text-[11px] text-slate-400 font-medium">{t.reports.cartons}</span>
        </div>

        <div className="space-y-2 text-xs">
          {products.slice(0, 4).map((p) => (
            <div key={p.id} className="flex items-center justify-between py-1">
              <span className="text-slate-700 truncate max-w-[200px]">{p.name}</span>
              <span className="font-bold text-slate-900 font-mono">{p.currentStockCartons} {t.reports.cartons}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
