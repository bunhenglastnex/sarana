"use client";

import React from "react";
import Link from "next/link";
import {
  Flame,
  Clock,
  Navigation,
  MapPin,
  Banknote,
  Phone,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface ActiveDeliveryCardProps {
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  targetEtaTime?: string;
  timeLeftStr?: string;
  address?: string;
  deliveryNotes?: string;
  routeInfo?: string;
  distanceStr?: string;
  codAmount?: number;
  onOpenSheet?: (type: string) => void;
}

export const ActiveDeliveryCard: React.FC<ActiveDeliveryCardProps> = ({
  orderId = "1024",
  orderNumber = "Order #1024",
  customerName = "John Smith",
  customerPhone = "5550192",
  targetEtaTime = "7:35 PM",
  timeLeftStr = "~8 mins left",
  address = "742 Evergreen Terr, Apt 3B",
  deliveryNotes = "Gate Code: #4820 • Leave at door mat",
  routeInfo = "Route optimized • Smooth traffic",
  distanceStr = "0.9 mi",
  codAmount = 34.5,
  onOpenSheet,
}) => {
  return (
    <div className="relative bg-surface-container-lowest rounded-xl p-space-md shadow-md overflow-hidden flex flex-col space-y-space-sm border border-outline-variant/20">
      {/* Glow & Ambient Header Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary"></div>

      {/* Header Badges */}
      <div className="flex items-center justify-between pt-1">
        <div className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed">
          <Flame className="w-3.5 h-3.5 fill-primary text-primary" />
          <span className="font-label-sm text-label-sm uppercase tracking-wider font-extrabold">
            Current Active
          </span>
        </div>
        <div className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-secondary-container/20 text-on-secondary-container">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
          <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
            Out for Delivery
          </span>
        </div>
      </div>

      {/* Order ID and Customer Meta */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {orderNumber}
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight truncate">
            {customerName}
          </h2>
        </div>
        <div className="text-right shrink-0">
          <div className="font-headline-sm text-headline-sm text-primary font-extrabold">
            {targetEtaTime}
          </div>
          <span className="font-label-sm text-label-sm text-error font-semibold flex items-center justify-end gap-0.5 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-error" />
            {timeLeftStr}
          </span>
        </div>
      </div>

      {/* Delivery Route Map Graphic Snippet */}
      <div
        className="relative w-full h-24 rounded-lg overflow-hidden shadow-inner bg-surface-container-high"
        style={{
          backgroundImage: `url('https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-on-primary">
          <div className="flex items-center gap-1 text-on-primary drop-shadow-sm min-w-0">
            <Navigation className="w-4 h-4 text-secondary-container fill-secondary-container" />
            <span className="font-label-md text-label-md font-bold truncate">
              {routeInfo}
            </span>
          </div>
          <span className="font-label-sm text-label-sm bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded text-on-primary font-semibold">
            {distanceStr}
          </span>
        </div>
      </div>

      {/* Address and Specific Delivery Notes */}
      <div className="bg-surface-container-low rounded-lg p-space-xs space-y-1">
        <div className="flex items-start gap-1.5">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="font-label-md text-label-md text-on-surface font-bold leading-snug">
              {address}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              {deliveryNotes}
            </p>
          </div>
        </div>
      </div>

      {/* Financial / Collect Badge */}
      {codAmount && codAmount > 0 ? (
        <div className="flex items-center justify-between p-space-xs bg-error-container/30 rounded-lg">
          <div className="flex items-center gap-1.5">
            <Banknote className="w-5 h-5 text-error" />
            <span className="font-label-md text-label-md text-on-error-container font-bold">
              Cash on Delivery
            </span>
          </div>
          <div className="font-headline-sm text-headline-sm text-on-error-container font-black">
            Collect ${codAmount.toFixed(2)}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-space-xs bg-emerald-100 rounded-lg">
          <div className="flex items-center gap-1.5">
            <Banknote className="w-5 h-5 text-emerald-800" />
            <span className="font-label-md text-label-md text-emerald-800 font-bold">
              KHQR • Paid in Full
            </span>
          </div>
          <div className="font-headline-sm text-headline-sm text-emerald-800 font-black">
            Prepaid
          </div>
        </div>
      )}

      {/* Primary Action CTA */}
      <Link
        href={`/delivery/${orderId}/navigate`}
        className="w-full bg-primary hover:bg-primary-container active:scale-[0.98] transition-all text-on-primary rounded-xl py-3 px-space-md flex items-center justify-center gap-2 shadow-sm"
      >
        <Navigation className="w-5 h-5" />
        <span className="font-label-lg text-label-lg font-bold">
          Continue Delivery / Navigation
        </span>
        <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Communication & Micro Actions */}
      <div className="flex items-center justify-around pt-1 border-t border-surface-variant/40">
        <a
          href={`tel:${customerPhone}`}
          className="flex items-center gap-1 text-on-surface-variant hover:text-primary font-label-sm text-label-sm font-semibold py-1 transition-colors"
        >
          <Phone className="w-4 h-4 text-primary" />
          Call Customer
        </a>
        <span className="text-surface-variant">•</span>
        <button
          type="button"
          onClick={() => onOpenSheet?.("note")}
          className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-semibold py-1 transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-tertiary" />
          Order Note
        </button>
        <span className="text-surface-variant">•</span>
        <button
          type="button"
          onClick={() => onOpenSheet?.("issue")}
          className="flex items-center gap-1 text-on-surface-variant hover:text-error font-label-sm text-label-sm font-semibold py-1 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-secondary" />
          Issue
        </button>
      </div>
    </div>
  );
};
