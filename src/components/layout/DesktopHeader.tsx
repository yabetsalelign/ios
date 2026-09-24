'use client';

import React from 'react';
import { ShieldCheck, Package, ChevronRight } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

export default function DesktopHeader() {
  const { activeTab, selectedCustomerId, customers, currentUser, setIsProfileOpen } = useStockFlow();
  const { language, setLanguage, t } = useLanguage();

  const isManager = currentUser.role === 'manager';

  const selectedCustomer = selectedCustomerId
    ? customers.find((c) => c.id === selectedCustomerId)
    : null;

  const getPageTitle = () => {
    if (selectedCustomer) return selectedCustomer.name;
    switch (activeTab) {
      case 'home':
        return isManager ? t.sidebar.dashboard : t.warehouse.title;
      case 'inventory':
        return t.inventory.title;
      case 'customers':
        return t.customers.title;
      case 'reports':
        return t.reports.title;
      case 'activity':
        return t.warehouse.title;
      default:
        return 'StockFlow';
    }
  };

  return (
    <header className="hidden lg:flex items-center justify-between w-full h-16 px-8 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex-shrink-0">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-slate-400">StockFlow</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        {selectedCustomer && (
          <>
            <span className="font-medium text-slate-500">{t.customers.title}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </>
        )}
        <span className="font-bold text-sm text-slate-900 tracking-tight">
          {getPageTitle()}
        </span>
      </div>

      {/* Right Controls: Role pill, Language, Profile Button */}
      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isManager
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
              : 'bg-blue-50 text-blue-800 border-blue-200/80'
          }`}
        >
          {isManager ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Package className="w-3.5 h-3.5 text-blue-600" />}
          <span>{isManager ? t.sidebar.manager : t.sidebar.warehouse}</span>
        </span>

        {/* Language Switcher */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            type="button"
            aria-label="Switch to English"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              language === 'en' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            aria-label="Switch to Amharic"
            onClick={() => setLanguage('am')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              language === 'am' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            አማ
          </button>
        </div>

        {/* Profile Button - Functional */}
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          title="Open Profile & Settings"
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200/80 transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-200 flex-shrink-0 group-hover:ring-2 group-hover:ring-slate-900/10 transition-all">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-400 font-medium leading-none">
              {isManager ? 'Manager' : 'Warehouse'}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
