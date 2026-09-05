"use client";

import React from "react";
import Link from "next/link";
import { Flame, ShoppingBag, Clock, Timer, Banknote, ChevronRight } from "lucide-react";

interface ShiftPerformanceCardProps {
  ordersCompleted?: number;
  onlineHours?: string;
  onTimeRate?: string;
  todayEarnings?: number;
}

export const ShiftPerformanceCard: React.FC<ShiftPerformanceCardProps> = ({
  ordersCompleted = 8,
  onlineHours = "4.2h",
  onTimeRate = "98%",
  todayEarnings = 42.0,
}) => {
  return (
    <section className="w-full bg-surface-container-lowest rounded-xl p-card-inner-padding shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05),0_1px_3px_0_rgba(26,23,21,0.03)] flex flex-col space-y-space-md border border-outline-variant/30">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary fill-primary/20" />
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Today's Shift
          </h3>
        </div>
        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold tracking-wide uppercase">
          Shift Active
        </span>
      </div>

      {/* Metrics Bento Strip */}
      <div className="grid grid-cols-3 gap-space-xs">
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-low text-center">
          <ShoppingBag className="w-5 h-5 text-tertiary mb-1" />
          <span className="font-price-lg text-price-lg text-on-surface font-bold">
            {ordersCompleted}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
            Orders
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-low text-center">
          <Clock className="w-5 h-5 text-tertiary mb-1" />
          <span className="font-price-lg text-price-lg text-on-surface font-bold">
            {onlineHours}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
            Online
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-container-low text-center">
          <Timer className="w-5 h-5 text-emerald-700 mb-1" />
          <span className="font-price-lg text-price-lg text-emerald-800 font-bold">
            {onTimeRate}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
            On-Time
          </span>
        </div>
      </div>

      {/* Earnings & Tips Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
            <Banknote className="w-[22px] h-[22px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Today's Earnings &amp; Tips
            </span>
            <span className="font-price-lg text-price-lg text-on-surface font-bold">
              ${todayEarnings.toFixed(2)}
            </span>
          </div>
        </div>

        <Link
          href="/delivery/history"
          className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-1 hover:bg-surface-container-high"
        >
          <span>Details</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};
