"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  Phone,
  MapPin,
  DoorOpen,
  ChevronDown,
  ChevronUp,
  Flame,
  Receipt,
  Sparkles,
  RefreshCw,
  Clock,
  Radio,
  Hourglass,
  CheckCircle,
  Send,
  ShoppingBag,
  X,
} from "lucide-react";
import { LiveOrderMap } from "./LiveOrderMap";
import { useApi } from "@/lib/api";

interface LiveOrderTrackerViewProps {
  orderRef?: string;
}

export const LiveOrderTrackerView: React.FC<LiveOrderTrackerViewProps> = ({
  orderRef = "ORD-33113",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeOrderNum =
    searchParams.get("order_id") ||
    searchParams.get("order_number") ||
    orderRef;

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");
  const [liveOrder, setLiveOrder] = useState<any>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasAutoOpenedCompletion, setHasAutoOpenedCompletion] = useState(false);

  // Fetch store settings for store HQ coordinates
  const { data: settingsRes } = useApi<any>("/settings.php");
  const settings = settingsRes?.data || settingsRes || {};

  const storeLat = parseFloat(settings.store_latitude || "13.352270");
  const storeLng = parseFloat(settings.store_longitude || "103.955116");
  const storeName = settings.store_name || "Amber & Ember Bistro";
  const storeAddress =
    settings.store_address || "520 N Michigan Ave, Siem Reap";

  const triggerNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // Live 3-second Polling Function
  const fetchLiveOrderData = useCallback(async () => {
    if (!activeOrderNum) return;
    try {
      const res = await fetch(
        `http://localhost:8000/api/customer-orders.php?order_id=${encodeURIComponent(
          activeOrderNum,
        )}`,
      );
      if (res.ok) {
        const result = await res.json();
        const rawData = result?.data;
        if (Array.isArray(rawData) && rawData.length > 0) {
          setLiveOrder(rawData[0]);
        } else if (rawData && typeof rawData === "object") {
          setLiveOrder(rawData);
        }
        setLastSyncTime(
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        );
      }
    } catch (err) {
      console.warn("Live order polling error:", err);
    }
  }, [activeOrderNum]);

  // Set up 3-second polling interval
  useEffect(() => {
    fetchLiveOrderData();
    const interval = setInterval(() => {
      fetchLiveOrderData();
    }, 3000); // 3000ms = 3 seconds polling

    return () => clearInterval(interval);
  }, [fetchLiveOrderData]);

  // Derived location & status values from live API response
  const status = (liveOrder?.status || "pending").toLowerCase();
  const isConfirmedByAdmin = status !== "pending";
  const isCompleted =
    status === "completed" || status === "delivered" || status === "picked_up";

  // Auto-trigger completion celebration popup modal when order finishes
  useEffect(() => {
    if (isCompleted && !hasAutoOpenedCompletion) {
      setShowCompletionModal(true);
      setHasAutoOpenedCompletion(true);
    }
  }, [isCompleted, hasAutoOpenedCompletion]);

  const deliveryAddress = liveOrder?.delivery_address || "Siem Reap, Cambodia";

  const customerLat = liveOrder?.delivery_lat
    ? parseFloat(liveOrder.delivery_lat)
    : storeLat - 0.012;
  const customerLng = liveOrder?.delivery_lng
    ? parseFloat(liveOrder.delivery_lng)
    : storeLng + 0.018;

  // Real driver assignment data (strictly no fake dummy driver data)
  const driverName = liveOrder?.delivery_staff_name || undefined;
  const driverPhone = liveOrder?.delivery_staff_phone || undefined;

  const items = Array.isArray(liveOrder?.items) ? liveOrder.items : [];
  const totalAmount =
    typeof liveOrder?.total_amount === "string"
      ? parseFloat(liveOrder.total_amount)
      : Number(liveOrder?.total_amount || 0);

  // Status mapping for progress percentage & labels
  const getStatusProgress = (st: string) => {
    switch (st) {
      case "pending":
        return {
          label: "Pending Admin Confirmation",
          percent: 15,
          badge: "Awaiting Admin",
          stepNum: 1,
        };
      case "accepted":
        return {
          label: "Order Confirmed by Admin",
          percent: 40,
          badge: "Accepted",
          stepNum: 2,
        };
      case "preparing":
        return {
          label: "Cooking in Kitchen",
          percent: 65,
          badge: "Preparing",
          stepNum: 2,
        };
      case "ready_for_delivery":
      case "ready_for_pickup":
        return {
          label: "Ready for Dispatch",
          percent: 80,
          badge: "Packed & Ready",
          stepNum: 3,
        };
      case "on_the_way":
        return {
          label: "Out for Delivery",
          percent: 90,
          badge: "En Route",
          stepNum: 3,
        };
      case "delivered":
      case "completed":
        return {
          label: "Delivered",
          percent: 100,
          badge: "Delivered",
          stepNum: 4,
        };
      case "cancelled":
        return {
          label: "Order Cancelled",
          percent: 0,
          badge: "Cancelled",
          stepNum: 0,
        };
      default:
        return { label: st, percent: 30, badge: "Processing", stepNum: 1 };
    }
  };

  const statusProgress = getStatusProgress(status);

  return (
    <div className="bg-surface text-on-surface font-sans text-sm min-h-screen flex flex-col items-center selection:bg-primary/20 selection:text-primary pb-20">
      {/* Sticky Top Header */}
      <header className="sticky top-0 w-full max-w-md mx-auto z-40 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="Go back"
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src="/logo.jpg"
              alt="Bistro Logo"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-primary/20"
            />
            <div className="flex flex-col min-w-0">
              <h1 className="font-bold text-sm text-on-surface truncate">
                Live Order Status
              </h1>
              <span className="text-[10px] text-primary font-extrabold truncate">
                #{activeOrderNum}
              </span>
            </div>
          </div>

          {/* 3-Second Live Polling Indicator Badge */}
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span>LIVE SYNC (3s)</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-col relative w-full max-w-md px-4 pt-4 min-h-screen bg-surface">
        <div className="flex flex-col w-full pb-8 gap-4">
          {/* PENDING ADMIN CONFIRMATION GUARD CARD */}
          {!isConfirmedByAdmin && (
            <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-5 text-center flex flex-col items-center gap-3 shadow-md animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center relative">
                <Hourglass
                  className="w-7 h-7 text-amber-700 animate-spin"
                  style={{ animationDuration: "6s" }}
                />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                </span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-400/50">
                  Waiting for Admin / Kitchen Confirmation
                </span>
                <h3 className="font-extrabold text-lg text-on-surface mt-2.5">
                  Order Submitted — Pending Approval
                </h3>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto mt-1 leading-relaxed">
                  Your order{" "}
                  <strong className="text-on-surface">#{activeOrderNum}</strong>{" "}
                  has been received by our system. Our admin &amp; kitchen team
                  are reviewing your order details.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-full border border-amber-500/30 text-[11px] text-amber-900 font-bold mt-1 shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
              </div>
            </div>
          )}

          {/* CONFIRMED ORDER HEADER BANNER */}
          {isConfirmedByAdmin && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3 text-emerald-800 font-bold text-xs animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-xs text-emerald-900">
                  Order Confirmed by Admin / Kitchen!
                </p>
                <p className="text-[11px] text-emerald-700 font-normal truncate">
                  Status: {statusProgress.label}
                </p>
              </div>
            </div>
          )}

          {/* Live Interactive Leaflet Map Card */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-surface-container-high h-64 border border-surface-container-high">
            <LiveOrderMap
              storeLat={storeLat}
              storeLng={storeLng}
              storeName={storeName}
              storeAddress={storeAddress}
              customerLat={customerLat}
              customerLng={customerLng}
              customerAddress={deliveryAddress}
              driverName={driverName}
              orderStatus={statusProgress.label}
            />

            {/* Top Floating Signal Pill Overlay */}
            <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-surface-container/60 z-10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-on-surface tracking-tight">
                Live Map ({lastSyncTime})
              </span>
            </div>

            {/* Manual Refresh Map Control */}
            <button
              type="button"
              aria-label="Refresh Location"
              onClick={() => {
                fetchLiveOrderData();
                triggerNotice("Synced live GPS data with kitchen server");
              }}
              className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center text-on-surface active:scale-95 transition-all hover:bg-surface-container z-10"
            >
              <RefreshCw className="w-4 h-4 text-primary" />
            </button>
          </div>

          {/* Status & Timing Highlight Card */}
          <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-surface-container/80">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
                  Order Status
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold text-xl text-on-surface">
                    {statusProgress.label}
                  </span>
                </div>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs font-bold text-xs border border-primary/20">
                <Bike className="w-4 h-4" />
                <span>{statusProgress.badge}</span>
              </div>
            </div>

            {/* Dynamic Linear Progress Meter */}
            <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden mt-1">
              <div
                className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${statusProgress.percent}%` }}
              />
            </div>

            <div className="flex items-center gap-2 text-on-surface-variant pt-0.5">
              <Flame className="w-4 h-4 text-primary flex-shrink-0 fill-primary/20" />
              <p className="text-xs leading-tight">
                {status === "on_the_way" && driverName ? (
                  <>
                    <strong className="text-on-surface font-semibold">
                      {driverName}
                    </strong>{" "}
                    is carrying your order to your door.
                  </>
                ) : status === "preparing" || status === "accepted" ? (
                  <>
                    Food is currently being prepared in the kitchen. Courier
                    will pick up when ready.
                  </>
                ) : (
                  <>
                    Our kitchen team is reviewing your order details before
                    starting preparation.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Delivery Location Card */}
          <div className="w-full bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm flex items-start gap-3 border border-surface-container/80">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
              <MapPin className="w-5 h-5 fill-primary text-primary" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                Customer Delivery Location
              </span>
              <p className="font-bold text-xs text-on-surface truncate">
                {deliveryAddress}
              </p>
              <div className="inline-flex items-center gap-1 mt-1 text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md text-[11px] w-fit">
                <DoorOpen className="w-3.5 h-3.5" />
                <span className="italic">Contactless Handoff</span>
              </div>
            </div>
          </div>

          {/* Courier Contact Card (Strictly live data, no fake driver names) */}
          <div className="w-full bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3 border border-surface-container/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 font-bold text-sm">
                🛵
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="font-bold text-xs text-on-surface truncate">
                  {driverName ||
                    (status === "on_the_way"
                      ? "Bistro Express Courier"
                      : "Courier Assignment Pending")}
                </h2>
                <span className="text-[11px] text-on-surface-variant truncate">
                  {driverName
                    ? "Assigned Bistro Driver"
                    : "Will be assigned when food is ready"}
                </span>
              </div>
            </div>

            {driverPhone && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`tel:${driverPhone}`}
                  onClick={() =>
                    triggerNotice(`Calling courier ${driverPhone}...`)
                  }
                  className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container active:scale-95 transition-all shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Timeline Stepper */}
          <div className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-surface-container/80">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-on-surface">
                Order Progress Timeline
              </h3>
              <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
              </span>
            </div>

            <div className="relative flex flex-col gap-4 ml-1">
              <div className="absolute top-3 bottom-4 left-3 w-0.5 bg-surface-variant -translate-x-1/2" />
              <div
                className="absolute top-3 left-3 w-0.5 bg-primary -translate-x-1/2 transition-all duration-500"
                style={{ height: `${statusProgress.percent}%` }}
              />

              {/* Step 1: Order Submitted */}
              <div className="relative flex items-start gap-3">
                <div className="relative z-10 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 flex justify-between items-baseline min-w-0 pt-0.5">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-on-surface">
                      Order Submitted
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Order ticket sent to admin dashboard
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2: Admin Confirmation */}
              <div className="relative flex items-start gap-3">
                <div
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                    isConfirmedByAdmin
                      ? "bg-surface-container-lowest text-primary"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {isConfirmedByAdmin ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Hourglass className="w-3.5 h-3.5 animate-spin" />
                  )}
                </div>
                <div className="flex-1 flex justify-between items-baseline min-w-0 pt-0.5">
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`font-bold text-xs ${isConfirmedByAdmin ? "text-on-surface" : "text-amber-700"}`}
                    >
                      {isConfirmedByAdmin
                        ? "Admin / Kitchen Confirmed"
                        : "Waiting for Admin Confirmation"}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {isConfirmedByAdmin
                        ? "Kitchen approved order"
                        : "Pending admin review"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 3: Dispatch & Delivery */}
              <div className="relative flex items-start gap-3">
                <div
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                    status === "on_the_way" || status === "delivered"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-variant text-tertiary"
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 flex flex-col min-w-0 pt-0.5 bg-surface-container-low p-2.5 rounded-xl border border-surface-container-high">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-xs text-on-surface">
                      Dispatch &amp; Delivery
                    </span>
                    <span className="text-[10px] text-primary font-bold">
                      {statusProgress.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {status === "on_the_way"
                      ? "Courier has picked up food and is moving towards your location."
                      : "Courier will pick up and transport food once kitchen finishes cooking."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Order Accordion */}
          <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-surface-container/80">
            <button
              type="button"
              onClick={() => setIsAccordionOpen((prev) => !prev)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                <span className="font-bold text-xs text-on-surface">
                  Order Summary ({items.length || 1} items)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-primary">
                  ${totalAmount.toFixed(2)}
                </span>
                {isAccordionOpen ? (
                  <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                )}
              </div>
            </button>

            {isAccordionOpen && (
              <div className="px-3.5 pb-3.5 flex flex-col gap-2 border-t border-surface-container pt-2 text-xs">
                {items.map((it: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded bg-surface-container flex items-center justify-center font-bold text-[11px] text-on-surface">
                        {it.quantity}×
                      </span>
                      <span className="font-semibold text-on-surface truncate">
                        {it.food_name || it.name}
                      </span>
                    </div>
                    <span className="font-semibold text-on-surface">
                      $
                      {(
                        (parseFloat(it.price) || 0) * (it.quantity || 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-1 border-t border-surface-container font-bold text-on-surface">
                  <span>Total Amount</span>
                  <span className="text-primary text-sm font-extrabold">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ORDER COMPLETED CELEBRATION POPUP MODAL */}
      {showCompletionModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowCompletionModal(false)}
        >
          <div
            className="relative flex flex-col items-center max-w-sm w-full bg-surface-container-lowest p-6 rounded-3xl shadow-2xl space-y-4 text-center border border-border/40 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowCompletionModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Icon Badge */}
            <div className="relative w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shadow-inner">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>

            {/* Title & Khmer Subtitle */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>ORDER COMPLETED / ប្រគល់ជូនរួចរាល់</span>
              </div>
              <h2 className="font-headline-sm text-xl font-extrabold text-on-surface tracking-tight pt-1">
                Order #{activeOrderNum} Delivered!
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Thank you for ordering with {storeName}! Your meal has been
                freshly prepared and delivered.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="w-full bg-surface-container-low p-3.5 rounded-2xl border border-border/30 text-xs space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">
                  Customer:
                </span>
                <span className="font-bold text-on-surface truncate max-w-[180px]">
                  {liveOrder?.customer_name || "Valued Customer"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">
                  Status:
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] uppercase">
                  ✓ Verified & Delivered
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/20">
                <span className="font-bold text-on-surface">Total Amount:</span>
                <span className="font-extrabold text-primary text-sm">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-full pt-1">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-xl font-bold text-xs transition-colors"
              >
                Close &amp; View Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notice Toast */}
      {noticeMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-xs w-full px-4 py-2.5 bg-inverse-surface text-inverse-on-surface rounded-full shadow-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all z-50 animate-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-secondary-fixed" />
          <span>{noticeMessage}</span>
        </div>
      )}
    </div>
  );
};

export default LiveOrderTrackerView;
