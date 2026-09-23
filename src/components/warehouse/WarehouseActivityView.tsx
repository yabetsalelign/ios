'use client';

import React from 'react';
import { Truck, ArrowDownLeft, ArrowUpRight, PackageCheck, ScanBarcode } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';

export default function WarehouseActivityView() {
  const { metrics, setIsQuickActionOpen } = useStockFlow();

  const dispatches = [
    { id: 'disp-1', customer: 'ABC Trading', details: '5 cartons · Shower Gel', time: '2h ago', avatar: 'AB' },
    { id: 'disp-2', customer: 'Mame Shop', details: '10 cartons · Soap', time: '5h ago', avatar: 'MS' },
    { id: 'disp-3', customer: 'XYZ Wholesale', details: '15 cartons · Shampoo', time: '7h ago', avatar: 'XY' },
    { id: 'disp-4', customer: 'Reta Retail', details: '8 cartons · Water Bottle', time: '1d ago', avatar: 'RR' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Warehouse View</h1>
          <p className="text-xs text-slate-500">Physical stock movement & dispatch activity</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-2xs">
          <ScanBarcode className="w-4 h-4" />
        </div>
      </div>

      {/* 3 Physical Metrics matching Screen 8 */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-3 shadow-2xs">
          <p className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider">Total Items</p>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">{metrics.inStockCartons}</p>
          <p className="text-[10px] text-blue-700 font-semibold mt-0.5">↑ 12%</p>
        </div>

        <div className="bg-[#ECFDF5] border border-emerald-100 rounded-2xl p-3 shadow-2xs">
          <p className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">Incoming</p>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">{metrics.incomingCartons}</p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">↑ 15%</p>
        </div>

        <div className="bg-[#FFF7ED] border border-orange-100 rounded-2xl p-3 shadow-2xs">
          <p className="text-[10px] font-semibold text-orange-800 uppercase tracking-wider">Outgoing</p>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">{metrics.outgoingCartons}</p>
          <p className="text-[10px] text-orange-700 font-semibold mt-0.5">↑ 8%</p>
        </div>
      </div>

      {/* Recent Dispatches List matching Screen 8 */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Dispatches</h2>
          <span className="text-[11px] font-semibold text-blue-600">View all</span>
        </div>

        <div className="divide-y divide-slate-100">
          {dispatches.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0">
                  {item.avatar}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{item.customer}</p>
                  <p className="text-[11px] text-slate-500 truncate">{item.details}</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Warehouse Action Button */}
      <button
        type="button"
        onClick={() => setIsQuickActionOpen(true)}
        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <Truck className="w-4 h-4" />
        <span>Log Dispatch</span>
      </button>
    </div>
  );
}
