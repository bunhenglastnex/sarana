"use client";

import React from "react";
import { Bike, CheckCircle2, PackageCheck, ShieldCheck } from "lucide-react";

interface EquipmentCardProps {
  vehicleName?: string;
  vehiclePlate?: string;
  fleetCode?: string;
  thermalBagCode?: string;
  thermalBagTempHold?: string;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  vehicleName = "Honda PCX 150",
  vehiclePlate = "Plate: 68-B2 491.20 • Insured",
  fleetCode = "Fleet #02",
  thermalBagCode = "Thermal Hearth Bag #04",
  thermalBagTempHold = "Inspected Today: 68°C hold certified",
}) => {
  return (
    <section className="w-full bg-surface-container-lowest rounded-xl p-card-inner-padding shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05),0_1px_3px_0_rgba(26,23,21,0.03)] flex flex-col space-y-space-sm border border-outline-variant/30">
      <div className="flex items-center justify-between pb-1">
        <h3 className="font-label-lg text-label-lg text-on-surface font-bold uppercase tracking-wider text-xs">
          Active Equipment
        </h3>
        <span className="font-label-sm text-label-sm text-emerald-800 flex items-center gap-1 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
        </span>
      </div>

      {/* Vehicle Info */}
      <div className="flex items-center gap-space-md p-2.5 rounded-lg bg-surface-container-low">
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Bike className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label-lg text-label-lg text-on-surface font-bold truncate">
            {vehicleName}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
            {vehiclePlate}
          </p>
        </div>
        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-semibold">
          {fleetCode}
        </span>
      </div>

      {/* Equipment Info */}
      <div className="flex items-center gap-space-md p-2.5 rounded-lg bg-surface-container-low">
        <div className="w-11 h-11 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary shrink-0">
          <PackageCheck className="w-6 h-6 text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label-lg text-label-lg text-on-surface font-bold truncate">
            {thermalBagCode}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
            {thermalBagTempHold}
          </p>
        </div>
        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
      </div>
    </section>
  );
};
