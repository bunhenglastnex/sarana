"use client";

import React, { useState } from "react";
import { Zap, Timer, Check, Copy } from "lucide-react";

interface PromoBannerProps {
  title?: string;
  subtitle?: string;
  timerText?: string;
  badgeText?: string;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  title = "20% OFF Wood-fired Specials",
  subtitle = "Handcrafted with oak and embers. Taste the charred perfection.",
  timerText = "Ends in 4h",
  badgeText = "Limited Hearth Special",
}) => {
  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-container via-primary to-secondary text-on-primary p-space-md mb-space-lg shadow-md">
      {/* Decorative ambient blur circle */}
      <div className="absolute -right-6 -bottom-10 w-40 h-40 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-space-xs">
          <span className="inline-flex items-center gap-1 bg-surface-container-lowest/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-bold text-[11px] text-surface-bright uppercase tracking-wider">
            <Zap className="w-3 h-3 text-secondary-fixed fill-secondary-fixed" />
            {badgeText}
          </span>

          <div className="flex items-center gap-1 bg-on-primary-fixed/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-primary-fixed font-bold text-[11px]">
            <Timer className="w-3 h-3" />
            <span>{timerText}</span>
          </div>
        </div>

        {/* Banner Title & Description */}
        <h2 className="font-extrabold text-xl text-on-primary leading-tight mt-1">
          {title}
        </h2>
        <p className="text-xs text-primary-fixed mt-1 max-w-[280px]">
          {subtitle}
        </p>
      </div>
    </section>
  );
};
