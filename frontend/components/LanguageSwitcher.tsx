"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/lib/i18n";
import { Check } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "segmented" | "dropdown";
}

export function LanguageSwitcher({
  variant = "segmented",
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const currentLang = i18n.language || "km";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (lang: "km" | "en") => {
    changeLanguage(lang);
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg text-xs font-semibold">
        <span className="px-2 py-1 rounded bg-primary text-on-primary">
          🇰🇭 ភាសាខ្មែរ
        </span>
        <span className="px-2 py-1 text-on-surface-variant">🇬🇧 English</span>
      </div>
    );
  }

  if (variant === "segmented") {
    return (
      <div className="flex items-center bg-surface-container-high/80 p-1 rounded-xl gap-1 border border-surface-container-highest">
        <button
          type="button"
          onClick={() => handleSelect("km")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
            currentLang === "km"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <span>🇰🇭</span>
          <span>ភាសាខ្មែរ</span>
          {currentLang === "km" && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        <button
          type="button"
          onClick={() => handleSelect("en")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
            currentLang === "en"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <span>🇬🇧</span>
          <span>English</span>
          {currentLang === "en" && <Check className="w-3 h-3 stroke-[3]" />}
        </button>
      </div>
    );
  }

  // Fallback dropdown variant
  return (
    <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
      <button
        type="button"
        onClick={() => handleSelect(currentLang === "km" ? "en" : "km")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm"
      >
        <span>{currentLang === "km" ? "🇰🇭 ភាសាខ្មែរ" : "🇬🇧 English"}</span>
      </button>
    </div>
  );
}

export default LanguageSwitcher;
