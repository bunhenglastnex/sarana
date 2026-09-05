"use client";

import React from "react";

export type DeliveryTabMode = "in-progress" | "completed";

interface SegmentedDeliveryTabsProps {
  activeTab: DeliveryTabMode;
  onTabChange: (tab: DeliveryTabMode) => void;
  inProgressCount?: number;
  completedCount?: number;
}

export const SegmentedDeliveryTabs: React.FC<SegmentedDeliveryTabsProps> = ({
  activeTab,
  onTabChange,
  inProgressCount = 2,
  completedCount = 6,
}) => {
  return (
    <div className="flex p-1 bg-surface-container rounded-full" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "in-progress"}
        id="tab-in-progress"
        onClick={() => onTabChange("in-progress")}
        className={`flex-1 py-space-xs px-space-sm rounded-full font-label-md text-label-md transition-all text-center flex items-center justify-center gap-1.5 ${
          activeTab === "in-progress"
            ? "bg-surface-container-lowest text-on-surface shadow-sm font-bold"
            : "text-on-surface-variant font-semibold hover:text-on-surface"
        }`}
      >
        <span>In Progress</span>
        <span
          className={`px-1.5 py-0.2 rounded-full font-label-sm text-label-sm font-bold ${
            activeTab === "in-progress"
              ? "bg-primary text-on-primary"
              : "bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          {inProgressCount}
        </span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "completed"}
        id="tab-completed"
        onClick={() => onTabChange("completed")}
        className={`flex-1 py-space-xs px-space-sm rounded-full font-label-md text-label-md transition-all text-center flex items-center justify-center gap-1.5 ${
          activeTab === "completed"
            ? "bg-surface-container-lowest text-on-surface shadow-sm font-bold"
            : "text-on-surface-variant font-semibold hover:text-on-surface"
        }`}
      >
        <span>Completed Today</span>
        <span
          className={`px-1.5 py-0.2 rounded-full font-label-sm text-label-sm font-bold ${
            activeTab === "completed"
              ? "bg-primary text-on-primary"
              : "bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          {completedCount}
        </span>
      </button>
    </div>
  );
};
