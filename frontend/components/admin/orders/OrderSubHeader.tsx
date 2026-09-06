"use client";

import React from "react";
import { Flame, Bike, Wallet, ChevronRight } from "lucide-react";

interface OrderSubHeaderProps {
  activeCount: number;
  prepCount: number;
  dispatchCount: number;
  codPendingTotal: number;
}

export const OrderSubHeader: React.FC<OrderSubHeaderProps> = ({
  activeCount,
  prepCount,
  dispatchCount,
  codPendingTotal,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
      {/* Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-xs uppercase tracking-wider mb-1 pt-4">
          <span>Operations Hub</span>
          <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/60" />
          <span className="text-primary font-bold">Orders Management</span>
        </div>
        <div className="flex items-center gap-space-sm">
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
            Daily Kitchen Dispatch &amp; Orders
          </h1>
          <span className="inline-flex items-center px-space-xs py-0.5 rounded-full font-label-sm text-xs bg-primary-fixed text-on-primary-fixed font-bold">
            {activeCount} Active Today
          </span>
        </div>
      </div>

      {/* Quick Stats Metric Micro-Bar */}
      <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
        <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-xs border border-border/30">
          <div className="w-9 h-9 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="font-label-sm text-xs text-on-surface-variant">
              In Smoker/Prep
            </div>
            <div className="font-headline-sm text-base text-on-surface font-bold leading-none mt-0.5">
              {prepCount} tickets
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-xs border border-border/30">
          <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <div className="font-label-sm text-xs text-on-surface-variant">
              Out for Dispatch
            </div>
            <div className="font-headline-sm text-base text-on-surface font-bold leading-none mt-0.5">
              {dispatchCount} orders
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-xs border border-border/30">
          <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="font-label-sm text-xs text-on-surface-variant">
              COD Pending
            </div>
            <div className="font-headline-sm text-base text-on-surface font-bold leading-none mt-0.5">
              ${codPendingTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
