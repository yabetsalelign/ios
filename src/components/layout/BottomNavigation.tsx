'use client';

import React from 'react';
import { Home, Package, Users, BarChart3, Plus, User } from 'lucide-react';
import { ActiveTab, useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

export default function BottomNavigation() {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setIsQuickActionOpen,
    setSelectedCustomerId,
    setSelectedProductId,
    isProfileOpen,
    setIsProfileOpen,
  } = useStockFlow();
  const { t, language } = useLanguage();
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
          aria-current={activeTab === 'home' && !isProfileOpen ? 'page' : undefined}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0 active:scale-95 transition-transform duration-100 ease-in-out touch-manipulation ${
            activeTab === 'home' && !isProfileOpen ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className={`w-5 h-5 flex-shrink-0 ${activeTab === 'home' && !isProfileOpen ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className={`text-[10px] leading-none tracking-tight ${activeTab === 'home' && !isProfileOpen ? 'font-bold' : 'font-medium'}`}>
            {t.nav.home}
          </span>
        </button>

        {/* Slot 2: Stock */}
        <button
          type="button"
          onClick={() => handleTabClick('inventory')}
          aria-label={t.nav.stock}
          aria-current={activeTab === 'inventory' && !isProfileOpen ? 'page' : undefined}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0 active:scale-95 transition-transform duration-100 ease-in-out touch-manipulation ${
            activeTab === 'inventory' && !isProfileOpen ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className={`w-5 h-5 flex-shrink-0 ${activeTab === 'inventory' && !isProfileOpen ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className={`text-[10px] leading-none tracking-tight ${activeTab === 'inventory' && !isProfileOpen ? 'font-bold' : 'font-medium'}`}>
            {t.nav.stock}
          </span>
        </button>

        {/* Slot 3: Elevated Center + */}
        <div className="flex-1 flex justify-center items-center relative">
          <button
            type="button"
            onClick={() => setIsQuickActionOpen(true)}
            aria-label={t.nav.recordAction}
            className="absolute -top-5 w-[52px] h-[52px] bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-900/30 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 active:scale-95 transition-transform duration-100 ease-in-out touch-manipulation"
          >
            <Plus className="w-6 h-6 stroke-[2.5px]" />
          </button>
        </div>

        {/* Slot 4: Customers */}
        <button
          type="button"
          onClick={() => handleTabClick('customers')}
          aria-label={t.nav.customers}
          aria-current={activeTab === 'customers' && !isProfileOpen ? 'page' : undefined}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0 active:scale-95 transition-transform duration-100 ease-in-out touch-manipulation ${
            activeTab === 'customers' && !isProfileOpen ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className={`w-5 h-5 flex-shrink-0 ${activeTab === 'customers' && !isProfileOpen ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className={`text-[10px] leading-none tracking-tight ${activeTab === 'customers' && !isProfileOpen ? 'font-bold' : 'font-medium'}`}>
            {t.nav.customers}
          </span>
        </button>

        {/* Slot 5: Reports or Profile */}
        {isManager ? (
          <button
            type="button"
            onClick={() => handleTabClick('reports')}
            aria-label={t.nav.reports}
            aria-current={activeTab === 'reports' && !isProfileOpen ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0 active:scale-95 transition-transform duration-100 ease-in-out touch-manipulation ${
              activeTab === 'reports' && !isProfileOpen ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart3 className={`w-5 h-5 flex-shrink-0 ${activeTab === 'reports' && !isProfileOpen ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className={`text-[10px] leading-none tracking-tight ${activeTab === 'reports' && !isProfileOpen ? 'font-bold' : 'font-medium'}`}>
              {t.nav.reports}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            aria-label={language === 'am' ? 'መገለጫ' : 'Profile'}
            aria-current={isProfileOpen ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0 active:scale-95 transition-transform duration-100 ease-in-out touch-manipulation ${
              isProfileOpen ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className={`w-5 h-5 flex-shrink-0 ${isProfileOpen ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className={`text-[10px] leading-none tracking-tight ${isProfileOpen ? 'font-bold' : 'font-medium'}`}>
              {language === 'am' ? 'መገለጫ' : 'Profile'}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
