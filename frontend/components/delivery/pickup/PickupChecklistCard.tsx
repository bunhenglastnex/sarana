"use client";

import React from "react";
import { Check, CheckCheck } from "lucide-react";

export interface ChecklistItem {
  id: string;
  title: string;
  category: string;
  note: string;
}

interface PickupChecklistCardProps {
  items: ChecklistItem[];
  checkedState: Record<string, boolean>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  isConfirmed?: boolean;
}

export const PickupChecklistCard: React.FC<PickupChecklistCardProps> = ({
  items,
  checkedState,
  onToggle,
  onToggleAll,
  isConfirmed = false,
}) => {
  const total = items.length;
  const checkedCount = items.filter((item) => checkedState[item.id]).length;
  const progressPct = total > 0 ? (checkedCount / total) * 100 : 0;
  const allChecked = total > 0 && checkedCount === total;

  return (
    <div className="px-screen-edge-padding mb-space-lg">
      <div className="bg-surface-container-lowest rounded-xl p-card-inner-padding shadow-sm">
        <div className="flex items-center justify-between mb-space-xs">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Package Checklist
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Check off each item directly with expediter
            </p>
          </div>
          <span className="font-label-md text-label-md font-bold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
            {checkedCount}/{total} Ready
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-space-md">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        {/* Items List */}
        <div className="space-y-space-xs">
          {items.map((item) => {
            const isChecked = !!checkedState[item.id];
            return (
              <label
                key={item.id}
                onClick={() => !isConfirmed && onToggle(item.id)}
                className={`group relative flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-low cursor-pointer transition-all hover:bg-surface-container active:scale-[0.99] select-none ${
                  isConfirmed ? "pointer-events-none opacity-80" : ""
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                    isChecked
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-highest text-transparent border border-outline-variant/40"
                  }`}
                >
                  <Check className="w-4 h-4 font-bold stroke-[3]" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
                      {item.title}
                    </span>
                    <span
                      className={`font-label-sm text-label-sm uppercase font-semibold ${
                        item.category === "Security"
                          ? "text-primary"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {item.note}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Select All Quick Action Button */}
        {!isConfirmed && (
          <div className="mt-space-sm pt-space-xs flex justify-end">
            <button
              type="button"
              onClick={onToggleAll}
              className="text-primary font-label-md text-label-md font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <CheckCheck className="w-4 h-4 text-primary" />
              <span>
                {allChecked ? "Deselect All" : `Select All ${total} Items`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
