"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { DeliveryOrder, useDeliveryStore } from "@/lib/store/useDeliveryStore";
import { ActiveNavigationHUD } from "./navigation/ActiveNavigationHUD";
import { NavigationMapCanvas } from "./navigation/NavigationMapCanvas";
import { NavigationCustomerCard } from "./navigation/NavigationCustomerCard";
import {
  ArrowLeft,
  CheckCircle2,
  X,
  Check,
  Loader2,
} from "lucide-react";

interface ActiveNavigationContainerProps {
  orderId?: string;
}

export const ActiveNavigationContainer: React.FC<ActiveNavigationContainerProps> = ({
  orderId = "1",
}) => {
  const router = useRouter();
  const { avatarUrl } = useAuthStore();
  const userAvatar = avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
  const { getOrderById, fetchOrderById, updateDeliveryStage, showToast, fetchLiveOrders } = useDeliveryStore();

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

  const [showSmsToast, setShowSmsToast] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSendQuickSms = () => {
    setShowSmsToast(true);
    setTimeout(() => {
      setShowSmsToast(false);
    }, 4000);
  };

  const handleConfirmDelivered = () => {
    if (order) {
      router.push(`/delivery/${order.id}/confirm`);
    }
  };

  if (loadingOrder && !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface text-on-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="font-label-md text-sm font-bold">Loading Navigation Data for Order #{orderId}...</span>
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

  return (
    <div className="flex flex-col relative w-full bg-surface min-h-screen text-on-surface">
      {/* Fixed Navigation Top Header */}
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
              Active Order Navigation
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
      <div className="flex flex-col w-full pt-16 pb-[100px]">
        {/* Turn-by-Turn Real-time Floating Guidance HUD */}
        <ActiveNavigationHUD />

        {/* Interactive Leaflet Map Canvas Container */}
        <NavigationMapCanvas order={order} />

        {/* Delivery Order Operational Card */}
        <NavigationCustomerCard
          order={order}
          onSendQuickSms={handleSendQuickSms}
        />

        {/* Quick SMS Toast Banner */}
        {showSmsToast && (
          <div className="px-screen-edge-padding my-space-xs max-w-md mx-auto w-full">
            <div className="w-full bg-inverse-surface text-inverse-on-surface p-space-sm rounded-xl flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-space-xs">
                <CheckCircle2 className="w-5 h-5 text-secondary-container" />
                <span className="font-body-md text-body-md font-medium">
                  Auto-sent: "Arriving in 5 mins!"
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSmsToast(false)}
                className="text-surface-variant hover:text-surface-bright p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Primary Sticky Bottom Delivery Completion Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 w-full px-screen-edge-padding py-space-sm bg-surface/95 backdrop-blur-xl shadow-2xl max-w-md mx-auto">
          <button
            type="button"
            disabled={isVerifying || isCompleted}
            onClick={handleConfirmDelivered}
            className={`w-full h-14 rounded-xl flex items-center justify-center gap-space-xs shadow-xl transition-all ${
              isCompleted
                ? "bg-emerald-600 text-white cursor-default"
                : isVerifying
                ? "bg-secondary text-on-secondary cursor-wait"
                : "bg-primary text-on-primary hover:bg-primary-container active:scale-[0.98]"
            }`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-on-secondary" />
                <span className="font-headline-sm text-headline-sm font-bold">
                  Verifying COD & Dropoff...
                </span>
              </>
            ) : isCompleted ? (
              <>
                <Check className="w-6 h-6 text-white" />
                <span className="font-headline-sm text-headline-sm font-bold">
                  Delivery Completed!
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-headline-sm text-headline-sm font-bold tracking-tight">
                  Confirm Delivered
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
