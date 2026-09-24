'use client';

import React, { useState } from 'react';
import { ShieldCheck, Package, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';

export default function LoginView() {
  const { login } = useStockFlow();
  const { language, setLanguage, t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<UserRole>('manager');
  const [email, setEmail] = useState<string>('alex@stockflow.app');
  const [password, setPassword] = useState<string>('••••••••');
  const [error, setError] = useState<string>('');

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    if (role === 'manager') {
      setEmail('alex@stockflow.app');
      setPassword('••••••••');
    } else {
      setEmail('dawit@stockflow.app');
      setPassword('••••••••');
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    handleRoleTabChange(role);
    login(role, role === 'manager' ? 'alex@stockflow.app' : 'dawit@stockflow.app');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(language === 'am' ? 'እባክዎን ኢሜይል እና የይለፍ ቃል ያስገቡ።' : 'Please enter your email and password.');
      return;
    }
    login(selectedRole, email.trim());
  };

  const isManager = selectedRole === 'manager';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-slate-100">
      {/* Top Navbar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-white shadow-xs">
            <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white">StockFlow</span>
            <span className="text-[10px] text-slate-400 ml-2 font-mono uppercase tracking-wider hidden sm:inline">Inventory OS</span>
          </div>
        </div>

        {/* Language selector in login header */}
        <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs font-semibold">
          <button
            type="button"
            aria-label="Switch to English"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              language === 'en' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            aria-label="Switch to Amharic"
            onClick={() => setLanguage('am')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              language === 'am' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            አማ
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {t.auth.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {t.auth.subtitle}
            </p>
          </div>

          {/* Role Entry Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => handleRoleTabChange('manager')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                isManager
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${isManager ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{t.auth.managerRole}</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('warehouse')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                !isManager
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Package className={`w-4 h-4 ${!isManager ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{t.auth.warehouseRole}</span>
            </button>
          </div>

          {/* Role Experience Summary Badge */}
          <div
            className={`p-3.5 rounded-2xl border mb-6 text-xs transition-colors ${
              isManager
                ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                : 'bg-blue-50/70 border-blue-200/80 text-blue-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle2 className={`w-4 h-4 ${isManager ? 'text-emerald-600' : 'text-blue-600'}`} />
              <span>
                {isManager ? 'Alex Morgan (Manager)' : 'Dawit Haile (Warehouse)'}
              </span>
            </div>
            <p className="text-[11px] leading-snug opacity-80">
              {isManager ? t.auth.managerDesc : t.auth.warehouseDesc}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.auth.email}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@stockflow.app"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.auth.password}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
            >
              <span>
                {t.auth.loginAs} {isManager ? t.auth.managerRole : t.auth.warehouseRole}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              {t.auth.quickDemo}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('manager')}
                className="py-2 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-center transition-colors truncate"
              >
                {t.auth.fillManager}
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('warehouse')}
                className="py-2 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-center transition-colors truncate"
              >
                {t.auth.fillWarehouse}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-md mx-auto text-center pb-2">
        <p className="text-[11px] text-slate-500">
          StockFlow — Addis Ababa Inventory & Sales Management System
        </p>
      </div>
    </div>
  );
}
