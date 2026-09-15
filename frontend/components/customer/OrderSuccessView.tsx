"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Flame,
  UtensilsCrossed,
  MapPin,
  BadgeCheck,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  BellRing,
  Store,
  PhoneCall,
  Clock,
  Banknote,
  Heart,
  Coins,
} from "lucide-react";
import { LiveOrderTrackerView } from "./LiveOrderTrackerView";
import { PickupTrackerView } from "./PickupTrackerView";

import { useApi } from "@/lib/api";

interface OrderSuccessViewProps {
  orderRef?: string;
  paymentMethod?: "khqr" | "cod" | "counter";
  fulfillmentMode?: "delivery" | "pickup";
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  orderRef = "#AE-84920",
  paymentMethod,
  fulfillmentMode,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const targetOrderId =
    searchParams.get("order_id") ||
    searchParams.get("order_number") ||
    orderRef;

  // Fetch live order details to get exact fulfillment_type & restaurant data
  const { data: orderRes } = useApi<any>(
    targetOrderId ? "/customer-orders.php" : null,
    targetOrderId ? { order_id: targetOrderId } : undefined
  );

  const fetchedOrder = React.useMemo(() => {
    if (Array.isArray(orderRes?.data)) return orderRes.data[0];
    if (Array.isArray(orderRes)) return orderRes[0];
    if (orderRes?.data && typeof orderRes.data === "object") return orderRes.data;
    return null;
  }, [orderRes]);

  // Query param fallbacks
  const paymentParam =
    paymentMethod || (searchParams.get("payment") as "khqr" | "cod" | "counter") || "khqr";
  const modeParam =
    fulfillmentMode || (searchParams.get("mode") as "delivery" | "pickup") || "delivery";

  const effectiveMode = fetchedOrder?.fulfillment_type || modeParam;

  const rawTip = searchParams.get("tip");
  const tipParam = rawTip !== null ? parseFloat(rawTip) : 2.50;
  const subtotal = 34.50;
  const packagingAndTax = 1.20;
  const deliveryFee = 2.00;
  const totalAmount = subtotal + packagingAndTax + deliveryFee + tipParam;

  // If Pickup, render PickupTrackerView directly!
  if (effectiveMode === "pickup") {
    return (
      <PickupTrackerView
        orderRef={targetOrderId}
        paymentMethod={paymentParam === "khqr" ? "Paid via KHQR" : paymentParam === "cod" ? "Cash on Delivery" : "Pay at Counter"}
      />
    );
  }

  // Render LiveOrderTrackerView for live delivery tracking!
  if (targetOrderId || (paymentParam === "khqr" && effectiveMode === "delivery")) {
    return <LiveOrderTrackerView orderRef={targetOrderId} />;
  }

  // Pickup mode returns early above; any code reaching here is delivery mode
  const isPickup = false;

  const getPaymentBadge = () => {
    switch (paymentParam) {
      case "khqr":
        return {
          label: "Paid via KHQR",
          bg: "bg-[#2E6F40]/10 text-[#2E6F40]",
        };
      case "cod":
        return {
          label: "Cash on Delivery",
          bg: "bg-primary/10 text-primary",
        };
      case "counter":
        return {
          label: "Pay at Counter",
          bg: "bg-secondary-fixed/50 text-on-secondary-fixed-variant",
        };
      default:
        return {
          label: "Payment Pending",
          bg: "bg-surface-container text-on-surface-variant",
        };
    }
  };

  const paymentBadge = getPaymentBadge();

