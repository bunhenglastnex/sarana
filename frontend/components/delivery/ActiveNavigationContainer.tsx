"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeliveryStore } from "@/lib/store/useDeliveryStore";
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
  orderId = "1024",
}) => {
  const router = useRouter();
  const { getOrderById, updateDeliveryStage, showToast, fetchLiveOrders } = useDeliveryStore();

  React.useEffect(() => {
    fetchLiveOrders();
  }, [fetchLiveOrders]);

  const order = getOrderById(orderId) || getOrderById("1024")!;

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
    router.push(`/delivery/${order.id}/confirm`);
  };

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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFgSCPH_D_P89baxhACYIj6Q2wbutJp62w19yulHEwoZj5uLw76X4auNlAQwC8QilaCC7ZLj8lg9-ds-zz6T47rTJ4pvLNsLVPjiItTdbl9mP6acLkdxcLMMIaLmJVi5XnnJ-J7Tk_h5KKbA1v3WW4xKpKXVsqigU8wcQTFIr37DBLz_ayvnYjOXC3Z9qpsw4ABYD21JrhKAmJ_4qduv1qd2qJIzLO0Bg-EoEkquOYxLGiPTrgQqDx"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col w-full pt-16 pb-[100px]">
        {/* Turn-by-Turn Real-time Floating Guidance HUD */}
        <ActiveNavigationHUD />

        {/* Interactive Map Canvas Container */}
        <NavigationMapCanvas />

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
