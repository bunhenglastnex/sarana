'use client';

import React, { useEffect, useState } from 'react';
import '@/lib/i18n';
import i18n from '@/lib/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sarana_app_language');
        if (saved && (saved === 'en' || saved === 'km') && i18n.language !== saved) {
          i18n.changeLanguage(saved);
        }
      } catch {
        // Ignore
      }
    }
  }, []);

  return <>{children}</>;
}

export default I18nProvider;
