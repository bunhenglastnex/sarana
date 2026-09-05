"use client";

import React from "react";
import { X, Store, Bike, Check, Send, ChefHat } from "lucide-react";
import { KdsTicket } from "@/types/kds";
import { KdsCard } from "./KdsCard";

interface PassStationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  readyTickets: KdsTicket[];
  onAction?: (action: string, ticketId: string) => void;
}

export const PassStationSheet: React.FC<PassStationSheetProps> = ({
  isOpen,
  onClose,
  readyTickets,
  onAction,
}) => {
  if (!isOpen) return null;

  const pickupReady = readyTickets.filter((t) => t.readySubtype === "pickup");
  const deliveryReady = readyTickets.filter((t) => t.readySubtype === "delivery");

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs z-50 transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Sheet */}
      <div className="fixed right-0 top-0 bottom-0 h-full w-full max-w-lg bg-surface-container-lowest shadow-2xl z-50 flex flex-col justify-between border-l border-border/40 transition-transform duration-300 animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-space-lg bg-surface-container-low border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-base font-bold text-on-surface">
                  4. READY — Pass Station
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs font-bold">
                  {readyTickets.length} Ready
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Pickup counter dispatch and courier bag handover queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-space-lg overflow-y-auto space-y-space-lg custom-scrollbar">
          {readyTickets.length === 0 ? (
            <div className="py-20 text-center text-sm text-on-surface-variant bg-surface-container-low/50 rounded-xl border border-dashed border-border/40">
              <ChefHat className="w-10 h-10 text-on-surface-variant mx-auto mb-2 opacity-40" />
              <p className="font-bold text-on-surface">No Orders at Pass Station</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Completed orders ready for guest or courier pickup will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Pickup Counter Section */}
              {pickupReady.length > 0 && (
                <div className="space-y-space-xs">
                  <div className="flex items-center gap-1.5 px-1 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                    <Store className="w-4 h-4 text-tertiary" />
                    <span>Ready for Pickup Counter ({pickupReady.length})</span>
                  </div>
                  <div className="space-y-space-sm">
                    {pickupReady.map((ticket) => (
                      <KdsCard key={ticket.id} ticket={ticket} onAction={onAction} />
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Courier Section */}
              {deliveryReady.length > 0 && (
                <div className="space-y-space-xs">
                  <div className="flex items-center gap-1.5 px-1 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                    <Bike className="w-4 h-4 text-secondary" />
                    <span>Ready for Delivery Courier ({deliveryReady.length})</span>
                  </div>
                  <div className="space-y-space-sm">
                    {deliveryReady.map((ticket) => (
                      <KdsCard key={ticket.id} ticket={ticket} onAction={onAction} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-space-md bg-surface-container-low border-t border-border/40 flex items-center justify-between">
          <span className="font-body-sm text-xs text-on-surface-variant">
            Pass Station SLA Target: <strong>&lt; 3 min</strong>
          </span>
          <button
            onClick={onClose}
            className="px-space-md py-1.5 rounded-lg bg-surface-container-highest text-on-surface font-label-sm text-xs font-bold hover:bg-surface-container transition-colors"
          >
            Close Pass Station
          </button>
        </div>
      </div>
    </>
  );
};
