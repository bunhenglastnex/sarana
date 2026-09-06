"use client";

import React, { useState } from "react";
import { Calendar, Power } from "lucide-react";

export const HearthStatusStrip: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<
    "today" | "week" | "month" | "custom"
  >("today");
  const [isKitchenActive, setIsKitchenActive] = useState<boolean>(true);

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
          Good morning, Bistro Manager
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
            onClick={() => setSelectedRange("today")}
            className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-all font-semibold ${
              selectedRange === "today"
                ? "text-on-primary bg-primary shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedRange("week")}
            className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-all font-semibold ${
              selectedRange === "week"
                ? "text-on-primary bg-primary shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedRange("month")}
            className={`px-space-sm py-1 rounded-md font-label-sm text-xs transition-all font-semibold ${
              selectedRange === "month"
                ? "text-on-primary bg-primary shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setSelectedRange("custom")}
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
            {isKitchenActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isKitchenActive
                  ? "bg-secondary-container"
                  : "bg-muted-foreground"
              }`}
            ></span>
          </span>
          <div className="flex flex-col">
            <span className="font-label-sm text-xs text-on-surface leading-tight font-semibold">
              {isKitchenActive ? "Kitchen Active" : "Kitchen Paused"}
            </span>
            <span className="font-body-sm text-[10px] leading-tight text-on-surface-variant">
              {isKitchenActive ? "Accepting Orders" : "Orders On Hold"}
            </span>
          </div>
          <button
            onClick={() => setIsKitchenActive(!isKitchenActive)}
            title="Toggle Kitchen Acceptance"
            className="ml-space-xs p-1 hover:bg-surface-container rounded transition-colors text-on-surface-variant"
          >
            <Power
              className={`w-4 h-4 ${isKitchenActive ? "text-primary font-bold" : "text-muted-foreground"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
