"use client";

import React from "react";
import { Search, RefreshCw, Navigation, CheckCircle2, LogOut, Truck } from "lucide-react";
import { StaffStatus } from "@/types/staff";

interface StaffFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StaffStatus;
  onStatusFilterChange: (status: StaffStatus) => void;
  onRefresh: () => void;
}

export const StaffFilterBar: React.FC<StaffFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
}) => {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Driver Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-border/30">
        <button
          type="button"
          onClick={() => onStatusFilterChange("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === "all"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>All Couriers</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange("on_delivery")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === "on_delivery"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>ON DELIVERY</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange("available")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === "available"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ONLINE</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange("logout")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === "logout"
              ? "bg-slate-700 text-white shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>LOGOUT</span>
        </button>
      </div>

      {/* Search Input & Refresh Button */}
      <div className="flex items-center gap-2 flex-1 md:flex-initial">
        <div className="relative flex-1 md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search courier name, phone, plate..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-container-lowest border border-border/30 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant border border-border/30 transition-colors shrink-0"
          title="Refresh Fleet Roster"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
