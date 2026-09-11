"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Lock,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Download,
  X,
  RefreshCw,
  Flame,
  Check,
  Upload,
  Maximize2,
  Loader2,
} from "lucide-react";
import { PaymentUploadModal } from "./PaymentUploadModal";
import { useApi, Api } from "@/lib/api";

interface KhqrPaymentViewProps {
  orderBillId?: string;
  totalUsd?: number;
  totalKhr?: number;
  merchantId?: string;
}

export const KhqrPaymentView: React.FC<KhqrPaymentViewProps> = ({
  orderBillId,
  totalUsd,
  totalKhr,
  merchantId = "AMBER_EMBER_BISTRO_01",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch admin settings for dynamic KHQR image
  const { data: settingsRes } = useApi<any>("/settings.php");
  const settings = settingsRes?.data || settingsRes || {};
  const rawKhqrUrl = settings.khqr_image_url || "";
  const formattedKhqrUrl = rawKhqrUrl
    ? rawKhqrUrl.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "") : "http://localhost:8000"}${rawKhqrUrl}`
      : rawKhqrUrl
    : "";

  const queryOrderBillId =
    searchParams?.get("order_id") || searchParams?.get("orderBillId");
  const queryAmountStr =
    searchParams?.get("amount") || searchParams?.get("totalUsd");
  const queryAmount = queryAmountStr ? parseFloat(queryAmountStr) : null;

  const displayBillId = orderBillId || queryOrderBillId || "#ORD-8942";
  const displayUsd =
    totalUsd !== undefined
      ? totalUsd
      : queryAmount !== null && !isNaN(queryAmount)
        ? queryAmount
        : 37.7;
  const displayKhr =
    totalKhr !== undefined ? totalKhr : Math.round(displayUsd * 4100);

  // Countdown Timer state (starts at 9 mins 48s = 588 seconds)
  const [timeLeft, setTimeLeft] = useState(588);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isWaitingAdminConfirm, setIsWaitingAdminConfirm] = useState(false);
  const [liveOrder, setLiveOrder] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload & Fullscreen Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFullscreenPreviewOpen, setIsFullscreenPreviewOpen] = useState(false);

  // 3-second Live Polling for Admin Order Confirmation
  const checkLiveOrderStatus = useCallback(async () => {
    if (!displayBillId) return;
    try {
      const cleanBillId = displayBillId.replace(/^#/, "");
      const res = await Api.get<any>("/customer-orders.php", {
        order_id: cleanBillId,
      });
      const rawData = res.data?.data || res.data;
      const targetOrder = Array.isArray(rawData) ? rawData[0] : rawData;
      if (targetOrder) {
        setLiveOrder(targetOrder);

          const status = (targetOrder.status || "pending").toLowerCase();
          const paymentStatus = (
            targetOrder.payment_status || "pending"
          ).toLowerCase();

          // Check if Admin has confirmed order or verified payment!
          const isConfirmedByAdmin =
            status !== "pending" ||
            paymentStatus === "verified" ||
            paymentStatus === "paid" ||
            paymentStatus === "approved";

          if (isConfirmedByAdmin && !isVerified) {
            setIsVerifying(false);
            setIsWaitingAdminConfirm(false);
            setIsVerified(true);
            setToastMessage("✓ Payment Confirmed by Admin! Redirecting...");
            setTimeout(() => {
              router.push(
                `/order-success?order_id=${encodeURIComponent(targetOrder.order_number || cleanBillId)}`,
              );
            }, 1000);
          }
        }
    } catch (err) {
      console.warn("Error polling KHQR payment status:", err);
    }
  }, [displayBillId, router, isVerified]);

  useEffect(() => {
    checkLiveOrderStatus();
    const interval = setInterval(checkLiveOrderStatus, 3000);
    return () => clearInterval(interval);
  }, [checkLiveOrderStatus]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenUploadModal = () => {
    if (isVerified) return;
    setIsUploadModalOpen(true);
  };

  const handleConfirmUpload = async (imageUrl: string) => {
    setIsUploadModalOpen(false);
    setIsVerifying(true);
    setIsWaitingAdminConfirm(true);
    triggerToast("Payment slip submitted! Waiting for admin confirmation...");

    try {
      const cleanBillId = displayBillId.replace(/^#/, "");
      await Api.post("/api/customer-orders.php", {
        action: "upload_proof",
        order_id: cleanBillId,
        payment_proof_url: imageUrl,
      });
    } catch (err) {
      console.error("Failed to upload payment slip:", err);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-sans text-sm min-h-screen flex flex-col items-center selection:bg-primary/20 selection:text-primary pb-16">
      {/* Top Navigation Bar with Back Button */}
      <header className="sticky top-0 w-full max-w-md mx-auto z-40 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-lg flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
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
              Bakong KHQR Payment
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
        <div className="flex flex-col w-full pb-8 gap-space-lg">
          {/* Amount Header */}
          <div className="flex flex-col gap-1 items-center text-center px-space-xs pt-space-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="font-bold text-xs">
                KHQR Instant Merchant Checkout
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-extrabold text-3xl text-primary tracking-tight">
                ${displayUsd.toFixed(2)}
              </span>
              <span className="font-bold text-sm text-tertiary">USD</span>
            </div>

            <div className="flex items-center gap-1.5 text-on-surface-variant font-semibold text-xs">
              <span>Equivalent to</span>
              <span className="font-bold text-sm text-on-surface">
                ៛ {displayKhr.toLocaleString()}
              </span>
              <span>KHR</span>
            </div>
          </div>

          {/* Payment Window Countdown Bar */}
          <div className="flex items-center justify-between px-space-md py-2.5 bg-surface-container-low rounded-xl shadow-sm border border-surface-container/60">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary flex-shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                  Payment Window
                </span>
                <span className="font-extrabold text-sm text-primary tracking-wider tabular-nums">
                  {formatTimer(timeLeft)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 bg-surface-container-highest rounded-full text-tertiary text-xs">
              <Lock className="w-3 h-3 text-outline" />
              <span className="font-semibold text-[11px]">Do not refresh</span>
            </div>
          </div>

          {/* KHQR Card Wrapper */}
          <div className="relative bg-surface-container-lowest rounded-xl shadow-lg overflow-hidden flex flex-col border border-surface-container/80 max-w-[360px] mx-auto w-full">
            {/* Red KHQR Top Banner */}
            <div className="bg-primary px-3.5 py-2 flex items-center justify-between text-on-primary">
              <div className="flex items-center gap-1.5">
                <div className="px-1.5 py-0.5 bg-surface-container-lowest rounded text-primary font-extrabold text-[11px] tracking-tighter leading-none">
                  KHQR
                </div>
                <span className="font-semibold text-[11px] tracking-wide opacity-95">
                  Bakong Accepted
                </span>
              </div>

              <div className="flex items-center gap-1 opacity-90 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official QR</span>
              </div>
            </div>

            {/* QR Code Body */}
            <div className="p-3.5 flex flex-col items-center">
              {/* Merchant Details */}
              <div className="flex items-center gap-2.5 w-full pb-2 mb-2 bg-surface-container-low p-2 rounded-lg border border-surface-container/60">
                <img
                  src="/logo.jpg"
                  alt="Amber & Ember Bistro Logo"
                  className="h-8 w-8 rounded-md object-cover bg-surface-container-lowest p-0.5 shadow-sm flex-shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-on-surface truncate">
                    Amber & Ember Bistro
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    MID: {merchantId}
                  </span>
                </div>
              </div>

              {/* Centered KHQR Code Graphic */}
              {formattedKhqrUrl ? (
                <div className="flex flex-col items-center gap-2 w-full my-1">
                  <div
                    onClick={() => setIsFullscreenPreviewOpen(true)}
                    className="relative group cursor-pointer p-2.5 bg-surface-container-lowest rounded-xl shadow-md flex flex-col items-center justify-center border border-surface-container-high hover:border-primary transition-all active:scale-[0.98] w-full max-w-[240px]"
                  >
                    <img
                      src={formattedKhqrUrl}
                      alt="Official Bakong KHQR Payment Code"
                      className="w-52 h-52 object-contain rounded-md shadow-xs bg-white p-1.5"
                    />

                    {/* Hover/Tap Overlay Hint */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center text-white gap-1.5 p-2">
                      <Maximize2 className="w-6 h-6 text-white animate-bounce" />
                      <span className="text-[11px] font-extrabold bg-black/70 px-3 py-1 rounded-full backdrop-blur-sm">
                        Tap for Full Screen Scan
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFullscreenPreviewOpen(true)}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 pt-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Tap QR Code for Full Screen Scan</span>
                  </button>
                </div>
              ) : null}

              {/* Bill & Transaction Footer */}
              <div className="flex items-center justify-between w-full mt-2.5 pt-1 text-on-surface-variant font-semibold text-[11px]">
                <span>Order Bill: {displayBillId}</span>
                <span className="font-mono text-tertiary">TXN: TXN-984210</span>
              </div>
            </div>
          </div>

          {/* Real-time Webhook Pulse */}
          <div className="flex items-center gap-space-sm p-3 bg-surface-container rounded-xl border border-surface-container-high">
            <span className="relative flex h-3 w-3 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-bold text-xs text-on-surface">
                Awaiting Bank Confirmation
              </span>
              <span className="text-[11px] text-on-surface-variant truncate">
                Listening to real-time Bakong network webhook
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-primary flex-shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
            </div>
          </div>

          {/* 3-Step Guide */}
          <div className="flex flex-col gap-2.5 bg-surface-container-low p-space-md rounded-xl border border-surface-container/60">
            <div className="flex items-center gap-1.5 text-on-surface font-bold text-sm mb-1">
              <Smartphone className="w-4 h-4 text-primary" />
              <span>Quick 3-Step Payment</span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-surface-container-highest text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-xs text-on-surface-variant">
                Open your mobile banking app{" "}
                <span className="text-on-surface font-semibold">
                  (ABA, Wing, ACLEDA, Bakong, etc.)
                </span>
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-surface-container-highest text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-xs text-on-surface-variant">
                Tap the{" "}
                <span className="text-on-surface font-semibold">Scan QR</span>{" "}
                button & frame this code
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-surface-container-highest text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-xs text-on-surface-variant">
                Confirm the exact payment of{" "}
                <span className="text-primary font-bold">
                  ${displayUsd.toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex flex-col gap-space-sm mt-1">
            {/* Live Loading Card: Waiting for Admin Confirmation */}
            {(isWaitingAdminConfirm ||
              liveOrder?.payment_status === "pending_review" ||
              isVerifying) &&
              !isVerified && (
                <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-2xl flex flex-col items-center text-center gap-2 shadow-sm animate-in fade-in mb-1">
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                  <span className="font-extrabold text-sm text-primary">
                    Waiting for Admin Confirmation...
                  </span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Payment slip submitted for{" "}
                    <strong className="text-on-surface">{displayBillId}</strong>
                    . Please stay on this screen while dispatch verifies your
                    payment.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest rounded-full text-[11px] font-bold text-primary border border-surface-container">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span>Polling payment confirmation (every 3s)...</span>
                  </div>
                </div>
              )}

            <button
              type="button"
              onClick={handleOpenUploadModal}
              disabled={
                isVerifying ||
                isVerified ||
                isWaitingAdminConfirm ||
                liveOrder?.payment_status === "pending_review"
              }
              className={`w-full py-4 px-space-md rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all ${
                isVerified
                  ? "bg-emerald-600 text-white cursor-default"
                  : isWaitingAdminConfirm ||
                      liveOrder?.payment_status === "pending_review" ||
                      isVerifying
                    ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-90"
                    : "bg-primary text-on-primary hover:bg-primary-container"
              }`}
            >
              {isVerified ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Payment Verified by Admin!</span>
                </>
              ) : isWaitingAdminConfirm ||
                liveOrder?.payment_status === "pending_review" ||
                isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span>Waiting for Admin Confirmation...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>I've Completed Payment (Upload Slip)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* POPUP MODAL: Upload Payment Slip Component */}
      <PaymentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onConfirmUpload={handleConfirmUpload}
      />

      {/* Full Screen Lightbox Modal for Scanning QR Code */}
      {isFullscreenPreviewOpen && formattedKhqrUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsFullscreenPreviewOpen(false)}
        >
          {/* Top Close Button */}
          <button
            type="button"
            onClick={() => setIsFullscreenPreviewOpen(false)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all z-10 shadow-lg"
            title="Close Preview"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative flex flex-col items-center max-w-sm w-full bg-white p-6 rounded-3xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-red-600 text-white rounded font-extrabold text-xs tracking-tight">
                  KHQR
                </div>
                <span className="font-bold text-sm text-gray-900">
                  Bakong Payment QR
                </span>
              </div>
              <span className="text-xs text-gray-500 font-extrabold">
                ${displayUsd.toFixed(2)} USD
              </span>
            </div>

            {/* High Resolution Enlarged QR Image */}
            <div className="relative p-2 bg-gray-50 rounded-2xl border border-gray-200 shadow-inner flex items-center justify-center">
              <img
                src={formattedKhqrUrl}
                alt="Bakong KHQR Fullscreen Preview"
                className="w-72 h-72 object-contain bg-white rounded-xl shadow-xs p-2"
              />
            </div>

            <div className="text-center space-y-1">
              <p className="font-extrabold text-sm text-gray-900">
                Amber &amp; Ember Bistro
              </p>
              <p className="text-xs text-gray-500 font-mono">
                Order Bill: {displayBillId} • Total: ${displayUsd.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <a
                href={formattedKhqrUrl}
                download="Bakong_KHQR_Payment.png"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Save Image</span>
              </a>
              <button
                type="button"
                onClick={() => setIsFullscreenPreviewOpen(false)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Done Scanning</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-xs w-full px-4 py-2.5 bg-inverse-surface text-inverse-on-surface rounded-full shadow-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all z-50 animate-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-secondary-fixed" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
