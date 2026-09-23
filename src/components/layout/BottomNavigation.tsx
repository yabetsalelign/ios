'use client';

import React from 'react';
import { Home, Package, Users, BarChart3, Plus, Activity, MoreHorizontal } from 'lucide-react';
import { ActiveTab, useStockFlow } from '../../context/StockFlowContext';

export default function BottomNavigation() {
  const { activeTab, setActiveTab, currentUser, setIsQuickActionOpen, setSelectedCustomerId, setSelectedProductId } =
    useStockFlow();

  const isManager = currentUser.role === 'manager';

  const handleTabClick = (tab: ActiveTab) => {
    // Clear sub-page detail views when tapping bottom nav
    setSelectedCustomerId(null);
    setSelectedProductId(null);
    setActiveTab(tab);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] lg:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Slot 1: Home */}
        <button
          type="button"
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'home' ? 'text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </button>

        {/* Slot 2: Inventory */}
        <button
          type="button"
          onClick={() => handleTabClick('inventory')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'inventory' ? 'text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className={`w-5 h-5 ${activeTab === 'inventory' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Inventory</span>
        </button>

        {/* Slot 3: Fixed Elevated Center + Action Button */}
        <div className="flex-1 flex justify-center items-center relative">
          <button
            type="button"
            onClick={() => setIsQuickActionOpen(true)}
            aria-label="Record Transaction"
            className="absolute -top-5 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-900/30 active:scale-95 transition-transform hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20"
          >
            <Plus className="w-6 h-6 stroke-[2.5px]" />
          </button>
        </div>

        {/* Slot 4: Customers (Manager) or Activity (Warehouse) */}
        {isManager ? (
          <button
            type="button"
            onClick={() => handleTabClick('customers')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'customers' ? 'text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className={`w-5 h-5 ${activeTab === 'customers' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Customers</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleTabClick('activity')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'activity' ? 'text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Activity className={`w-5 h-5 ${activeTab === 'activity' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Activity</span>
          </button>
        )}

        {/* Slot 5: Reports (Manager) or More (Warehouse) */}
        {isManager ? (
          <button
            type="button"
            onClick={() => handleTabClick('reports')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'reports' ? 'text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${activeTab === 'reports' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Reports</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleTabClick('more')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === 'more' ? 'text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${activeTab === 'more' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-1 tracking-tight">More</span>
          </button>
        )}
      </div>
    </nav>
  );
}
