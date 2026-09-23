"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  Flame,
  Clock,
  Thermometer,
  Store,
  CheckCircle2,
  PackageCheck,
  Package,
  Navigation,
  Phone,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Headphones,
  Sparkles,
  Layers,
  CheckCheck,
} from "lucide-react";
import { Api, useApi } from "@/lib/api";

interface PickupTrackerViewProps {
  orderRef?: string;
  paymentMethod?: string;
}

export const PickupTrackerView: React.FC<PickupTrackerViewProps> = ({
  orderRef = "#AE-82104",
  paymentMethod = "Paid via KHQR",
}) => {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const cleanOrderRef = useMemo(() => orderRef.replace("#", ""), [orderRef]);

  // Fetch live order data to get exact fulfilling restaurant location, address & phone
  const { data: orderRes } = useApi<any>("/customer-orders.php", {
    order_id: cleanOrderRef,
  });

  const orderData = useMemo(() => {
    if (Array.isArray(orderRes?.data)) return orderRes.data[0];
    if (Array.isArray(orderRes)) return orderRes[0];
    return null;
  }, [orderRes]);

  const restaurantName = orderData?.restaurant_name || "Amber & Ember Bistro";
  const restaurantAddress =
    orderData?.restaurant_address || "520 N Michigan Ave, Suite 14F, Siem Reap";
  const restaurantPhone = orderData?.restaurant_phone || "+855 23 888 999";
  const restaurantLat = orderData?.restaurant_lat
    ? Number(orderData.restaurant_lat)
    : 13.35227;
  const restaurantLng = orderData?.restaurant_lng
    ? Number(orderData.restaurant_lng)
    : 103.955116;
  const totalAmount = orderData?.total_amount
    ? Number(orderData.total_amount).toFixed(2)
    : "28.50";

  const triggerNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(orderRef.replace("#", ""));
    setIsCopied(true);
    triggerNotice("Pickup code copied to clipboard");
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="bg-surface text-on-surface font-sans text-sm min-h-screen flex flex-col items-center selection:bg-primary/20 selection:text-primary pb-20 w-full">
      {/* Top Tracking Bar Navigation */}
      <header className="sticky top-0 w-full z-40 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="w-full max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="Go Back"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-transform active:scale-95 shadow-sm border border-surface-container-high"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                Store Collection
              </span>
              <h1 className="font-extrabold text-base text-on-surface leading-tight">
                Express Pickup Tracker
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/customer-profile")}
            aria-label="User Profile"
            className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-ping" />
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1WG5HVTWC5LLJbB2PqdnRJ67p9zpja5T6dbmRzk9uzevom6eIezanysplSyywSDu4va4KnMLCPJmYDPwVk_vBpgDaci3i0tP-RTHATBuyZzduINgEplaf6K-pVqc56E2pG2vRIXsiu16ryX3ea5viL2kFPcax-39oZKPAmwMn8bLCEerbyueUJkeOvoiwG0evceo6dXlWyqg1m8_83T7rhug8cwRMfhgz8fIdLK8rtskYaOyVAYu4p5Unk"
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-primary-fixed"
            />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen bg-surface">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pb-12">
          {/* Left Column: Express Pickup Pass, Stepper & Directions Map */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            {/* Hero Staging Card: QR Pickup Pass */}
            <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-5 shadow-md border border-surface-container/80 flex flex-col gap-4">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-secondary-container/15 blur-2xl pointer-events-none" />
              <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />

              {/* Status Pill & Timestamp */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary">
                  <Flame className="w-4 h-4 text-primary fill-primary/20" />
                  <span className="text-[11px] font-bold tracking-wide uppercase">
                    Ready for Pickup
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-secondary" /> Just Now
                  (19:28)
                </span>
              </div>

              {/* Main Ticket Info Block */}
              <div className="flex flex-col items-center justify-center text-center py-3 bg-surface-container-low/50 rounded-xl p-4 border border-surface-container/60">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-bold">
                  Express Pickup Pass
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-3xl sm:text-4xl font-mono text-on-surface tracking-tight">
                    {orderRef}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    aria-label="Copy pickup code"
                    className="p-2 rounded-full bg-surface-container text-on-surface-variant hover:text-primary transition-colors active:scale-95 border border-surface-container-high"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-secondary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {isCopied && (
                  <span className="text-xs text-primary font-bold mt-1.5 animate-in fade-in duration-200">
                    Code copied to clipboard
                  </span>
                )}
              </div>

              {/* Locker & Staging Location Detail */}
              <div className="flex items-center gap-3.5 p-4 bg-surface-container rounded-xl border border-surface-container-high">
                <div className="w-11 h-11 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary flex-shrink-0">
                  <Layers className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                    Staging Location
                  </span>
                  <span className="font-extrabold text-sm sm:text-base text-on-surface truncate">
                    Shelf B-3 • Hot Box #04
                  </span>
                  <span className="text-xs text-secondary flex items-center gap-1 font-semibold mt-0.5">
                    <Thermometer className="w-3.5 h-3.5" /> Heated Pickup
                    Station
                  </span>
                </div>
              </div>
            </div>

            {/* Pickup Milestone Timeline (4 Steps) */}
            <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm flex flex-col gap-4 border border-surface-container/80">
              <div className="flex items-center justify-between border-b border-surface-container/60 pb-3">
                <h2 className="font-extrabold text-sm sm:text-base text-on-surface">
                  Fulfillment Progress
                </h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-container text-on-surface-variant">
                  Step 3 of 4
                </span>
              </div>

              <div className="flex flex-col gap-4 relative">
                {/* Step 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="relative flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="w-0.5 h-8 bg-primary mt-1" />
                  </div>
                  <div className="flex flex-col min-w-0 pt-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-on-surface">
                        Order Confirmed
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        19:10
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      Ticket accepted by head chef
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="relative flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="w-0.5 h-8 bg-primary mt-1" />
                  </div>
                  <div className="flex flex-col min-w-0 pt-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-on-surface">
                        Prepared in Woodfire Hearth
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        19:15
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      Cooked at 700°F ember stone
                    </span>
                  </div>
                </div>

                {/* Step 3 (Active) */}
                <div className="flex items-start gap-3.5">
                  <div className="relative flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 z-10 shadow-md ring-4 ring-primary-fixed">
                      <Flame className="w-4 h-4 fill-white animate-pulse text-white" />
                    </div>
                    <div className="w-0.5 h-8 bg-surface-container mt-1" />
                  </div>
                  <div className="flex flex-col min-w-0 pt-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-primary">
                        Ready for Pickup
                      </span>
                      <span className="text-[10px] text-primary font-bold">
                        19:28
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      Packaged in thermal foil at express shelf
                    </span>
                  </div>
                </div>

                {/* Step 4 (Pending) */}
                <div className="flex items-start gap-3.5 opacity-60">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 z-10">
                      <CheckCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 pt-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs sm:text-sm text-on-surface-variant">
                        Handed Over &amp; Completed
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        Pending
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      Host verifies your barcode
                    </span>
                  </div>
                </div>
              </div>

              {/* Thermal packaging notice banner */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low text-on-surface border border-surface-container">
                <Package className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-xs text-on-surface-variant">
                  Your order is hot and sealed with artisan moisture locks.
                </span>
              </div>
            </div>

            {/* Restaurant Location & Walking Directions Map Card */}
            <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm flex flex-col gap-4 border border-surface-container/80">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                    Pickup Destination
                  </span>
                  <h3 className="font-extrabold text-base text-on-surface">
                    {restaurantName}
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                    {restaurantAddress}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant flex items-center gap-1 flex-shrink-0">
                  <Navigation className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold">Store Counter</span>
                </div>
              </div>

              {/* Interactive Location Map View */}
              <div
                className="w-full h-48 sm:h-56 bg-surface-container rounded-xl relative overflow-hidden bg-cover bg-center shadow-inner border border-surface-container-high"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80')",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-4 py-2 rounded-full bg-surface text-on-surface shadow-lg flex items-center gap-2 border border-surface-container-high">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-extrabold">
                      {restaurantName} Counter
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-surface/90 text-on-surface text-xs font-bold backdrop-blur-sm">
                  Pickup Counter • Ground Level
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${restaurantLat},${restaurantLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm hover:bg-primary-container"
                >
                  <Navigation className="w-4 h-4" /> Get Directions
                </a>
                <a
                  href={`tel:${restaurantPhone}`}
                  className="h-12 rounded-xl bg-surface-container text-on-surface font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-surface-container-high border border-surface-container-high"
                >
                  <Phone className="w-4 h-4 text-tertiary" /> Call Store
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Payment, Order Details & Help */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            {/* Payment Status Card */}
            <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm flex items-center justify-between border border-surface-container/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-secondary flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                    Payment Summary
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-on-surface">
                    {paymentMethod}
                  </span>
                  <span className="text-xs text-on-surface-variant truncate">
                    Ticket {orderRef}
                  </span>
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-surface-container text-secondary font-extrabold text-sm">
                ${totalAmount}
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3 border border-surface-container/80">
              <button
                type="button"
                onClick={() => setIsAccordionOpen((prev) => !prev)}
                className="flex items-center justify-between w-full text-left py-1"
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs sm:text-sm text-on-surface">
                    Order Details
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold">
                    2 items
                  </span>
                </div>
                {isAccordionOpen ? (
                  <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                )}
              </button>

              {isAccordionOpen && (
                <div className="flex flex-col gap-2.5 pt-2 border-t border-surface-container text-xs sm:text-sm">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between py-2 bg-surface-container-low rounded-xl px-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80"
                        alt="Ember Margherita Pizza"
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-surface-container"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-on-surface truncate text-xs sm:text-sm">
                          Ember Margherita Pizza
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          1x • Extra Char Basil
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-on-surface flex-shrink-0 text-xs sm:text-sm">
                      $18.50
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between py-2 bg-surface-container-low rounded-xl px-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src="https://images.unsplash.com/photo-1562967914-608f82629710?w=200&auto=format&fit=crop&q=80"
                        alt="Smoked Maple Tenders"
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-surface-container"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-on-surface truncate text-xs sm:text-sm">
                          Smoked Maple Tenders
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          1x • Rosemary Dip
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-on-surface flex-shrink-0 text-xs sm:text-sm">
                      $10.00
                    </span>
                  </div>

                  {/* Breakdown footer */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-surface-container text-on-surface-variant text-xs">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>$26.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Taxes &amp; Packaging</span>
                      <span>$2.50</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-on-surface pt-1 border-t border-surface-container">
                      <span>Total Collected</span>
                      <span className="text-primary font-extrabold">
                        ${totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Host Concierge Assistance Help Card */}
            <div className="rounded-2xl bg-surface-container p-4 flex items-center justify-between border border-surface-container-high">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs sm:text-sm text-on-surface">
                    Need help finding counter?
                  </span>
                  <span className="text-xs text-on-surface-variant truncate">
                    Ask host concierge at entrance
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerNotice("Connecting with Bistro host concierge...")
                }
                className="px-3.5 py-2 rounded-xl bg-surface text-on-surface font-bold text-xs shadow-sm active:scale-95 transition-transform flex-shrink-0 hover:bg-surface-container-lowest"
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Notice Toast */}
      {noticeMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-xs w-full px-4 py-2.5 bg-inverse-surface text-inverse-on-surface rounded-full shadow-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all z-50 animate-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-secondary-fixed" />
          <span>{noticeMessage}</span>
        </div>
      )}
    </div>
  );
};
