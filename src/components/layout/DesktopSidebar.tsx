'use client';

import React from 'react';
import { Home, Package, Users, BarChart3, Plus, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { ActiveTab, useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

export default function DesktopSidebar() {
  const {
    activeTab, setActiveTab, currentUser, switchRole,
    setIsQuickActionOpen, setSelectedCustomerId, setSelectedProductId,
    setIsProfileOpen,
  } = useStockFlow();
  const { language, setLanguage, t } = useLanguage();
  const isManager = currentUser.role === 'manager';

  const handleTabClick = (tab: ActiveTab) => {
    setSelectedCustomerId(null);
    setSelectedProductId(null);
    setActiveTab(tab);
  };

  const navBtn = (tab: ActiveTab, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => handleTabClick(tab)}
      aria-current={activeTab === tab ? 'page' : undefined}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        activeTab === tab
          ? 'bg-slate-100 text-slate-900 font-semibold'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <aside className="hidden lg:flex lg:flex-col w-60 bg-white border-r border-slate-200/80 min-h-screen p-5 flex-shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-lg tracking-tight text-slate-900">StockFlow</h1>
          <p className="text-xs text-slate-500 truncate">{t.sidebar.tagline}</p>
        </div>
      </div>

      {/* Active Role Indicator Card */}
      <div className="mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isManager ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <Package className="w-4 h-4 text-blue-600 flex-shrink-0" />
          )}
          <span className="text-xs font-bold text-slate-800">
            {isManager ? t.sidebar.manager : t.sidebar.warehouse}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
        >
          {t.common.search === 'ፈልግ' ? 'ቀይር' : 'Switch'}
        </button>
      </div>

      {/* Quick Action Button */}
      <button
        type="button"
        onClick={() => setIsQuickActionOpen(true)}
        className="w-full mb-5 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
      >
        <Plus className="w-4 h-4 stroke-[2.5px]" />
        <span>{t.sidebar.quickAction}</span>
      </button>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1" aria-label="Sidebar Navigation">
        {navBtn('home', <Home className="w-4 h-4 flex-shrink-0" />, t.sidebar.dashboard)}
        {navBtn('inventory', <Package className="w-4 h-4 flex-shrink-0" />, t.sidebar.stock)}
        {isManager ? (
          <>
            {navBtn('customers', <Users className="w-4 h-4 flex-shrink-0" />, t.sidebar.customers)}
            {navBtn('reports', <BarChart3 className="w-4 h-4 flex-shrink-0" />, t.sidebar.reports)}
          </>
        ) : (
          <>
            {navBtn('more', <MoreHorizontal className="w-4 h-4 flex-shrink-0" />, t.sidebar.more)}
          </>
        )}
      </nav>

      {/* Language Switcher */}
      <div className="mt-4 flex items-center gap-1.5 px-2">
        <span className="text-[11px] text-slate-400 font-medium">{t.common.language}:</span>
        <button
          type="button"
          aria-label="English"
          onClick={() => setLanguage('en')}
          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
            language === 'en' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >EN</button>
        <button
          type="button"
          aria-label="Amharic"
          onClick={() => setLanguage('am')}
          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
            language === 'am' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >አማ</button>
      </div>

      {/* Functional User Info Footer */}
      <button
        type="button"
        onClick={() => setIsProfileOpen(true)}
        title="Open Profile & Settings"
        className="pt-4 border-t border-slate-100 flex items-center gap-3 mt-3 w-full text-left p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-200 group-hover:ring-2 group-hover:ring-slate-900/10">
          <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{currentUser.name}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 capitalize">
            {isManager ? (
              <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
            ) : (
              <Package className="w-3 h-3 text-blue-600 flex-shrink-0" />
            )}
            <span className="truncate">{isManager ? t.sidebar.manager : t.sidebar.warehouse}</span>
          </div>
        </div>
      </button>
    </aside>
  );
}
