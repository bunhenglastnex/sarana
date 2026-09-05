"use client";

import React from "react";
import {
  Search,
  Crown,
  Sparkles,
  Star,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { CustomerRecord, CustomerTag } from "@/types/customers";
import { Badge } from "@/components/ui/badge";

interface CustomerDirectoryTableProps {
  customers: CustomerRecord[];
  allCustomersCount: number;
  selectedCustomerId: string;
  onSelectCustomer: (id: string) => void;
  filterTag: string;
  onFilterTagChange: (tag: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export const CustomerDirectoryTable: React.FC<CustomerDirectoryTableProps> = ({
  customers,
  allCustomersCount,
  selectedCustomerId,
  onSelectCustomer,
  filterTag,
  onFilterTagChange,
  searchQuery,
  onSearchQueryChange,
}) => {
  const getTagBadge = (tag: CustomerTag) => {
    switch (tag) {
      case "VIP":
        return (
          <Badge variant="warning" className="gap-1 font-bold shadow-xs">
            <Crown className="w-3 h-3 text-amber-600" />
            VIP DINER
          </Badge>
        );
      case "High Spend":
        return (
          <Badge variant="secondary" className="gap-1 bg-purple-500/15 text-purple-600 border-purple-500/30 font-bold shadow-xs">
            <Sparkles className="w-3 h-3 text-purple-600" />
            HIGH SPEND
          </Badge>
        );
      case "Regular":
        return (
          <Badge variant="secondary" className="gap-1 font-bold">
            <Star className="w-3 h-3 text-secondary" />
            REGULAR
          </Badge>
        );
      case "New":
        return (
          <Badge variant="default" className="gap-1 font-bold">
            NEW GUEST
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-space-md min-w-0">
      {/* Status Filter Tabs */}
      <div className="bg-surface-container-low p-1.5 rounded-xl flex items-center gap-1 overflow-x-auto shadow-xs border border-border/30 custom-scrollbar">
        <button
          onClick={() => onFilterTagChange("all")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 ${
            filterTag === "all"
              ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high font-medium"
          }`}
        >
          All ({allCustomersCount})
        </button>
        <button
          onClick={() => onFilterTagChange("vip")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 flex items-center gap-1 ${
            filterTag === "vip"
              ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high font-medium"
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span>VIP ({customers.filter((c) => c.tag === "VIP").length})</span>
        </button>
        <button
          onClick={() => onFilterTagChange("regular")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 ${
            filterTag === "regular"
              ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high font-medium"
          }`}
        >
          Regulars ({customers.filter((c) => c.tag === "Regular").length})
        </button>
        <button
          onClick={() => onFilterTagChange("high_spend")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 ${
            filterTag === "high_spend"
              ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high font-medium"
          }`}
        >
          High Spend ({customers.filter((c) => c.tag === "High Spend").length})
        </button>
        <button
          onClick={() => onFilterTagChange("new")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 ${
            filterTag === "new"
              ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high font-medium"
          }`}
        >
          New Guests ({customers.filter((c) => c.tag === "New").length})
        </button>
      </div>

      {/* Search Box */}
      <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-xs border border-border/40 flex items-center gap-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            suppressHydrationWarning
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search customers by name, phone, email, or address..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-outline-variant transition-all border border-transparent focus:border-border/40"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-border/40 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider border-b border-border/30">
                <th className="py-3 px-space-md">Customer Profile</th>
                <th className="py-3 px-space-md">Tag &amp; Status</th>
                <th className="py-3 px-space-md text-center">Orders</th>
                <th className="py-3 px-space-md text-right">Lifetime Spend</th>
                <th className="py-3 px-space-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs">
              {customers.map((customer) => {
                const isSelected = customer.id === selectedCustomerId;
                return (
                  <tr
                    key={customer.id}
                    onClick={() => onSelectCustomer(customer.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary-fixed/20 hover:bg-primary-fixed/30"
                        : "hover:bg-surface-container-low"
                    }`}
                  >
                    <td className="py-3.5 px-space-md">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary-container/40 flex items-center justify-center text-on-secondary-container font-bold text-xs shrink-0 ring-2 ring-surface-container-lowest">
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div
                            className={`font-headline-sm text-xs font-bold ${
                              isSelected ? "text-primary" : "text-on-surface"
                            }`}
                          >
                            {customer.name}
                          </div>
                          <div className="font-body-sm text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                            <span>{customer.phone}</span>
                            <span>•</span>
                            <span>{customer.paymentPreference}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-space-md">
                      {getTagBadge(customer.tag)}
                    </td>

                    <td className="py-3.5 px-space-md text-center">
                      <span className="font-headline-sm text-xs font-bold text-on-surface">
                        {customer.totalOrders}
                      </span>
                      <span className="text-[10px] text-on-surface-variant block font-medium">
                        orders
                      </span>
                    </td>

                    <td className="py-3.5 px-space-md text-right">
                      <div className="font-price-lg text-xs font-bold text-emerald-700">
                        ${customer.totalSpend.toFixed(2)}
                      </div>
                      <span className="font-label-sm text-[10px] text-on-surface-variant block">
                        {customer.lastOrderDate}
                      </span>
                    </td>

                    <td className="py-3.5 px-space-sm text-center">
                      <ChevronRight
                        className={`w-4 h-4 mx-auto transition-transform ${
                          isSelected
                            ? "text-primary translate-x-0.5"
                            : "text-on-surface-variant/50"
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-space-sm bg-surface-container-low flex items-center justify-between border-t border-border/30">
          <div className="font-body-sm text-xs text-on-surface-variant">
            Showing{" "}
            <span className="font-bold text-on-surface">
              1 - {customers.length}
            </span>{" "}
            of {allCustomersCount} accounts
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="p-1 rounded bg-surface-container text-on-surface-variant disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-label-sm text-xs font-bold text-on-surface">
              Page 1 of 1
            </span>
            <button
              disabled
              className="p-1 rounded bg-surface-container text-on-surface-variant disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
