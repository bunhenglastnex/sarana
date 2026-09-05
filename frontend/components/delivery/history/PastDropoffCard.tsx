"use client";

import React from "react";
import { MapPin, QrCode, Banknote } from "lucide-react";

export interface PastDropoffItem {
  id: string;
  orderNumber: string;
  customerName: string;
  timeStr: string;
  statusText: string;
  address: string;
  distance: string;
  totalPrice: number;
  paymentType: "khqr" | "cod";
  codCollectedAmount?: number;
  itemsSummary: string;
  tipAmount: number;
}

interface PastDropoffCardProps {
  dropoff: PastDropoffItem;
}

export const PastDropoffCard: React.FC<PastDropoffCardProps> = ({ dropoff }) => {
  return (
    <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05),0_1px_3px_0_rgba(26,23,21,0.03)] flex flex-col gap-space-sm">
      {/* Header Row: Date/Time + Order # & Status Badge */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {dropoff.timeStr}
            </span>
            <span className="text-on-surface-variant/40">•</span>
            <span className="font-label-sm text-label-sm font-bold text-on-surface">
              Order {dropoff.orderNumber}
            </span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5">
            {dropoff.customerName}
          </h3>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-label-sm text-label-sm font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          {dropoff.statusText}
        </span>
      </div>

      {/* Address & Map Context */}
      <div className="flex items-center gap-space-xs text-on-surface-variant bg-surface-container-low px-space-xs py-2 rounded-lg">
        <MapPin className="w-4 h-4 text-primary shrink-0" />
        <span className="font-body-md text-body-md text-on-surface truncate flex-1">
          {dropoff.address}
        </span>
        <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0 font-medium">
          {dropoff.distance}
        </span>
      </div>

      {/* Financial Split & Status */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-body-md text-body-md font-bold text-on-surface">
              ${dropoff.totalPrice.toFixed(2)}
            </span>
            {dropoff.paymentType === "khqr" ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                <QrCode className="w-3.5 h-3.5 text-on-surface-variant" />
                KHQR (Paid)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-label-sm text-label-sm font-semibold">
                <Banknote className="w-3.5 h-3.5 text-amber-800" />
                Cash Collected ${dropoff.codCollectedAmount?.toFixed(2) || dropoff.totalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
            {dropoff.itemsSummary}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="font-label-sm text-label-sm text-secondary font-semibold">
            Courier Tip
          </span>
          <span className="font-price-lg text-price-lg text-secondary font-bold">
            +${dropoff.tipAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </article>
  );
};
