'use client';

import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';

const DEMO_CREDENTIALS: Record<string, { role: UserRole; email: string }> = {
  'manager@stockflow.app:manager123': { role: 'manager', email: 'manager@stockflow.app' },
  'warehouse@stockflow.app:warehouse123': { role: 'warehouse', email: 'warehouse@stockflow.app' },
};

export default function LoginView() {
  const { login } = useStockFlow();
  const { language, setLanguage } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(language === 'am' ? 'እባክዎን ኢሜይል እና የይለፍ ቃል ያስገቡ።' : 'Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));

    const key = `${email.trim().toLowerCase()}:${password}`;
    const match = DEMO_CREDENTIALS[key];

    if (match) {
      login(match.role, match.email);
    } else {
      setError(language === 'am' ? 'ኢሜይሉ ወይም የይለፍ ቃሉ ትክክለኛ አይደለም።' : 'Incorrect email or password. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-slate-100">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shadow-xs">
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

        <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs font-semibold">
          <button type="button" aria-label="Switch to English" onClick={() => setLanguage('en')} className={`px-2.5 py-1 rounded-lg transition-colors ${language === 'en' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'}`}>EN</button>
          <button type="button" aria-label="Switch to Amharic" onClick={() => setLanguage('am')} className={`px-2.5 py-1 rounded-lg transition-colors ${language === 'am' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'}`}>አማ</button>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900">
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-7 h-7 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{language === 'am' ? 'እንኳን ደህና መጡ' : 'Welcome back'}</h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{language === 'am' ? 'ወደ StockFlow ለመግባት ይግቡ' : 'Sign in to your StockFlow account'}</p>
          </div>

          {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700 mb-1">{language === 'am' ? 'ኢሜይል' : 'Email address'}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@stockflow.app" required autoComplete="email" className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs" />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-700 mb-1">{language === 'am' ? 'የይለፍ ቃል' : 'Password'}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input id="auth-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 mt-2">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  {language === 'am' ? 'እየገቡ ነው...' : 'Signing in...'}
                </span>
              ) : (
                <><span>{language === 'am' ? 'ግባ' : 'Sign In'}</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">{language === 'am' ? 'ሙከራ መረጃ' : 'Demo credentials'}</p>
            <div className="space-y-2 text-[11px] bg-slate-50 rounded-xl p-3">
              <div className="flex justify-between items-center"><span className="font-semibold text-slate-700">Manager:</span><span className="font-mono text-slate-500">manager@stockflow.app / manager123</span></div>
              <div className="flex justify-between items-center"><span className="font-semibold text-slate-700">Warehouse:</span><span className="font-mono text-slate-500">warehouse@stockflow.app / warehouse123</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto text-center pb-2">
        <p className="text-[11px] text-slate-500">StockFlow — Addis Ababa Inventory &amp; Sales Management System</p>
      </div>
    </div>
  );
}
