"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Power, Loader2 } from "lucide-react";
import { Api, useApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface HearthStatusStripProps {
  selectedRange?: "today" | "week" | "month" | "custom";
  onRangeChange?: (range: "today" | "week" | "month" | "custom") => void;
  onRefresh?: () => void;
}

export const HearthStatusStrip: React.FC<HearthStatusStripProps> = ({
  selectedRange: externalRange,
  onRangeChange,
  onRefresh,
}) => {
  const { role, selectedTenantId } = useAuthStore();
  const [internalRange, setInternalRange] = useState<
    "today" | "week" | "month" | "custom"
  >("today");
  const [isKitchenActive, setIsKitchenActive] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  const selectedRange = externalRange || internalRange;

  // Fetch live settings on mount or tenant switch
  const getParams: Record<string, any> = {};
  if (role === "super_admin" && selectedTenantId) {
    getParams.restaurant_id = selectedTenantId;
  }

  const { data: settingsRes, loading: settingsLoading } = useApi<any>(
    "/settings.php",
    getParams,
    { forceRefresh: true }
  );

  useEffect(() => {
    if (settingsRes) {
      const status = settingsRes?.data?.is_active ?? settingsRes?.is_active;
      if (status !== undefined && status !== null) {
        setIsKitchenActive(
          status === true || status === 1 || status === "1" || status === "true"
        );
      }
    }
  }, [settingsRes]);

  const handleSelectRange = (range: "today" | "week" | "month" | "custom") => {
    setInternalRange(range);
    if (onRangeChange) onRangeChange(range);
  };

  const handleToggleKitchenStatus = async () => {
    if (isToggling) return;
    const nextStatus = !isKitchenActive;
    setIsToggling(true);

    try {
      const payload: Record<string, any> = {
        is_active: nextStatus,
      };
      if (role === "super_admin" && selectedTenantId) {
        payload.restaurant_id = selectedTenantId;
      }

      // 1. Post to /settings.php
      const res = await Api.post("/settings.php", payload);
      
      // 2. Put to /restaurants.php to ensure multi-tenant DB table is updated
      await Api.put("/restaurants.php", { is_active: nextStatus, id: selectedTenantId || undefined });

      if (res.success) {
        setIsKitchenActive(nextStatus);
        Api.cache.clear();
        if (onRefresh) onRefresh();
      } else {
        alert("Failed to update kitchen status: " + (res.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error updating kitchen status: " + (err.message || "Network error"));
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
      {/* Greeting & Station Description */}
      <div className="flex flex-col">
        <div className="flex items-center gap-space-xs">
          <span className="font-label-sm text-xs text-primary uppercase tracking-wider font-bold">
            Shift Administration
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
          <span className="font-label-sm text-xs text-on-surface-variant font-medium">
            Station #01 Hearth Hub
          </span>
        </div>
        <h1 className="font-headline-xl text-2xl md:text-3xl text-on-surface tracking-tight font-bold mt-0.5">
          Hello, Bistro Manager
        </h1>
        <p className="font-body-sm text-sm text-on-surface-variant">
          Live operations, service dispatch queue, and culinary sales rhythm for
          today.
        </p>
      </div>

      {/* Date Range Selector & Hearth Switcher */}
      <div className="flex flex-wrap items-center gap-space-sm">
        {/* Filter Buttons */}
        <div className="inline-flex p-1 bg-surface-container rounded-lg shadow-sm border border-border/40">
          <button
            onClick={() => handleSelectRange("today")}
            className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-all font-semibold ${
              selectedRange === "today"
                ? "text-on-primary bg-primary shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleSelectRange("week")}
            className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-all font-semibold ${
              selectedRange === "week"
                ? "text-on-primary bg-primary shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => handleSelectRange("month")}
            className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-all font-semibold ${
              selectedRange === "month"
                ? "text-on-primary bg-primary shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handleSelectRange("custom")}
            className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-all font-semibold flex items-center gap-1 ${
              selectedRange === "custom"
                ? "text-on-primary bg-primary shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Custom</span>
          </button>
        </div>

        {/* Hearth Switcher Toggle */}
        <div className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-lowest shadow-sm border border-border/40">
          <span className="relative flex h-2.5 w-2.5">
            {isKitchenActive && !settingsLoading && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                settingsLoading
                  ? "bg-amber-400 animate-pulse"
                  : isKitchenActive
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            ></span>
          </span>
          <div className="flex flex-col min-w-[100px]">
            <span className="font-label-sm text-xs text-on-surface leading-tight font-semibold">
              {settingsLoading
                ? "Checking..."
                : isKitchenActive
                ? "Kitchen Active"
                : "Kitchen Paused"}
            </span>
            <span
              className={`font-body-sm text-[10px] leading-tight font-medium ${
                isKitchenActive ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {settingsLoading
                ? "Connecting..."
                : isKitchenActive
                ? "Accepting Orders"
                : "Orders On Hold"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleKitchenStatus}
            disabled={isToggling || settingsLoading}
            title={isKitchenActive ? "Pause Kitchen (Hold Orders)" : "Activate Kitchen (Accept Orders)"}
            className={`ml-space-xs p-1.5 hover:bg-surface-container rounded-lg transition-all flex items-center justify-center border ${
              isKitchenActive
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20"
                : "bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20"
            } disabled:opacity-50 active:scale-95`}
          >
            {isToggling ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Power
                className={`w-4 h-4 font-bold ${
                  isKitchenActive ? "text-emerald-600" : "text-red-600"
                }`}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
