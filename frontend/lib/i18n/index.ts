'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enLocale from './locales/en.json';
import kmLocale from './locales/km.json';

const resources = {
  en: { translation: enLocale },
  km: { translation: kmLocale },
};

// Get initial language preference safely (defaults to Khmer for SSR & initial hydration consistency)
const getInitialLanguage = (): string => {
  return 'km'; // Default to Khmer
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes strings
    },
    react: {
      useSuspense: false,
    },
  });
}

export const changeLanguage = (lang: 'en' | 'km') => {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('sarana_app_language', lang);
    } catch {
      // Ignore
    }
  }
};

export default i18n;
