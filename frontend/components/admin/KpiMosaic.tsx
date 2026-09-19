"use client";

import React from "react";
import {
  Receipt,
  DollarSign,
  AlertCircle,
  Bike,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";

interface KpiMosaicProps {
  kpis?: {
    todayOrders: number;
    todayOrdersGrowth: number;
    totalRevenue: number;
    settledCount: number;
    pendingCount: number;
    activeDeliveries: number;
    completedCount: number;
    codPendingTotal: number;
  };
}

export const KpiMosaic: React.FC<KpiMosaicProps> = ({ kpis }) => {
  const todayOrders = kpis?.todayOrders ?? 0;
  const growth = kpis?.todayOrdersGrowth ?? 0;
  const revenue = kpis?.totalRevenue ?? 0.0;
  const settledCount = kpis?.settledCount ?? 0;
  const pendingCount = kpis?.pendingCount ?? 0;
  const activeDeliveries = kpis?.activeDeliveries ?? 0;
  const completedCount = kpis?.completedCount ?? 0;
  const codPendingTotal = kpis?.codPendingTotal ?? 0.0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-md">
      {/* 1: Today's Orders */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-space-sm">
          <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Today's Orders
          </span>
          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="font-display-lg text-3xl font-bold text-on-surface leading-none">
            {todayOrders}
          </div>
          <div className="flex items-center gap-1 mt-2 text-primary font-label-sm text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{growth}% vs yesterday</span>
          </div>
        </div>
      </div>

      {/* 2: Total Revenue */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-space-sm">
          <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Total Revenue
          </span>
          <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="font-display-lg text-3xl font-bold text-on-surface leading-none">
            ${revenue.toFixed(2)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-on-surface-variant font-label-sm text-xs">
            <span>Paid Gross • {settledCount} settled</span>
          </div>
        </div>
      </div>

      {/* 3: Pending Orders (Urgent) */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-start justify-between mb-space-sm">
          <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Pending Action
          </span>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-3xl font-bold text-primary leading-none">
              {pendingCount}
            </span>
            <span className="font-label-sm text-xs text-primary font-semibold">
              Immediate
            </span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-primary font-label-sm text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Requires hearth claim</span>
          </div>
        </div>
      </div>

      {/* 4: Active Deliveries */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-space-sm">
          <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Dispatches
          </span>
          <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
            <Bike className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="font-display-lg text-3xl font-bold text-on-surface leading-none">
            {activeDeliveries}
          </div>
          <div className="flex items-center gap-1 mt-2 text-on-surface-variant font-label-sm text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
            <span>Couriers En Route</span>
          </div>
        </div>
      </div>

      {/* 5: Completed Orders */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-space-sm">
          <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Completed
          </span>
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div>
          <div className="font-display-lg text-3xl font-bold text-on-surface leading-none">
            {completedCount}
          </div>
          <div className="flex items-center gap-1 mt-2 text-on-surface-variant font-label-sm text-xs">
            <span>Fulfill rate today</span>
          </div>
        </div>
      </div>

      {/* 6: Unpaid / COD Amount */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-space-sm">
          <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
            COD / Pending
          </span>
          <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-on-error-container">
            <Clock className="w-4 h-4 text-error" />
          </div>
        </div>
        <div>
          <div className="font-display-lg text-3xl font-bold text-error leading-none">
            ${codPendingTotal.toFixed(2)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-on-surface-variant font-label-sm text-xs">
            <span>Pending cash settlement</span>
          </div>
        </div>
      </div>
    </div>
  );
};
