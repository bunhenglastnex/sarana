"use client";

import React from "react";
import {
  Users,
  UserPlus,
  Crown,
  DollarSign,
  TrendingUp,
  QrCode,
  CheckCircle2,
} from "lucide-react";

interface CustomerSubHeaderProps {
  totalCustomers: number;
  vipCount: number;
  totalRevenue: number;
  onAddCustomerClick: () => void;
}

export const CustomerSubHeader: React.FC<CustomerSubHeaderProps> = ({
  totalCustomers,
  vipCount,
  totalRevenue,
  onAddCustomerClick,
}) => {
  return (
    <div className="flex flex-col gap-space-md">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md border-b border-border/40 pb-space-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-xl text-2xl font-extrabold text-on-surface tracking-tight">
              Customer CRM Directory
            </h1>
            <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-xs px-2.5 py-0.5 rounded-full font-bold">
              {totalCustomers} Accounts
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Manage registered diner accounts, order histories, KHQR payment preferences &amp; VIP tags.
          </p>
        </div>

        <button
          onClick={onAddCustomerClick}
          className="px-space-md py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Metric Quick Dashboard Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-xs uppercase tracking-wider font-semibold">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="font-display-lg text-2xl font-extrabold text-on-surface mt-2">
            1,428
          </div>
          <div className="font-body-sm text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12% this month</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-xs uppercase tracking-wider font-semibold">
            <span>VIP &amp; Regular Diners</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-display-lg text-2xl font-extrabold text-on-surface mt-2">
            {vipCount} VIPs
          </div>
          <div className="font-body-sm text-[11px] text-on-surface-variant font-medium mt-1">
            High retention rate (68%)
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-xs uppercase tracking-wider font-semibold">
            <span>Lifetime Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display-lg text-2xl font-extrabold text-primary mt-2">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="font-body-sm text-[11px] text-on-surface-variant font-medium mt-1">
            Avg order value: $32.40
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-border/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-xs uppercase tracking-wider font-semibold">
            <span>KHQR Adoption</span>
            <QrCode className="w-4 h-4 text-secondary" />
          </div>
          <div className="font-display-lg text-2xl font-extrabold text-on-surface mt-2">
            82% KHQR
          </div>
          <div className="font-body-sm text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Instant settlement</span>
          </div>
        </div>
      </div>
    </div>
  );
};
