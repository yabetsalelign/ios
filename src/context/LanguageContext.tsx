'use client';

import React, { createContext, useContext, useCallback } from 'react';
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
  const language: Language = React.useSyncExternalStore<Language>(
    (callback) => {
      window.addEventListener('stockflow_lang_change', callback);
      window.addEventListener('storage', callback);
      return () => {
        window.removeEventListener('stockflow_lang_change', callback);
        window.removeEventListener('storage', callback);
      };
    },
    (): Language => {
      try {
        const stored = localStorage.getItem('sf_lang');
        return stored === 'am' ? 'am' : 'en';
      } catch {
        return 'en';
      }
    },
    (): Language => 'en'
  );

  const setLanguage = useCallback((lang: Language) => {
    try {
      localStorage.setItem('sf_lang', lang);
      window.dispatchEvent(new Event('stockflow_lang_change'));
    } catch {
      // Fallback
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
