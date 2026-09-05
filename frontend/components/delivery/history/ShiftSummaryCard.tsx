"use client";

import React from "react";
import { CheckCircle2, Coins, Wallet } from "lucide-react";

interface ShiftSummaryCardProps {
  completedOrdersCount?: number;
  tipsTotal?: number;
  cashCollectedTotal?: number;
}

export const ShiftSummaryCard: React.FC<ShiftSummaryCardProps> = ({
  completedOrdersCount = 8,
  tipsTotal = 42.0,
  cashCollectedTotal = 138.5,
}) => {
  return (
    <section className="px-screen-edge-padding pt-space-xs pb-space-sm">
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05),0_1px_3px_0_rgba(26,23,21,0.03)] flex flex-col gap-space-sm relative overflow-hidden">
        {/* Glowing background ambient element */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-primary/5 rounded-full pointer-events-none blur-xl"></div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Shift Summary
            </span>
          </div>
          <span className="font-label-md text-label-md text-primary bg-primary-fixed/40 px-2.5 py-0.5 rounded-full font-semibold">
            Live Tally
          </span>
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-3 gap-space-xs pt-1">
          {/* Metric 1: Completed Orders */}
          <div className="flex flex-col bg-surface-container-low p-space-xs rounded-lg">
            <div className="flex items-center gap-1 text-on-surface-variant mb-1">
              <CheckCircle2 className="w-4 h-4 text-on-surface-variant" />
              <span className="font-label-sm text-label-sm">Orders</span>
            </div>
            <span className="font-headline-md text-headline-md text-on-surface font-bold leading-tight">
              {completedOrdersCount}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant/80">
              Completed
            </span>
          </div>

          {/* Metric 2: Tips Earned */}
          <div className="flex flex-col bg-surface-container-low p-space-xs rounded-lg">
            <div className="flex items-center gap-1 text-secondary mb-1">
              <Coins className="w-4 h-4 text-secondary" />
              <span className="font-label-sm text-label-sm font-semibold">
                Tips
              </span>
            </div>
            <span className="font-headline-md text-headline-md text-secondary font-bold leading-tight">
              ${tipsTotal.toFixed(2)}
            </span>
            <span className="font-label-sm text-label-sm text-secondary/80">
              Earned
            </span>
          </div>

          {/* Metric 3: Cash Collected */}
          <div className="flex flex-col bg-surface-container-low p-space-xs rounded-lg">
            <div className="flex items-center gap-1 text-primary mb-1">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="font-label-sm text-label-sm font-semibold">
                Cash
              </span>
            </div>
            <span className="font-headline-md text-headline-md text-primary font-bold leading-tight">
              ${cashCollectedTotal.toFixed(2)}
            </span>
            <span className="font-label-sm text-label-sm text-primary/80">
              Collected
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
