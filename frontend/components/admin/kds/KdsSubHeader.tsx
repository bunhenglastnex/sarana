"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  RefreshCw,
  Gauge,
  Volume2,
  VolumeX,
  Kanban,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface KdsSubHeaderProps {
  activeCount: number;
  deliveryCount: number;
  pickupCount: number;
  readyCount?: number;
  currentFilter: "all" | "delivery" | "pickup";
  onFilterChange: (filter: "all" | "delivery" | "pickup") => void;
}

export const KdsSubHeader: React.FC<KdsSubHeaderProps> = ({
  activeCount,
  deliveryCount,
  pickupCount,
  readyCount,
  currentFilter,
  onFilterChange,
}) => {
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-md">
      {/* Left: Screen State & Operational Metrics */}
      <div className="flex flex-wrap items-center gap-space-md">
        <div className="flex items-center gap-space-xs">
          <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
          <h1 className="font-headline-sm text-lg font-bold text-on-surface tracking-tight">
            Kitchen Hearth KDS
          </h1>
        </div>

        <div className="h-5 w-px bg-surface-container-high hidden sm:block" />

        {/* Sync Status & Active Count Badge */}
        <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded-full text-on-surface-variant border border-border/30">
          <RefreshCw className="w-3.5 h-3.5 text-secondary animate-spin-slow" />
          <span className="font-label-sm text-xs text-on-surface font-medium">
            Live Synced{" "}
            <span className="text-on-surface-variant font-normal">
              • 2s ago
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1 bg-primary-fixed px-space-sm py-1 rounded-full text-on-primary-fixed">
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span className="font-label-sm text-xs font-bold uppercase tracking-wider">
            {activeCount} Active Tickets
          </span>
        </div>
      </div>

      {/* Right: Quick Filters & Auditory Alert Controls */}
      <div className="flex flex-wrap items-center gap-space-sm w-full xl:w-auto justify-between xl:justify-end">
        {/* Order Filter Pills */}
        <div className="flex items-center bg-surface-container p-1 rounded-lg border border-border/30">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-all ${
              currentFilter === "all"
                ? "bg-inverse-surface text-inverse-on-surface shadow-sm font-bold"
                : "text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            All Orders ({activeCount})
          </button>
          <button
            onClick={() => onFilterChange("delivery")}
            className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-all ${
              currentFilter === "delivery"
                ? "bg-inverse-surface text-inverse-on-surface shadow-sm font-bold"
                : "text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            Delivery ({deliveryCount})
          </button>
          <button
            onClick={() => onFilterChange("pickup")}
            className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-all ${
              currentFilter === "pickup"
                ? "bg-inverse-surface text-inverse-on-surface shadow-sm font-bold"
                : "text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            Pickup ({pickupCount})
          </button>
        </div>

        <div className="h-6 w-px bg-surface-container-high hidden sm:block" />

        {/* Kitchen Chime Toggle */}
        <button
          onClick={() => setIsSoundOn(!isSoundOn)}
          className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-border/30"
        >
          {isSoundOn ? (
            <Volume2 className="w-4 h-4 text-primary" />
          ) : (
            <VolumeX className="w-4 h-4 text-on-surface-variant" />
          )}
          <span className="font-label-sm text-xs font-semibold">
            Bell: {isSoundOn ? "ON" : "MUTED"}
          </span>
        </button>

        {/* Fullscreen Toggle for Kitchen Monitor */}
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-space-2xs px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-border/30"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Monitor Mode"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-primary" />
          ) : (
            <Maximize2 className="w-4 h-4 text-on-surface-variant" />
          )}
          <span className="font-label-sm text-xs font-semibold">
            {isFullscreen ? "Exit Full" : "Fullscreen"}
          </span>
        </button>
      </div>
    </div>
  );
};
