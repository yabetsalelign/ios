'use client';

import React from 'react';
import { Home, Package, Users, BarChart3, Plus, MoreHorizontal } from 'lucide-react';
import { ActiveTab, useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

export default function BottomNavigation() {
  const { activeTab, setActiveTab, currentUser, setIsQuickActionOpen, setSelectedCustomerId, setSelectedProductId } =
    useStockFlow();
  const { t } = useLanguage();
  const isManager = currentUser.role === 'manager';

  const handleTabClick = (tab: ActiveTab) => {
    setSelectedCustomerId(null);
    setSelectedProductId(null);
    setActiveTab(tab);
  };

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] lg:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-between relative">
        {/* Slot 1: Home */}
        <button
          type="button"
          onClick={() => handleTabClick('home')}
          aria-label={t.nav.home}
          aria-current={activeTab === 'home' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0 ${
            activeTab === 'home' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className={`w-5 h-5 flex-shrink-0 ${activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className={`text-[10px] leading-none tracking-tight ${activeTab === 'home' ? 'font-bold' : 'font-medium'}`}>
            {t.nav.home}
          </span>
        </button>

        {/* Slot 2: Stock */}
        <button
          type="button"
          onClick={() => handleTabClick('inventory')}
          aria-label={t.nav.stock}
          aria-current={activeTab === 'inventory' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0 ${
            activeTab === 'inventory' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className={`w-5 h-5 flex-shrink-0 ${activeTab === 'inventory' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className={`text-[10px] leading-none tracking-tight ${activeTab === 'inventory' ? 'font-bold' : 'font-medium'}`}>
            {t.nav.stock}
          </span>
        </button>

        {/* Slot 3: Elevated Center + */}
        <div className="flex-1 flex justify-center items-center relative">
          <button
            type="button"
            onClick={() => setIsQuickActionOpen(true)}
            aria-label={t.nav.recordAction}
            className="absolute -top-5 w-13 h-13 w-[52px] h-[52px] bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-900/30 active:scale-95 transition-transform hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20"
          >
            <Plus className="w-6 h-6 stroke-[2.5px]" />
          </button>
        </div>

        {/* Slot 4: Customers */}
        {isManager && (
          <button
            type="button"
            onClick={() => handleTabClick('customers')}
            aria-label={t.nav.customers}
            aria-current={activeTab === 'customers' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0 ${
              activeTab === 'customers' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className={`w-5 h-5 flex-shrink-0 ${activeTab === 'customers' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className={`text-[10px] leading-none tracking-tight ${activeTab === 'customers' ? 'font-bold' : 'font-medium'}`}>
              {t.nav.customers}
            </span>
          </button>
        )}

        {/* Slot 5: Reports or More */}
        {isManager ? (
          <button
            type="button"
            onClick={() => handleTabClick('reports')}
            aria-label={t.nav.reports}
            aria-current={activeTab === 'reports' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0 ${
              activeTab === 'reports' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart3 className={`w-5 h-5 flex-shrink-0 ${activeTab === 'reports' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className={`text-[10px] leading-none tracking-tight ${activeTab === 'reports' ? 'font-bold' : 'font-medium'}`}>
              {t.nav.reports}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleTabClick('more')}
            aria-label={t.nav.more}
            aria-current={activeTab === 'more' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0 ${
              activeTab === 'more' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 flex-shrink-0 ${activeTab === 'more' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className={`text-[10px] leading-none tracking-tight ${activeTab === 'more' ? 'font-bold' : 'font-medium'}`}>
              {t.nav.more}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
