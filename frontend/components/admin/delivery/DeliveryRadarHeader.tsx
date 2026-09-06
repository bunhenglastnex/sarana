"use client";

import React from "react";
import {
  Bike,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Wallet,
} from "lucide-react";

interface DeliveryRadarHeaderProps {
  activeCourierCount: number;
  avgFulfillmentMinutes: number;
  totalCodOnRoad: number;
}

export const DeliveryRadarHeader: React.FC<DeliveryRadarHeaderProps> = ({
  activeCourierCount,
  avgFulfillmentMinutes,
  totalCodOnRoad,
}) => {
  return (
    <div className="flex flex-col gap-space-md mb-space-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2 flex-wrap">
            <span>Live Delivery &amp; Fleet Radar</span>
            <span className="text-primary font-label-lg text-xs font-bold bg-primary-fixed px-2.5 py-0.5 rounded-full shadow-xs">
              {activeCourierCount} Couriers On Road
            </span>
            <span className="text-emerald-700 bg-emerald-100 border border-emerald-300/60 font-label-sm text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>GPS SYNC (5s)</span>
            </span>
          </h1>
        </div>

        {/* Metric Quick Stats Micro-Bar */}
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-xs border border-border/30">
            <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="font-label-sm text-xs text-on-surface-variant">
                Active Couriers
              </div>
              <div className="font-headline-sm text-base text-on-surface font-bold leading-none mt-0.5">
                {activeCourierCount} On Route
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-xs border border-border/30">
            <div className="w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary font-bold">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="font-label-sm text-xs text-on-surface-variant">
                Avg Fulfillment
              </div>
              <div className="font-headline-sm text-base text-on-surface font-bold leading-none mt-0.5">
                {avgFulfillmentMinutes} min
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-xs border border-border/30">
            <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface font-bold">
              <Wallet className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="font-label-sm text-xs text-on-surface-variant">
                COD on Road
              </div>
              <div className="font-headline-sm text-base text-on-surface font-bold leading-none mt-0.5">
                ${totalCodOnRoad.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
