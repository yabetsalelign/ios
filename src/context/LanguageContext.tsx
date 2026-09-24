'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, Translations, translations } from '../i18n/translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always start with 'en' so server and initial client renders match,
  // preventing React hydration mismatches.
  const [language, setLanguageState] = useState<Language>('en');

  // After mount, sync the stored preference from localStorage.
  useEffect(() => {
    const stored = localStorage.getItem('sf_lang');
    if (stored === 'en' || stored === 'am') {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sf_lang', lang);
    }
  }, []);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
