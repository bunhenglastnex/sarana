"use client";

import React from "react";
import {
  Search,
  Calendar,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronIcon,
  Bike,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { OrderRecord } from "@/types/orders";
import { PaginationMeta } from "@/hooks/useInfiniteScroll";
import { InfiniteScrollSentinel } from "@/components/ui/InfiniteScrollSentinel";

interface OrderDirectoryProps {
  orders: OrderRecord[];
  allOrders?: OrderRecord[];
  counts?: {
    all: number;
    pending: number;
    preparing: number;
    ready: number;
    delivery: number;
    pickup: number;
    completed: number;
    cancelled: number;
  };
  pagination?: PaginationMeta | null;
  loading?: boolean;
  sentinelRef?: React.RefObject<HTMLDivElement>;
  selectedOrderId: string;
  onSelectOrder: (orderId: string) => void;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onRefresh?: () => void;
}

export const OrderDirectory: React.FC<OrderDirectoryProps> = ({
  orders,
  allOrders,
  counts,
  pagination,
  loading = false,
  sentinelRef,
  selectedOrderId,
  onSelectOrder,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  onRefresh,
}) => {
  const activeCounts = counts || {
    all: (allOrders || orders).length,
    pending: (allOrders || orders).filter((o) => o.status === "pending").length,
    preparing: (allOrders || orders).filter((o) => o.status === "preparing")
      .length,
    ready: (allOrders || orders).filter((o) => o.status === "ready").length,
    delivery: (allOrders || orders).filter((o) => o.channel === "delivery")
      .length,
    pickup: (allOrders || orders).filter((o) => o.channel === "pickup").length,
    completed: (allOrders || orders).filter(
      (o) => o.status === "delivered" || o.status === "picked_up",
    ).length,
    cancelled: (allOrders || orders).filter((o) => o.status === "cancelled")
      .length,
  };

  const getStatusBadge = (order: OrderRecord) => {
    switch (order.status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-xs bg-error-container text-on-error-container font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
            PENDING
          </span>
        );
      case "preparing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-xs bg-secondary-container/20 text-on-secondary-container font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse" />
            PREPARING
          </span>
        );
      case "ready":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-xs bg-primary-fixed text-on-primary-fixed font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            READY (STAGE)
          </span>
        );
      case "in_transit":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-xs bg-surface-container text-on-surface font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            IN TRANSIT
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-xs bg-surface-container-high text-on-surface-variant font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            DELIVERED
          </span>
        );
      case "picked_up":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-xs bg-surface-container-high text-on-surface-variant font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            PICKED UP
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-xs bg-error-container text-on-error-container font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-xs bg-surface-container text-on-surface-variant font-bold">
            {order.statusLabel}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-space-md min-w-0">
      {/* Primary Status Filter Pills (Tabbed) */}
      <div className="bg-surface-container-low p-1.5 rounded-xl flex items-center gap-1 overflow-x-auto shadow-xs border border-border/30 custom-scrollbar">
        <button
          onClick={() => onStatusFilterChange("all")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 ${
            statusFilter === "all"
              ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high font-medium"
          }`}
        >
          All ({activeCounts.all})
        </button>

        <button
          onClick={() => onStatusFilterChange("pending")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 flex items-center gap-1.5 ${
            statusFilter === "pending"
              ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high font-medium"
          }`}
        >
          <span>Pending</span>
          <span className="w-2 h-2 rounded-full bg-secondary" />
          {activeCounts.pending > 0 && (
            <span className="bg-error text-on-error px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {activeCounts.pending}
            </span>
          )}
        </button>

        <button
          onClick={() => onStatusFilterChange("preparing")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 flex items-center gap-1.5 ${
            statusFilter === "preparing"
              ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high font-medium"
          }`}
        >
          <span>Preparing</span>
          <span className="w-2 h-2 rounded-full bg-secondary-container" />
          {activeCounts.preparing > 0 && (
            <span className="bg-primary-container text-on-primary-container px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {activeCounts.preparing}
            </span>
          )}
        </button>

        <button
          onClick={() => onStatusFilterChange("ready")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 ${
            statusFilter === "ready"
              ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high font-medium"
          }`}
        >
          Ready ({activeCounts.ready})
        </button>

        <button
          onClick={() => onStatusFilterChange("delivery")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 ${
            statusFilter === "delivery"
              ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high font-medium"
          }`}
        >
          Delivery ({activeCounts.delivery})
        </button>

        <button
          onClick={() => onStatusFilterChange("pickup")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 ${
            statusFilter === "pickup"
              ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high font-medium"
          }`}
        >
          Pickup ({activeCounts.pickup})
        </button>

        <button
          onClick={() => onStatusFilterChange("completed")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 ${
            statusFilter === "completed"
              ? "bg-inverse-surface text-inverse-on-surface font-bold shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high font-medium"
          }`}
        >
          Completed ({activeCounts.completed})
        </button>

        <button
          onClick={() => onStatusFilterChange("cancelled")}
          className={`px-space-md py-2 rounded-lg font-label-md text-xs transition-colors shrink-0 ${
            statusFilter === "cancelled"
              ? "bg-error text-on-error font-bold shadow-xs"
              : "text-error hover:bg-error-container/30 font-medium"
          }`}
        >
          Cancelled ({activeCounts.cancelled})
        </button>
      </div>

      {/* Extended Filter Utility Row */}
      <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-xs border border-border/40 flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              suppressHydrationWarning
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search by #ID, customer, phone..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-outline-variant transition-all border border-transparent focus:border-border/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-space-xs">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Refresh Directory"
            className="p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors border border-border/20"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Data Table Card (Scrollable Y with Sticky Header) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-border/40 overflow-hidden flex flex-col">
        <div className="overflow-x-auto max-h-[calc(100vh-260px)] overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-surface-container-low border-b border-border/30 shadow-xs">
              <tr className="text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider">
                <th className="py-3 px-space-md">Order ID</th>
                <th className="py-3 px-space-md">Customer &amp; Channel</th>
                <th className="py-3 px-space-md">Items / Dishes</th>
                <th className="py-3 px-space-md">Status</th>
                <th className="py-3 px-space-md text-right">
                  Total &amp; Payment
                </th>
                <th className="py-3 px-space-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs">
              {orders.map((order) => {
                const isSelected = order.id === selectedOrderId;
                return (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary-fixed/20 hover:bg-primary-fixed/30"
                        : "hover:bg-surface-container-low"
                    }`}
                  >
                    <td className="py-3.5 px-space-md">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        )}
                        <div>
                          <div
                            className={`font-headline-sm text-sm font-bold ${
                              isSelected ? "text-primary" : "text-on-surface"
                            }`}
                          >
                            {order.id}
                          </div>
                          <div className="font-label-sm text-[11px] text-on-surface-variant">
                            {order.placedTimeLabel} • {order.timeAgoLabel}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-space-md">
                      <div className="font-label-lg text-xs font-bold text-on-surface">
                        {order.customerName}
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-[11px] mt-0.5">
                        {order.channel === "delivery" ? (
                          <Bike className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5 text-secondary" />
                        )}
                        <span>{order.channelLabel}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-space-md">
                      <div className="font-label-md text-xs text-on-surface truncate max-w-[170px]">
                        {order.itemsSummary}
                      </div>
                      <div className="font-body-sm text-[11px] text-on-surface-variant">
                        {order.totalItemsCount} items total
                      </div>
                    </td>

                    <td className="py-3.5 px-space-md">
                      {getStatusBadge(order)}
                    </td>

                    <td className="py-3.5 px-space-md text-right">
                      <div className="font-price-lg text-sm font-bold text-on-surface">
                        ${order.totalPrice.toFixed(2)}
                      </div>
                      <span
                        className={`font-label-sm text-[10px] px-1.5 py-0.5 rounded uppercase font-bold inline-block mt-0.5 ${
                          order.paymentIsPaid
                            ? "bg-secondary-fixed text-on-secondary-fixed"
                            : order.paymentStatus === "pending_review" || order.proofImageUrl
                            ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {order.paymentStatus === "pending_review"
                          ? "SLIP UPLOADED"
                          : order.paymentBadgeLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-space-sm text-center">
                      <ChevronIcon
                        className={`w-5 h-5 transition-transform ${
                          isSelected
                            ? "text-primary translate-x-0.5"
                            : "text-on-surface-variant/60"
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Infinite Scroll Sentinel inside scrollable container */}
          {sentinelRef && (
            <InfiniteScrollSentinel
              sentinelRef={sentinelRef}
              loading={loading}
              pagination={pagination || null}
              itemsCount={orders.length}
              unitLabel="orders"
            />
          )}
        </div>
      </div>
    </div>
  );
};
