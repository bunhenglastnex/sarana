"use client";

import React from "react";
import {
  CreditCard,
  QrCode,
  AlertCircle,
  Banknote,
  Building2,
  TrendingUp,
  CheckCircle2,
  Download,
} from "lucide-react";
import { PaymentSummaryMetrics } from "@/types/payments";

interface PaymentSubHeaderProps {
  metrics: PaymentSummaryMetrics;
  onExportCsv?: () => void;
}

export const PaymentSubHeader: React.FC<PaymentSubHeaderProps> = ({
  metrics,
  onExportCsv,
}) => {
  return (
    <div className="flex flex-col gap-space-md">
      {/* Header Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md border-b border-border/40 pb-space-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-xl text-2xl font-extrabold text-on-surface tracking-tight">
              Payments &amp; Reconciliation
            </h1>
            <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <QrCode className="w-3 h-3 text-primary" />
              Bakong KHQR Active
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-1">
            Real-time digital settlements, KHQR proof slip audit, and cash-on-delivery tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportCsv}
            className="px-space-md py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-xs font-bold shadow-xs border border-border/30 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export Financial Audit (CSV)</span>
          </button>
        </div>
      </div>

      {/* Financial Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: Today Settlements */}
        <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-xs border border-border/40 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Today's Settlements
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display-lg text-2xl font-extrabold text-on-surface tracking-tight">
              ${metrics.totalSettledUsd.toFixed(2)}
            </div>
            <div className="font-body-sm text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-1">
              <span className="text-emerald-700 font-bold">
                {metrics.totalSettledKhr.toLocaleString()} ៛
              </span>
              <span>•</span>
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold text-[10px]">
                {metrics.khqrSharePercentage}% KHQR Digital
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending KHQR Verification */}
        <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-xs border border-border/40 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Pending KHQR Audit
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display-lg text-2xl font-extrabold text-amber-700 tracking-tight flex items-center gap-2">
              <span>{metrics.pendingVerificationCount} Slips</span>
              <span className="text-xs font-normal text-on-surface-variant">
                (${metrics.pendingVerificationAmountUsd.toFixed(2)})
              </span>
            </div>
            <div className="font-body-sm text-[11px] text-amber-800/80 font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              <span>Action required: Verify payment slip</span>
            </div>
          </div>
        </div>

        {/* Card 3: COD Cash On-Hand */}
        <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-xs border border-border/40 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              COD Cash On-Hand
            </span>
            <div className="w-9 h-9 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display-lg text-2xl font-extrabold text-on-surface tracking-tight">
              ${metrics.codOnHandUsd.toFixed(2)}
            </div>
            <div className="font-body-sm text-[11px] text-on-surface-variant mt-1">
              Held by 3 delivery couriers awaiting shift end
            </div>
          </div>
        </div>

        {/* Card 4: Cancelled & Refunded Transactions */}
        <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-xs border border-border/40 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Cancelled / Refunded
            </span>
            <div className="w-9 h-9 rounded-xl bg-error-container text-on-error-container flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display-lg text-2xl font-extrabold text-error tracking-tight flex items-center gap-2">
              <span>{metrics.cancelledCount} Txns</span>
              <span className="text-xs font-normal text-on-surface-variant">
                (${metrics.cancelledAmountUsd.toFixed(2)})
              </span>
            </div>
            <div className="font-body-sm text-[11px] text-on-surface-variant mt-1">
              Refund processed to customer account
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
