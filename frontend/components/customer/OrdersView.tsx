"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UtensilsCrossed,
  Flame,
  QrCode,
  Truck,
  CheckCircle2,
  Banknote,
  RotateCcw,
  Headphones,
  ArrowRight,
  ChevronRight,
  Clock,
  Store,
  XCircle,
  ShieldCheck,
  Receipt,
  X,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { useApi } from "@/lib/api";

const getStatusInfo = (status: string) => {
  const st = (status || "pending").toLowerCase();
  switch (st) {
    case "pending":
      return {
        label: "Order Received",
        step: "Step 1 of 4",
        percent: 25,
        color: "bg-amber-500/10 text-amber-700",
      };
    case "accepted":
      return {
        label: "Accepted by Kitchen",
        step: "Step 2 of 4",
        percent: 45,
        color: "bg-blue-500/10 text-blue-700",
      };
    case "preparing":
      return {
        label: "Preparing Food",
        step: "Step 2 of 4",
        percent: 65,
        color: "bg-secondary-fixed text-on-secondary-fixed-variant",
      };
    case "ready_for_pickup":
    case "ready_for_delivery":
      return {
        label: "Ready for Dispatch",
        step: "Step 3 of 4",
        percent: 85,
        color: "bg-indigo-500/10 text-indigo-700",
      };
    case "on_the_way":
      return {
        label: "Out for Delivery",
        step: "Step 3 of 4",
        percent: 90,
        color: "bg-primary/10 text-primary font-bold",
      };
    case "completed":
    case "delivered":
      return {
        label: "Delivered",
        step: "Completed",
        percent: 100,
        color: "bg-emerald-500/10 text-emerald-700",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        step: "Cancelled",
        percent: 0,
        color: "bg-red-500/10 text-red-700",
      };
    case "refunded":
      return {
        label: "Refunded",
        step: "Refunded",
        percent: 0,
        color: "bg-purple-500/10 text-purple-700",
      };
    default:
      return {
        label: status,
        step: "In Progress",
        percent: 50,
        color: "bg-primary/10 text-primary",
      };
  }
};

const getPaymentLabel = (method: string) => {
  const m = (method || "").toLowerCase();
  if (m === "khqr") return "Paid (KHQR)";
  if (m === "cash_on_delivery" || m === "cod") return "Cash on Delivery";
  if (m === "cash_at_counter" || m === "counter") return "Pay at Counter";
  return method || "Pending";
};

