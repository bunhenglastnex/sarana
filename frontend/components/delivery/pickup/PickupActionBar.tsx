"use client";

import React from "react";
import { Lock, ShieldCheck, Bike, Navigation } from "lucide-react";

interface PickupActionBarProps {
  allChecked: boolean;
  remainingCount: number;
  isConfirmed: boolean;
  onConfirm: () => void;
}

export const PickupActionBar: React.FC<PickupActionBarProps> = ({
  allChecked,
  remainingCount,
  isConfirmed,
  onConfirm,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md px-screen-edge-padding py-space-sm shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto flex flex-col gap-space-2xs">
        {/* Validation Hint */}
        <div className="flex items-center justify-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
          {isConfirmed ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-bold">
                Package sealed & in transit. Navigate to customer.
              </span>
            </>
          ) : allChecked ? (
            <>
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span className="text-on-surface font-semibold">
                All items verified with expediter
              </span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-on-surface-variant opacity-80" />
              <span>
                Check all items above to unlock departure ({remainingCount}{" "}
                remaining)
              </span>
            </>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={!allChecked && !isConfirmed}
          onClick={onConfirm}
          className={`w-full h-[52px] rounded-xl font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
            isConfirmed
              ? "bg-secondary text-on-secondary shadow-md cursor-pointer hover:bg-secondary/90"
              : allChecked
              ? "bg-primary text-on-primary shadow-md hover:bg-primary-container active:scale-[0.98] cursor-pointer"
              : "bg-surface-container-highest text-on-surface-variant shadow-sm cursor-not-allowed"
          }`}
        >
          {isConfirmed ? (
            <>
              <Navigation className="w-6 h-6 text-on-secondary" />
              <span>En Route to Customer</span>
            </>
          ) : (
            <>
              <Bike className="w-6 h-6" />
              <span>Confirm Pickup</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
