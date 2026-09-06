"use client";

import React, { useState, useEffect } from "react";
import { ShiftStatusBeacon } from "@/components/delivery/ShiftStatusBeacon";
import { DeliveryCard } from "@/components/delivery/DeliveryCard";
import { useDeliveryStore } from "@/lib/store/useDeliveryStore";
import { Flame, Banknote, QrCode, Coffee, RefreshCw } from "lucide-react";

export default function DeliveryHomePage() {
  const {
    availableOrders,
    acceptOrder,
    resetAvailableOrders,
    fetchLiveOrders,
    selectedFilter,
    setSelectedFilter,
  } = useDeliveryStore();

  const [viewMode, setViewMode] = useState<"orders" | "empty">("orders");

  useEffect(() => {
    fetchLiveOrders();
  }, [fetchLiveOrders]);

  // Filter orders based on active pill
  const filteredOrders = availableOrders.filter((order) => {
    if (selectedFilter === "nearby") return parseFloat(order.distance) < 4.0;
    if (selectedFilter === "ready")
      return order.prepStatusType === "ready" || order.prepStatusType === "urgent";
    if (selectedFilter === "cash") return order.paymentType === "cod";
    if (selectedFilter === "prepaid") return order.paymentType === "khqr";
    return true;
  });

  const showEmptyState =
    viewMode === "empty" || filteredOrders.length === 0;

  return (
    <div className="flex flex-col w-full pb-space-2xl max-w-md mx-auto">
      {/* Shift Overview & Beacon */}
      <ShiftStatusBeacon />

      {/* Dispatch Control Header & View Switcher */}
      <div className="px-screen-edge-padding flex flex-col gap-space-sm">
        <div className="flex items-center justify-between flex-wrap gap-y-2 gap-x-space-xs pt-space-xs">
          <div className="flex items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight truncate">
              Kitchen Dispatch
            </h2>
            <span
              id="orderCountBadge"
              className="bg-primary-fixed text-on-primary-fixed font-label-md text-label-md px-2.5 py-0.5 rounded-full font-bold shadow-sm shrink-0 whitespace-nowrap"
            >
              {availableOrders.length} Available
            </span>
          </div>

          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full shrink-0">
            <button
              id="viewOrdersBtn"
              type="button"
              onClick={() => setViewMode("orders")}
              className={`px-2.5 sm:px-3 py-1 rounded-full font-label-sm text-xs sm:text-label-sm transition-all whitespace-nowrap ${
                viewMode === "orders"
                  ? "bg-surface-container-lowest text-on-surface font-bold shadow-sm"
                  : "text-on-surface-variant font-semibold hover:text-on-surface"
              }`}
            >
              Orders ({availableOrders.length})
            </button>
            <button
              id="viewEmptyBtn"
              type="button"
              onClick={() => setViewMode("empty")}
              className={`px-2.5 sm:px-3 py-1 rounded-full font-label-sm text-xs sm:text-label-sm transition-all whitespace-nowrap ${
                viewMode === "empty"
                  ? "bg-surface-container-lowest text-on-surface font-bold shadow-sm"
                  : "text-on-surface-variant font-semibold hover:text-on-surface"
              }`}
            >
              Preview Empty
            </button>
          </div>
        </div>

        {/* Horizontal Category Filter Pills */}
        <div className="flex items-center gap-space-xs overflow-x-auto py-1 scrollbar-none no-scrollbar">
          <button
            type="button"
            onClick={() =>
              setSelectedFilter(selectedFilter === "nearby" ? "all" : "nearby")
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-label-sm shrink-0 shadow-sm transition-all ${
              selectedFilter === "nearby"
                ? "bg-on-surface text-surface font-bold"
                : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
            <span>Nearby (&lt; 4 mi)</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedFilter(selectedFilter === "ready" ? "all" : "ready")
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-label-sm shrink-0 shadow-sm transition-all ${
              selectedFilter === "ready"
                ? "bg-on-surface text-surface font-bold"
                : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <Flame className="w-4 h-4 text-primary" />
            <span>Ready for Pickup</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedFilter(selectedFilter === "cash" ? "all" : "cash")
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-label-sm shrink-0 shadow-sm transition-all ${
              selectedFilter === "cash"
                ? "bg-on-surface text-surface font-bold"
                : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <Banknote className="w-4 h-4 text-tertiary" />
            <span>Cash Orders</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedFilter(selectedFilter === "prepaid" ? "all" : "prepaid")
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-label-sm shrink-0 shadow-sm transition-all ${
              selectedFilter === "prepaid"
                ? "bg-on-surface text-surface font-bold"
                : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <QrCode className="w-4 h-4 text-tertiary" />
            <span>Prepaid Only</span>
          </button>
        </div>
      </div>

      {/* Main Order Feed or Empty State */}
      {!showEmptyState ? (
        <div
          id="ordersFeed"
          className="flex flex-col gap-space-md px-screen-edge-padding mt-space-xs"
        >
          {filteredOrders.map((order) => (
            <DeliveryCard
              key={order.id}
              order={order}
              onAccept={acceptOrder}
            />
          ))}
        </div>
      ) : (
        <div
          id="emptyFeedState"
          className="flex flex-col items-center justify-center text-center px-screen-edge-padding py-space-3xl min-h-[380px]"
        >
          <div className="relative w-28 h-28 mb-space-md flex items-center justify-center">
            <div className="absolute inset-0 bg-primary-fixed/40 rounded-full animate-pulse"></div>
            <div className="relative w-20 h-20 bg-surface-container-lowest rounded-full shadow-lg flex items-center justify-center text-primary">
              <Coffee className="w-10 h-10 text-primary" />
            </div>
            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-secondary-container ring-2 ring-surface"></span>
          </div>
          <span className="font-headline-md text-headline-md text-on-surface font-bold">
            Kitchen is Simmering
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mt-space-xs">
            No delivery tickets pending right now. Grab an espresso while we smoke the next batch.
          </p>

          {/* Radar Pulse Indicator */}
          <div className="inline-flex items-center gap-2 bg-surface-container px-space-md py-2 rounded-full mt-space-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span className="font-label-sm text-label-sm font-bold text-on-surface">
              Checking bistro dispatch feed...
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setViewMode("orders");
              resetAvailableOrders();
            }}
            className="mt-space-lg px-space-lg py-2.5 bg-surface-container-lowest text-on-surface rounded-full font-label-md text-label-md font-bold shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform hover:bg-surface-container-high"
          >
            <RefreshCw className="w-4 h-4 text-primary" />
            <span>Force Refresh</span>
          </button>
        </div>
      )}
    </div>
  );
}
