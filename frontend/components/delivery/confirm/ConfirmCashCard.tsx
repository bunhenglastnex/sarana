"use client";

import React from "react";
import { DeliveryOrder } from "@/lib/store/useDeliveryStore";
import { Banknote, DollarSign } from "lucide-react";

interface ConfirmCashCardProps {
  order: DeliveryOrder;
  isCashChecked?: boolean;
  onToggleCash?: () => void;
}

export const ConfirmCashCard: React.FC<ConfirmCashCardProps> = ({ order }) => {
  const amountToCollect = (order.codAmount || order.totalPrice).toFixed(2);

  return (
    <div className="px-screen-edge-padding max-w-md mx-auto w-full">
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md relative overflow-hidden border border-outline-variant/30">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-secondary-container/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="w-6 h-6 text-secondary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Cash Collection Verification
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm uppercase tracking-wider font-bold">
            Mandatory
          </span>
        </div>

        {/* Prominent Amount Display */}
        <div className="bg-surface-container p-space-md rounded-xl flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
              Amount to Collect
            </p>
            <div className="flex items-baseline gap-1 text-on-surface">
              <span className="font-headline-lg text-headline-lg font-extrabold text-primary">
                $
              </span>
              <span className="font-display-lg text-display-lg font-extrabold tracking-tight text-on-surface">
                {amountToCollect}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
            <DollarSign className="w-7 h-7 text-secondary font-bold" />
          </div>
        </div>
      </div>
    </div>
  );
};
