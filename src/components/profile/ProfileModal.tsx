'use client';

import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Package, Globe, LogOut, CheckCircle2, Sliders, Mail, Send } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase/client';

export default function ProfileModal() {
  const {
    isProfileOpen,
    setIsProfileOpen,
    currentUser,
    logout,
  } = useStockFlow();
  const { language, setLanguage, t } = useLanguage();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'success' | 'error' | 'cooldown'>('idle');
  const [isInviting, setIsInviting] = useState(false);
  const [lastInvite, setLastInvite] = useState<{ email: string; at: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProfileOpen) {
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileOpen, setIsProfileOpen]);

  if (!isProfileOpen) return null;

  const isManager = currentUser.role === 'manager';

  const sendStaffInvitation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (isInviting) return;
    if (lastInvite?.email === email && Date.now() - lastInvite.at < 30_000) {
      setInviteStatus('cooldown');
      return;
    }

    setIsInviting(true);
    setInviteStatus('idle');
    try {
      const { error } = await supabase.functions.invoke('invite-staff', {
        body: { email },
      });
      if (error) {
        setInviteStatus('error');
      } else {
        setLastInvite({ email, at: Date.now() });
        setInviteStatus('success');
      }
    } catch {
      setInviteStatus('error');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)' }}
      >
        {/* Header with Title and X dismiss button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 id="profile-modal-title" className="text-base font-bold text-slate-900 tracking-tight">
              {t.profile.title}
            </h2>
            <p className="text-xs text-slate-500">{t.profile.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsProfileOpen(false)}
            aria-label={t.profile.close}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>

        {/* User Card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0 border-2 border-white shadow-xs">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-slate-900 truncate">{currentUser.name}</h3>
            <p className="text-xs text-slate-500 font-mono truncate">{currentUser.email}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isManager
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {isManager ? <ShieldCheck className="w-3 h-3 text-emerald-600" /> : <Package className="w-3 h-3 text-blue-600" />}
                <span>{isManager ? t.profile.managerBadge : t.profile.warehouseBadge}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Role Permissions Scope */}
        <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 text-xs">
          <p className="font-bold text-slate-800 mb-1">{t.profile.permissions}</p>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            {isManager ? t.profile.managerScope : t.profile.warehouseScope}
          </p>
        </div>

        {isManager && (
          <section className="mt-4 p-3.5 rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900">
                {language === 'am' ? 'የመጋዘን ሠራተኛ ጋብዝ' : 'Invite staff member'}
              </h3>
            </div>
            <form onSubmit={sendStaffInvitation} className="space-y-2.5">
              <label htmlFor="invite-staff-email" className="block text-xs font-semibold text-slate-700">
                {language === 'am' ? 'ኢሜይል' : 'Email'}
              </label>
              <input
                id="invite-staff-email"
                type="email"
                autoComplete="email"
                required
                value={inviteEmail}
                onChange={(event) => {
                  setInviteEmail(event.target.value);
                  setInviteStatus('idle');
                }}
                placeholder="name@stockflow.app"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
              <button
                type="submit"
                disabled={isInviting || inviteStatus === 'success'}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                {isInviting ? <span>{language === 'am' ? 'በመላክ ላይ...' : 'Sending...'}</span> : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'am' ? 'ግብዣ ላክ' : 'Send invitation'}</span>
                  </>
                )}
              </button>
            </form>
            <p aria-live="polite" className={`mt-2 text-[11px] ${inviteStatus === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
              {inviteStatus === 'success' && (language === 'am' ? 'ግብዣው ተልኳል።' : 'Invitation sent.')}
              {inviteStatus === 'error' && (language === 'am' ? 'ግብዣውን መላክ አልተቻለም። እንደገና ይሞክሩ።' : 'Could not send the invitation. Please try again.')}
              {inviteStatus === 'cooldown' && (language === 'am' ? 'እባክዎ እንደገና ከመላክዎ በፊት 30 ሰከንድ ይጠብቁ።' : 'Please wait 30 seconds before resending to this address.')}
            </p>
          </section>
        )}

        {/* Language Preference */}
        <div className="mt-4 p-3.5 rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-900">{t.profile.language}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                language === 'en'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              English (EN)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('am')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                language === 'am'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              አማርኛ (Amharic)
            </button>
          </div>
        </div>

        {/* System & Inventory Settings */}
        <div className="mt-4 p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-2.5 text-xs">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-900">System Preferences</span>
          </div>

          <div className="flex items-center justify-between py-1 text-slate-600">
            <span>{t.profile.currency}</span>
            <span className="font-bold font-mono text-slate-900">ETB (Ethiopian Birr)</span>
          </div>

          <div className="flex items-center justify-between py-1 text-slate-600">
            <span>Inventory Tracking Unit</span>
            <span className="font-bold uppercase text-slate-900">Cartons (ctn)</span>
          </div>

          <div className="flex items-center justify-between py-1 text-slate-600">
            <span>{t.profile.offlineStatus}</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.profile.ready}</span>
            </span>
          </div>

        </div>

        {/* Sign Out / Logout Action */}
        <div className="mt-5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={logout}
            className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.profile.logout}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
