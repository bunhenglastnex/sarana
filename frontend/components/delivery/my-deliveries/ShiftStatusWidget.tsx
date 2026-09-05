"use client";

import React from "react";
import { Zap } from "lucide-react";

interface ShiftStatusWidgetProps {
  activeTaskCount?: number;
  districtName?: string;
  acceptanceRate?: string;
}

export const ShiftStatusWidget: React.FC<ShiftStatusWidgetProps> = ({
  activeTaskCount = 2,
  districtName = "Woodfire District • On Road",
  acceptanceRate = "100% Rate",
}) => {
  return (
    <div className="bg-surface-container-high rounded-xl p-card-inner-padding shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-space-xs min-w-0">
        <div className="relative flex shrink-0">
          <span className="w-3 h-3 rounded-full bg-emerald-600 animate-ping absolute opacity-75"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-600 relative"></span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md text-on-surface font-bold truncate">
            Active Shift • {activeTaskCount} Active Tasks
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
            {districtName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-surface-container-lowest px-space-xs py-1 rounded-full shadow-sm shrink-0">
        <Zap className="w-4 h-4 text-primary fill-primary" />
        <span className="font-label-sm text-label-sm text-on-surface font-bold">
          {acceptanceRate}
        </span>
      </div>
    </div>
  );
};
