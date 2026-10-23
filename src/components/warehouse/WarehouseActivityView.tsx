'use client';

import React from 'react';
import { Package, Plus, AlertTriangle } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

export default function WarehouseActivityView() {
  const { metrics, products, inventoryTransactions, setIsQuickActionOpen, setActiveModal, setPreselectedProductId } = useStockFlow();
  const { t } = useLanguage();

  const lowStockItems = products.filter(
    (p) => p.currentStockCartons <= p.lowStockThresholdCartons
  );

  const recentActivity = inventoryTransactions.slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.warehouse.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.warehouse.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsQuickActionOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-transform active:scale-[0.99] shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.warehouse.logActivity}</span>
        </button>
      </div>

      {/* 3 Physical Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-3.5 shadow-2xs">
          <p className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider">{t.warehouse.totalItems}</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">{metrics.inStockCartons.toLocaleString()}</p>
          <p className="text-[10px] text-blue-700 font-medium mt-0.5">{t.dashboard.cartons}</p>
        </div>

        <div className="bg-[#ECFDF5] border border-emerald-100 rounded-2xl p-3.5 shadow-2xs">
          <p className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">{t.warehouse.comingIn}</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">{metrics.incomingCartons.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">{t.dashboard.cartons}</p>
        </div>

        <div className="bg-[#FFF7ED] border border-orange-100 rounded-2xl p-3.5 shadow-2xs">
          <p className="text-[10px] font-semibold text-orange-800 uppercase tracking-wider">{t.warehouse.sold}</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">{metrics.outgoingCartons.toLocaleString()}</p>
          <p className="text-[10px] text-orange-700 font-medium mt-0.5">{t.dashboard.cartons}</p>
        </div>
      </div>

      {/* Low Stock Alert Section */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-200/60">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <h2 className="text-xs font-bold text-amber-900">{t.reports.lowStockReorder}</h2>
            <span className="ml-auto text-[11px] font-bold bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full">
              {lowStockItems.length}
            </span>
          </div>
          <div className="space-y-2">
            {lowStockItems.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-amber-200/60 overflow-hidden flex-shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-amber-700 font-medium">
                      {p.currentStockCartons === 0 ? t.inventory.outOfStock : `${p.currentStockCartons} / ${p.lowStockThresholdCartons} ctn`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreselectedProductId(p.id);
                    setActiveModal('purchase');
                  }}
                  className="text-[11px] font-bold text-blue-700 border border-blue-200/80 rounded-lg px-2.5 py-1 bg-white hover:bg-blue-50 transition-colors flex-shrink-0"
                >
                  {t.reports.reorderNow}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Stock Activity Feed */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-bold text-slate-900">{t.dashboard.recentActivity}</h2>
          </div>
        </div>

        {recentActivity.length === 0 ? (
          <div className="py-6 text-center">
            <Package className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">{t.common.noData}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActivity.map((tx) => {
              const isPurchase = tx.type === 'purchase';
              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 tabular-nums ${isPurchase
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}>
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
        )}
      </div>
    </div>
  );
}
