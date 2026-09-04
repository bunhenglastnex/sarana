'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/lib/i18n';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const currentLang = i18n.language || 'km';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="gap-1.5 px-2 text-xs font-semibold">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span>🇰🇭 KM</span>
      </Button>
    );
  }

  const handleSelect = (lang: 'km' | 'en') => {
    changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2 text-xs font-semibold hover:bg-muted">
          <Globe className="w-4 h-4 text-primary" />
          <span>{currentLang === 'km' ? '🇰🇭 ភាសាខ្មែរ' : '🇬🇧 English'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => handleSelect('km')}
          className="flex items-center justify-between cursor-pointer text-xs font-medium"
        >
          <span className="flex items-center gap-2">
            <span>🇰🇭</span>
            <span>ភាសាខ្មែរ (KM)</span>
          </span>
          {currentLang === 'km' && <Check className="w-3.5 h-3.5 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSelect('en')}
          className="flex items-center justify-between cursor-pointer text-xs font-medium"
        >
          <span className="flex items-center gap-2">
            <span>🇬🇧</span>
            <span>English (EN)</span>
          </span>
          {currentLang === 'en' && <Check className="w-3.5 h-3.5 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
