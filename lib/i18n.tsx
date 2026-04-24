'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { getTranslation } from './translations';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const authStore = useAuthStore();
  const language = authStore.user?.language || 'en';

  const setLanguage = useCallback((lang: string) => {
    authStore.setLanguage(lang);
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('ks_language', lang);
    }
  }, [authStore]);

  const t = useCallback((key: string, fallback?: string): string => {
    return getTranslation(language, key) || fallback || key;
  }, [language]);

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
