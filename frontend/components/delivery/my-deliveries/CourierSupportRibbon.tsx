"use client";

import React from "react";
import { AlertTriangle, Clock, Headset } from "lucide-react";

interface CourierSupportRibbonProps {
  onOpenSheet: (type: "issue" | "delay" | "dispatcher") => void;
}

export const CourierSupportRibbon: React.FC<CourierSupportRibbonProps> = ({
  onOpenSheet,
}) => {
  return (
    <div className="bg-surface-container-low rounded-xl p-card-inner-padding shadow-sm flex flex-col space-y-space-xs border border-outline-variant/30">
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md text-on-surface font-bold">
          Courier Operations Center
        </span>
        <span className="font-label-sm text-label-sm text-secondary font-semibold">
          Live Support On Duty
        </span>
      </div>

      <div className="grid grid-cols-3 gap-space-xs">
        {/* Report Issue Button */}
        <button
          type="button"
          onClick={() => onOpenSheet("issue")}
          className="bg-surface-container-lowest p-2 rounded-lg flex flex-col items-center justify-center text-center active:scale-95 transition-transform shadow-sm hover:bg-surface-container-high"
        >
          <AlertTriangle className="w-[22px] h-[22px] text-error" />
          <span className="font-label-sm text-label-sm text-on-surface font-bold mt-1">
            Report Issue
          </span>
        </button>

        {/* Delay Kitchen Button */}
        <button
          type="button"
          onClick={() => onOpenSheet("delay")}
          className="bg-surface-container-lowest p-2 rounded-lg flex flex-col items-center justify-center text-center active:scale-95 transition-transform shadow-sm hover:bg-surface-container-high"
        >
          <Clock className="w-[22px] h-[22px] text-secondary" />
          <span className="font-label-sm text-label-sm text-on-surface font-bold mt-1">
            Delay Kitchen
          </span>
        </button>

        {/* Dispatcher Support Button */}
        <button
          type="button"
          onClick={() => onOpenSheet("dispatcher")}
          className="bg-surface-container-lowest p-2 rounded-lg flex flex-col items-center justify-center text-center active:scale-95 transition-transform shadow-sm hover:bg-surface-container-high"
        >
          <Headset className="w-[22px] h-[22px] text-primary" />
          <span className="font-label-sm text-label-sm text-on-surface font-bold mt-1">
            Dispatcher
          </span>
        </button>
      </div>
    </div>
  );
};
