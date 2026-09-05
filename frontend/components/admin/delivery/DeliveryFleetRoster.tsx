"use client";

import React, { useState } from "react";
import {
  Navigation,
  Phone,
  Radio,
  Satellite,
  CheckCircle2,
  AlertCircle,
  Gauge,
  Flame,
} from "lucide-react";
import { CourierRecord } from "@/types/deliveryFleet";

interface DeliveryFleetRosterProps {
  couriers: CourierRecord[];
  selectedCourierId: string;
  onSelectCourier: (id: string) => void;
  onCallCourier?: (name: string, phone: string) => void;
}

export const DeliveryFleetRoster: React.FC<DeliveryFleetRosterProps> = ({
  couriers,
  selectedCourierId,
  onSelectCourier,
  onCallCourier,
}) => {
  const [transitsFilter, setTransitsFilter] = useState<
    "in_transit" | "drop_off" | "returning"
  >("in_transit");

  const totalCodOnRoad = couriers
    .filter((c) => c.paymentMethod === "cod")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="flex flex-col gap-space-md mt-space-sm">
      {/* Section Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
        <div>
          <h2 className="font-headline-md text-lg text-on-surface font-bold flex items-center gap-2">
            <span>Active In-Transit Fleet Roster</span>
            <span className="text-primary font-label-md text-xs font-bold bg-primary-fixed px-2 py-0.5 rounded-full">
              Live Fleet
            </span>
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Active shift couriers currently en route to customer addresses with real-time ETA
          </p>
        </div>

        <div className="flex items-center gap-space-xs">
          <span className="font-label-sm text-xs text-on-surface-variant font-medium">
            Live Filter:
          </span>
          <button
            onClick={() => setTransitsFilter("in_transit")}
            className={`px-space-sm py-1 rounded-full font-label-sm text-xs font-semibold transition-colors ${
              transitsFilter === "in_transit"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
            }`}
          >
            In-Transit ({couriers.length})
          </button>
          <button
            onClick={() => setTransitsFilter("drop_off")}
            className={`px-space-sm py-1 rounded-full font-label-sm text-xs transition-colors ${
              transitsFilter === "drop_off"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-medium"
            }`}
          >
            At Drop-off (1)
          </button>
          <button
            onClick={() => setTransitsFilter("returning")}
            className={`px-space-sm py-1 rounded-full font-label-sm text-xs transition-colors ${
              transitsFilter === "returning"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-medium"
            }`}
          >
            Returning (1)
          </button>
        </div>
      </div>

      {/* Live Transit Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-xs">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider border-b border-border/30">
                <th className="py-3 px-space-lg">Courier &amp; Vehicle</th>
                <th className="py-3 px-space-md">Destination &amp; Order</th>
                <th className="py-3 px-space-md">Live Telemetry</th>
                <th className="py-3 px-space-md">ETA / Remaining</th>
                <th className="py-3 px-space-md text-right">Payment Mode</th>
                <th className="py-3 px-space-lg text-right">GPS Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {couriers.map((courier) => {
                const isSelected = courier.id === selectedCourierId;
                return (
                  <tr
                    key={courier.id}
                    onClick={() => onSelectCourier(courier.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary-fixed/20 hover:bg-primary-fixed/30"
                        : "hover:bg-surface-container-low/70"
                    }`}
                  >
                    <td className="py-3.5 px-space-lg">
                      <div className="flex items-center gap-space-sm">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-xs ring-2 ring-primary">
                          <img
                            src={courier.avatarUrl}
                            alt={courier.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-surface-container-lowest animate-ping" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-lg text-xs text-on-surface font-bold flex items-center gap-1.5">
                            {courier.name}
                            {isSelected && (
                              <span className="font-label-sm text-[9px] text-primary font-bold bg-primary-fixed px-1.5 py-0.2 rounded">
                                FOCUS
                              </span>
                            )}
                          </span>
                          <span className="font-body-sm text-[11px] text-on-surface-variant font-mono">
                            #{courier.code} · {courier.vehicleLabel}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-space-md">
                      <div className="flex flex-col">
                        <span className="font-label-md text-xs text-on-surface font-bold">
                          Order {courier.orderId} ({courier.customerName})
                        </span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant truncate max-w-xs">
                          {courier.destinationAddress}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-space-md">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-primary" />
                        <span className="font-label-md text-xs text-on-surface font-semibold">
                          {courier.speedKmH} km/h
                        </span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant">
                          · {courier.tempCelsius}°C Warm
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-space-md">
                      <div className="flex flex-col">
                        <span className="font-label-md text-xs text-primary font-bold">
                          {courier.remainingKm} km · {courier.remainingMinutes} mins ({courier.etaLabel})
                        </span>
                        <span className="font-body-sm text-[11px] text-secondary font-medium">
                          {courier.statusText}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-space-md text-right">
                      <div className="font-price-lg text-sm font-bold text-secondary">
                        ${courier.amount.toFixed(2)}
                      </div>
                      <span className="font-label-sm text-[10px] bg-secondary-fixed text-on-secondary-fixed px-1.5 py-0.5 rounded font-bold uppercase inline-block mt-0.5">
                        {courier.paymentBadgeLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-space-lg text-right">
                      <div className="flex items-center justify-end gap-space-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCourier(courier.id);
                          }}
                          className="p-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-xs"
                          title="Center on Map"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onCallCourier) onCallCourier(courier.name, "+1 (555) 492-001");
                          }}
                          className="p-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors border border-border/20"
                          title="Radio Call Courier"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Live Fleet Health Bar */}
        <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm text-on-surface-variant border-t border-border/30 text-xs">
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-secondary shrink-0" />
            <span className="font-body-sm">
              All courier GPS transponders broadcasting valid telemetry to Amber &amp; Ember dispatch core.
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <span className="font-label-sm text-xs font-bold text-on-surface">
              Total COD on Road: ${totalCodOnRoad.toFixed(2)}
            </span>
            <button
              onClick={() => alert("Opening Fleet Safety & Speed Log...")}
              className="font-label-sm text-xs text-primary font-bold hover:underline transition-all"
            >
              Fleet Safety &amp; Speed Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
