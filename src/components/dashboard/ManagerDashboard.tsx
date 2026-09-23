'use client';

import React from 'react';
import {
  TrendingUp,
  PackageCheck,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';

export default function ManagerDashboard() {
  const { currentUser, metrics, inventoryTransactions, setActiveTab, setSelectedProductId } = useStockFlow();

  const isWarehouse = currentUser.role === 'warehouse';

  return (
    <div className="space-y-6">
      {/* Top Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Good morning, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isWarehouse
              ? "Here's the physical stock & dispatch overview"
              : "Here's what's happening with your business today."}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-xs">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Role Notice if Warehouse User (role permissions check) */}
      {isWarehouse && (
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <p className="text-xs text-amber-900 leading-snug">
            <span className="font-semibold">Warehouse Mode:</span> Sensitive company financials (inventory value & customer credit balances) are restricted per role policy.
          </p>
        </div>
      )}

      {/* Primary Financial Metric Cards (Manager Only) */}
      {!isWarehouse && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Total Inventory Value Card */}
          <div className="bg-[#ECFDF5] border border-emerald-100 rounded-2xl p-4.5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-900 tracking-tight">Total Inventory</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-emerald-200/60">
                <TrendingUp className="w-3 h-3 stroke-[2.5px]" />
                12%
              </span>
            </div>
            <div className="mt-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {metrics.totalInventoryValueETB.toLocaleString()}{' '}
                <span className="text-sm font-semibold text-emerald-800">ETB</span>
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-1 font-medium">Estimated wholesale valuation</p>
            </div>
          </div>

          {/* Customer Credit Card */}
          <div className="bg-[#FFF1F2] border border-rose-100 rounded-2xl p-4.5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-900 tracking-tight">Customer Credit</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-rose-200/60">
                <TrendingUp className="w-3 h-3 stroke-[2.5px]" />
                8%
              </span>
            </div>
            <div className="mt-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {metrics.totalCustomerCreditETB.toLocaleString()}{' '}
                <span className="text-sm font-semibold text-rose-700">ETB</span>
              </div>
              <p className="text-[11px] text-rose-700/80 mt-1 font-medium">Total outstanding receivables</p>
            </div>
          </div>
        </div>
      )}

      {/* 4 Status Metrics Grid (2x2 on narrow mobile, 4-col on tablet/desktop per Rule 17) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Chip 1: In Stock */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">In Stock</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {metrics.inStockCartons.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">cartons</span>
            </div>
            <span className="text-[10px] text-blue-600 font-medium">Ready in warehouse</span>
          </div>
        </div>

        {/* Chip 2: Incoming */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Incoming</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {metrics.incomingCartons.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">cartons</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">From purchases</span>
          </div>
        </div>

        {/* Chip 3: Outgoing */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Outgoing</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {metrics.outgoingCartons.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">cartons</span>
            </div>
            <span className="text-[10px] text-orange-600 font-medium">Dispatched sales</span>
          </div>
        </div>

        {/* Chip 4: Low Stock */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Low Stock</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-700">
              {metrics.lowStockCount}{' '}
              <span className="text-xs font-normal text-slate-500">items</span>
            </div>
            <span className="text-[10px] text-purple-600 font-medium">Needs reorder</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            <span>View all</span>
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
                  {/* Square Status Badge matching Screen 2 */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
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
                      {isPurchase ? `+${tx.quantityCartons} cartons (Purchase)` : `${tx.quantityCartons} cartons (Sale)`}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium">{tx.timeAgo}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
