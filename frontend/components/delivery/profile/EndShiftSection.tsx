"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2, Check, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

export const EndShiftSection: React.FC = () => {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [shiftStatus, setShiftStatus] = useState<"idle" | "closing" | "closed">(
    "idle"
  );

  const handleOpenConfirm = () => {
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (shiftStatus === "closing") return;
    setIsConfirmOpen(false);
  };

  const handleConfirmLogout = () => {
    setShiftStatus("closing");
    setTimeout(() => {
      setShiftStatus("closed");
      clearSession();
      setIsConfirmOpen(false);
      router.push("/delivery/login");
    }, 800);
  };

  return (
    <section className="flex flex-col items-center space-y-space-md pt-space-xs pb-space-sm w-full">
      <button
        type="button"
        onClick={handleOpenConfirm}
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

      {/* Confirmation Modal Dialog Popup */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden border border-outline-variant/30 animate-in zoom-in-95 duration-200">
            {/* Warning Icon Badge */}
            <div className="mx-auto w-16 h-16 rounded-full bg-error-container/40 text-error flex items-center justify-center border border-error/30 shadow-md">
              <AlertTriangle className="w-8 h-8 text-error animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-headline-sm text-xl font-bold text-on-surface">
                End Shift & Log Out?
              </h3>
              <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                Are you sure you want to end your courier shift and check in your cash bag?
              </p>
            </div>

            {/* Quick Context Pill */}
            <div className="bg-surface-container-low p-3 rounded-xl flex items-center justify-between text-xs text-on-surface font-semibold border border-outline-variant/20">
              <span className="text-on-surface-variant">Active Duty Session</span>
              <span className="text-error font-bold uppercase tracking-wider">
                Ending Shift
              </span>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                disabled={shiftStatus === "closing"}
                onClick={handleConfirmLogout}
                className="w-full h-12 bg-error text-on-error font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md hover:bg-error/90"
              >
                {shiftStatus === "closing" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Ending Shift & Checking Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-5 h-5" />
                    <span>Yes, End Shift & Log Out</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={shiftStatus === "closing"}
                onClick={handleCloseConfirm}
                className="w-full h-12 bg-surface-container-high text-on-surface font-bold text-sm rounded-xl flex items-center justify-center active:scale-95 transition-all hover:bg-surface-container-highest border border-outline-variant/30"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
