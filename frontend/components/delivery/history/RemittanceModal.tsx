"use client";

import React from "react";
import { Store, X } from "lucide-react";

interface RemittanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  remittanceAmount?: number;
  referenceCode?: string;
}

export const RemittanceModal: React.FC<RemittanceModalProps> = ({
  isOpen,
  onClose,
  remittanceAmount = 79.5,
  referenceCode = "REF: REM-2023-1021-08",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/50 backdrop-blur-sm flex items-end justify-center p-space-xs transition-opacity duration-200"
      id="remit-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl p-space-lg flex flex-col items-center gap-space-md shadow-2xl mb-16 animate-in slide-in-from-bottom-4 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-space-xs">
            <Store className="w-5 h-5 text-primary" />
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Shift Settlement
            </span>
          </div>
          <button
            onClick={onClose}
            id="close-remit-modal-btn"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
            aria-label="Close modal"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Manager Handover Info */}
        <div className="text-center flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Manager Handover
          </span>
          <span className="font-display-lg text-[40px] leading-tight font-extrabold text-primary">
            ${remittanceAmount.toFixed(2)}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
            Present this QR code to the cashier or manager to clear collected cash.
          </span>
        </div>

        {/* Interactive Simulated QR Display */}
        <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col items-center justify-center shadow-inner w-full">
          <svg
            className="w-44 h-44 text-on-surface"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 100 100"
          >
            {/* Outer border anchor marks */}
            <rect
              x="5"
              y="5"
              width="26"
              height="26"
              rx="4"
              stroke="currentColor"
              strokeWidth="4"
              fill="currentColor"
              fillOpacity="0.08"
            ></rect>
            <rect
              x="11"
              y="11"
              width="14"
              height="14"
              rx="2"
              fill="currentColor"
            ></rect>
            <rect
              x="69"
              y="5"
              width="26"
              height="26"
              rx="4"
              stroke="currentColor"
              strokeWidth="4"
              fill="currentColor"
              fillOpacity="0.08"
            ></rect>
            <rect
              x="75"
              y="11"
              width="14"
              height="14"
              rx="2"
              fill="currentColor"
            ></rect>
            <rect
              x="5"
              y="69"
              width="26"
              height="26"
              rx="4"
              stroke="currentColor"
              strokeWidth="4"
              fill="currentColor"
              fillOpacity="0.08"
            ></rect>
            <rect
              x="11"
              y="75"
              width="14"
              height="14"
              rx="2"
              fill="currentColor"
            ></rect>

            {/* Distinct QR Grid Patterns */}
            <circle cx="50" cy="20" r="3" fill="currentColor"></circle>
            <circle cx="40" cy="30" r="3" fill="currentColor"></circle>
            <circle cx="60" cy="30" r="3" fill="currentColor"></circle>
            <rect
              x="45"
              y="45"
              width="10"
              height="10"
              rx="2"
              fill="currentColor"
            ></rect>
            <circle cx="20" cy="50" r="3" fill="currentColor"></circle>
            <circle cx="80" cy="50" r="3" fill="currentColor"></circle>
            <rect
              x="35"
              y="60"
              width="8"
              height="8"
              rx="1.5"
              fill="currentColor"
            ></rect>
            <rect
              x="55"
              y="60"
              width="8"
              height="8"
              rx="1.5"
              fill="currentColor"
            ></rect>
            <circle cx="50" cy="80" r="3" fill="currentColor"></circle>
            <circle cx="70" cy="80" r="3" fill="currentColor"></circle>
          </svg>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-mono mt-2 select-all">
            {referenceCode}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          id="dismiss-remit-modal-btn"
          className="w-full py-3 bg-surface-container text-on-surface font-label-lg text-label-lg rounded-xl font-bold active:scale-98 transition-transform hover:bg-surface-container-high"
        >
          Done / Return to Feed
        </button>
      </div>
    </div>
  );
};
