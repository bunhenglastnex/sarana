"use client";

import React, { useState } from "react";
import { formatProofUrl } from "@/lib/utils";
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
  ZoomIn,
  X,
  XCircle,
} from "lucide-react";
import { KdsTicket } from "@/types/kds";

interface KdsCardProps {
  ticket: KdsTicket;
  onAction?: (action: string, ticketId: string, reason?: string) => void;
}

export const KdsCard: React.FC<KdsCardProps> = ({ ticket, onAction }) => {
  const [showProofModal, setShowProofModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const isDelivery = ticket.channel === "delivery";
  const isKhqrPaid =
    ticket.paymentIsPaid !== false &&
    ticket.paymentBadge.toUpperCase().includes("KHQR");

  return (
    <div
      className={`bg-surface-container-lowest rounded-lg p-space-md shadow-sm flex flex-col gap-space-sm hover:shadow-md transition-shadow relative overflow-hidden border border-border/40 shrink-0 ${
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
            (ticket.prepProgress || 0) > 70
              ? "bg-primary"
              : "bg-secondary-container"
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

      {/* KHQR Payment Proof Slip Banner (Only when KHQR PAID) */}
      {isKhqrPaid && (
        <div className="bg-surface-container-low p-2 rounded-lg border border-border/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              onClick={() => setShowProofModal(true)}
              className="relative w-10 h-10 rounded-md overflow-hidden bg-surface-container-highest shrink-0 cursor-pointer group border border-border/40 shadow-xs"
              title="Click to preview KHQR payment slip"
            >
              <img
                src={
                  formatProofUrl(ticket.proofImageUrl) ||
                  "https://images.unsplash.com/photo-1556742049-0a67923004a3?w=300&auto=format&fit=crop"
                }
                alt="KHQR Payment Slip"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-label-md text-[11px] font-bold text-on-surface truncate flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>KHQR Payment Slip</span>
              </div>
              <div className="font-body-sm text-[10px] text-on-surface-variant truncate">
                Verified (${ticket.totalPrice.toFixed(2)}) • Tap preview
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowProofModal(true)}
            className="px-2 py-1 rounded bg-surface-container-lowest hover:bg-surface-container-high text-primary font-label-sm text-[10px] font-bold shadow-xs border border-border/20 shrink-0 transition-colors"
          >
            Preview
          </button>
        </div>
      )}

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
              onClick={() => setShowRejectModal(true)}
              className="px-space-xs py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-error font-label-md text-xs font-bold transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => {
                if (isKhqrPaid) {
                  setShowProofModal(true);
                } else {
                  if (onAction) onAction("accept", ticket.id);
                }
              }}
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

      {ticket.status === "rejected" && (
        <div className="bg-error-container/20 p-2.5 rounded-lg border border-error/30 mt-1 flex flex-col gap-1 text-xs">
          <div className="font-bold text-error flex items-center gap-1">
            <XCircle className="w-4 h-4 text-error" />
            <span>ORDER REJECTED / CANCELLED</span>
          </div>
          {ticket.rejectReason && (
            <div className="text-on-surface-variant font-medium text-[11px] italic">
              Reason: “{ticket.rejectReason}”
            </div>
          )}
        </div>
      )}

      {/* KHQR Payment Proof Preview Modal */}
      {showProofModal && (
        <div
          onClick={() => setShowProofModal(false)}
          className="fixed inset-0 bg-on-surface/60 backdrop-blur-xs z-50 flex items-center justify-center p-space-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-md shadow-2xl space-y-space-sm border border-border/40"
          >
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  KHQR Payment Slip ({ticket.id})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  VERIFIED PAID
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowProofModal(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full h-80 rounded-xl overflow-hidden bg-black/90 border border-border/20 relative flex items-center justify-center">
              <img
                src={
                  formatProofUrl(ticket.proofImageUrl) ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10"
                }
                alt="Full KHQR Payment Slip"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant bg-surface-container-low p-2.5 rounded-xl border border-border/20">
              <div>
                <div className="font-bold text-on-surface">{ticket.customerName}</div>
                <div className="text-[11px]">KHQR Instant Transfer</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-700 text-sm">
                  ${ticket.totalPrice.toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Transaction Success
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowProofModal(false)}
                className="w-1/3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-label-md text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              {ticket.status === "pending" ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onAction) onAction("accept", ticket.id);
                    setShowProofModal(false);
                  }}
                  className="w-2/3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-label-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept &amp; Confirm Order</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowProofModal(false)}
                  className="w-2/3 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified &amp; Close</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Reason Modal */}
      {showRejectModal && (
        <div
          onClick={() => setShowRejectModal(false)}
          className="fixed inset-0 bg-on-surface/60 backdrop-blur-xs z-50 flex items-center justify-center p-space-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-md shadow-2xl space-y-space-md border border-border/40"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-error" />
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  Reject Order {ticket.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Brief */}
            <div className="bg-error-container/20 p-2.5 rounded-xl border border-error/20 text-xs">
              <div className="font-bold text-on-surface">
                Customer: {ticket.customerName}
              </div>
              <div className="text-on-surface-variant text-[11px] mt-0.5">
                Total Amount: ${ticket.totalPrice.toFixed(2)} • {ticket.items.length} dishes
              </div>
            </div>

            {/* Quick Reason Suggestions */}
            <div className="space-y-1.5">
              <label className="font-label-sm text-xs font-bold text-on-surface block">
                Select Rejection Reason:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Out of stock / Sold out",
                  "Invalid KHQR payment slip",
                  "Kitchen over capacity",
                  "Outside delivery zone",
                  "Store closing soon",
                ].map((reasonText) => (
                  <button
                    key={reasonText}
                    type="button"
                    onClick={() => setRejectReason(reasonText)}
                    className={`px-2.5 py-1 rounded-lg font-label-sm text-[11px] transition-all border ${
                      rejectReason === reasonText
                        ? "bg-error text-on-error font-bold border-error shadow-xs"
                        : "bg-surface-container-low hover:bg-surface-container text-on-surface border-border/30"
                    }`}
                  >
                    {reasonText}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Text Input Area */}
            <div className="space-y-1">
              <label className="font-label-sm text-xs font-bold text-on-surface block">
                Reason to send to Customer:
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Type rejection reason for customer notification..."
                className="w-full p-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-xs outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-error/40 border border-border/40 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="w-1/3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-label-md text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim()}
                onClick={() => {
                  if (onAction) onAction("reject", ticket.id, rejectReason);
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="w-2/3 py-2 rounded-xl bg-error hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed text-on-error font-label-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirm &amp; Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
