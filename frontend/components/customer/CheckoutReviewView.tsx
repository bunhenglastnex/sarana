'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Truck,
  ShoppingBag,
  MapPin,
  Edit,
  Phone,
  Check,
  CheckCircle,
  MessageSquare,
  Edit3,
  Store,
  QrCode,
  Banknote,
  CreditCard,
  Lock,
  UtensilsCrossed,
  Flame,
  Shield,
  ArrowRight,
  Loader2,
  ChefHat,
  Clock,
} from 'lucide-react';

export const CheckoutReviewView: React.FC = () => {
  const router = useRouter();

  // State
  const [fulfillmentMode, setFulfillmentMode] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'khqr' | 'cod' | 'counter'>('khqr');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const subtotal = 34.5;
  const packagingAndTax = 1.2;
  const deliveryFee = fulfillmentMode === 'delivery' ? 2.0 : 0.0;
  const totalAmount = subtotal + packagingAndTax + deliveryFee;

  const handleSelectPayment = (method: 'khqr' | 'cod' | 'counter') => {
    if (method === 'counter' && fulfillmentMode === 'delivery') {
      return; // Counter pay is pickup only
    }
    setPaymentMethod(method);
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'khqr') {
      router.push('/khqr-payment');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/order-success?payment=${paymentMethod}&mode=${fulfillmentMode}`);
    }, 650);
  };

  return (
    <div className="bg-surface text-on-surface font-sans text-sm min-h-screen flex flex-col items-center selection:bg-primary/20 selection:text-primary pb-32">
      {/* Fixed Header */}
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
              Checkout Flow
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
        <div className="flex flex-col w-full gap-space-lg">
          {/* Live Order Pipeline / Status Badges */}
          <div className="flex items-center justify-between gap-2 py-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Order: New (Pending)
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Payment: Pending
              </span>
            </div>
          </div>

          {/* Section 1: Order Type Selection */}
          <div className="mt-1 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-on-surface">
                Fulfillment Method
              </h2>
              <span className="text-xs text-primary font-bold">Step 1 of 2</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Card A: Delivery */}
              <button
                type="button"
                onClick={() => {
                  setFulfillmentMode('delivery');
                  if (paymentMethod === 'counter') setPaymentMethod('khqr');
                }}
                className={`relative flex flex-col p-3 rounded-xl text-left transition-all duration-200 shadow-sm ${
                  fulfillmentMode === 'delivery'
                    ? 'bg-surface-container-lowest text-on-surface ring-2 ring-primary shadow-md'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                {fulfillmentMode === 'delivery' && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-on-surface">Delivery</span>
                <span className="text-xs text-on-surface-variant mt-1 leading-tight">
                  To your door
                  <br />
                  <strong className="text-primary font-semibold">25–35 min</strong>
                </span>
              </button>

              {/* Card B: Pickup */}
              <button
                type="button"
                onClick={() => setFulfillmentMode('pickup')}
                className={`relative flex flex-col p-3 rounded-xl text-left transition-all duration-200 shadow-sm ${
                  fulfillmentMode === 'pickup'
                    ? 'bg-surface-container-lowest text-on-surface ring-2 ring-primary shadow-md'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                {fulfillmentMode === 'pickup' && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-2">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-on-surface">Pickup</span>
                <span className="text-xs text-on-surface-variant mt-1 leading-tight">
                  Bistro counter
                  <br />
                  <strong className="text-on-surface font-semibold">15–20 min</strong>
                </span>
              </button>
            </div>
          </div>

          {/* Dynamic Section: Delivery Destination Details */}
          {fulfillmentMode === 'delivery' ? (
            <div className="mt-2 flex flex-col gap-3 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-on-surface">
                  Delivery Address
                </span>
                <button
                  type="button"
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Edit</span>
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Address Card */}
              <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 fill-primary text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-bold uppercase">
                      HOME
                    </span>
                    <span className="text-xs text-secondary font-medium">
                      • 1.4 miles away
                    </span>
                  </div>
                  <p className="font-bold text-sm text-on-surface mt-1 truncate">
                    244 Oak Street, Apt 4B
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    River North, Downtown District
                  </p>
                </div>
              </div>

              {/* Mini Map Visual Anchor */}
              <div
                className="w-full h-28 rounded-xl bg-cover bg-center shadow-inner relative overflow-hidden border border-surface-container/60"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDPpH_RpSN287-cVRY0sqvBUTAYq1cr9OtlGDZIxN8JHBALJH8XtEwlZDF5sr4FZDfIDuLdCOZ-7ajYlDSqWuKEuokpsArXXyy0X2KAaETacGNud7x9yMR_oVhgU6hhPrRILbWBCEdBCUWc9hvXj7Fe0RQVSoWHbT5qSx7Ngy9ZqyEFwnWH61opW-50gJc02OUmLy8udtX6BZci9TA2NbP7aMxX7A-PShp3PAbFxmx_kadNCTNIyv91')",
                }}
              >
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform -translate-y-1">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-on-surface text-[11px] font-bold flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Live dispatch active
                </div>
              </div>

              {/* Phone Verified & Courier Instruction Row */}
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-medium block">
                        Contact Recipient
                      </span>
                      <span className="text-xs font-bold text-on-surface">
                        +1 (555) 382-9012
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full font-bold">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                </div>

                <div className="p-3 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/80 flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 text-on-surface-variant mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] text-on-surface-variant font-medium block mb-0.5">
                      Drop-off Instructions
                    </span>
                    <p className="text-xs text-on-surface italic">
                      "Leave at front door, ring bell twice please."
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Edit instructions"
                    className="text-primary hover:opacity-80 p-1"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Pickup Info Fallback */
            <div className="mt-2 flex flex-col gap-2">
              <div className="p-3.5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] bg-secondary-fixed/50 text-on-secondary-fixed-variant px-2 py-0.5 rounded font-bold uppercase">
                    READY IN 15-20 MIN
                  </span>
                  <p className="font-bold text-sm text-on-surface mt-1">
                    Amber & Ember Kitchen Counter
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    742 Evergreen Terrace, Culinary Row
                  </p>
                  <p className="text-xs text-secondary mt-1 font-semibold">
                    Please have your order code ready upon arrival.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Payment Method */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-on-surface">
                Payment Method
              </h2>
              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                <Lock className="w-3 h-3 text-secondary" /> Encrypted & Secure
              </span>
            </div>

            {/* Option 1: KHQR (Bakong / All Banks) */}
            <div
              onClick={() => handleSelectPayment('khqr')}
              className={`cursor-pointer relative p-3 bg-surface-container-lowest rounded-xl shadow-sm transition-all duration-150 flex items-center justify-between border ${
                paymentMethod === 'khqr'
                  ? 'ring-2 ring-primary border-primary/40 shadow-md'
                  : 'border-surface-container hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-error-container/40 text-error flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-xs text-on-surface truncate">
                      KHQR (Bakong)
                    </p>
                    <span className="text-[10px] bg-primary-fixed text-on-primary-fixed-variant px-1.5 py-0.5 rounded-full font-bold">
                      Instant
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    Scan with ABA, Wing, or Any Bank App
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'khqr'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-variant text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Option 2: Cash on Delivery (COD) */}
            <div
              onClick={() => handleSelectPayment('cod')}
              className={`cursor-pointer relative p-3 rounded-xl shadow-sm transition-all duration-150 flex items-center justify-between border ${
                paymentMethod === 'cod'
                  ? 'bg-surface-container-lowest ring-2 ring-primary border-primary/40 shadow-md'
                  : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-surface-variant text-on-surface-variant flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-on-surface truncate">
                    Cash on Delivery (COD)
                  </p>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    Pay cash to driver upon handoff
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'cod'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-variant text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Option 3: Pay at Restaurant Counter */}
            <div
              onClick={() => handleSelectPayment('counter')}
              className={`cursor-pointer relative p-3 rounded-xl shadow-sm transition-all duration-150 flex items-center justify-between border ${
                fulfillmentMode === 'delivery' ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                paymentMethod === 'counter'
                  ? 'bg-surface-container-lowest ring-2 ring-primary border-primary/40 shadow-md'
                  : 'bg-surface-container-low border-surface-container'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-surface-variant text-on-surface-variant flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs text-on-surface truncate">
                      Pay at Counter
                    </p>
                    <span className="text-[10px] bg-surface-variant text-on-surface-variant px-1.5 py-0.5 rounded font-semibold">
                      Pickup Only
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    Cards or cash when collecting food
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'counter'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-variant text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Order Items Preview Recap Accordion Card */}
          <div className="mt-4 bg-surface-container-lowest rounded-xl p-3.5 shadow-sm border border-surface-container/80 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-on-surface">
                  Order Summary (2 items)
                </h3>
              </div>
              <span className="text-xs text-primary font-bold">
                Receipt Details
              </span>
            </div>

            {/* Item 1 */}
            <div className="flex items-center justify-between py-1 text-on-surface">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center">
                  1x
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-on-surface truncate">
                    Smoked Wagyu Brisket Burger
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    Brioche • House BBQ • Aged Cheddar
                  </p>
                </div>
              </div>
              <span className="font-bold text-xs text-on-surface ml-2 flex-shrink-0">
                $22.50
              </span>
            </div>

            {/* Item 2 */}
            <div className="flex items-center justify-between py-1 text-on-surface">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center">
                  1x
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-on-surface truncate">
                    Truffle Smoked Mac & Cheese
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    Crispy Shallots • Herb Pangrattato
                  </p>
                </div>
              </div>
              <span className="font-bold text-xs text-on-surface ml-2 flex-shrink-0">
                $12.00
              </span>
            </div>

            {/* Price Calculation Rows */}
            <div className="mt-1 pt-2 border-t border-surface-container flex flex-col gap-1 text-xs text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>
                  {fulfillmentMode === 'delivery'
                    ? 'Delivery Fee (1.4 mi)'
                    : 'Pickup Packaging'}
                </span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Packaging & Tax</span>
                <span>${packagingAndTax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-sm text-on-surface pt-1 border-t border-surface-container">
                <span>Total Amount</span>
                <span className="text-primary text-base font-extrabold">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Culinary Warmth Guarantee Note */}
          <div className="mt-2 p-3 rounded-xl bg-surface-container flex items-center gap-2.5 border border-surface-container-high">
            <Flame className="w-5 h-5 text-secondary flex-shrink-0 fill-secondary/20" />
            <p className="text-xs text-on-surface-variant">
              Packed in artisanal thermal foil to preserve woodfired heat and aroma
              straight to your table.
            </p>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Order Execution Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-surface/95 backdrop-blur-xl px-space-lg py-3 border-t border-surface-container/60 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-on-surface-variant px-1 text-[11px]">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-secondary" />
              256-Bit SSL Encrypted Checkout
            </span>
            <span className="text-primary font-bold">Amber & Ember Kitchen</span>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full h-13 py-3.5 bg-primary hover:bg-primary-container active:scale-[0.98] transition-all text-on-primary rounded-xl flex items-center justify-between px-space-lg shadow-lg font-bold text-sm"
          >
            <div className="flex items-center gap-2">
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
              <span>
                {paymentMethod === 'khqr'
                  ? 'Proceed with KHQR'
                  : 'Place Order'}
              </span>
            </div>
            <div className="flex items-center gap-2 font-extrabold text-base">
              <span>${totalAmount.toFixed(2)}</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>

      {/* Confirmation Sheet Modal Mock */}
      {isConfirmationOpen && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsConfirmationOpen(false)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-md rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-extrabold text-lg text-on-surface">
              Order Received!
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              The kitchen has fired up the grill. You can track preparation in
              real-time.
            </p>
            <div className="w-full mt-4 p-3 bg-surface-container rounded-xl flex justify-between text-xs text-on-surface font-bold">
              <span>Order #AE-8942</span>
              <span className="text-primary">ETA: 28 mins</span>
            </div>
            <button
              type="button"
              onClick={() => setIsConfirmationOpen(false)}
              className="mt-4 w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm shadow hover:bg-primary-container transition-colors"
            >
              Track My Dish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
