"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeliveryOrder } from "@/lib/store/useDeliveryStore";
import { Bike, Navigation, Handshake, CheckCircle2, ThumbsUp, ChevronRight, Heart } from "lucide-react";

interface DeliveryCardProps {
  order: DeliveryOrder;
  onAccept?: (orderId: string) => void;
  showAcceptButton?: boolean;
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({
  order,
  onAccept,
  showAcceptButton = true,
}) => {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);

  const getBorderColor = () => {
    if (order.prepStatusType === "urgent") return "bg-primary";
    if (order.prepStatusType === "warning") return "bg-secondary-container";
    return "bg-emerald-600";
  };

  const getPrepBadgeStyle = () => {
    if (order.prepStatusType === "urgent")
      return "bg-primary-container/15 text-primary";
    if (order.prepStatusType === "warning")
      return "bg-secondary-fixed text-on-secondary-fixed";
    return "bg-emerald-100 text-emerald-800";
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAccepting(true);
    setTimeout(() => {
      onAccept?.(order.id);
      router.push(`/delivery/${order.id}`);
    }, 300);
  };

  return (
    <div
      id={`card-${order.id}`}
      onClick={() => router.push(`/delivery/${order.id}`)}
      className={`flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-md gap-space-sm relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg ${
        isAccepting ? "opacity-40 scale-[0.97]" : ""
      }`}
    >
      {/* Status indicator bar on the left edge */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${getBorderColor()}`}></div>

      {/* Top Badges Row */}
      <div className="flex items-start justify-between gap-space-xs pl-1">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold hover:underline">
              {order.orderNumber}
            </span>
            <span
              className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold ${getPrepBadgeStyle()}`}
            >
              {order.prepStatus}
            </span>
            {order.tipAmount !== undefined && order.tipAmount > 0 && (
              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold bg-secondary-fixed text-on-secondary-fixed border border-secondary/20 shadow-xs">
                <Heart className="w-3.5 h-3.5 text-secondary fill-secondary" />
                +${order.tipAmount.toFixed(2)} Tip
              </span>
            )}
          </div>
          <span className="font-label-lg text-label-lg text-on-surface font-bold mt-0.5 flex items-center gap-1">
            {order.customerName}
            <ChevronRight className="w-4 h-4 text-on-surface-variant" />
          </span>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-price-lg text-price-lg text-primary font-bold">
            ${order.totalPrice.toFixed(2)}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            {order.itemCount} {order.itemCount === 1 ? "Item" : "Items"}
          </span>
        </div>
      </div>

      {/* Route / Distance Pill Box */}
      <div className="flex items-center gap-space-xs bg-surface-container-low rounded-lg p-space-xs pl-space-sm">
        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
          <Bike className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {order.timeAgo && (
              <>
                <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-primary-container/20 text-primary font-bold">
                  {order.timeAgo}
                </span>
                <span className="text-outline-variant">•</span>
              </>
            )}
            <span className="font-label-sm text-label-sm text-on-surface font-bold">
              {order.distance}
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              {order.eta}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface truncate font-medium">
            {order.address}
          </p>
        </div>
        <a
          aria-label="Open Navigation"
          href={
            order.deliveryLat && order.deliveryLng
              ? `https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}`
              : `https://maps.google.com/?q=${encodeURIComponent(order.address)}`
          }
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-primary shadow-sm active:scale-95 shrink-0 transition-colors"
        >
          <Navigation className="w-4 h-4" />
        </a>
      </div>

      {/* Item Preview Breakdown */}
      <div className="flex items-center gap-space-sm pl-1 py-1">
        <div className="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden shrink-0">
          <img
            src={order.itemImage}
            alt={order.itemsSummary}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <p className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
            {order.itemsSummary}
          </p>
          {order.itemsNote && (
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              {order.itemsNote}
            </span>
          )}
        </div>
      </div>

      {/* Payment Alert Badge */}
      {order.paymentType === "cod" ? (
        <div className="flex items-center gap-2 bg-secondary-fixed/50 text-on-secondary-fixed px-space-sm py-2 rounded-lg pl-3">
          <Handshake className="w-5 h-5 text-secondary shrink-0 font-bold" />
          <div className="flex items-center justify-between w-full min-w-0 pr-1">
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wide">
              Cash on Delivery
            </span>
            <span className="font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
              Collect ${order.codAmount?.toFixed(2) || order.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-surface-container-high text-on-surface px-space-sm py-2 rounded-lg pl-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 font-bold" />
          <div className="flex items-center justify-between w-full min-w-0 pr-1">
            <span className="font-label-sm text-label-sm font-bold">
              KHQR — Paid in Full
            </span>
            <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
              {order.khqrNote || "Contactless Delivery"}
            </span>
          </div>
        </div>
      )}

      {/* Big Touch Primary CTA */}
      {showAcceptButton && (
        <button
          type="button"
          onClick={handleAccept}
          className="w-full h-12 bg-primary text-on-primary rounded-xl font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-md hover:bg-primary-container active:scale-[0.98] transition-all mt-1"
        >
          <ThumbsUp className="w-5 h-5" />
          <span>
            Accept Delivery
            {order.tipAmount !== undefined && order.tipAmount > 0
              ? ` • +$${order.tipAmount.toFixed(2)} Tip`
              : ""}
          </span>
        </button>
      )}
    </div>
  );
};
