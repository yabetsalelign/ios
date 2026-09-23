'use client';

import React from 'react';
import {
  TrendingUp, PackageCheck, ArrowDownLeft, ArrowUpRight,
  AlertTriangle, ChevronRight, ShieldAlert,
} from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

function greeting(t: ReturnType<typeof useLanguage>['t']): string {
  const h = new Date().getHours();
  if (h < 12) return t.dashboard.greetingMorning;
  if (h < 17) return t.dashboard.greetingAfternoon;
  return t.dashboard.greetingEvening;
}

export default function ManagerDashboard() {
  const { currentUser, metrics, inventoryTransactions, setActiveTab } = useStockFlow();
  const { t } = useLanguage();
  const isWarehouse = currentUser.role === 'warehouse';

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {greeting(t)}, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isWarehouse ? t.dashboard.subtitleWarehouse : t.dashboard.subtitleManager}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-xs flex-shrink-0">
          <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Warehouse Role Notice */}
      {isWarehouse && (
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-snug">
            <span className="font-semibold">{t.dashboard.warehouseRestriction}: </span>
            {t.dashboard.warehouseRestrictionNote}
          </p>
        </div>
      )}

      {/* Manager Financial Cards */}
      {!isWarehouse && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#ECFDF5] border border-emerald-100 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-900">{t.dashboard.totalStock}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <TrendingUp className="w-3 h-3 stroke-[2.5px]" /> 12%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {metrics.totalInventoryValueETB.toLocaleString()}
              <span className="text-sm font-semibold text-emerald-800 ml-1">{t.common.etb}</span>
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-1 font-medium">{t.dashboard.totalStockSub}</p>
          </div>

          <div className="bg-[#FFF1F2] border border-rose-100 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-900">{t.dashboard.amountOwedTotal}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-white/80 px-2 py-0.5 rounded-full border border-rose-200/60">
                <TrendingUp className="w-3 h-3 stroke-[2.5px]" /> 8%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {metrics.totalCustomerCreditETB.toLocaleString()}
              <span className="text-sm font-semibold text-rose-700 ml-1">{t.common.etb}</span>
            </div>
            <p className="text-[11px] text-rose-700/80 mt-1 font-medium">{t.dashboard.amountOwedTotalSub}</p>
          </div>
        </div>
      )}

      {/* 4 Status Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.inStock}</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {metrics.inStockCartons.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">{t.dashboard.cartons}</span>
          </div>
          <span className="text-[10px] text-blue-600 font-medium">{t.dashboard.inStockSub}</span>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.comingIn}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {metrics.incomingCartons.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">{t.dashboard.cartons}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">{t.dashboard.comingInSub}</span>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.sold}</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {metrics.outgoingCartons.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">{t.dashboard.cartons}</span>
          </div>
          <span className="text-[10px] text-orange-600 font-medium">{t.dashboard.soldSub}</span>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.lowStock}</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-purple-700 tabular-nums">
            {metrics.lowStockCount}
            <span className="text-xs font-normal text-slate-400 ml-1">{t.dashboard.items}</span>
          </div>
          <span className="text-[10px] text-purple-600 font-medium">{t.dashboard.lowStockSub}</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">{t.dashboard.recentActivity}</h2>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            <span>{t.dashboard.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {inventoryTransactions.map((tx) => {
            const isPurchase = tx.type === 'purchase';
            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-1.5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 tabular-nums ${
                      isPurchase
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    }`}
                  >
                    {isPurchase ? `+${tx.quantityCartons}` : `${tx.quantityCartons}`}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{tx.productName}</p>
                    <p className="text-[11px] text-slate-500">
                      {isPurchase
                        ? `+${tx.quantityCartons} ${t.dashboard.cartons} (${t.dashboard.purchase})`
                        : `${Math.abs(tx.quantityCartons)} ${t.dashboard.cartons} (${t.dashboard.sale})`}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium flex-shrink-0">{tx.timeAgo}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
