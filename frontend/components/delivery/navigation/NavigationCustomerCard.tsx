"use client";

import React from "react";
import { DeliveryOrder } from "@/lib/store/useDeliveryStore";
import {
  Bike,
  Banknote,
  ShieldCheck,
  MapPin,
  Key,
  Phone,
  MessageSquare,
  Map,
} from "lucide-react";

interface NavigationCustomerCardProps {
  order: DeliveryOrder;
  onSendQuickSms: () => void;
}

export const NavigationCustomerCard: React.FC<NavigationCustomerCardProps> = ({
  order,
  onSendQuickSms,
}) => {
  // Get initials for customer avatar
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenWazeOrMaps = () => {
    const mapsUrl =
      order.deliveryLat && order.deliveryLng
        ? `https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}`
        : `https://maps.google.com/?q=${encodeURIComponent(order.address)}`;
    window.open(mapsUrl, "_blank");
  };

  return (
    <div className="px-screen-edge-padding flex flex-col gap-space-md pt-space-xs max-w-md mx-auto w-full">
      <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md shadow-md flex flex-col gap-space-md border border-outline-variant/30">
        {/* Top Order Status & Identifier */}
        <div className="flex items-center justify-between gap-space-xs pb-space-xs border-b border-outline-variant/20">
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Order {order.orderNumber}
            </span>
            <span className="text-tertiary font-body-sm text-body-sm">• Active</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm uppercase tracking-wider font-extrabold flex items-center gap-1">
            <Bike className="w-3.5 h-3.5 text-primary" />
            OUT_FOR_DELIVERY
          </span>
        </div>

        {/* Critical Payment Alert Banner */}
        {order.paymentType === "cod" ? (
          <div className="w-full rounded-xl bg-secondary-fixed p-space-md flex items-center gap-space-sm shadow-sm">
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
              <Banknote className="w-6 h-6 text-on-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-label-sm text-label-sm uppercase font-extrabold text-on-secondary-fixed tracking-wider block">
                Payment Requirement
              </span>
              <p className="font-headline-sm text-headline-sm font-bold text-on-secondary-fixed leading-tight">
                Collect Cash:{" "}
                <span className="text-primary font-extrabold">
                  ${(order.codAmount || order.totalPrice).toFixed(2)}
                </span>
              </p>
            </div>
            <span className="px-2 py-1 bg-surface-container-lowest/80 text-secondary font-label-sm text-label-sm rounded-lg font-bold shrink-0">
              COD
            </span>
          </div>
        ) : (
          <div className="w-full rounded-xl bg-emerald-100 text-emerald-900 p-space-md flex items-center gap-space-sm shadow-sm">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-label-sm text-label-sm uppercase font-extrabold text-emerald-800 tracking-wider block">
                Payment Protocol
              </span>
              <p className="font-headline-sm text-headline-sm font-bold text-emerald-950 leading-tight">
                KHQR — Paid in Full
              </p>
            </div>
            <span className="px-2 py-1 bg-emerald-200 text-emerald-900 font-label-sm text-label-sm rounded-lg font-bold shrink-0">
              Prepaid
            </span>
          </div>
        )}

        {/* Customer Details & Delivery Gatecode Card */}
        <div className="flex flex-col gap-space-xs bg-surface-container-low rounded-xl p-space-md">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold font-headline-sm shrink-0">
                {getInitials(order.customerName)}
              </div>
              <div className="min-w-0">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">
                  {order.customerName}
                </h3>
                <p className="font-body-sm text-body-sm text-tertiary truncate">
                  Standard Delivery • {order.itemCount} items
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-highest text-on-surface-variant font-label-md text-label-md font-semibold shrink-0">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              Pin Verified
            </span>
          </div>

          <div className="mt-space-2xs pt-space-xs flex flex-col gap-1.5 border-t border-outline-variant/15">
            <div className="flex items-start gap-space-xs">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-body-lg text-body-lg font-semibold text-on-surface leading-snug">
                  {order.address}
                </p>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-label-md text-label-md px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-bold">
                    <Key className="w-3.5 h-3.5 text-on-secondary-fixed" />
                    Gate: #4910
                  </span>
                  <span className="text-on-surface-variant font-body-sm text-body-sm">
                    {order.dropOffInstruction || "Ring callbox or leave at door"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Driver Communications Grid */}
        <div className="grid grid-cols-3 gap-space-xs pt-space-2xs">
          {/* Call Button */}
          <a
            href={`tel:${order.customerPhone || "5550192834"}`}
            className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-95 transition-all text-center"
          >
            <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <span className="font-label-md text-label-md font-bold leading-tight">
              Call
            </span>
          </a>

          {/* SMS Quick Text */}
          <button
            type="button"
            onClick={onSendQuickSms}
            className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-95 transition-all text-center"
          >
            <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm">
              <MessageSquare className="w-5 h-5 text-secondary" />
            </div>
            <span className="font-label-md text-label-md font-bold leading-tight">
              Quick SMS
            </span>
          </button>

          {/* External Nav */}
          <button
            type="button"
            onClick={handleOpenWazeOrMaps}
            className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-95 transition-all text-center"
          >
            <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-tertiary-container shadow-sm">
              <Map className="w-5 h-5 text-tertiary-container" />
            </div>
            <span className="font-label-md text-label-md font-bold leading-tight">
              Waze / Maps
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
