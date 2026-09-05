"use client";

import React from "react";
import { useDeliveryStore } from "@/lib/store/useDeliveryStore";
import { Power, PauseCircle } from "lucide-react";

export const ShiftStatusBeacon: React.FC = () => {
  const { isOnline, activeZone, toggleShift } = useDeliveryStore();

  return (
    <div className="px-screen-edge-padding pt-space-sm pb-space-xs flex flex-col gap-space-sm w-full max-w-md mx-auto">
      <div className="flex items-center justify-between bg-surface-container rounded-full px-space-md py-space-xs shadow-sm">
        <div className="flex items-center gap-space-xs min-w-0">
          <div className="relative flex items-center justify-center w-3.5 h-3.5">
            {isOnline && (
              <span className="absolute w-full h-full rounded-full bg-secondary-container animate-ping opacity-75"></span>
            )}
            <span
              className={`relative w-2.5 h-2.5 rounded-full ${
                isOnline ? "bg-primary" : "bg-tertiary"
              }`}
            ></span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface font-bold tracking-wide uppercase truncate">
              Status: {isOnline ? "Active & Ready" : "Shift Paused"}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {activeZone}
            </span>
          </div>
        </div>
        <button
          aria-label="Toggle Online Duty Status"
          className="flex items-center gap-1 bg-surface-container-lowest px-space-sm py-1.5 rounded-full text-on-surface shadow-sm active:scale-95 transition-transform hover:bg-surface-container-high"
          onClick={toggleShift}
          type="button"
        >
          {isOnline ? (
            <Power className="w-4 h-4 text-primary" />
          ) : (
            <PauseCircle className="w-4 h-4 text-tertiary" />
          )}
          <span className="font-label-sm text-label-sm font-bold text-on-surface select-none">
            {isOnline ? "Go Offline" : "Go Online"}
          </span>
        </button>
      </div>
    </div>
  );
};
