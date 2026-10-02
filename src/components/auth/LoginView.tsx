'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff, CheckCircle2, ArrowLeft, ImagePlus, UserRound, X } from 'lucide-react';
import { useStockFlow } from '../../context/StockFlowContext';
import { useLanguage } from '../../context/LanguageContext';

// View modes for the login card
type LoginMode = 'sign-in' | 'forgot-password' | 'create-password';

export default function LoginView() {
  const { login, isFirstTimeSetup, invitedEmail, completeFirstTimeSetup, requestAccountSetup } = useStockFlow();
  const { language, setLanguage } = useLanguage();

  // Derive mode:
  //   isFirstTimeSetup=true  → a valid invite/recovery session is active  → 'create-password'
  //   otherwise              → normal sign-in or password recovery
  const [mode, setMode] = useState<LoginMode>(isFirstTimeSetup ? 'create-password' : 'sign-in');

  // Keep mode in sync with context-driven isFirstTimeSetup transitions
  // (e.g. when Supabase PASSWORD_RECOVERY event fires asynchronously)
  useEffect(() => {
    if (isFirstTimeSetup) {
      setMode('create-password');
    }
  }, [isFirstTimeSetup]);

  // ── Normal sign-in state ──────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Password recovery — email-entry state ────────────────────────────────
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // ── Create Password state (invite / recovery session) ────────────────────
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<{ file: File; previewUrl: string } | null>(null);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (selectedAvatar) URL.revokeObjectURL(selectedAvatar.previewUrl);
    };
  }, [selectedAvatar]);

  // Parse URL hash error messages (e.g. expired invite link)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const desc = params.get('error_description');
      if (desc) {
        setError(decodeURIComponent(desc.replace(/\+/g, ' ')));
      }
    }
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError(language === 'am' ? 'እባክዎን ኢሜይል እና የይለፍ ቃል ያስገቡ።' : 'Enter your email and password.');
      return;
    }
    setIsSubmitting(true);
    const result = await login(email.trim().toLowerCase(), password.trim());
    if (!result?.success) {
      setError(
        result?.error ||
        (language === 'am'
          ? 'ኢሜይሉ ወይም የይለፍ ቃሉ ትክክለኛ አይደለም።'
          : 'Email or password is incorrect. Try again.')
      );
      setIsSubmitting(false);
    }
  };

  const handlePasswordRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!recoveryEmail.trim()) {
      setError(language === 'am' ? 'እባክዎን ኢሜይልዎን ያስገቡ' : 'Enter your email.');
      return;
    }
    setIsSubmitting(true);
    // Always returns { success: true } to avoid account-enumeration.
    // Any transport error is silently swallowed inside requestAccountSetup.
    await requestAccountSetup(recoveryEmail.trim().toLowerCase());
    setRecoverySent(true);
    setIsSubmitting(false);
  };

  const finishSetup = async (avatarFile: File | null) => {
    setError('');
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();
    if (!cleanNew || !cleanConfirm) {
      setError(language === 'am' ? 'እባክዎን ሁለቱንም የይለፍ ቃል መስኮች ይሙሉ' : 'Enter both passwords.');
      return;
    }
    if (cleanNew.length < 6) {
      setError(language === 'am' ? 'የይለፍ ቃሉ ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት' : 'Use at least 6 characters.');
      return;
    }
    if (cleanNew !== cleanConfirm) {
      setError(language === 'am' ? 'የይለፍ ቃሎቹ አይዛመዱም' : 'Passwords don\'t match.');
      return;
    }
    setIsSubmitting(true);
    const result = await completeFirstTimeSetup(cleanNew, avatarFile || undefined);
    if (!result.success) {
      setError(
        result.error ||
        (language === 'am'
          ? 'የይለፍ ቃል ማዘጋጀት አልተሳካም። እባክዎ እንደገና ይሞክሩ።'
          : 'Couldn\'t save your password. Try again.')
      );
      setIsSubmitting(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await finishSetup(selectedAvatar?.file ?? null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = '';
    if (!file) return;

    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!acceptedTypes.includes(file.type)) {
      setError(language === 'am' ? 'JPG፣ PNG፣ WEBP ወይም GIF ምስል ይምረጡ።' : 'Choose a JPG, PNG, WEBP, or GIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(language === 'am' ? 'ምስሉ ከ5 MB መብለጥ የለበትም።' : 'Choose an image under 5 MB.');
      return;
    }

    setError('');
    setSelectedAvatar({ file, previewUrl: URL.createObjectURL(file) });
  };

  // ── Shared UI helpers ─────────────────────────────────────────────────────

  const Spinner = () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  const Logo = () => (
    <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-slate-100">

      {/* Top bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shadow-xs">
            <Logo />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white">StockFlow</span>
            <span className="text-[10px] text-slate-400 ml-2 font-mono uppercase tracking-wider hidden sm:inline">Inventory &amp; sales</span>
          </div>
        </div>

        <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs font-semibold">
          <button type="button" aria-label="Switch to English" onClick={() => setLanguage('en')} className={`px-2.5 py-1 rounded-lg transition-colors ${language === 'en' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'}`}>EN</button>
          <button type="button" aria-label="Switch to Amharic" onClick={() => setLanguage('am')} className={`px-2.5 py-1 rounded-lg transition-colors ${language === 'am' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'}`}>አማ</button>
        </div>
      </div>

      {/* Login card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900">

          {/* Card header */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Logo />
            </div>

            {mode === 'sign-in' && (
              <>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {language === 'am' ? 'እንኳን ደህና መጡ' : 'Welcome back'}
                </h1>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {language === 'am' ? 'ወደ StockFlow ለመግባት ይግቡ' : 'Sign in to StockFlow'}
                </p>
              </>
            )}

            {mode === 'forgot-password' && (
              <>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {language === 'am' ? 'የይለፍ ቃልዎን ዳግም ያስጀምሩ' : 'Reset your password'}
                </h1>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {language === 'am'
                    ? 'መለያ ካለ የይለፍ ቃል ማስጀመሪያ ማገናኛ እንልካለን።'
                    : 'If an account exists, we\'ll send a password reset link.'}
                </p>
              </>
            )}

            {mode === 'create-password' && (
              <>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {language === 'am' ? 'የይለፍ ቃልዎን ይፍጠሩ' : 'Create your password'}
                </h1>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {invitedEmail
                    ? `${language === 'am' ? 'ለመለያዎ የይለፍ ቃል ይፍጠሩ' : 'Choose a password for your account'}: ${invitedEmail}`
                    : (language === 'am' ? 'መለያዎን ለማንቃት የይለፍ ቃል ይፍጠሩ' : 'Choose a password for your account')}
                </p>
              </>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-4">
              {error}
            </div>
          )}

          {/* ── MODE: sign-in ─────────────────────────────────────────────── */}
          {mode === 'sign-in' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'ኢሜይል' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@stockflow.app"
                    required
                    autoComplete="email"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'የይለፍ ቃል' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="sign-in-btn"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    {language === 'am' ? 'እየገቡ ነው...' : 'Signing in...'}
                  </span>
                ) : (
                  <><span>{language === 'am' ? 'ግባ' : 'Sign in'}</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              {/* ── Password recovery link ── */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  id="forgot-password-btn"
                  onClick={() => { setError(''); setRecoverySent(false); setMode('forgot-password'); }}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors"
                >
                  {language === 'am' ? 'የይለፍ ቃል ረሱ?' : 'Forgot password?'}
                </button>
              </div>
            </form>
          )}

          {/* ── MODE: forgot-password ─────────────────────────────────────── */}
          {mode === 'forgot-password' && !recoverySent && (
            <form onSubmit={handlePasswordRecoveryRequest} className="space-y-4">
              <div>
                <label htmlFor="recovery-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'ኢሜይል' : 'Email address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="recovery-email"
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="name@stockflow.app"
                    required
                    autoComplete="email"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="request-recovery-btn"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    {language === 'am' ? 'እየላኩ ነው...' : 'Sending recovery link...'}
                  </span>
                ) : (
                  <><span>{language === 'am' ? 'የይለፍ ቃል ማገናኛ ላክ' : 'Send recovery link'}</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  id="back-to-signin-btn"
                  onClick={() => { setError(''); setMode('sign-in'); }}
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 mx-auto transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  {language === 'am' ? 'ወደ ሙሉ ግቤት ተመለስ' : 'Back to sign in'}
                </button>
              </div>
            </form>
          )}

          {/* ── MODE: forgot-password — success state ────────────────────── */}
          {mode === 'forgot-password' && recoverySent && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 py-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-700 leading-relaxed max-w-xs">
                  {language === 'am'
                    ? 'ለዚህ ኢሜይል መለያ ካለ የይለፍ ቃል ማስጀመሪያ ማገናኛ ወደ ገቢ መልዕክት ሳጥንዎ ተልኳል።'
                    : 'If an account exists for this email, check your inbox for a password reset link.'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {language === 'am' ? 'ኢሜይሉ ካልደረሰ ስፓምን ያረጋግጡ' : 'No email? Check your spam folder.'}
                </p>
              </div>

              <button
                type="button"
                id="back-to-signin-from-success-btn"
                onClick={() => { setMode('sign-in'); setRecoverySent(false); setRecoveryEmail(''); }}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {language === 'am' ? 'ወደ መግቢያ ተመለስ' : 'Back to sign in'}
              </button>
            </div>
          )}

          {/* ── MODE: create-password (invite / recovery session active) ─── */}
          {mode === 'create-password' && (
            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div>
                <label htmlFor="setup-new-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'የይለፍ ቃል' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="setup-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="setup-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'የይለፍ ቃል ያረጋግጡ' : 'Confirm password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="setup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="block text-xs font-semibold text-slate-700 mb-2">
                  {language === 'am' ? 'የመገለጫ ምስል' : 'Profile picture'}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    {selectedAvatar ? (
                      <img src={selectedAvatar.previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <UserRound className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <label
                      htmlFor="setup-avatar"
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <ImagePlus className="w-4 h-4" />
                      {selectedAvatar
                        ? (language === 'am' ? 'ምስል ቀይር' : 'Change photo')
                        : (language === 'am' ? 'ምስል ጨምር' : 'Add photo')}
                    </label>
                    <input
                      id="setup-avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="sr-only"
                    />
                    {selectedAvatar && (
                      <button
                        type="button"
                        onClick={() => setSelectedAvatar(null)}
                        className="ml-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                      >
                        <X className="w-3.5 h-3.5" />
                        {language === 'am' ? 'አስወግድ' : 'Remove'}
                      </button>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {language === 'am' ? 'አማራጭ · እስከ 5 MB' : 'Optional · JPG, PNG, WEBP, or GIF · Up to 5 MB'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="skip-profile-picture-btn"
                disabled={isSubmitting}
                onClick={() => void finishSetup(null)}
                className="w-full py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:text-slate-400"
              >
                {language === 'am' ? 'ለአሁን ዝለል' : 'Skip for now'}
              </button>

              <button
                type="submit"
                id="create-password-btn"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    {language === 'am' ? 'እየተዘጋጀ ነው...' : 'Saving password...'}
                  </span>
                ) : (
                  <><span>{language === 'am' ? 'ቀጥል' : 'Continue'}</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md mx-auto text-center pb-2">
        <p className="text-[11px] text-slate-500">StockFlow — Stock and sales</p>
      </div>
    </div>
  );
}


