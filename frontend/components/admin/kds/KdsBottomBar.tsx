"use client";

import React from "react";
import Link from "next/link";
import { Flame, Clock, Receipt } from "lucide-react";

export const KdsBottomBar: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md mt-space-sm">
      {/* Live Hearth Capacity Visualizer */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex items-center gap-space-md">
        <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0">
          <Flame className="w-6 h-6 fill-primary text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-md text-xs font-bold text-on-surface">
              Woodfire Grill Load
            </span>
            <span className="font-label-sm text-xs text-primary font-bold">
              82% Peak
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "82%" }} />
          </div>
          <span className="font-body-sm text-[11px] text-on-surface-variant mt-1 block truncate">
            Station 1 at 4/5 pans • Station 2 ready
          </span>
        </div>
      </div>

      {/* Active Expediter Speed */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex items-center gap-space-md">
        <div className="w-12 h-12 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
          <Clock className="w-6 h-6 text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-label-md text-xs font-bold text-on-surface">
              Prep Efficiency Rate
            </span>
            <span className="font-label-sm text-xs text-secondary font-bold">
              94.2% On Time
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: "94.2%" }} />
          </div>
          <span className="font-body-sm text-[11px] text-on-surface-variant mt-1 block truncate">
            18 of 19 orders fulfilled within SLA today
          </span>
        </div>
      </div>

      {/* Shift Volume Milestone */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-space-md min-w-0">
          <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface shrink-0">
            <Receipt className="w-6 h-6 text-on-surface-variant" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-base font-extrabold leading-tight text-on-surface truncate">
              64 Completed
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">
              Shift Gross: <strong>$1,842.50</strong>
            </span>
          </div>
        </div>
        <Link
          href="/admin/orders"
          className="px-space-sm py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-bold transition-colors shrink-0 border border-border/30"
        >
          Full History
        </Link>
      </div>
    </div>
  );
};
