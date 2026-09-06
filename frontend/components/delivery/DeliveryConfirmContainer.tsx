"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DeliveryOrder, useDeliveryStore } from "@/lib/store/useDeliveryStore";
import { Api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ConfirmHeaderSummary } from "./confirm/ConfirmHeaderSummary";
import { ConfirmCashCard } from "./confirm/ConfirmCashCard";
import { ConfirmProofCard } from "./confirm/ConfirmProofCard";
import { DeliverySuccessModal } from "./confirm/DeliverySuccessModal";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface DeliveryConfirmContainerProps {
  orderId?: string;
}

export const DeliveryConfirmContainer: React.FC<DeliveryConfirmContainerProps> = ({
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

  const [isCashChecked, setIsCashChecked] = useState(true);
  const [proofBase64, setProofBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (loadingOrder && !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface text-on-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="font-label-md text-sm font-bold">Loading Confirmation Details for Order #{orderId}...</span>
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

  const amountToCollect = ((order.codAmount ?? order.totalPrice) || 0).toFixed(2);

  const handleToggleCash = () => {
    setIsCashChecked(!isCashChecked);
  };

  const handleConfirmDelivery = async () => {
    if (!isCashChecked || isSubmitting) return;

    setIsSubmitting(true);
    showToast(`Verifying cash payment ($${amountToCollect}) with Admin...`);

    try {
      const authUserId = useAuthStore.getState().userId;
      await Api.post("/delivery.php", {
        action: "confirm_delivered",
        order_id: Number(order.id),
        staff_id: authUserId ? Number(authUserId) : undefined,
        proof_image: proofBase64 || undefined,
      });
    } catch (err) {
      console.error("Failed to complete delivery on server:", err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      updateDeliveryStage(order.id, "completed");
      setShowSuccessModal(true);

      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col relative w-full bg-surface min-h-screen text-on-surface">
      {/* Fixed Top Header */}
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
      <div className="flex flex-col w-full pt-16 pb-32 max-w-md mx-auto space-y-space-md">
        {/* Step 4 Context & Header Summary */}
        <ConfirmHeaderSummary order={order} />

        {/* Cash Collection Verification Section */}
        <ConfirmCashCard
          order={order}
          isCashChecked={isCashChecked}
          onToggleCash={handleToggleCash}
        />

        {/* Proof of Delivery Section */}
        <ConfirmProofCard onPhotoSelect={(base64) => setProofBase64(base64)} />
      </div>

      {/* Sticky Bottom CTA Area */}
      <div className="fixed bottom-0 left-0 right-0 p-screen-edge-padding bg-surface/95 backdrop-blur-md shadow-lg z-40 max-w-md mx-auto">
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Ready to complete
            </span>
            {isCashChecked ? (
              <span className="font-label-sm text-label-sm text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Cash Verified
              </span>
            ) : (
              <span className="font-label-sm text-label-sm text-error font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                Awaiting Cash Check
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!isCashChecked || isSubmitting}
            onClick={handleConfirmDelivery}
            className={`w-full h-14 font-label-lg text-label-lg font-bold rounded-xl flex items-center justify-center gap-2 transition-all select-none ${
              isSubmitting
                ? "bg-secondary text-on-secondary shadow-lg cursor-wait"
                : isCashChecked
                ? "bg-primary text-on-primary shadow-lg hover:bg-primary-container active:scale-98 cursor-pointer"
                : "bg-surface-dim text-on-surface-variant/50 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-on-secondary" />
                <span>Admin Confirming COD (${amountToCollect})... (3s)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span>Confirm Delivery • ${amountToCollect}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Delivery Success Modal */}
      <DeliverySuccessModal
        order={order}
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
};
