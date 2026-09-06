'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import { PaymentUploadModal } from './PaymentUploadModal';

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
  merchantId = 'AMBER_EMBER_BISTRO_01',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryOrderBillId = searchParams?.get('order_id') || searchParams?.get('orderBillId');
  const queryAmountStr = searchParams?.get('amount') || searchParams?.get('totalUsd');
  const queryAmount = queryAmountStr ? parseFloat(queryAmountStr) : null;

  const displayBillId = orderBillId || queryOrderBillId || '#ORD-8942';
  const displayUsd = totalUsd !== undefined ? totalUsd : (queryAmount !== null && !isNaN(queryAmount) ? queryAmount : 37.70);
  const displayKhr = totalKhr !== undefined ? totalKhr : Math.round(displayUsd * 4100);

  // Countdown Timer state (starts at 9 mins 48s = 588 seconds)
  const [timeLeft, setTimeLeft] = useState(588);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveQr = () => {
    triggerToast('QR code image saved to gallery');
  };

  const handleOpenUploadModal = () => {
    if (isVerified) return;
    setIsUploadModalOpen(true);
  };

  const handleConfirmUpload = (imageUrl: string) => {
    setIsUploadModalOpen(false);
    setIsVerifying(true);
    setTimeout(() => {
      triggerToast('Payment slip uploaded & verified!');
      setTimeout(() => {
        setIsVerifying(false);
        setIsVerified(true);
        setTimeout(() => {
          router.push('/order-success?payment=khqr&mode=delivery');
        }, 800);
      }, 1200);
    }, 1500);
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
            onClick={() => router.push('/customer-profile')}
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
              <div className="relative p-2.5 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-center border border-surface-container-high">
                <svg
                  className="w-44 h-44 text-on-surface"
                  fill="none"
                  viewBox="0 0 240 240"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect fill="#FFFFFF" height="240" width="240" />
                  <rect fill="currentColor" height="64" width="64" x="16" y="16" />
                  <rect fill="#FFFFFF" height="48" width="48" x="24" y="24" />
                  <rect fill="currentColor" height="28" width="28" x="34" y="34" />
                  <rect fill="currentColor" height="64" width="64" x="160" y="16" />
                  <rect fill="#FFFFFF" height="48" width="48" x="168" y="24" />
                  <rect fill="currentColor" height="28" width="28" x="178" y="34" />
                  <rect fill="currentColor" height="64" width="64" x="16" y="160" />
                  <rect fill="#FFFFFF" height="48" width="48" x="24" y="168" />
                  <rect fill="currentColor" height="28" width="28" x="34" y="178" />
                  <path
                    d="M96 20h8v8h-8zm16 0h16v8h-16zm-8 16h8v8h-8zm24 0h8v16h-8zm-16 16h16v8h-16zm-8 16h8v8h-8zm24 0h16v8h-16z"
                    fill="currentColor"
                  />
                  <path
                    d="M20 96h8v16h-8zm16 8h16v8h-16zm-16 16h24v8h-24zm32 0h16v16h-16zm-32 24h8v8h-8zm16 0h8v8h-8zm16 8h8v8h-8z"
                    fill="currentColor"
                  />
                  <path
                    d="M160 96h8v8h-8zm16 0h16v8h-16zm24 8h8v16h-8zm-32 8h8v8h-8zm16 8h16v8h-16zm24 0h8v16h-8zm-40 16h8v8h-8z"
                    fill="currentColor"
                  />
                  <path
                    d="M96 160h16v8h-16zm24 8h8v8h-8zm-16 16h8v8h-8zm16 8h16v8h-16zm-24 16h8v16h-8zm24 0h8v8h-8zm-8 16h16v8h-16z"
                    fill="currentColor"
                  />
                  <path
                    d="M160 160h8v8h-8zm24 0h16v8h-16zm-8 16h8v16h-8zm24 8h8v16h-8zm-32 16h8v8h-8zm24 0h16v8h-16zm-16 16h8v8h-8z"
                    fill="currentColor"
                  />
                  <path
                    d="M88 88h16v16H88zm48 0h16v16h-16zm-32 32h16v16H104zm32 0h16v16h-16zm-16 24h16v16h-16z"
                    fill="currentColor"
                  />
                </svg>

                {/* Center Logo Overlay Icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-lowest p-1 shadow-md flex items-center justify-center border border-surface-container">
                    <div className="w-full h-full rounded-md bg-primary flex items-center justify-center text-on-primary">
                      <Flame className="w-4 h-4 fill-white text-white" />
                    </div>
                  </div>
                </div>
              </div>

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
                Open your mobile banking app{' '}
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
                Tap the <span className="text-on-surface font-semibold">Scan QR</span>{' '}
                button & frame this code
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-surface-container-highest text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-xs text-on-surface-variant">
                Confirm the exact payment of{' '}
                <span className="text-primary font-bold">${displayUsd.toFixed(2)}</span>
              </p>
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex flex-col gap-space-sm mt-1">
            <button
              type="button"
              onClick={handleOpenUploadModal}
              disabled={isVerifying || isVerified}
              className={`w-full py-3.5 px-space-md rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all ${
                isVerified
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Verifying with Bakong...</span>
                </>
              ) : isVerified ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Payment Verified!</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>I've Completed Payment</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-space-sm">
              <button
                type="button"
                onClick={handleSaveQr}
                className="w-full py-3 px-space-sm rounded-xl bg-surface-container-lowest border border-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all hover:bg-surface-container-low"
              >
                <Download className="w-4 h-4 text-tertiary" />
                <span>Save QR Image</span>
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-3 px-space-sm rounded-xl bg-surface-container text-tertiary hover:text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Cancel Payment</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* POPUP MODAL: Upload Payment Slip Component */}
      <PaymentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onConfirmUpload={handleConfirmUpload}
      />

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
