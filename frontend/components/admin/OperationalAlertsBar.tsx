"use client";

import React from "react";
import { Flame, Bike, Package } from "lucide-react";

export const OperationalAlertsBar: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
      {/* Woodfire Oven Temp */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex items-center gap-space-md">
        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
          <Flame className="w-5 h-5 fill-primary" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-xs font-bold text-on-surface">
            Woodfire Oven Temp
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant truncate">
            Baking at 785°F • Ideal for artisanal burrata crusts
          </span>
        </div>
      </div>

      {/* Fleet Status */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex items-center gap-space-md">
        <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
          <Bike className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-xs font-bold text-on-surface">
            Fleet Status
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant truncate">
            3 Couriers Active • 1 Available on Standby
          </span>
        </div>
      </div>

      {/* Stock Warning */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex items-center gap-space-md">
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface shrink-0">
          <Package className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-xs font-bold text-on-surface">
            Stock Warning
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant truncate">
            Brioche Buns remaining: 18 units • Restock soon
          </span>
        </div>
      </div>
    </div>
  );
};
