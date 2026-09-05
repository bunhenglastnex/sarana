"use client";

import React from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  FileText,
  ShieldAlert,
  Calendar,
  RotateCcw,
  X,
} from "lucide-react";
import { TransactionRecord, PaymentMethodType } from "@/types/payments";
import { DatePicker } from "@/components/ui/date-picker";

interface PaymentTableProps {
  transactions: TransactionRecord[];
  totalRecordsCount: number;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  datePreset: "today" | "week" | "month" | "all" | "custom";
  onDatePresetChange: (preset: "today" | "week" | "month" | "all" | "custom") => void;
  dateFrom: string;
  onDateFromChange: (val: string) => void;
  dateTo: string;
  onDateToChange: (val: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onSelectTransactionForProof: (txn: TransactionRecord) => void;
  onVerifyTransaction: (txnId: string) => void;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({
  transactions,
  totalRecordsCount,
  searchQuery,
  onSearchQueryChange,
  selectedFilter,
  onFilterChange,
  datePreset,
  onDatePresetChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  hasActiveFilters,
  onClearFilters,
  onSelectTransactionForProof,
  onVerifyTransaction,
}) => {
  const getMethodBadge = (method: PaymentMethodType, gateway: string) => {
    switch (method) {
      case "khqr":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-label-sm text-[11px] font-bold border border-emerald-500/30">
            <QrCode className="w-3 h-3 text-emerald-600" />
            {gateway}
          </span>
        );
      case "cod":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-[11px] font-bold">
            <Banknote className="w-3 h-3 text-secondary" />
            {gateway}
          </span>
        );
      case "counter_cash":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-bold">
            <Building2 className="w-3 h-3 text-on-surface-variant" />
            Counter Cash
          </span>
        );
      case "card":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-bold">
            <CreditCard className="w-3 h-3 text-tertiary" />
            Card (Visa/MC)
          </span>
        );
    }
  };

  const getStatusBadge = (status: TransactionRecord["status"]) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-[10px] font-extrabold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED PAID
          </span>
        );
      case "pending_review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-label-sm text-[10px] font-extrabold animate-pulse">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> PENDING AUDIT
          </span>
        );
      case "flagged":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-[10px] font-extrabold">
            <ShieldAlert className="w-3 h-3 text-error" /> FLAGGED SLIP
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[10px] font-bold">
            REFUNDED
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-space-md">
      {/* Date Preset & Date From/To Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md bg-surface-container-low p-space-sm rounded-2xl border border-border/30">
        {/* Date Preset Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-label-sm text-xs font-bold text-on-surface-variant mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Date Filter:
          </span>
          {[
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
            { id: "all", label: "All Time" },
            { id: "custom", label: "Custom Range" },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onDatePresetChange(preset.id as any)}
              className={`px-3 py-1.5 rounded-xl font-label-sm text-xs font-bold transition-all border ${
                datePreset === preset.id
                  ? "bg-inverse-surface text-inverse-on-surface border-inverse-surface shadow-xs"
                  : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border-border/30"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Date From & Date To Shadcn Date Pickers + Clear Filters Button */}
        <div className="flex items-center gap-2 text-xs flex-wrap sm:flex-nowrap w-full lg:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant font-bold text-[11px]">From:</span>
            <DatePicker
              value={dateFrom}
              onChange={(newDate) => {
                onDateFromChange(newDate);
                onDatePresetChange("custom");
              }}
              placeholder="Select From Date"
            />
          </div>
          <span className="text-on-surface-variant font-bold">-</span>
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant font-bold text-[11px]">To:</span>
            <DatePicker
              value={dateTo}
              onChange={(newDate) => {
                onDateToChange(newDate);
                onDatePresetChange("custom");
              }}
              placeholder="Select To Date"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-3 py-1.5 rounded-xl bg-error-container/20 hover:bg-error-container text-error font-label-sm text-xs font-bold border border-error/20 flex items-center gap-1.5 transition-all shadow-xs shrink-0 ml-1"
              title="Reset all search queries, date ranges, and method filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Summary Bar */}
      {hasActiveFilters && (
        <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl flex items-center justify-between text-xs text-on-surface gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-amber-800 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-600" /> Active Filters:
            </span>
            <span className="text-on-surface-variant font-medium">
              Showing {transactions.length} of {totalRecordsCount} transactions
            </span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-surface-container-lowest font-bold text-[11px] border border-border/20">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedFilter !== "all" && (
              <span className="px-2 py-0.5 rounded-md bg-surface-container-lowest font-bold text-[11px] border border-border/20">
                Method: {selectedFilter}
              </span>
            )}
            {datePreset !== "all" && (
              <span className="px-2 py-0.5 rounded-md bg-surface-container-lowest font-bold text-[11px] border border-border/20">
                Period: {datePreset.toUpperCase()} ({dateFrom || "..."} → {dateTo || "..."})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-error hover:underline font-bold text-xs shrink-0 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Method & Status Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-sm rounded-2xl shadow-xs border border-border/40">
        {/* Method Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Transactions" },
            { id: "khqr", label: "KHQR Digital" },
            { id: "pending_audit", label: "Pending Audit" },
            { id: "cod", label: "COD Courier" },
            { id: "counter", label: "Counter POS" },
            { id: "cancelled", label: "Cancelled / Refunded" },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onFilterChange(chip.id)}
              className={`px-3 py-1.5 rounded-xl font-label-sm text-xs font-bold transition-all border ${
                selectedFilter === chip.id
                  ? "bg-primary text-on-primary border-primary shadow-xs"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant border-border/30"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            suppressHydrationWarning
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search by Txn Ref, Order ID, or Customer..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-border/30"
          />
        </div>
      </div>

      {/* Responsive Transactions Audit Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-border/40 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider border-b border-border/30">
                <th className="py-3 px-space-md">Txn Ref &amp; Order</th>
                <th className="py-3 px-space-md">Customer Info</th>
                <th className="py-3 px-space-md">Gateway &amp; Method</th>
                <th className="py-3 px-space-md">Amount Paid</th>
                <th className="py-3 px-space-md">Audit Status</th>
                <th className="py-3 px-space-md">Timestamp</th>
                <th className="py-3 px-space-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                    No transaction audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => {
                  const isKhqr = txn.method === "khqr" || txn.proofImageUrl;
                  const isPending = txn.status === "pending_review";

                  return (
                    <tr
                      key={txn.id}
                      className="hover:bg-surface-container-low/70 transition-colors"
                    >
                      {/* Txn Ref & Order ID */}
                      <td className="py-3 px-space-md">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-primary">
                            {txn.txnRef}
                          </span>
                          <span className="font-label-sm text-[11px] text-on-surface-variant">
                            Order {txn.orderId}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-space-md">
                        <div className="flex flex-col">
                          <span className="font-label-md text-xs font-bold text-on-surface">
                            {txn.customerName}
                          </span>
                          <span className="font-body-sm text-[11px] text-on-surface-variant">
                            {txn.customerPhone}
                          </span>
                        </div>
                      </td>

                      {/* Gateway & Method */}
                      <td className="py-3 px-space-md">
                        {getMethodBadge(txn.method, txn.gateway)}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3 px-space-md">
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-xs font-extrabold text-emerald-700">
                            ${txn.amountUsd.toFixed(2)}
                          </span>
                          <span className="font-body-sm text-[10px] text-on-surface-variant font-semibold">
                            {txn.amountKhr.toLocaleString()} ៛
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-space-md">
                        {getStatusBadge(txn.status)}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-space-md text-on-surface-variant font-medium text-[11px]">
                        <div>{txn.dateLabel}</div>
                        <div className="text-[10px] text-on-surface-variant/80">{txn.timestamp}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-space-md text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {isKhqr && (
                            <button
                              type="button"
                              onClick={() => onSelectTransactionForProof(txn)}
                              className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-xs font-bold shadow-xs border border-border/20 flex items-center gap-1 transition-colors"
                              title="Preview KHQR Payment Slip"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                              <span>Preview Slip</span>
                            </button>
                          )}

                          {isPending && (
                            <button
                              type="button"
                              onClick={() => onVerifyTransaction(txn.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-label-sm text-xs font-bold shadow-xs transition-colors"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
