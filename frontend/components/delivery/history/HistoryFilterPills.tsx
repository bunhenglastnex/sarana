"use client";

import React from "react";

export type HistoryPeriod = "today" | "week" | "month";

interface HistoryFilterPillsProps {
  selectedPeriod: HistoryPeriod;
  onSelectPeriod: (period: HistoryPeriod) => void;
}

export const HistoryFilterPills: React.FC<HistoryFilterPillsProps> = ({
  selectedPeriod,
  onSelectPeriod,
}) => {
  const periods: { id: HistoryPeriod; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
  ];

  return (
    <section className="px-screen-edge-padding py-space-xs">
      <div
        className="flex items-center gap-space-xs overflow-x-auto no-scrollbar"
        id="history-filter-group"
      >
        {periods.map((period) => {
          const isActive = selectedPeriod === period.id;
          return (
            <button
              key={period.id}
              onClick={() => onSelectPeriod(period.id)}
              className={`filter-pill flex items-center gap-1.5 px-4 py-2 rounded-full font-label-lg text-label-lg transition-transform active:scale-95 ${
                isActive
                  ? "bg-on-surface text-surface shadow-sm font-bold"
                  : "bg-surface-container-lowest text-on-surface-variant shadow-[0_2px_8px_-2px_rgba(26,23,21,0.04)] font-semibold hover:bg-surface-container-low"
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
              )}
              <span>{period.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
