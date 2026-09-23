'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language, Translations, translations } from '../i18n/translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitialLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('sf_lang');
    if (stored === 'en' || stored === 'am') return stored;
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

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