  return (
    <div className="bg-surface text-on-surface font-sans text-sm min-h-screen flex flex-col items-center selection:bg-primary/20 selection:text-primary pb-16">
      {/* Sticky Top Header */}
      <header className="sticky top-0 w-full max-w-md mx-auto z-40 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-lg flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="Go back to menu"
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src="/logo.jpg"
              alt="Amber & Ember Bistro Logo"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-primary/20"
            />
            <h1 className="font-bold text-base text-on-surface truncate">
              Order Confirmed
            </h1>
          </div>

          <button
            type="button"
            onClick={() => router.push("/customer-profile")}
            aria-label="User Profile"
            className="w-10 h-10 flex items-center justify-center rounded-full p-0.5 hover:ring-2 hover:ring-primary/40 transition-all flex-shrink-0 overflow-hidden border border-outline-variant/50"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiE9xKCdnv_bglgxg_2LERQbUBlAt1FErmCjJlM_VLK5dW_V-8xiETqMbrDniEM2ZCbQDo_2QKUNG1OinMh1B4XXpwt9n7cccMS_56WCxtMvDwQxsI8pYloDdLducI9tPkTmY9k1J9DgWvY0tNX2DVDPQwP05xPeK0_ZTRvRRrm17jeMPPglgidJwtV3vvobKKha1REpz9pb_kGucgUkNYqPL8qWHCW-ebONnap7f-tdnyxqvtE7Q9"
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-col relative w-full max-w-md px-space-lg pt-4 min-h-screen bg-surface">
        <div className="flex flex-col w-full pb-8">
          {/* Success Celebration Visual & Status Anchor */}
          <div className="relative flex flex-col items-center pt-4 pb-6 text-center overflow-hidden">
            {/* Subtle Ambient Glow */}
            <div className="absolute w-44 h-44 rounded-full bg-secondary-container/20 blur-2xl -top-4 pointer-events-none" />

            {/* Checkmark Badge */}
            <div className="relative z-10 w-24 h-24 rounded-full bg-surface-container-lowest shadow-xl flex items-center justify-center mb-4">
              <div className="w-[72px] h-[72px] rounded-full bg-[#2E6F40]/10 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#2E6F40] flex items-center justify-center shadow-md shadow-[#2E6F40]/30 transform hover:scale-105 transition-transform duration-300">
                  <Check className="w-8 h-8 text-on-primary stroke-[3]" />
                </div>
              </div>

              {/* Miniature hearth ember badge overlap */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shadow-md">
                <Flame className="w-4 h-4 text-on-primary fill-white" />
              </div>
            </div>

            {/* Heading Group */}
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-1">
              Order Placed Successfully
            </span>
            <h2 className="font-extrabold text-2xl text-on-surface mb-2 tracking-tight">
              Order Confirmed!
            </h2>
            <p className="text-xs text-on-surface-variant max-w-[320px] mx-auto px-2 leading-relaxed">
              Thank you! Amber & Ember kitchen has received your order and
              started preparing your wood-fired dishes.
            </p>
          </div>

          {/* Real-Time Prep Banner */}
          <div className="relative bg-surface-container-lowest rounded-xl p-4 shadow-md mb-4 flex items-center justify-between gap-3 overflow-hidden border border-surface-container/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                {isPickup ? (
                  <Store className="w-6 h-6 text-primary" />
                ) : (
                  <UtensilsCrossed className="w-6 h-6 text-primary animate-pulse" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase text-secondary font-bold tracking-wider">
                  {isPickup ? "Estimated Pickup" : "Estimated Delivery"}
                </p>
                <p className="font-bold text-sm text-on-surface truncate">
                  {isPickup ? "15–20 Mins" : "30–40 Mins"}{" "}
                  <span className="text-xs font-normal text-on-surface-variant">
                    (~7:45 PM)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                {isPickup ? "Preparing" : "Preparing"}
              </span>
            </div>
          </div>

          {/* Cash Collection Guidance Card (COD Mode) */}
          {paymentParam === "cod" && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4 flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-amber-800" />
                  <span className="font-extrabold text-sm text-amber-950">
                    Cash Payment Required
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider">
                  Pay Driver
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-[11px] text-amber-900/80 uppercase font-bold">
                    Exact Cash for Courier
                  </p>
                  <p className="text-2xl font-extrabold text-amber-950 tracking-tight">
                    ${totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="text-right text-xs text-amber-900/80 space-y-0.5">
                  <p>Food & Tax: ${ (subtotal + packagingAndTax).toFixed(2) }</p>
                  <p>Delivery Fee: ${ deliveryFee.toFixed(2) }</p>
                  <p className="text-amber-800 font-bold">Courier Tip: ${ tipParam.toFixed(2) }</p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-500/20 text-xs text-amber-950/90 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-800 shrink-0" />
                <span>Please prepare exact cash to give your delivery driver upon drop-off.</span>
              </div>
            </div>
          )}

          {/* Primary Order Details Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-md p-4 flex flex-col gap-4 mb-4 border border-surface-container/80">
            {/* Order Identifiers & Pill Tags */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container bg-surface-container-low/50 -mx-4 -mt-4 p-4 rounded-t-xl">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-medium">
                  Order Reference
                </span>
                <span className="font-extrabold text-sm text-on-surface tracking-tight">
                  {orderRef}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${paymentBadge.bg}`}
                >
                  <BadgeCheck className="w-3 h-3" />
                  {paymentBadge.label}
                </span>
              </div>
            </div>

            {/* Destination Details */}
            <div className="flex items-start gap-3 pt-1">
              <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5 text-on-surface">
                {isPickup ? (
                  <Store className="w-5 h-5 text-on-surface" />
                ) : (
                  <MapPin className="w-5 h-5 text-on-surface fill-on-surface/20" />
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">
                  {isPickup ? "Pickup Location" : "Delivery Address"}
                </span>
                <p className="font-semibold text-xs text-on-surface truncate">
                  {isPickup
                    ? "Amber & Ember Kitchen Counter"
                    : "244 Oak Street, Apt 4B"}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {isPickup
                    ? "742 Evergreen Terrace, Culinary Row"
                    : "Leave at door • Contactless"}
                </p>
              </div>
              <button
                type="button"
                className="text-primary font-bold text-xs px-2 py-1 rounded-lg hover:bg-surface-container transition-colors"
              >
                Notes
              </button>
            </div>

            {/* Step Progress Mini Tracker */}
            <div className="py-1">
              <div className="flex items-center justify-between text-[11px] mb-1.5 text-on-surface-variant">
                <span className="text-primary font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Kitchen Smoker Active
                </span>
                <span>
                  {isPickup ? "Ready at Counter" : "Driver Assigning"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex">
                <div className="w-2/5 h-full bg-primary rounded-full transition-all duration-500" />
              </div>
            </div>

            {/* Itemized Breakdown Snippet */}
            <div className="pt-1 border-t border-surface-container">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold block mb-2">
                Dishes Ordered
              </span>

              {/* Item 1 */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 border border-surface-container-high">
                    <img
                      src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80"
                      alt="Smoked Bacon Truffle Burger"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-on-surface truncate">
                      Smoked Bacon Truffle Burger
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      1 × Handcrafted Patty • Medium
                    </p>
                  </div>
                </div>
                <span className="font-bold text-xs text-on-surface ml-2 flex-shrink-0">
                  $19.75
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 border border-surface-container-high">
                    <img
                      src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80"
                      alt="Wood-fired Burrata Pizza"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-on-surface truncate">
                      Wood-fired Burrata Pizza
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      1 × Prosciutto di Parma • 12-inch
                    </p>
                  </div>
                </div>
                <span className="font-bold text-xs text-on-surface ml-2 flex-shrink-0">
                  $18.00
                </span>
              </div>

              {/* Payment Summary Row */}
              <div className="flex items-center justify-between pt-3 mt-2 bg-surface-container-low -mx-4 -mb-4 p-4 rounded-b-xl border-t border-surface-container/60">
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold block uppercase tracking-wider">
                    {paymentParam === "cod" ? "Total COD Amount to Pay" : "Total Amount Paid"}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Includes taxes, delivery fee & ${tipParam.toFixed(2)} courier tip
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-base text-primary tracking-tight">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reassuring Kitchen Live Notification Banner */}
          <div className="bg-secondary-fixed/40 rounded-xl p-3.5 mb-5 flex items-center gap-3 border border-secondary-fixed/60">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-on-secondary">
              <BellRing className="w-4 h-4" />
            </div>
            <p className="text-xs text-on-secondary-fixed leading-tight font-medium">
              We will send live courier updates via SMS & in-app notification
              when your bag departs the hearth.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-2.5 w-full">
            {/* Primary Order Tracking / Get My Food CTA */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full h-12 rounded-full bg-primary hover:bg-primary-container active:scale-[0.98] transition-all text-on-primary font-extrabold text-base shadow-xl shadow-primary/25 flex items-center justify-center gap-2 group"
            >
              <span>{isPickup ? "Get My Food" : "Track Order Live"}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Back To Menu Action */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full h-12 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm border border-surface-container-high"
            >
              <UtensilsCrossed className="w-4 h-4 text-tertiary" />
              <span>Back to Menu</span>
            </button>
          </div>

          {/* Friendly Footer Note */}
          <div className="mt-5 text-center pb-2">
            <p className="text-[11px] text-tertiary">
              Need to modify kitchen notes?{" "}
              <a
                href="tel:055538290"
                className="text-primary font-bold underline inline-flex items-center gap-0.5"
              >
                <PhoneCall className="w-3 h-3" /> Call Bistro Counter
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