export const OrdersView: React.FC = () => {
  const router = useRouter();
  const { token, userId, phone, email } = useAuthStore();
  const { customerPhone: cartPhone } = useCartStore();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!token && !userId && !phone && !cartPhone) {
      setShowLoginPrompt(true);
    }
  }, [token, userId, phone, cartPhone]);

  const targetPhone = phone || cartPhone || email || "";
  const endpoint =
    targetPhone || userId
      ? `/customer-orders.php?phone=${encodeURIComponent(targetPhone)}${
          userId ? `&user_id=${userId}` : ""
        }`
      : `/customer-orders.php`;

  const {
    data: fetchedOrders,
    loading,
    error,
  } = useApi<any[]>(endpoint);

  const orders = Array.isArray(fetchedOrders) ? fetchedOrders : [];

  const isCompletedOrEnded = (status: string) => {
    const st = (status || "").toLowerCase();
    return (
      st === "delivered" ||
      st === "completed" ||
      st === "cancelled" ||
      st === "refunded"
    );
  };

  const activeOrders = orders.filter((o) => !isCompletedOrEnded(o.status));
  const historyOrders = orders.filter((o) => isCompletedOrEnded(o.status));

  return (
    <main className="flex flex-col relative w-full max-w-md px-4 pt-4 pb-28 bg-surface min-h-screen">
      {/* Title & Sub-header */}
      <div className="flex items-end justify-between mb-4 pt-2">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold block">
            Kitchen Dispatch
          </span>
          <h1 className="text-2xl text-on-surface font-extrabold tracking-tight">
            My Orders
          </h1>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1 rounded-full text-on-surface-variant border border-surface-container-highest/60">
          <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold">
            {orders.length} Total
          </span>
        </div>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="relative bg-surface-container-high p-1 rounded-full flex items-center mb-6 shadow-sm border border-surface-container-highest/50">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 rounded-full text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === "active"
              ? "font-bold text-on-primary bg-primary shadow-sm"
              : "font-medium text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span>Active Orders</span>
          <span
            className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-full leading-none ${
              activeTab === "active"
                ? "bg-surface-container-lowest text-primary"
                : "bg-surface-variant text-on-surface-variant"
            }`}
          >
            {activeOrders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 rounded-full text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === "history"
              ? "font-bold text-on-primary bg-primary shadow-sm"
              : "font-medium text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span>Order History</span>
          <span
            className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-full leading-none ${
              activeTab === "history"
                ? "bg-surface-container-lowest text-primary"
                : "bg-surface-variant text-on-surface-variant"
            }`}
          >
            {historyOrders.length}
          </span>
        </button>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-2 text-primary font-bold text-xs">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Fetching live orders from kitchen...</span>
        </div>
      )}

      {/* ACTIVE ORDERS SECTION */}
      {!loading && activeTab === "active" && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                In Progress
              </span>
            </div>
            <span className="text-xs text-secondary font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Est. Arrival 20–30 min
            </span>
          </div>

          {activeOrders.map((order: any) => {
            const statusInfo = getStatusInfo(order.status);
            const totalAmount =
              typeof order.total_amount === "string"
                ? parseFloat(order.total_amount)
                : Number(order.total_amount || 0);
            const items = Array.isArray(order.items) ? order.items : [];
            const itemCount = items.reduce(
              (acc: number, it: any) => acc + (Number(it.quantity) || 1),
              0,
            );

            return (
              <div
                key={order.id || order.order_number}
                className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden border border-surface-container/80"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary-container to-secondary" />

                {/* Restaurant Outlet Header */}
                <div className="flex items-center justify-between pb-2 border-b border-surface-container/60 pt-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 border border-primary/20">
                      {order.restaurant_logo ? (
                        <img
                          src={order.restaurant_logo}
                          alt={order.restaurant_name || "Restaurant"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <span className="font-extrabold text-xs text-on-surface truncate">
                      {order.restaurant_name || "Amber & Ember Woodfired Bistro"}
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant shrink-0">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Today"}
                  </span>
                </div>

                {/* Top info line */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-extrabold text-sm text-primary tracking-tight truncate">
                      #{order.order_number || `ORD-${order.id}`}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                    {order.fulfillment_type === "pickup" ? (
                      <>
                        <Store className="w-3.5 h-3.5 text-secondary" /> Pickup
                      </>
                    ) : (
                      <>
                        <Truck className="w-3.5 h-3.5 text-primary" /> Delivery
                      </>
                    )}
                  </span>
                </div>

                {/* Dual Status Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusInfo.color}`}
                  >
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{statusInfo.label}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                    <QrCode className="w-3.5 h-3.5 text-secondary" />
                    <span>{getPaymentLabel(order.payment_method)}</span>
                  </div>
                </div>

                {/* Order Content Thumbnails & Item Names */}
                <div className="bg-surface-container-low rounded-lg p-2 flex items-center gap-3 my-0.5 border border-surface-container/60">
                  <div className="relative flex -space-x-3 overflow-hidden shrink-0 pl-1 py-0.5">
                    {items.slice(0, 3).map((item: any, i: number) => (
                      <img
                        key={i}
                        className="w-10 h-10 rounded-full object-cover shadow-sm bg-surface-variant border-2 border-surface-container-lowest"
                        alt={item.food_name || item.name}
                        src={
                          item.image_url ||
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                        }
                      />
                    ))}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-on-surface">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate">
                      {items
                        .map(
                          (it: any) =>
                            `${it.quantity}x ${it.food_name || it.name}`,
                        )
                        .join(", ")}
                    </p>
                  </div>
                </div>

                {/* Progress Meter */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-on-surface-variant font-medium">
                      {order.fulfillment_type === "pickup"
                        ? "Kitchen is preparing your order"
                        : "Courier dispatch in progress"}
                    </span>
                    <span className="text-primary font-bold">
                      {statusInfo.step}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${statusInfo.percent}%` }}
                    />
                  </div>
                </div>

                {/* Footer & Action */}
                <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold">
                      Total
                    </span>
                    <span className="font-extrabold text-base text-primary">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/order-success?order_id=${encodeURIComponent(
                          order.order_number || order.id,
                        )}`,
                      )
                    }
                    className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <span>Track Live</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {activeOrders.length === 0 && (
            <div className="text-center py-12 bg-surface-container-lowest rounded-xl p-6 border border-surface-container">
              <UtensilsCrossed className="w-12 h-12 text-outline mx-auto mb-2 opacity-40" />
              <p className="font-bold text-on-surface text-base">
                No active orders in progress
              </p>
              <p className="text-xs text-on-surface-variant mt-1 mb-4">
                Your active food orders will show up here with real-time status tracking.
              </p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-xs hover:bg-primary-container transition-all"
              >
                Browse Menu
              </button>
            </div>
          )}
        </div>
      )}

      {/* ORDER HISTORY SECTION */}
      {!loading && activeTab === "history" && (
        <div className="flex flex-col gap-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">
              Past Orders History ({historyOrders.length})
            </h2>
          </div>

          {historyOrders.map((order: any) => {
            const statusInfo = getStatusInfo(order.status);
            const totalAmount =
              typeof order.total_amount === "string"
                ? parseFloat(order.total_amount)
                : Number(order.total_amount || 0);
            const items = Array.isArray(order.items) ? order.items : [];
            const itemCount = items.reduce(
              (acc: number, it: any) => acc + (Number(it.quantity) || 1),
              0,
            );
            const isCancelled =
              order.status === "cancelled" || order.status === "refunded";

            return (
              <div
                key={order.id || order.order_number}
                className={`bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-2.5 border transition-colors ${
                  isCancelled
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-surface-container/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-extrabold text-sm text-on-surface tracking-tight truncate">
                      #{order.order_number || `ORD-${order.id}`}
                    </span>
                    <span className="text-tertiary text-xs">•</span>
                    <span className="text-xs text-on-surface-variant truncate">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "Past Order"}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                    {order.fulfillment_type === "pickup" ? (
                      <>
                        <Store className="w-3 h-3 text-secondary" /> Pickup
                      </>
                    ) : (
                      <>
                        <Truck className="w-3 h-3 text-primary" /> Delivery
                      </>
                    )}
                  </span>
                </div>

                {/* Status row */}
                <div className="flex flex-wrap items-center gap-2 my-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusInfo.color}`}
                  >
                    {isCancelled ? (
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    )}
                    {statusInfo.label}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                    <Banknote className="w-3.5 h-3.5 text-secondary" />
                    {getPaymentLabel(order.payment_method)}
                  </span>
                </div>

                {/* Details */}
                <div className="flex items-center gap-2.5 py-1">
                  <div className="relative flex -space-x-3 overflow-hidden shrink-0">
                    {items.slice(0, 2).map((item: any, i: number) => (
                      <img
                        key={i}
                        className="w-9 h-9 rounded-lg object-cover bg-surface-variant border border-surface-container-high"
                        alt={item.food_name || item.name}
                        src={
                          item.image_url ||
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                        }
                      />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-on-surface truncate">
                      {itemCount} {itemCount === 1 ? "item" : "items"} •{" "}
                      {items
                        .map((it: any) => it.food_name || it.name)
                        .join(", ")}
                    </p>
                    {order.delivery_address && (
                      <span className="text-[11px] text-on-surface-variant block truncate">
                        {order.delivery_address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom price & reorder */}
                <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-extrabold text-sm text-on-surface">
                      ${totalAmount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      Total
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/cart")}
                    className="bg-surface-container-high hover:bg-surface-container text-on-surface px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all border border-surface-container-highest/60"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-primary" />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            );
          })}

          {historyOrders.length === 0 && (
            <div className="text-center py-8 bg-surface-container-lowest rounded-xl p-4 border border-surface-container">
              <p className="text-xs text-on-surface-variant font-medium">
                No past order history found.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Culinary Warmth Touch / Assistance Card */}
      <div className="mt-6 bg-surface-container-low rounded-xl p-4 flex items-center gap-3 border border-surface-container/80">
        <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
          <Headphones className="w-5 h-5 text-on-secondary-fixed-variant" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-on-surface">
            Need help with an order?
          </p>
          <p className="text-[11px] text-on-surface-variant truncate">
            Our host stand is ready to assist.
          </p>
        </div>
        <a
          href="tel:055538290"
          className="text-primary text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-surface-variant/60 transition-colors border border-primary/20 flex-shrink-0"
        >
          Contact
        </a>
      </div>

      {/* Sign In Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Receipt className="w-7 h-7 text-primary" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-on-surface">
                Sign In Required
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Please sign in or register an account to view your active order status and order history.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => router.push("/login?redirect=/orders")}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary-container transition-all"
              >
                Sign In / Register
              </button>
              <button
                type="button"
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-2.5 rounded-xl bg-surface-container-low text-on-surface-variant font-semibold text-xs hover:bg-surface-container transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
