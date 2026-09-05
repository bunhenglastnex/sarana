'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Copy,
  Check,
  Flame,
  Clock,
  Thermometer,
  Store,
  CheckCircle2,
  PackageCheck,
  Package,
  Navigation,
  Phone,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Headphones,
  Sparkles,
  Layers,
  CheckCheck,
} from 'lucide-react';


interface PickupTrackerViewProps {
  orderRef?: string;
  paymentMethod?: string;
}

export const PickupTrackerView: React.FC<PickupTrackerViewProps> = ({
  orderRef = '#AE-82104',
  paymentMethod = 'Paid via KHQR',
}) => {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(orderRef.replace('#', ''));
    setIsCopied(true);
    triggerNotice('Pickup code copied to clipboard');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <main className="flex flex-col relative w-full max-w-md px-space-lg pt-4 pb-28 bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-8 gap-4">
          {/* Top Tracking Bar Navigation */}
          <div className="flex items-center justify-between py-2 pt-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.push('/')}
                aria-label="Go Back"
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-transform active:scale-95 shadow-sm border border-surface-container-high"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                  Store Collection
                </span>
                <h1 className="font-extrabold text-base text-on-surface leading-tight">
                  Live Order Tracker
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/customer-profile')}
              aria-label="User Profile"
              className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-ping" />
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1WG5HVTWC5LLJbB2PqdnRJ67p9zpja5T6dbmRzk9uzevom6eIezanysplSyywSDu4va4KnMLCPJmYDPwVk_vBpgDaci3i0tP-RTHATBuyZzduINgEplaf6K-pVqc56E2pG2vRIXsiu16ryX3ea5viL2kFPcax-39oZKPAmwMn8bLCEerbyueUJkeOvoiwG0evceo6dXlWyqg1m8_83T7rhug8cwRMfhgz8fIdLK8rtskYaOyVAYu4p5Unk"
                alt="Elena Rostova Avatar"
                className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-primary-fixed"
              />
            </button>
          </div>

          {/* Hero Staging Card: QR Pickup Pass */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-md border border-surface-container/80 flex flex-col gap-3">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-secondary-container/15 blur-2xl pointer-events-none" />
            <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />

            {/* Status Pill & Timestamp */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary">
                <Flame className="w-4 h-4 text-primary fill-primary/20" />
                <span className="text-[11px] font-bold tracking-wide uppercase">
                  Ready for Pickup
                </span>
              </div>
              <span className="text-xs text-on-surface-variant font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-secondary" /> Just Now (19:28)
              </span>
            </div>

            {/* Main Ticket Info Block */}
            <div className="flex flex-col items-center justify-center text-center py-2">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-bold">
                Express Pickup Pass
              </span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-3xl font-mono text-on-surface tracking-tight">
                  {orderRef}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  aria-label="Copy pickup code"
                  className="p-1.5 rounded-full bg-surface-container text-on-surface-variant hover:text-primary transition-colors active:scale-95"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-secondary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {isCopied && (
                <span className="text-[11px] text-primary font-bold mt-1 animate-in fade-in duration-200">
                  Code copied to clipboard
                </span>
              )}
            </div>

            {/* Scannable Graphic QR Code Box */}
            <div className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center gap-2.5 border border-surface-container/60">
              <div className="relative p-2.5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high flex items-center justify-center">
                <svg
                  aria-label="Scannable Pickup QR Code"
                  className="w-36 h-36 text-on-surface"
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

                {/* Center Emblem Logo Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-lowest p-1 shadow-md flex items-center justify-center border border-surface-container">
                    <div className="w-full h-full rounded-md bg-primary flex items-center justify-center text-on-primary">
                      <Flame className="w-4 h-4 fill-white text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant text-center font-medium">
                Scan this QR code or show pickup pass at Bistro Host Counter
              </p>
            </div>

            {/* Locker & Staging Location Detail */}
            <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-surface-container-high">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary flex-shrink-0">
                <Layers className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                  Staging Location
                </span>
                <span className="font-bold text-sm text-on-surface truncate">
                  Shelf B-3 • Hot Box #04
                </span>
                <span className="text-xs text-secondary flex items-center gap-1 font-semibold">
                  <Thermometer className="w-3.5 h-3.5" /> Heated Pickup Station
                </span>
              </div>
            </div>
          </div>

          {/* Pickup Milestone Timeline (4 Steps) */}
          <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3 border border-surface-container/80">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-on-surface">
                Fulfillment Progress
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                Step 3 of 4
              </span>
            </div>

            <div className="flex flex-col gap-3 relative">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="relative flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="w-0.5 h-8 bg-primary mt-1" />
                </div>
                <div className="flex flex-col min-w-0 pt-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-on-surface">
                      Order Confirmed
                    </span>
                    <span className="text-[10px] text-on-surface-variant">19:10</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    Ticket accepted by head chef
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="relative flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="w-0.5 h-8 bg-primary mt-1" />
                </div>
                <div className="flex flex-col min-w-0 pt-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-on-surface">
                      Prepared in Woodfire Hearth
                    </span>
                    <span className="text-[10px] text-on-surface-variant">19:15</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    Cooked at 700°F ember stone
                  </span>
                </div>
              </div>

              {/* Step 3 (Active) */}
              <div className="flex items-start gap-3">
                <div className="relative flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 z-10 shadow-md ring-4 ring-primary-fixed">
                    <Flame className="w-4 h-4 fill-white animate-pulse text-white" />
                  </div>
                  <div className="w-0.5 h-8 bg-surface-container mt-1" />
                </div>
                <div className="flex flex-col min-w-0 pt-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-primary">
                      Ready for Pickup
                    </span>
                    <span className="text-[10px] text-primary font-bold">19:28</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    Packaged in thermal foil at express shelf
                  </span>
                </div>
              </div>

              {/* Step 4 (Pending) */}
              <div className="flex items-start gap-3 opacity-60">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 z-10">
                    <CheckCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col min-w-0 pt-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-on-surface-variant">
                      Handed Over & Completed
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      Pending
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    Host verifies your barcode
                  </span>
                </div>
              </div>
            </div>

            {/* Thermal packaging notice banner */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-on-surface border border-surface-container">
              <Package className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-[11px] text-on-surface-variant">
                Your order is hot and sealed with artisan moisture locks.
              </span>
            </div>
          </div>

          {/* Restaurant Location & Walking Directions Map Card */}
          <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3 border border-surface-container/80">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                  Pickup Destination
                </span>
                <h3 className="font-bold text-sm text-on-surface">
                  Amber & Ember Bistro
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  244 Oak Street, Central Dining Quarter
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant flex items-center gap-1 flex-shrink-0">
                <Navigation className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold">~6 min (450m)</span>
              </div>
            </div>

            {/* Interactive Location Map View */}
            <div
              className="w-full h-36 bg-surface-container rounded-xl relative overflow-hidden bg-cover bg-center shadow-inner border border-surface-container-high"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCklNexH6yUkjGIxhLcF-a0YQk2FPg95zxOapOPZe3hiM8wfw_slYsnt3cBE7ryAVKL6Avp05iH6KiMp0sCMufRL4iiLMSs0lpt2mc46RiWNTh9qbWPhc5PPX-BVVQNFhn0mgZURccE3HOgWnIJpUXSTjZllSk5GOJL5BhVLO1mgmPCymL4qXulo5IAxVULMh352uWW3-c6x7jjHXqrvH7EgShardQ73oYqViSgwXsIjBuBEw9r2dDz')",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-3 py-1.5 rounded-full bg-surface text-on-surface shadow-lg flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-xs font-bold">Store Front Entrance</span>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-surface/90 text-on-surface text-[10px] font-bold backdrop-blur-sm">
                Bistro Counter • Ground Level
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => triggerNotice('Opening Google Maps Directions...')}
                className="h-11 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-sm hover:bg-primary-container"
              >
                <Navigation className="w-4 h-4" /> Get Directions
              </button>
              <a
                href="tel:+15550198234"
                className="h-11 rounded-xl bg-surface-container text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform hover:bg-surface-container-high"
              >
                <Phone className="w-4 h-4 text-tertiary" /> Call Bistro
              </a>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm flex items-center justify-between border border-surface-container/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                  Payment Summary
                </span>
                <span className="font-bold text-xs text-on-surface">
                  {paymentMethod}
                </span>
                <span className="text-[11px] text-on-surface-variant truncate">
                  Transaction #QR-9428 • No balance due
                </span>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-surface-container text-secondary font-extrabold text-xs">
              $28.50
            </div>
          </div>

          {/* Collapsible Order Summary Preview */}
          <div className="rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm flex flex-col gap-2 border border-surface-container/80">
            <button
              type="button"
              onClick={() => setIsAccordionOpen((prev) => !prev)}
              className="flex items-center justify-between w-full text-left py-1"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-on-surface">
                  Order Details
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold">
                  2 items
                </span>
              </div>
              {isAccordionOpen ? (
                <ChevronUp className="w-4 h-4 text-on-surface-variant" />
              ) : (
                <ChevronDown className="w-4 h-4 text-on-surface-variant" />
              )}
            </button>

            {isAccordionOpen && (
              <div className="flex flex-col gap-2 pt-2 border-t border-surface-container text-xs">
                {/* Item 1 */}
                <div className="flex items-center justify-between py-2 bg-surface-container-low rounded-xl px-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80"
                      alt="Ember Margherita Pizza"
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-surface-container"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-on-surface truncate text-xs">
                        Ember Margherita Pizza
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        1x • Extra Char Basil
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-on-surface flex-shrink-0 text-xs">
                    $18.50
                  </span>
                </div>

                {/* Item 2 */}
                <div className="flex items-center justify-between py-2 bg-surface-container-low rounded-xl px-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src="https://images.unsplash.com/photo-1562967914-608f82629710?w=200&auto=format&fit=crop&q=80"
                      alt="Smoked Maple Tenders"
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-surface-container"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-on-surface truncate text-xs">
                        Smoked Maple Tenders
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        1x • Rosemary Dip
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-on-surface flex-shrink-0 text-xs">
                    $10.00
                  </span>
                </div>

                {/* Breakdown footer */}
                <div className="flex flex-col gap-1 pt-2 border-t border-surface-container text-on-surface-variant text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>$26.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taxes & Packaging</span>
                    <span>$2.50</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-xs text-on-surface pt-1 border-t border-surface-container">
                    <span>Total Collected</span>
                    <span className="text-primary font-extrabold">$28.50</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Host Concierge Assistance Help Card */}
          <div className="rounded-2xl bg-surface-container p-3.5 flex items-center justify-between border border-surface-container-high">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-on-surface">
                  Need help finding counter?
                </span>
                <span className="text-[11px] text-on-surface-variant truncate">
                  Ask host concierge at front entrance
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => triggerNotice('Connecting with Bistro host concierge...')}
              className="px-3 py-1.5 rounded-lg bg-surface text-on-surface font-bold text-xs shadow-sm active:scale-95 transition-transform flex-shrink-0 hover:bg-surface-container-lowest"
            >
              Chat
            </button>
          </div>
        </div>

        {/* Floating Notice Toast */}
        {noticeMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-xs w-full px-4 py-2.5 bg-inverse-surface text-inverse-on-surface rounded-full shadow-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all z-50 animate-in slide-in-from-bottom-2 duration-200">
            <Sparkles className="w-4 h-4 text-secondary-fixed" />
            <span>{noticeMessage}</span>
          </div>
        )}
      </main>
  );
};
