"use client";

import React from "react";
import { Store, Bike } from "lucide-react";
import { KdsTicket, KdsOrderStatus } from "@/types/kds";
import { KdsCard } from "./KdsCard";

interface KdsKanbanColumnProps {
  title: string;
  stepNumber: number;
  status: KdsOrderStatus;
  count: number;
  sublabel: string;
  dotColorClass: string;
  badgeClass: string;
  containerClass?: string;
  tickets: KdsTicket[];
  onAction?: (action: string, ticketId: string) => void;
}

export const KdsKanbanColumn: React.FC<KdsKanbanColumnProps> = ({
  title,
  stepNumber,
  status,
  count,
  sublabel,
  dotColorClass,
  badgeClass,
  containerClass = "bg-surface-container-low",
  tickets,
  onAction,
}) => {
  const pickupReady = tickets.filter((t) => t.readySubtype === "pickup");
  const deliveryReady = tickets.filter((t) => t.readySubtype === "delivery");

  return (
    <div
      className={`flex flex-col gap-space-sm p-space-sm rounded-xl border border-border/40 min-h-[500px] transition-colors ${containerClass}`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-space-xs py-1 border-b border-border/30 pb-2">
        <div className="flex items-center gap-space-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColorClass}`} />
          <h2 className="font-headline-sm text-sm text-on-surface font-bold">
            {stepNumber}. {title}
          </h2>
          <span
            className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-bold ${badgeClass}`}
          >
            {count}
          </span>
        </div>
        <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
          {sublabel}
        </span>
      </div>

      {/* Column Cards Queue */}
      <div className="flex flex-col gap-space-sm overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar pr-0.5">
        {tickets.length === 0 ? (
          <div className="py-12 text-center text-xs text-on-surface-variant font-medium bg-surface-container-lowest/50 rounded-lg border border-dashed border-border/40">
            No orders in queue
          </div>
        ) : status === "ready" ? (
          <div className="flex flex-col gap-space-md">
            {/* Section A: Ready for Pickup Counter */}
            {pickupReady.length > 0 && (
              <div className="flex flex-col gap-space-2xs">
                <div className="flex items-center gap-1 px-1 font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                  <Store className="w-3.5 h-3.5 text-tertiary" />
                  <span>Ready for Pickup Counter ({pickupReady.length})</span>
                </div>
                <div className="flex flex-col gap-space-sm">
                  {pickupReady.map((ticket) => (
                    <KdsCard key={ticket.id} ticket={ticket} onAction={onAction} />
                  ))}
                </div>
              </div>
            )}

            {/* Section B: Ready for Delivery Courier */}
            {deliveryReady.length > 0 && (
              <div className="flex flex-col gap-space-2xs">
                <div className="flex items-center gap-1 px-1 font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                  <Bike className="w-3.5 h-3.5 text-secondary" />
                  <span>Ready for Delivery Courier ({deliveryReady.length})</span>
                </div>
                <div className="flex flex-col gap-space-sm">
                  {deliveryReady.map((ticket) => (
                    <KdsCard key={ticket.id} ticket={ticket} onAction={onAction} />
                  ))}
                </div>
              </div>
            )}

            {/* Fallback for ready tickets without explicit readySubtype */}
            {tickets
              .filter((t) => !t.readySubtype)
              .map((ticket) => (
                <KdsCard key={ticket.id} ticket={ticket} onAction={onAction} />
              ))}
          </div>
        ) : (
          tickets.map((ticket) => (
            <KdsCard key={ticket.id} ticket={ticket} onAction={onAction} />
          ))
        )}
      </div>
    </div>
  );
};
