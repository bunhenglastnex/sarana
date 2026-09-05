"use client";

import React, { useState } from "react";
import { X, CheckCircle2, TrafficCone, ShieldAlert, Headphones } from "lucide-react";

export type SheetType = "issue" | "delay" | "dispatcher" | "note" | null;

interface CourierActionSheetProps {
  sheetType: SheetType;
  onClose: () => void;
  orderNumber?: string;
}

export const CourierActionSheet: React.FC<CourierActionSheetProps> = ({
  sheetType,
  onClose,
  orderNumber = "#1024",
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!sheetType) return null;

  const getSheetTitle = () => {
    switch (sheetType) {
      case "issue":
        return "Report an Issue";
      case "delay":
        return "Notify Delay / Kitchen";
      case "dispatcher":
        return "Contact Dispatch Support";
      case "note":
        return "Order Notes & Instructions";
      default:
        return "Quick Actions";
    }
  };

  const triggerToast = (msg: string) => {
    onClose();
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center transition-opacity"
        id="courier-bottom-sheet"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-surface-container-lowest rounded-t-2xl p-space-lg w-full max-w-lg flex flex-col space-y-space-md shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-12 h-1.5 bg-surface-variant rounded-full mx-auto"></div>

          {/* Sheet Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {getSheetTitle()}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Select an action for current active delivery {orderNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Options */}
          <div className="flex flex-col space-y-space-xs">
            {/* Action 1: Traffic Congestion */}
            <button
              type="button"
              onClick={() =>
                triggerToast("Customer notified of traffic delay (+5m)")
              }
              className="flex items-center gap-3 p-space-sm bg-surface-container-low hover:bg-surface-container rounded-xl text-left active:bg-surface-container transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                <TrafficCone className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-label-md text-label-md font-bold text-on-surface">
                  Traffic Congestion (+5 Mins)
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Auto-adjusts ETA and updates customer tracking
                </div>
              </div>
            </button>

            {/* Action 2: Access Code Issue */}
            <button
              type="button"
              onClick={() =>
                triggerToast("Order tagged: Wrong Address/Access Issue")
              }
              className="flex items-center gap-3 p-space-sm bg-surface-container-low hover:bg-surface-container rounded-xl text-left active:bg-surface-container transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-label-md text-label-md font-bold text-on-surface">
                  Access Code Not Working
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Prompt dispatch desk to assist with entry gate
                </div>
              </div>
            </button>

            {/* Action 3: Call Dispatcher */}
            <button
              type="button"
              onClick={() =>
                triggerToast("Connecting to dispatch support line...")
              }
              className="flex items-center gap-3 p-space-sm bg-surface-container-low hover:bg-surface-container rounded-xl text-left active:bg-surface-container transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-label-md text-label-md font-bold text-on-surface">
                  Direct Call Dispatcher
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Priority voice line to Amber &amp; Ember HQ
                </div>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-surface-container text-on-surface font-label-md text-label-md font-bold rounded-xl hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Notification Toast Simulation */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-space-md py-2 rounded-full font-label-md text-label-md shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4.5 h-4.5 text-secondary-container" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
