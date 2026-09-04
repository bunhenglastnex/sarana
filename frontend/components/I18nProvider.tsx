'use client';

import React, { useEffect, useState } from 'react';
import '@/lib/i18n';
import i18n from '@/lib/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <>{children}</>;
}

export default I18nProvider;
