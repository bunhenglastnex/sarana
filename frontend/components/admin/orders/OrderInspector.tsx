"use client";

import React, { useState } from "react";
import {
  Printer,
  X,
  Flame,
  Wallet,
  Clock,
  Check,
  RotateCw,
  Phone,
  MapPin,
  FileText,
  Utensils,
  Tag,
  Bike,
  Receipt,
  XCircle,
  CheckCircle,
  Camera,
  ShieldCheck,
  Eye,
  CheckCircle2,
  ZoomIn,
} from "lucide-react";
import { OrderRecord } from "@/types/orders";

interface OrderInspectorProps {
  order: OrderRecord;
  onClose?: () => void;
  onAction?: (action: string, orderId: string) => void;
}

export const OrderInspector: React.FC<OrderInspectorProps> = ({
  order,
  onClose,
  onAction,
}) => {
  const [isMarkedReady, setIsMarkedReady] = useState(order.status === "ready");
  const [isAdminVerified, setIsAdminVerified] = useState(order.isAdminVerified || false);
  const [showProofModal, setShowProofModal] = useState(false);

  const handleConfirmAdminVerification = () => {
    setIsAdminVerified(true);
    if (onAction) {
      onAction("verify_admin", order.id);
    }
  };

  const handleMarkReady = () => {
    setIsMarkedReady(true);
    if (onAction) {
      onAction("mark_ready", order.id);
    }
  };

  return (
    <div className="xl:col-span-5 flex flex-col bg-surface-container-lowest rounded-2xl shadow-xl border border-border/40 overflow-hidden min-h-[600px]">
      {/* Panel Compact Header */}
      <div className="p-space-md bg-surface-container-low border-b border-border/30 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-sm text-lg font-extrabold text-on-surface tracking-tight">
              Order {order.id}
            </h2>
            <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-sm text-[11px] text-on-surface-variant font-bold">
              {order.channelLabel.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => alert(`Printing kitchen chit for ${order.id}`)}
              className="p-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors border border-border/20"
              title="Print Kitchen Chits"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors border border-border/20"
                title="Close Panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Compact Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm bg-primary text-on-primary font-bold shadow-xs">
            <Flame className="w-3 h-3" />
            <span>{order.statusLabel.toUpperCase()}</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm bg-secondary-fixed text-on-secondary-fixed font-bold">
            <Wallet className="w-3 h-3" />
            <span>{order.paymentBadgeLabel} (${order.totalPrice.toFixed(2)})</span>
          </div>

          <div className="text-on-surface-variant font-body-sm text-[11px] flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            <span>Placed {order.placedTimeLabel}</span>
          </div>
        </div>
      </div>

      {/* Compact Lifecycle Stepper */}
      <div className="px-space-md py-2 bg-surface-container/50 border-b border-border/30">
        <div className="flex items-center justify-between mb-1">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
            Order Lifecycle Track
          </span>
          <span className="font-label-sm text-[11px] text-primary font-bold">
            Est. Dispatch in {order.estimatedPrepMinutes || 8} min
          </span>
        </div>

        {/* 6 Steps Compact Graphic */}
        <div className="relative flex items-center justify-between py-1">
          {/* Background Track Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-container-highest rounded-full z-0" />
          {/* Active Filled Line */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300"
            style={{
              width: `${((order.lifecycleStep - 1) / 5) * 100}%`,
            }}
          />

          {/* Step 1: Placed */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-[10px] font-bold shadow-xs">
              <Check className="w-3 h-3" />
            </div>
            <span className="font-label-sm text-[9px] text-on-surface mt-0.5 font-semibold">
              Placed
            </span>
          </div>

          {/* Step 2: Accepted */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center font-label-sm text-[10px] font-bold shadow-xs ${
                order.lifecycleStep >= 2
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {order.lifecycleStep >= 2 ? <Check className="w-3 h-3" /> : "2"}
            </div>
            <span className="font-label-sm text-[9px] text-on-surface mt-0.5 font-semibold">
              Accepted
            </span>
          </div>

          {/* Step 3: Preparing */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-[10px] font-bold ${
                order.lifecycleStep === 3
                  ? "bg-primary-container text-on-primary-container ring-2 ring-primary-fixed shadow-xs"
                  : order.lifecycleStep > 3
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {order.lifecycleStep === 3 ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : order.lifecycleStep > 3 ? (
                <Check className="w-3 h-3" />
              ) : (
                "3"
              )}
            </div>
            <span
              className={`font-label-sm text-[9px] mt-0.5 ${
                order.lifecycleStep === 3
                  ? "text-primary font-bold"
                  : "text-on-surface-variant font-medium"
              }`}
            >
              Preparing
            </span>
          </div>

          {/* Step 4: Ready */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center font-label-sm text-[10px] font-bold ${
                order.lifecycleStep >= 4
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {order.lifecycleStep >= 4 ? <Check className="w-3 h-3" /> : "4"}
            </div>
            <span className="font-label-sm text-[9px] text-on-surface-variant mt-0.5">
              Ready
            </span>
          </div>

          {/* Step 5: Delivery */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center font-label-sm text-[10px] font-bold ${
                order.lifecycleStep >= 5
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {order.lifecycleStep >= 5 ? <Check className="w-3 h-3" /> : "5"}
            </div>
            <span className="font-label-sm text-[9px] text-on-surface-variant mt-0.5">
              Delivery
            </span>
          </div>

          {/* Step 6: Done */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center font-label-sm text-[10px] font-bold ${
                order.lifecycleStep >= 6
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {order.lifecycleStep >= 6 ? <Check className="w-3 h-3" /> : "6"}
            </div>
            <span className="font-label-sm text-[9px] text-on-surface-variant mt-0.5">
              Done
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Inspector Body */}
      <div className="p-space-md flex flex-col gap-space-md overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar">
        {/* Cancelled Alert Banner */}
        {order.status === "cancelled" && (
          <div className="p-space-md rounded-xl bg-error-container/20 border border-error/40 flex flex-col gap-1.5 text-on-surface">
            <div className="flex items-center gap-2 font-headline-sm text-xs font-extrabold text-error uppercase tracking-wider">
              <XCircle className="w-4 h-4 fill-error text-on-error shrink-0" />
              <span>ORDER CANCELLED &amp; REFUNDED</span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant font-medium">
              Reason: <span className="font-bold text-on-surface">{order.cancelReason || "Cancelled by kitchen expediter / customer request."}</span>
            </p>
            <div className="flex items-center gap-2 font-label-sm text-[11px] text-error font-bold mt-1">
              <span>Status: Settled (Payment Reversed / Voided)</span>
            </div>
          </div>
        )}

        {/* Customer Identity & Drop-off Compact Card */}
        <div className="bg-surface-container-low p-space-sm rounded-xl flex flex-col gap-2 border border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary-container/40 flex items-center justify-center text-on-secondary-container font-bold text-xs">
                {order.customerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div className="font-headline-sm text-xs text-on-surface font-bold">
                  {order.customerName}
                </div>
                <div className="font-body-sm text-[11px] text-on-surface-variant flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span className="font-semibold text-on-surface">
                    {order.customerPhone}
                  </span>
                  {order.customerTag && (
                    <span className="text-tertiary font-bold">
                      • {order.customerTag}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Calling customer ${order.customerPhone}...`)}
              className="px-2 py-1 rounded bg-surface-container-lowest text-primary hover:bg-surface-container font-label-sm text-[11px] font-bold flex items-center gap-1 shadow-xs border border-border/20 transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>Call Client</span>
            </button>
          </div>

          {/* Delivery Address Box */}
          {order.deliveryAddress && (
            <div className="bg-surface-container-lowest p-2 rounded-lg flex items-start gap-2 border border-border/20">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-label-md text-xs text-on-surface font-bold leading-tight">
                  {order.deliveryAddress}
                </div>
                {order.deliveryAddressCity && (
                  <div className="font-body-sm text-[11px] text-on-surface-variant">
                    {order.deliveryAddressCity}
                  </div>
                )}
                {order.deliveryNote && (
                  <div className="mt-1.5 p-1.5 rounded bg-surface-container-high/60 flex items-center gap-1.5 text-[11px]">
                    <FileText className="w-3 h-3 text-secondary shrink-0" />
                    <span className="font-label-sm text-on-surface-variant italic truncate">
                      Drop-off notes: “{order.deliveryNote}”
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Courier Drop-Off & Payment Verification Card */}
        {order.paymentIsPaid && (
          <div className="bg-surface-container-low p-space-sm rounded-xl flex flex-col gap-2 border border-border/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-label-sm text-xs font-bold text-on-surface">
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span>Courier Delivery & Payment Verification</span>
              </div>
              {isAdminVerified ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified & Approved
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-label-sm text-[10px] font-bold flex items-center gap-1 animate-pulse">
                  <ShieldCheck className="w-3 h-3 text-amber-700" />
                  Pending Verification
                </span>
              )}
            </div>

            <div className="bg-surface-container-lowest p-2 rounded-lg flex items-center justify-between gap-2 border border-border/20">
              {/* Delivery Drop Image Thumbnail */}
              <div className="flex items-center gap-2">
                <div
                  onClick={() => setShowProofModal(true)}
                  className="relative w-12 h-12 rounded-md overflow-hidden bg-surface-container-highest shrink-0 cursor-pointer group shadow-xs border border-border/30"
                >
                  <img
                    src={
                      order.proofImageUrl ||
                      "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=300&auto=format&fit=crop"
                    }
                    alt="Drop-off Proof Photo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div>
                  <div className="font-label-md text-xs font-bold text-on-surface">
                    Drop-Off Photo & Payment Slip
                  </div>
                  <div className="font-body-sm text-[11px] text-on-surface-variant flex items-center gap-1">
                    <span>Driver Verified Cash (${order.totalPrice.toFixed(2)})</span>
                  </div>
                </div>
              </div>

              {/* Admin Action Button */}
              {!isAdminVerified ? (
                <button
                  onClick={handleConfirmAdminVerification}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-label-sm text-[11px] font-bold shadow-xs flex items-center gap-1 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Payment</span>
                </button>
              ) : (
                <span className="font-label-sm text-[11px] text-emerald-700 font-bold">
                  ✓ Cash Settled
                </span>
              )}
            </div>
          </div>
        )}

        {/* Itemized Culinary Breakdown Section */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-sm text-on-surface font-bold">
              Ticket Items ({order.items.length} Items, {order.totalItemsCount} Qty)
            </span>
            <span className="font-label-sm text-xs text-primary font-bold">
              Kitchen Station: {order.kitchenStation || "Grill & Fryer"}
            </span>
          </div>

          {/* Render List of Order Items */}
          <div className="space-y-space-xs">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-low p-space-sm rounded-xl flex gap-space-md items-center border border-border/20"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 shadow-xs relative bg-surface-container-highest flex items-center justify-center text-primary">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Utensils className="w-6 h-6 text-secondary" />
                  )}
                  <span className="absolute bottom-1 right-1 bg-inverse-surface/90 text-inverse-on-surface font-label-sm text-[10px] font-bold px-1.5 py-0.2 rounded">
                    {item.quantity}x
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-label-lg text-xs font-bold text-on-surface truncate">
                      {item.name}
                    </div>
                    <div className="font-price-lg text-xs font-bold text-on-surface shrink-0">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  {item.basePrice && (
                    <div className="font-body-sm text-[11px] text-on-surface-variant">
                      {item.quantity} × ${item.basePrice.toFixed(2)} base
                    </div>
                  )}

                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.modifiers.map((mod, idx) => (
                        <span
                          key={idx}
                          className={`px-1.5 py-0.5 rounded font-label-sm text-[10px] ${
                            mod.isAlert
                              ? "bg-primary-fixed/40 text-primary font-bold"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {mod.text}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Financial Summary */}
        <div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-2 border border-border/20">
          <div className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">
            Payment &amp; Billing Calculation
          </div>

          <div className="flex justify-between text-xs text-on-surface">
            <span>Item Subtotal</span>
            <span className="font-semibold">${order.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-xs text-on-surface">
            <span>Delivery Fee</span>
            <div className="flex items-center gap-1.5">
              {order.deliveryFee === 0 ? (
                <>
                  <span className="line-through text-on-surface-variant">$2.50</span>
                  <span className="text-primary font-bold">FREE</span>
                </>
              ) : (
                <span className="font-semibold">
                  ${order.deliveryFee.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-xs text-on-surface">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span>Promo Code (AMBER20)</span>
              </span>
              <span className="text-primary font-bold">
                -${order.discount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-xs text-on-surface">
            <span>State Sales Tax (Included 9.25%)</span>
            <span className="text-on-surface-variant">${order.tax.toFixed(2)}</span>
          </div>

          <div className="pt-2 mt-1 flex justify-between items-baseline bg-surface-container-lowest p-2.5 rounded-lg border border-border/20">
            <div className="flex flex-col">
              <span className="font-headline-sm text-sm font-bold text-on-surface leading-tight">
                Total to Collect
              </span>
              <span className="font-label-sm text-[10px] text-secondary font-bold uppercase">
                {order.paymentBadgeLabel}
              </span>
            </div>
            <div className="font-display-lg text-2xl font-extrabold text-primary leading-none">
              ${order.totalPrice.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Action Control Footer (Sticky Bottom of Panel) */}
      <div className="p-space-md bg-surface-container-low border-t border-border/30 flex flex-col gap-space-xs shadow-lg mt-auto">
        {/* Main Primary Progression Action Button */}
        <button
          onClick={handleMarkReady}
          className={`w-full h-11 rounded-xl font-label-lg text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md ${
            isMarkedReady
              ? "bg-secondary text-on-secondary"
              : "bg-primary text-on-primary hover:bg-primary-container"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>
            {isMarkedReady
              ? "Ticket Updated to READY"
              : "Mark as Ready for Delivery"}
          </span>
        </button>

        {/* Secondary Operational Controls */}
        <div className="grid grid-cols-3 gap-space-xs">
          <button
            onClick={() => alert(`Assigning courier for ${order.id}`)}
            className="py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-sm text-[11px] font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors border border-border/20"
          >
            <Bike className="w-3.5 h-3.5 text-secondary" />
            <span>Assign Courier</span>
          </button>

          <button
            onClick={() => alert(`Printing ticket for ${order.id}`)}
            className="py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-sm text-[11px] font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors border border-border/20"
          >
            <Receipt className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>Print Ticket</span>
          </button>

          <button
            onClick={() => {
              if (onAction) onAction("cancel", order.id);
            }}
            className="py-2 rounded-lg bg-error-container/40 hover:bg-error-container text-error font-label-sm text-[11px] font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors border border-error/20"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Order</span>
          </button>
        </div>
      </div>

      {/* Proof Photo Fullscreen Modal */}
      {showProofModal && (
        <div
          onClick={() => setShowProofModal(false)}
          className="fixed inset-0 bg-on-surface/60 backdrop-blur-xs z-50 flex items-center justify-center p-space-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-md shadow-2xl space-y-space-sm border border-border/40"
          >
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <span className="font-headline-sm text-sm font-bold text-on-surface">
                Drop-Off Proof &amp; Receipt Photo ({order.id})
              </span>
              <button
                onClick={() => setShowProofModal(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full h-64 rounded-xl overflow-hidden bg-surface-container-highest border border-border/20">
              <img
                src={
                  order.proofImageUrl ||
                  "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&auto=format&fit=crop"
                }
                alt="Full Delivery Proof"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Driver: Liam Vance (ID 4791)</span>
              <span className="font-bold text-emerald-700">
                Cash Collected: ${order.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
