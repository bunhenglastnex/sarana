"use client";

import React from "react";
import {
  Truck,
  Navigation,
  CheckCircle2,
  Banknote,
  Bike,
  HeartHandshake,
  Plus,
} from "lucide-react";

interface StaffHeaderProps {
  totalDriverCount: number;
  onDeliveryCount: number;
  availableCount: number;
  totalCodCollected: number;
  totalTipsToday: number;
  onOpenCreateStaff?: () => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  totalDriverCount,
  onDeliveryCount,
  availableCount,
  totalCodCollected,
  totalTipsToday,
  onOpenCreateStaff,
}) => {
  return (
    <div className="bg-surface-container-lowest p-4 md:p-space-lg rounded-2xl shadow-sm border border-border/40 space-y-space-md">
      {/* Title & Page Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-border/30 pb-3">
        <div>
          <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-primary block">
            Bistro Fleet Dispatch
          </span>
          <h1 className="font-headline-xl text-xl sm:text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary shrink-0" />
            <span>Delivery Driver Roster</span>
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Monitor couriers, active dispatches, tips collected, and Cash on Delivery (COD) balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs font-bold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span>Fleet Active ({onDeliveryCount} On Road)</span>
          </div>

          {onOpenCreateStaff && (
            <button
              type="button"
              onClick={onOpenCreateStaff}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Mosaic Cards (Responsive 4-Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Delivery Couriers */}
        <div className="bg-surface-container-low p-3 sm:p-3.5 rounded-xl border border-border/30 flex items-center justify-between">
          <div>
            <span className="font-label-sm text-[10px] sm:text-[11px] text-on-surface-variant font-bold uppercase truncate block">
              Total Couriers
            </span>
            <div className="font-display-lg text-lg sm:text-2xl font-black text-on-surface mt-0.5">
              {totalDriverCount} <span className="text-xs font-bold text-on-surface-variant">Drivers</span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <Bike className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Card 2: Couriers On Road */}
        <div className="bg-surface-container-low p-3 sm:p-3.5 rounded-xl border border-border/30 flex items-center justify-between">
          <div>
            <span className="font-label-sm text-[10px] sm:text-[11px] text-on-surface-variant font-bold uppercase truncate block">
              Active Deliveries
            </span>
            <div className="font-display-lg text-lg sm:text-2xl font-black text-emerald-700 mt-0.5">
              {onDeliveryCount} <span className="text-xs font-bold text-emerald-600">On Road</span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
        </div>

        {/* Card 3: Driver Tips Collected Today */}
        <div className="bg-surface-container-low p-3 sm:p-3.5 rounded-xl border border-border/30 flex items-center justify-between">
          <div>
            <span className="font-label-sm text-[10px] sm:text-[11px] text-on-surface-variant font-bold uppercase truncate block">
              Driver Tips Today
            </span>
            <div className="font-display-lg text-lg sm:text-2xl font-black text-primary mt-0.5">
              ${totalTipsToday.toFixed(2)}
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Card 4: Driver Cash Held (COD) */}
        <div className="bg-surface-container-low p-3 sm:p-3.5 rounded-xl border border-border/30 flex items-center justify-between">
          <div>
            <span className="font-label-sm text-[10px] sm:text-[11px] text-on-surface-variant font-bold uppercase truncate block">
              COD Cash Balance
            </span>
            <div className="font-display-lg text-lg sm:text-2xl font-black text-amber-700 mt-0.5">
              ${totalCodCollected.toFixed(2)}
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
