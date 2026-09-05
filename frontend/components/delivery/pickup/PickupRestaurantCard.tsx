"use client";

import React from "react";
import { DeliveryOrder } from "@/lib/store/useDeliveryStore";
import { ShieldCheck, MapPin, Phone, Box } from "lucide-react";

interface PickupRestaurantCardProps {
  order: DeliveryOrder;
}

export const PickupRestaurantCard: React.FC<PickupRestaurantCardProps> = () => {
  return (
    <div className="px-screen-edge-padding mb-space-md">
      <div className="bg-surface-container-lowest rounded-xl p-card-inner-padding shadow-sm">
        {/* Restaurant Header */}
        <div className="flex items-start gap-space-sm mb-space-sm">
          <img
            alt="Amber & Ember Restaurant"
            className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm border border-outline-variant/30"
            src="/logo.jpg"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
              <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                Kitchen Partner
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate leading-tight">
              Amber & Ember
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Artisan Bistro & Grill
            </p>
          </div>
        </div>

        {/* Address & Expediter Info */}
        <div className="space-y-space-xs mb-space-sm">
          <div className="flex items-start gap-space-xs">
            <MapPin className="w-4.5 h-4.5 text-on-surface-variant shrink-0 mt-0.5" />
            <p className="font-body-sm text-body-sm text-on-surface leading-tight">
              244 Oak Street, Central Dining Quarter
            </p>
          </div>

          <div className="flex items-center justify-between bg-surface-container-low rounded-lg p-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-on-surface" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Expediter Contact
                </span>
                <span className="font-label-md text-label-md text-on-surface font-bold truncate">
                  +1 (555) 902-1144
                </span>
              </div>
            </div>
            <a
              href="tel:+15559021144"
              className="h-9 px-space-sm rounded-lg bg-surface-container-highest text-on-surface hover:bg-secondary-fixed flex items-center gap-1.5 transition-colors font-label-md text-label-md font-bold shrink-0"
            >
              <Phone className="w-4 h-4 text-primary" />
              <span>Call Kitchen</span>
            </a>
          </div>
        </div>

        {/* Designated Pickup Staging Spot */}
        <div className="rounded-lg bg-secondary-container/15 p-space-sm flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary flex items-center justify-center shrink-0">
            <Box className="w-6 h-6 text-on-secondary" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Pickup Staging Spot
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold truncate">
              Shelf B-3 • Hot Box #04
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
