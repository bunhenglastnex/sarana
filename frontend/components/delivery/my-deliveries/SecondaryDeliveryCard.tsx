"use client";

import React from "react";
import Link from "next/link";
import { Store, Navigation, ShieldCheck, Bike } from "lucide-react";

interface SecondaryDeliveryCardProps {
  orderId?: string;
  orderNumber?: string;
  restaurantName?: string;
  customerName?: string;
  distanceStr?: string;
  estimatedTime?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  paymentType?: "khqr" | "cod";
  totalPrice?: number;
}

export const SecondaryDeliveryCard: React.FC<SecondaryDeliveryCardProps> = ({
  orderId = "1027",
  orderNumber = "Order #1026",
  restaurantName = "Bistro Hearth",
  customerName = "Sarah Jenkins",
  distanceStr = "2.1 mi",
  estimatedTime = "Estimated ~14m",
  pickupAddress = "Bistro Hearth Woodfire",
  dropoffAddress = "150 Oakwood Blvd",
  paymentType = "khqr",
  totalPrice = 22.0,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col space-y-space-sm border border-outline-variant/20">
      {/* Header Badges */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
          <span className="font-label-sm text-label-sm uppercase font-bold tracking-wider">
            Next in Queue
          </span>
        </div>
        <div className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed">
          <Store className="w-3.5 h-3.5" />
          <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
            Ready for Pickup
          </span>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {orderNumber} • {restaurantName}
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate mt-0.5">
            {customerName}
          </h3>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
            {distanceStr}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {estimatedTime}
          </span>
        </div>
      </div>

      {/* Quick Route Preview */}
      <div className="bg-surface-container-low rounded-lg p-space-xs space-y-1">
        <div className="flex items-center gap-1.5 text-on-surface">
          <Store className="w-4 h-4 text-secondary shrink-0" />
          <span className="font-label-md text-label-md font-bold truncate">
            Pick up at: {pickupAddress}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <Navigation className="w-4 h-4 shrink-0 text-on-surface-variant" />
          <span className="font-body-sm text-body-sm truncate">
            Deliver to: {dropoffAddress}
          </span>
        </div>
      </div>

      {/* Payment Tag */}
      <div className="flex items-center justify-between px-space-xs py-1.5 bg-surface-container rounded-lg">
        <div className="flex items-center gap-1 text-on-surface">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-700" />
          <span className="font-label-md text-label-md font-semibold">
            {paymentType === "khqr" ? "KHQR • Paid in Full" : "COD Cash Order"}
          </span>
        </div>
        <span className="font-label-md text-label-md text-on-surface font-bold">
          ${totalPrice.toFixed(2)}
        </span>
      </div>

      {/* Secondary Action Button */}
      <Link
        href={`/delivery/${orderId}/pickup`}
        className="w-full bg-surface-container-high hover:bg-surface-container-highest active:scale-[0.98] transition-transform text-on-surface rounded-xl py-3 px-space-md flex items-center justify-center gap-2 font-bold shadow-xs"
      >
        <Bike className="w-5 h-5 text-primary" />
        <span className="font-label-lg text-label-lg font-bold">
          Start Pickup at Bistro
        </span>
      </Link>
    </div>
  );
};
