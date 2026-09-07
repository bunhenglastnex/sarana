"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NavigationMapCanvas } from "@/components/delivery/navigation/NavigationMapCanvas";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { DeliveryOrder, useDeliveryStore } from "@/lib/store/useDeliveryStore";
import {
  ArrowLeft,
  Clock,
  Banknote,
  Phone,
  MessageSquare,
  Navigation,
  MapPin,
  BellRing,
  UtensilsCrossed,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Check,
  Heart,
} from "lucide-react";

interface DeliveryOrderDetailViewProps {
  orderId?: string;
}

export const DeliveryOrderDetailView: React.FC<DeliveryOrderDetailViewProps> = ({
  orderId = "1",
}) => {
  const router = useRouter();
  const { avatarUrl } = useAuthStore();
  const { getOrderById, fetchOrderById, updateDeliveryStage, showToast, fetchLiveOrders } = useDeliveryStore();
  
  const userAvatar = avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
  const [liveOrder, setLiveOrder] = useState<DeliveryOrder | undefined>(() => getOrderById(orderId));
  const [loadingOrder, setLoadingOrder] = useState<boolean>(!liveOrder);

  React.useEffect(() => {
    fetchLiveOrders();
    if (orderId) {
      fetchOrderById(orderId).then((ord) => {
        if (ord) setLiveOrder(ord);
        setLoadingOrder(false);
      });
    }
  }, [orderId, fetchLiveOrders, fetchOrderById]);

  const order = liveOrder || getOrderById(orderId);

  const [currentStage, setCurrentStage] = useState<
    "accepted" | "picked_up" | "arrived" | "completed"
  >(order?.deliveryStage || "accepted");

  React.useEffect(() => {
    if (order?.deliveryStage) {
      setCurrentStage(order.deliveryStage);
    }
  }, [order?.deliveryStage]);

  // Get customer initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (loadingOrder && !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface text-on-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="font-label-md text-sm font-bold">Loading Order #{orderId}...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface text-on-surface p-6 text-center">
        <h2 className="font-headline-sm font-bold text-headline-sm text-on-surface mb-2">Order Not Found</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">Could not locate delivery order #{orderId}.</p>
        <button
          onClick={() => router.push("/delivery")}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-md text-label-md font-bold shadow-md"
        >
          Return to Kitchen Dispatch
        </button>
      </div>
    );
  }

  const handleStageAdvance = () => {
    if (currentStage === "accepted" || currentStage === "picked_up") {
      router.push(`/delivery/${order.id}/pickup`);
    } else if (currentStage === "arrived") {
      setCurrentStage("completed");
      updateDeliveryStage(order.id, "completed");
      showToast(`Order #${order.id} completed! Earnings added to history.`);
    }
  };

  const getStageButtonLabel = () => {
    if (currentStage === "accepted") return "Proceed to Restaurant Pickup";
    if (currentStage === "picked_up") return "Proceed to Restaurant Pickup";
    if (currentStage === "arrived")
      return order.paymentType === "cod"
        ? `Complete Delivery & Collect $${(
            order.codAmount || order.totalPrice
          ).toFixed(2)}`
        : "Complete Delivery & Mark Delivered";
    return "Delivery Completed ✓";
  };

  // Derive items list dynamically if itemsList is not defined
  const itemsToDisplay =
    order.itemsList && order.itemsList.length > 0
      ? order.itemsList
      : (order.itemsSummary || "").split(",").map((s, idx) => ({
          id: `fallback-${idx}`,
          name: s.trim(),
          quantity: 1,
          optionsNote: order.itemsNote || "Verified kitchen dish",
          image: order.itemImage,
          isVerified: true,
        }));

  return (
    <div className="flex flex-col relative w-full bg-surface min-h-screen text-on-surface">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-screen-edge-padding flex items-center justify-between gap-space-xs max-w-md mx-auto">
          <div className="flex items-center gap-space-xs min-w-0 flex-1">
            <button
              aria-label="Go back"
              type="button"
              onClick={() => router.back()}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface -ml-2 rounded-full hover:bg-surface-container-high transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <img
              alt="Amber & Ember Logo"
              className="h-8 w-8 rounded-md object-cover shrink-0 border border-outline-variant/40 shadow-xs"
              src="/logo.jpg"
            />
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight truncate leading-tight">
              Order Summary Details
            </h1>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/20">
              <img
                alt="Courier Profile"
                className="w-8 h-8 rounded-full object-cover"
                src={userAvatar}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col w-full pt-16 pb-[100px] max-w-md mx-auto">
        {/* Order Header & Live Timer Pill Banner */}
        <div className="px-screen-edge-padding pt-space-xs pb-space-sm flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                Order {order.orderNumber}
              </span>
              {order.timeAgo && (
                <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary font-bold">
                  Placed {order.timeAgo}
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              {order.prepStatus}
            </span>
          </div>

          {/* Estimated Delivery Window Badge */}
          <div className="bg-surface-container rounded-xl p-card-inner-padding flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Est. Drop-Off Window
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">
                  {order.estDropOffWindow || "7:25 PM – 7:35 PM"}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0 bg-primary-fixed text-on-primary-fixed-variant px-2.5 py-1 rounded-lg">
              <span className="font-label-md text-label-md font-bold block">
                {order.estTimeLeft || "~14m left"}
              </span>
            </div>
          </div>
        </div>

        {/* Cash Collect Urgent Banner */}
        <div className="px-screen-edge-padding mb-space-sm">
          {order.paymentType === "cod" ? (
            <div className="bg-secondary-fixed text-on-secondary-fixed rounded-xl p-card-inner-padding shadow-md flex items-center justify-between gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <div className="w-11 h-11 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                  <Banknote className="w-6 h-6 text-on-secondary" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-sm text-label-sm font-extrabold uppercase px-1.5 py-0.5 rounded bg-error text-on-error tracking-wider">
                      Unpaid
                    </span>
                    <span className="font-label-md text-label-md font-bold text-on-secondary-fixed">
                      Cash on Delivery
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-secondary-fixed-variant">
                    Collect exact cash upon arrival
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-label-sm text-label-sm text-on-secondary-fixed-variant uppercase font-semibold block">
                  To Collect
                </span>
                <span className="font-price-lg text-price-lg font-extrabold text-primary leading-tight">
                  ${(order.codAmount || order.totalPrice).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-high text-on-surface rounded-xl p-card-inner-padding shadow-sm flex items-center justify-between gap-space-xs border border-outline-variant/30">
              <div className="flex items-center gap-space-xs">
                <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    KHQR — Paid in Full
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {order.khqrNote || "Contactless Delivery"}
                  </span>
                </div>
              </div>
              <span className="font-label-sm text-label-sm font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                Prepaid
              </span>
            </div>
          )}

          {/* Customer Courier Tip Highlight Banner */}
          {order.tipAmount !== undefined && order.tipAmount > 0 && (
            <div className="mt-2.5 bg-secondary-fixed/50 border border-secondary/30 rounded-xl p-card-inner-padding flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-space-xs">
                <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 fill-on-secondary text-on-secondary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-bold text-on-secondary-fixed">
                    Courier Tip Included
                  </span>
                  <span className="font-body-sm text-body-sm text-on-secondary-fixed-variant">
                    100% added by customer for driver
                  </span>
                </div>
              </div>
              <span className="font-headline-sm text-headline-sm font-extrabold text-secondary bg-surface-container-lowest px-3 py-1 rounded-full shadow-xs">
                +${order.tipAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Delivery Customer Card */}
        <div className="px-screen-edge-padding mb-space-sm">
          <div className="bg-surface-container-lowest rounded-xl p-card-inner-padding shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-headline-sm text-headline-sm font-bold shrink-0">
                  {getInitials(order.customerName)}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">
                      {order.customerName}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {order.customerPhone || "+1 (555) 382-9012"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Connect Buttons */}
            <div className="grid grid-cols-2 gap-space-xs pt-1">
              <a
                href={`tel:${order.customerPhone || "+15553829012"}`}
                className="h-11 px-space-sm rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-dim active:scale-[0.98] transition-transform flex items-center justify-center gap-2 font-label-lg text-label-lg font-bold"
              >
                <Phone className="w-5 h-5 text-primary" />
                <span>Call Customer</span>
              </a>
              <a
                href={`sms:${order.customerPhone || "+15553829012"}`}
                className="h-11 px-space-sm rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-dim active:scale-[0.98] transition-transform flex items-center justify-center gap-2 font-label-lg text-label-lg font-bold"
              >
                <MessageSquare className="w-5 h-5 text-tertiary" />
                <span>Message</span>
              </a>
            </div>
          </div>
        </div>

        {/* Delivery Address & Map Card */}
        <div className="px-screen-edge-padding mb-space-sm">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col">
            {/* Live Interactive Navigation Map (Store HQ -> Driver GPS -> Customer Drop-off) */}
            <div className="w-full">
              <NavigationMapCanvas
                order={order}
                routeName={`${order.storeName || "Store HQ"} → ${order.customerName || "Customer"}`}
              />
            </div>

            {/* Address & Drop-Off Instruction Block */}
            <div className="p-card-inner-padding flex flex-col gap-space-xs">
              <div className="flex items-start gap-space-xs">
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">
                    {order.address}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {order.dropOffDistrict || "River North Culinary District"}
                  </span>
                </div>
              </div>

              {/* Courier Instruction Callout */}
              <div className="bg-surface-container-low rounded-lg p-space-xs flex items-start gap-2">
                <BellRing className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">
                    Drop-off Instruction
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    {order.dropOffInstruction ||
                      "Door code #4910. Ring bell twice, leave on vestibule shelf if no answer."}
                  </span>
                </div>
              </div>

              {/* Open Navigation CTA Button */}
              <a
                href={
                  order.deliveryLat && order.deliveryLng
                    ? `https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}`
                    : `https://maps.google.com/?q=${encodeURIComponent(order.address)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 mt-1 rounded-xl bg-on-surface text-surface flex items-center justify-center gap-2 font-label-lg text-label-lg font-bold shadow-md hover:bg-inverse-surface active:scale-[0.99] transition-transform"
              >
                <Navigation className="w-5 h-5 text-secondary-container" />
                <span>Open Navigation (Maps / Waze)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Ordered Food Items Breakdown ("Items to Verify") */}
        <div className="px-screen-edge-padding mb-space-lg">
          <div className="bg-surface-container-lowest rounded-xl p-card-inner-padding shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Items to Verify
                </span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                {itemsToDisplay.length} distinct {itemsToDisplay.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Render Items Dynamically */}
            {itemsToDisplay.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex gap-space-xs items-center bg-surface-container-low rounded-lg p-2.5"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug">
                    {item.quantity ? `${item.quantity}× ` : ""}{item.name}
                  </span>
                  {item.optionsNote && (
                    <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight mt-0.5">
                      {item.optionsNote}
                    </span>
                  )}
                </div>
                <div className="shrink-0 flex items-center pr-1 text-on-surface-variant">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                </div>
              </div>
            ))}

            {/* Kitchen Bag Seal Note */}
            <div className="flex items-center gap-2 pt-1 text-on-surface-variant">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="font-label-sm text-label-sm">
                Thermal tamper-evident bag seal intact
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar Action for Courier Flow */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl px-screen-edge-padding py-space-sm pb-safe shadow-[0_-4px_20px_-2px_rgba(26,23,21,0.08)] max-w-md mx-auto">
        <button
          type="button"
          disabled={currentStage === "completed"}
          onClick={handleStageAdvance}
          className={`w-full h-[52px] rounded-xl font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
            currentStage === "completed"
              ? "bg-emerald-600 text-white cursor-default"
              : "bg-primary text-on-primary hover:bg-primary-container active:scale-[0.98]"
          }`}
        >
          <span>{getStageButtonLabel()}</span>
          {currentStage === "completed" ? (
            <Check className="w-5 h-5" />
          ) : (
            <ArrowRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};
