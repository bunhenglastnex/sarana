"use client";

import React, { useState } from "react";
import { LogOut, Loader2, Check } from "lucide-react";

export const EndShiftSection: React.FC = () => {
  const [shiftStatus, setShiftStatus] = useState<"idle" | "closing" | "closed">(
    "idle"
  );

  const handleEndShift = () => {
    const confirmed = window.confirm(
      "Are you sure you want to end your courier shift and check in your cash bag?"
    );
    if (confirmed) {
      setShiftStatus("closing");
      setTimeout(() => {
        setShiftStatus("closed");
      }, 900);
    }
  };

  return (
    <section className="flex flex-col items-center space-y-space-md pt-space-xs pb-space-sm w-full">
      <button
        type="button"
        onClick={handleEndShift}
        id="end-shift-btn"
        className={`w-full h-13 py-3.5 px-space-md rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm font-label-lg text-label-lg font-bold ${
          shiftStatus === "closed"
            ? "bg-surface-container-high text-tertiary cursor-default"
            : "bg-error-container text-on-error-container hover:bg-error/20 active:scale-[0.98]"
        }`}
      >
        {shiftStatus === "closing" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Checking out...</span>
          </>
        ) : shiftStatus === "closed" ? (
          <>
            <Check className="w-5 h-5" />
            <span>Shift Closed</span>
          </>
        ) : (
          <>
            <LogOut className="w-[22px] h-[22px]" />
            <span>Log Out / End Shift</span>
          </>
        )}
      </button>

      {/* Version & Build Subtext */}
      <div className="flex flex-col items-center space-y-0.5 text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant font-medium">
          Amber &amp; Ember Courier App v2.4.0 (Driver Edition)
        </p>
        <p className="font-body-sm text-body-sm text-tertiary">
          Fleet Station: 184 Franklin Hearth Kitchen
        </p>
      </div>
    </section>
  );
};
