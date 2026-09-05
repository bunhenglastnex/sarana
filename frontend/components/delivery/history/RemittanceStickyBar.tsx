"use client";

import React from "react";
import { QrCode, Banknote } from "lucide-react";

interface RemittanceStickyBarProps {
  remittanceDueAmount?: number;
  onOpenModal: () => void;
}

export const RemittanceStickyBar: React.FC<RemittanceStickyBarProps> = ({
  remittanceDueAmount = 79.5,
  onOpenModal,
}) => {
  return (
    <aside className="sticky bottom-2 z-40 mx-screen-edge-padding mb-space-xs max-w-md self-center w-[calc(100%-2rem)]">
      <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-space-sm shadow-[0_8px_30px_rgb(26,23,21,0.12)] border border-white/60 flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed/50 flex items-center justify-center shrink-0 text-primary">
            <Banknote className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight truncate">
              Bistro Cash Remittance
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-sm text-headline-sm text-primary font-extrabold tracking-tight">
                ${remittanceDueAmount.toFixed(2)}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant/80">
                due
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenModal}
          id="open-remit-modal-btn"
          className="bg-primary text-on-primary hover:bg-primary-container active:scale-95 transition-all font-label-lg text-label-lg px-space-md py-2.5 rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
        >
          <QrCode className="w-[18px] h-[18px]" />
          <span>View QR</span>
        </button>
      </div>
    </aside>
  );
};
