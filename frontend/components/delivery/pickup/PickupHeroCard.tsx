"use client";

import React from "react";
import { DeliveryOrder } from "@/lib/store/useDeliveryStore";
import { Flame, CookingPot } from "lucide-react";

interface PickupHeroCardProps {
  order: DeliveryOrder;
}

export const PickupHeroCard: React.FC<PickupHeroCardProps> = ({ order }) => {
  return (
    <div className="px-screen-edge-padding mb-space-md">
      <div className="bg-surface-container-lowest rounded-xl p-card-inner-padding shadow-sm relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-secondary-fixed/30 pointer-events-none blur-2xl"></div>

        <div className="flex items-baseline justify-between mb-space-2xs">
          <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
            Active Order Ticket
          </span>
          <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-primary" />
            Fast Track
          </span>
        </div>

        <div className="flex items-baseline gap-space-xs">
          <h2 className="font-display-lg text-display-lg text-primary tracking-tight font-extrabold">
            {order.orderNumber}
          </h2>
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Express
          </span>
        </div>

        <div className="mt-space-xs flex items-center gap-space-xs bg-surface-container-low px-space-sm py-space-xs rounded-lg">
          <CookingPot className="w-5 h-5 text-secondary shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Assigned Prep Location
            </span>
            <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
              Kitchen Hearth Station 2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
