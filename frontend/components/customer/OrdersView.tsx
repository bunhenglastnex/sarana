"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export const OrdersView: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [showCustomerRefundProof, setShowCustomerRefundProof] = useState(false);

  return (
    <main className="flex flex-col relative w-full max-w-md px-screen-edge-padding pt-4 pb-28 bg-surface min-h-screen">
      {/* Title & Sub-header */}
      <div className="flex items-end justify-between mb-space-md pt-2">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold block">
            Kitchen Dispatch
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
            My Orders
          </h1>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-high px-space-xs py-1 rounded-full text-on-surface-variant border border-surface-container-highest/60">
          <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
          <span className="font-label-sm text-label-sm font-semibold">
            5 Total
          </span>
        </div>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="relative bg-surface-container-high p-1 rounded-full flex items-center mb-space-lg shadow-sm border border-surface-container-highest/50">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 rounded-full font-label-lg text-label-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
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
            1
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 rounded-full font-label-lg text-label-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
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
            4
          </span>
        </button>
      </div>

      {/* ACTIVE ORDERS SECTION */}
      {activeTab === "active" && (
        <div className="flex flex-col gap-space-md animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-bold">
                In Progress
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Est. Arrival 18–24 min
            </span>
          </div>

          {/* Live Active Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.06)] flex flex-col gap-space-sm relative overflow-hidden border border-surface-container/80">
            {/* Ambient hearth glow strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary-container to-secondary" />

            {/* Top info line */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-headline-sm text-headline-sm font-extrabold text-on-surface tracking-tight truncate">
                  #AE-84920
                </span>
                <span className="text-tertiary text-xs">•</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Today, 7:15 PM
                </span>
              </div>
              <span className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold">
                <Truck className="w-3.5 h-3.5 text-primary" /> Delivery
              </span>
            </div>

            {/* Dual Status Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Order status */}
              <div className="inline-flex items-center gap-1.5 bg-secondary-fixed text-on-secondary-fixed-variant px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold shadow-xs">
                <Flame className="w-3.5 h-3.5 text-secondary fill-secondary" />
                <span>Out for Delivery</span>
              </div>
              {/* Payment status */}
              <div className="inline-flex items-center gap-1.5 bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold">
                <QrCode className="w-3.5 h-3.5 text-secondary" />
                <span>Paid (KHQR)</span>
              </div>
            </div>

            {/* Order Content with Visual Thumbnails */}
            <div className="bg-surface-container-low rounded-lg p-space-xs flex items-center gap-3 my-0.5 border border-surface-container/60">
              <div className="relative flex -space-x-4 overflow-hidden shrink-0 pl-1 py-0.5">
                <img
                  className="w-12 h-12 rounded-full object-cover shadow-sm bg-surface-variant border-2 border-surface-container-lowest"
                  alt="Smoked Bacon Truffle Burger"
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80"
                />
                <img
                  className="w-12 h-12 rounded-full object-cover shadow-sm bg-surface-variant border-2 border-surface-container-lowest"
                  alt="Wood-fired Burrata Pizza"
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    2 items
                  </span>
                  <span className="text-tertiary text-xs">•</span>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">
                    Chef's Signature
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Smoked Bacon Truffle Burger, Burrata Pizza
                </p>
              </div>
            </div>

            {/* Progress Meter */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex justify-between items-center font-label-sm text-label-sm">
                <span className="text-on-surface-variant font-medium">
                  Bistro Courier is approaching
                </span>
                <span className="text-primary font-bold">Step 3 of 4</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden flex">
                <div className="bg-primary h-full rounded-full w-3/4 transition-all duration-500" />
              </div>
            </div>

            {/* Footer & Action */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Total Amount
                </span>
                <span className="font-price-lg text-price-lg font-extrabold text-primary">
                  $37.70
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  router.push("/order-success?mode=delivery&payment=khqr")
                }
                className="bg-primary hover:bg-primary-container text-on-primary px-space-md py-2.5 rounded-full font-label-lg text-label-lg font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all group"
              >
                <span>Track Order Live</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER HISTORY SECTION */}
      {(activeTab === "history" || activeTab === "active") && (
        <div className="flex flex-col gap-space-sm mt-space-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {activeTab === "active"
                ? "Recent Past Orders"
                : "All Past Orders"}
            </h2>
            {activeTab === "active" && (
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className="font-label-md text-label-md text-primary font-bold hover:underline flex items-center gap-0.5"
              >
                <span>See All (4)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Past Order 1 */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.04)] flex flex-col gap-space-xs border border-surface-container/80 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-headline-sm text-headline-sm font-extrabold text-on-surface tracking-tight truncate">
                  #AE-82104
                </span>
                <span className="text-tertiary text-xs">•</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Oct 24, 2024
                </span>
              </div>
              <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <Store className="w-3.5 h-3.5 text-secondary" /> Pickup
              </span>
            </div>

            {/* Status row */}
            <div className="flex flex-wrap items-center gap-2 my-1">
              <span className="inline-flex items-center gap-1 bg-surface-variant text-on-surface-variant px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Completed
              </span>
              <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-medium">
                <Banknote className="w-3.5 h-3.5 text-secondary" />
                Paid at Counter
              </span>
            </div>

            {/* Details */}
            <div className="flex items-center gap-2.5 py-1">
              <img
                className="w-10 h-10 rounded-lg object-cover bg-surface-variant shrink-0 border border-surface-container-high"
                alt="Crispy Chicken Tenders"
                src="https://images.unsplash.com/photo-1562967914-608f82629710?w=200&auto=format&fit=crop&q=80"
              />
              <div className="min-w-0 flex-1">
                <p className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  3 items • Crispy Tenders, Artisan Lemonade, Truffle Fries
                </p>
                <span className="font-body-sm text-body-sm text-on-surface-variant block truncate">
                  Bistro Pickup Counter • No contact
                </span>
              </div>
            </div>

            {/* Bottom price & reorder */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
              <div className="flex items-baseline gap-1.5">
                <span className="font-price-lg text-price-lg text-on-surface font-extrabold">
                  $28.50
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Total
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/cart")}
                className="bg-surface-container-high hover:bg-surface-container text-on-surface px-space-md py-2 rounded-full font-label-md text-label-md font-bold flex items-center gap-1.5 active:scale-95 transition-all border border-surface-container-highest/60"
              >
                <RotateCcw className="w-3.5 h-3.5 text-primary" />
                <span>Reorder</span>
              </button>
            </div>
          </div>

          {/* Past Order 2 */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.04)] flex flex-col gap-space-xs border border-surface-container/80 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-headline-sm text-headline-sm font-extrabold text-on-surface tracking-tight truncate">
                  #AE-79410
                </span>
                <span className="text-tertiary text-xs">•</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Oct 12, 2024
                </span>
              </div>
              <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <Truck className="w-3.5 h-3.5 text-primary" /> Delivery
              </span>
            </div>

            {/* Status row */}
            <div className="flex flex-wrap items-center gap-2 my-1">
              <span className="inline-flex items-center gap-1 bg-surface-variant text-on-surface-variant px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Delivered
              </span>
              <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-medium">
                <Banknote className="w-3.5 h-3.5 text-secondary" />
                Paid (Cash on Delivery)
              </span>
            </div>

            {/* Details */}
            <div className="flex items-center gap-2.5 py-1">
              <img
                className="w-10 h-10 rounded-lg object-cover bg-surface-variant shrink-0 border border-surface-container-high"
                alt="Skillet Hanger Steak"
                src="https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80"
              />
              <div className="min-w-0 flex-1">
                <p className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  2 items • Skillet Hanger Steak, Glazed Carrots
                </p>
                <span className="font-body-sm text-body-sm text-on-surface-variant block truncate">
                  Delivered to 244 Oak St, Apt 4B
                </span>
              </div>
            </div>

            {/* Bottom price & reorder */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
              <div className="flex items-baseline gap-1.5">
                <span className="font-price-lg text-price-lg text-on-surface font-extrabold">
                  $34.00
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Total
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/cart")}
                className="bg-surface-container-high hover:bg-surface-container text-on-surface px-space-md py-2 rounded-full font-label-md text-label-md font-bold flex items-center gap-1.5 active:scale-95 transition-all border border-surface-container-highest/60"
              >
                <RotateCcw className="w-3.5 h-3.5 text-primary" />
                <span>Reorder</span>
              </button>
            </div>
          </div>

          {/* Past Order 3: Cancelled & Refunded KHQR Order */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.04)] flex flex-col gap-space-xs border border-error/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-headline-sm text-headline-sm font-extrabold text-on-surface tracking-tight truncate">
                  #AE-81992
                </span>
                <span className="text-tertiary text-xs">•</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Today, 6:45 PM
                </span>
              </div>
              <span className="inline-flex items-center gap-1 bg-error-container/30 text-error px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold">
                <XCircle className="w-3.5 h-3.5 text-error" /> Cancelled
              </span>
            </div>

            {/* Cancelled Banner & Refund Settlement Status */}
            <div className="bg-error-container/15 p-2.5 rounded-lg border border-error/20 flex flex-col gap-1 my-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-xs font-bold text-error flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Refunded $41.50 to your ABA Bank Account
                </span>
              </div>
              <p className="font-body-sm text-[11px] text-on-surface-variant">
                Kitchen note: <span className="italic text-on-surface">“Hearth-Smoked Ribs sold out tonight.”</span>
              </p>
            </div>

            {/* Details */}
            <div className="flex items-center gap-2.5 py-1">
              <img
                className="w-10 h-10 rounded-lg object-cover bg-surface-variant shrink-0 border border-surface-container-high"
                alt="Smoked Ribs Platter"
                src="https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80"
              />
              <div className="min-w-0 flex-1">
                <p className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  2 items • Smoked Angus Ribs, Truffle Fries
                </p>
                <span className="font-body-sm text-body-sm text-emerald-700 font-bold block truncate">
                  ✓ KHQR Payment Settled &amp; Refunded
                </span>
              </div>
            </div>

            {/* Bottom price & View ABA Refund Receipt Button */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
              <div className="flex items-baseline gap-1.5">
                <span className="font-price-lg text-price-lg text-on-surface font-extrabold line-through text-on-surface-variant">
                  $41.50
                </span>
                <span className="font-label-sm text-xs font-bold text-emerald-700">
                  $0.00 (Refunded)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomerRefundProof(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full font-label-sm text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>View Refund Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER REFUND PROOF RECEIPT MODAL */}
      {showCustomerRefundProof && (
        <div
          onClick={() => setShowCustomerRefundProof(false)}
          className="fixed inset-0 bg-on-surface/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-2xl max-w-xs w-full p-4 shadow-2xl space-y-3 border border-border/40"
          >
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ABA Bank Refund Receipt (#AE-81992)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomerRefundProof(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-56 rounded-xl overflow-hidden bg-surface-container-highest border border-border/20 shadow-inner">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10"
                alt="ABA Bank Refund Transfer Proof"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-xl text-xs space-y-1 border border-border/20">
              <div className="flex justify-between font-label-sm text-[11px] text-on-surface-variant">
                <span>Refund Amount:</span>
                <span className="font-bold text-emerald-700">$41.50 USD</span>
              </div>
              <div className="flex justify-between font-label-sm text-[11px] text-on-surface-variant">
                <span>Transfer Type:</span>
                <span className="font-semibold text-on-surface">ABA Mobile Instant</span>
              </div>
              <div className="flex justify-between font-label-sm text-[11px] text-on-surface-variant">
                <span>Status:</span>
                <span className="font-bold text-emerald-700">✓ Transfer Verified</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCustomerRefundProof(false)}
              className="w-full py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-sm text-xs font-bold transition-colors"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Culinary Warmth Touch / Assistance Card */}
      <div className="mt-space-lg bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-sm border border-surface-container/80">
        <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
          <Headphones className="w-5 h-5 text-on-secondary-fixed-variant" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label-md text-label-md font-bold text-on-surface">
            Need help with an order?
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
            Our host stand is ready at the hearth.
          </p>
        </div>
        <a
          href="tel:055538290"
          className="text-primary font-label-sm text-label-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-surface-variant/60 transition-colors border border-primary/20 flex-shrink-0"
        >
          Contact
        </a>
      </div>
    </main>
  );
};
