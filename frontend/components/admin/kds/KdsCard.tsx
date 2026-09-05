"use client";

import React from "react";
import {
  Bike,
  ShoppingBag,
  Clock,
  CheckCircle2,
  CookingPot,
  ChefHat,
  Check,
  Send,
  AlertTriangle,
} from "lucide-react";
import { KdsTicket } from "@/types/kds";

interface KdsCardProps {
  ticket: KdsTicket;
  onAction?: (action: string, ticketId: string) => void;
}

export const KdsCard: React.FC<KdsCardProps> = ({ ticket, onAction }) => {
  const isDelivery = ticket.channel === "delivery";

  return (
    <div
      className={`bg-surface-container-lowest rounded-lg p-space-md shadow-sm flex flex-col gap-space-sm hover:shadow-md transition-shadow relative overflow-hidden border border-border/40 ${
        ticket.readySubtype === "pickup"
          ? "border-l-4 border-l-primary"
          : ticket.readySubtype === "delivery"
          ? "border-l-4 border-l-secondary"
          : ""
      }`}
    >
      {/* Visual Accent Bar for Preparing State */}
      {ticket.status === "preparing" && (
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            (ticket.prepProgress || 0) > 70 ? "bg-primary" : "bg-secondary-container"
          }`}
        />
      )}

      {/* Top Meta Header: ID, Channel, Timer */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-space-xs">
          <span className="font-headline-sm text-base font-extrabold tracking-tight text-on-surface">
            {ticket.id}
          </span>
          <span
            className={`font-label-sm text-[10px] px-space-xs py-0.5 rounded font-bold flex items-center gap-1 ${
              isDelivery
                ? "bg-secondary-fixed text-on-secondary-fixed"
                : "bg-tertiary-fixed text-on-tertiary-fixed"
            }`}
          >
            {isDelivery ? (
              <>
                <Bike className="w-3 h-3 text-secondary" /> Delivery
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 text-tertiary" /> Pickup
              </>
            )}
          </span>
          {ticket.shelfOrBag && (
            <span className="font-label-sm text-[10px] bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded font-bold">
              {ticket.shelfOrBag}
            </span>
          )}
        </div>

        {/* Timer Badge */}
        {ticket.status === "pending" && (
          <div
            className={`flex items-center gap-1 font-label-sm text-xs px-2 py-0.5 rounded-full font-bold ${
              ticket.isUrgent
                ? "bg-error-container text-on-error-container animate-pulse"
                : "bg-primary-fixed text-on-primary-fixed"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{ticket.timerLabel}</span>
          </div>
        )}

        {ticket.status === "accepted" && (
          <span className="font-label-sm text-[11px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-medium">
            {ticket.timerLabel}
          </span>
        )}

        {ticket.status === "preparing" && (
          <span className="font-label-sm text-[11px] bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full font-bold">
            {ticket.timerLabel}
          </span>
        )}

        {ticket.status === "ready" && (
          <span className="font-label-sm text-[11px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded font-medium">
            {ticket.readyTimeAgo || "Ready"}
          </span>
        )}
      </div>

      {/* Progress Bar (Preparing mode) */}
      {ticket.status === "preparing" && ticket.prepProgress !== undefined && (
        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              ticket.prepProgress > 70 ? "bg-primary" : "bg-secondary-container"
            }`}
            style={{ width: `${ticket.prepProgress}%` }}
          />
        </div>
      )}

      {/* Customer & Payment Badge */}
      <div className="flex items-center justify-between text-xs font-body-sm text-on-surface-variant">
        <span className="font-semibold text-on-surface truncate">
          {ticket.customerName}{" "}
          {ticket.locationOrNote && (
            <span className="text-on-surface-variant font-normal">
              ({ticket.locationOrNote})
            </span>
          )}
        </span>
        <span
          className={`font-label-sm text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
            ticket.paymentIsPaid !== false
              ? "bg-primary-fixed text-on-primary-fixed"
              : "bg-error-container text-on-error-container"
          }`}
        >
          {ticket.paymentBadge}
        </span>
      </div>

      {/* Food Manifest */}
      <div className="space-y-space-xs py-space-2xs bg-surface-container-low p-space-xs rounded border border-border/30">
        {ticket.items.map((item, index) => (
          <div key={index} className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <div className="font-label-lg text-xs font-bold text-on-surface leading-tight">
                {item.quantity}x {item.name}
              </div>
              {item.modifiers && item.modifiers.length > 0 && (
                <div className="font-body-sm text-[11px] text-primary font-medium mt-0.5 flex flex-wrap gap-1">
                  {item.modifiers.map((mod, mIdx) => (
                    <span
                      key={mIdx}
                      className={`px-1 rounded text-[10px] ${
                        mod.isAlert
                          ? "bg-error-container text-on-error-container font-bold flex items-center gap-0.5"
                          : mod.isPrimary
                          ? "bg-surface-container-lowest text-primary font-bold border border-primary/20"
                          : "bg-surface-container-lowest text-on-surface-variant"
                      }`}
                    >
                      {mod.isAlert && <AlertTriangle className="w-2.5 h-2.5" />}
                      • {mod.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="font-label-md text-xs text-on-surface font-semibold shrink-0">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Card Actions Footer */}
      {ticket.status === "pending" && (
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase block leading-none font-semibold">
              Total
            </span>
            <span className="font-headline-sm text-sm text-on-surface font-bold">
              ${ticket.totalPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              onClick={() => onAction && onAction("reject", ticket.id)}
              className="px-space-xs py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-error font-label-md text-xs font-bold transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => onAction && onAction("accept", ticket.id)}
              className="px-space-md py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept
            </button>
          </div>
        </div>
      )}

      {ticket.status === "accepted" && (
        <div className="flex items-center justify-between pt-1 gap-2">
          <span className="font-label-sm text-[10px] bg-surface-container-high text-on-surface-variant px-2 py-1 rounded font-medium truncate">
            Assign: {ticket.assignStation || "Hearth 1"}
          </span>
          <button
            onClick={() => onAction && onAction("start_prep", ticket.id)}
            className="w-2/3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-secondary-container hover:text-on-secondary-container text-on-surface font-label-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <CookingPot className="w-4 h-4" />
            Start Preparing
          </button>
        </div>
      )}

      {ticket.status === "preparing" && (
        <button
          onClick={() => onAction && onAction("mark_ready", ticket.id)}
          className="w-full py-2 rounded-lg bg-secondary text-on-secondary hover:bg-secondary/90 font-label-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 mt-1"
        >
          <ChefHat className="w-4 h-4" />
          Mark as Ready
        </button>
      )}

      {ticket.status === "ready" && ticket.readySubtype === "pickup" && (
        <button
          onClick={() => onAction && onAction("handover", ticket.id)}
          className="w-full py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1 mt-1"
        >
          <Check className="w-4 h-4" />
          Hand Over to Guest
        </button>
      )}

      {ticket.status === "ready" && ticket.readySubtype === "delivery" && (
        <button
          onClick={() => onAction && onAction("assign_courier", ticket.id)}
          className="w-full py-1.5 rounded-lg bg-surface-container-highest hover:bg-secondary-container hover:text-on-secondary-container text-on-surface font-label-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm mt-1"
        >
          <Send className="w-4 h-4" />
          Assign / Scan Courier
        </button>
      )}
    </div>
  );
};
