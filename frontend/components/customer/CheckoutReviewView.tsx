"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Heart,
  User,
  ShieldAlert,
  Navigation,
  ExternalLink,
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Api, useApi } from "@/lib/api";
import { LocationModal } from "./LocationModal";
import { CheckoutDeliveryMap } from "./CheckoutDeliveryMap";

// Haversine formula to compute exact distance in kilometers
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const CheckoutReviewView: React.FC = () => {
  const router = useRouter();

  // Fetch admin settings for delivery zone configuration
  const { data: settingsRes } = useApi<any>("/settings.php");
  const settings = settingsRes?.data || settingsRes || {};

  const storeLat = parseFloat(settings.store_latitude || "13.352270");
  const storeLng = parseFloat(settings.store_longitude || "103.955116");
  const restaurantName = settings.store_name || "Bistro Kitchen HQ";
  const restaurantAddress =
    settings.store_address || "520 N Michigan Ave, Suite 14F, Siem Reap";
  const restaurantPhone = settings.store_phone || "+855 23 888 999";
  const openingTime = settings.opening_time || "10:00 AM";
  const closingTime = settings.closing_time || "10:00 PM";

  const maxRadiusKm = parseFloat(settings.max_delivery_radius_km || "7.5");
  const enableZoneBlocker =
    settings.enable_zone_blocker !== false &&
    settings.enable_zone_blocker !== "false";
  const outOfZoneMessage =
    settings.out_of_zone_message ||
    `Sorry! Your delivery address is outside our maximum delivery radius of ${maxRadiusKm} km. Pickup is still available!`;

  const baseDeliveryFee = parseFloat(settings.base_delivery_fee || "1.50");
  const baseIncludedKm = parseFloat(settings.base_included_km || "3.0");
  const extraFeePerKm = parseFloat(settings.extra_fee_per_km || "0.50");
  const freeDeliveryMinSubtotal = parseFloat(
    settings.free_delivery_min_subtotal || "25.00",
  );
  const taxRate = parseFloat(settings.tax_rate ?? "9.03");

  // Stores
  const {
    items,
    fulfillmentType,
    setFulfillmentType,
    customerPhone: cartPhone,
    deliveryAddress: cartAddress,
    notes: storeNotes,
    setCustomerInfo,
    getFoodSubtotal,
    clearCart,
  } = useCartStore();

  const {
    name: authName,
    phone: authPhone,
    userId,
    avatarUrl,
  } = useAuthStore();

  // Local State
  const [fulfillmentMode, setFulfillmentMode] = useState<"delivery" | "pickup">(
    fulfillmentType || "delivery",
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "khqr" | "cod" | "counter"
  >("khqr");
  const [tipAmount, setTipAmount] = useState<number>(2.5);
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [customTipInput, setCustomTipInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Address, Coordinates & Notes State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    cartAddress || "",
  );
  const [customerCoords, setCustomerCoords] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: storeLat,
    lng: storeLng,
  });
  const [customerPhone, setCustomerPhone] = useState<string>(
    authPhone || cartPhone || "+1 (555) 382-9012",
  );
  const [customerName, setCustomerName] = useState<string>(
    authName || "Guest Customer",
  );
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState<string>(storeNotes || "");

  useEffect(() => {
    setFulfillmentType(fulfillmentMode);
  }, [fulfillmentMode, setFulfillmentType]);

  // Auto-acquire browser real GPS location on mount if address is not set
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      navigator.geolocation &&
      !cartAddress
    ) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCustomerCoords({ lat: latitude, lng: longitude });
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                const parts = data.display_name.split(",");
                const concise = parts.slice(0, 3).join(",").trim();
                setDeliveryAddress(concise);
                setCustomerInfo({ deliveryAddress: concise });
              }
            }
          } catch {
            // Geocoding network fallback
          }
        },
        (err) => {
          console.log("Checkout initial GPS fetch skipped:", err);
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }
  }, [cartAddress, setCustomerInfo]);

  // Compute distance from store center
  const distanceKm = useMemo(() => {
    return calculateDistanceKm(
      customerCoords.lat,
      customerCoords.lng,
      storeLat,
      storeLng,
    );
  }, [customerCoords, storeLat, storeLng]);

  // Out of delivery zone restriction check
  const isOutOfZone = useMemo(() => {
    return (
      fulfillmentMode === "delivery" &&
      enableZoneBlocker &&
      maxRadiusKm < 999 &&
      distanceKm > maxRadiusKm
    );
  }, [fulfillmentMode, enableZoneBlocker, maxRadiusKm, distanceKm]);

  // Price Calculations
  const subtotal = getFoodSubtotal();
  const packagingAndTax = subtotal > 0 ? (subtotal * taxRate) / 100 : 0.0;

  const rawFee = distanceKm * extraFeePerKm;
  const isFreeDelivery = subtotal >= freeDeliveryMinSubtotal;
  const deliveryFee =
    fulfillmentMode === "delivery" ? (isFreeDelivery ? 0.0 : rawFee) : 0.0;

  const effectiveTip = fulfillmentMode === "delivery" ? tipAmount : 0.0;
  const totalAmount =
    subtotal > 0
      ? subtotal + packagingAndTax + deliveryFee + effectiveTip
      : 0.0;

  const handleSelectPayment = (method: "khqr" | "cod" | "counter") => {
    if (method === "counter" && fulfillmentMode === "delivery") {
      return; // Counter pay is pickup only
    }
    setPaymentMethod(method);
  };

  const handleSelectAddress = (
    newAddr: string,
    newLat?: number,
    newLng?: number,
  ) => {
    setDeliveryAddress(newAddr);
    setCustomerInfo({ deliveryAddress: newAddr });
    if (newLat !== undefined && newLng !== undefined) {
      setCustomerCoords({ lat: newLat, lng: newLng });
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0 || isOutOfZone) {
      if (isOutOfZone) {
        alert(outOfZoneMessage);
      }
      return;
    }

    if (!customerPhone || !customerPhone.trim()) {
      alert("Please enter a valid contact phone number.");
      return;
    }

    if (fulfillmentMode === "delivery" && (!deliveryAddress || !deliveryAddress.trim())) {
      alert("Please enter a valid delivery address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        items: items.map((item) => ({
          food_id: item.food_id,
          food_name: item.name,
          price:
            typeof item.price === "string"
              ? parseFloat(item.price)
              : Number(item.price),
          quantity: item.quantity,
          subtotal:
            (typeof item.price === "string"
              ? parseFloat(item.price)
              : Number(item.price)) * item.quantity,
          image_url: item.food?.image_url || "",
        })),
        customer_name: customerName,
        customer_phone: customerPhone,
        fulfillment_type: fulfillmentMode,
        delivery_address: deliveryAddress,
        delivery_lat: customerCoords.lat,
        delivery_lng: customerCoords.lng,
        payment_method: paymentMethod,
        delivery_fee: deliveryFee,
        tax_amount: packagingAndTax,
        tip: effectiveTip,
        notes: notes,
        user_id: userId || undefined,
      };

      const res = await Api.post("/api/customer-orders.php", payload);

      if (res.success && res.data) {
        const orderId = res.data.order_id || res.data.order_number;
        const orderNum = res.data.order_number || `#ORD-${orderId}`;

        clearCart();

        if (paymentMethod === "khqr") {
          router.push(
            `/khqr-payment?order_id=${encodeURIComponent(orderNum)}&amount=${totalAmount.toFixed(2)}&tip=${effectiveTip}`,
          );
        } else {
          setConfirmedOrder({
            order_number: orderNum,
            total_amount: totalAmount,
            fulfillmentMode,
            paymentMethod,
          });
          setIsConfirmationOpen(true);
        }
      } else {
        alert(res.error || "Failed to place order. Please try again.");
      }
    } catch (err: any) {
      console.error("Failed to submit order:", err);
      alert("Network error while placing order.");
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={() => router.push("/customer-profile")}
            aria-label="User Profile"
            className="w-10 h-10 flex items-center justify-center rounded-full p-0.5 hover:ring-2 hover:ring-primary/40 transition-all flex-shrink-0 overflow-hidden border border-outline-variant/50"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                {customerName.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-col relative w-full max-w-md px-space-lg pt-4 min-h-screen bg-surface">
        {items.length === 0 ? (
          /* Empty Cart View */
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="font-extrabold text-xl text-on-surface">
              Your Cart is Empty
            </h2>
            <p className="text-xs text-on-surface-variant max-w-xs">
              Looks like you haven't added any items to your cart yet. Explore
              our delicious woodfired menu!
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-md hover:bg-primary-container transition-all flex items-center gap-2"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Explore Menu</span>
            </button>
          </div>
        ) : (
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
                <span className="text-xs text-primary font-bold">
                  Step 1 of 2
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Card A: Delivery */}
                <button
                  type="button"
                  onClick={() => {
                    setFulfillmentMode("delivery");
                    if (paymentMethod === "counter") setPaymentMethod("khqr");
                  }}
                  className={`relative flex flex-col p-3 rounded-xl text-left transition-all duration-200 shadow-sm ${
                    fulfillmentMode === "delivery"
                      ? "bg-surface-container-lowest text-on-surface ring-2 ring-primary shadow-md"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {fulfillmentMode === "delivery" && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-on-surface">
                    Delivery
                  </span>
                  <span className="text-xs text-on-surface-variant mt-1 leading-tight">
                    To your door
                    <br />
                    <strong className="text-primary font-semibold">
                      25–35 min
                    </strong>
                  </span>
                </button>

                {/* Card B: Pickup */}
                <button
                  type="button"
                  onClick={() => setFulfillmentMode("pickup")}
                  className={`relative flex flex-col p-3 rounded-xl text-left transition-all duration-200 shadow-sm ${
                    fulfillmentMode === "pickup"
                      ? "bg-surface-container-lowest text-on-surface ring-2 ring-primary shadow-md"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {fulfillmentMode === "pickup" && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-2">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-on-surface">
                    Pickup
                  </span>
                  <span className="text-xs text-on-surface-variant mt-1 leading-tight">
                    Bistro counter
                    <br />
                    <strong className="text-on-surface font-semibold">
                      15–20 min
                    </strong>
                  </span>
                </button>
              </div>
            </div>

            {/* Dynamic Section: Delivery Destination Details */}
            {fulfillmentMode === "delivery" ? (
              <div className="mt-2 flex flex-col gap-3 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-on-surface">
                    Delivery Address
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Edit</span>
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Address Card */}
                <div
                  onClick={() => setIsLocationModalOpen(true)}
                  className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container/80 flex items-start gap-3 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 fill-primary text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-bold uppercase">
                        DELIVERY DESTINATION
                      </span>
                      <span className="text-xs text-secondary font-medium">
                        • {distanceKm.toFixed(1)} km from store
                      </span>
                    </div>
                    <p className="font-bold text-sm text-on-surface mt-1 truncate">
                      {deliveryAddress}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      River North, Downtown District
                    </p>
                  </div>
                </div>

                {/* Out-of-Zone Delivery Restriction Alert Card */}
                {isOutOfZone && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-600 font-bold text-xs animate-in fade-in">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-red-700">
                        Out of Delivery Area ({distanceKm.toFixed(1)} km away)
                      </p>
                      <p className="text-xs text-red-600 font-normal mt-0.5 leading-relaxed">
                        {outOfZoneMessage}
                      </p>
                      <button
                        type="button"
                        onClick={() => setFulfillmentMode("pickup")}
                        className="mt-2.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Switch to Store Pickup</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Interactive Leaflet GPS Map */}
                <CheckoutDeliveryMap
                  currentAddress={deliveryAddress}
                  onAddressChange={handleSelectAddress}
                  storeLat={storeLat}
                  storeLng={storeLng}
                  maxRadiusKm={maxRadiusKm}
                />

                {/* Phone Verified & Courier Instruction Row */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant flex-shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-on-surface-variant font-medium block">
                          Contact Recipient
                        </span>
                        <input
                          type="text"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="text-xs font-bold text-on-surface bg-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 -ml-1 w-full"
                        />
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/80 flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-on-surface-variant mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-on-surface-variant font-medium block mb-0.5">
                        Drop-off Instructions
                      </span>
                      {isEditingNotes ? (
                        <textarea
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          onBlur={() => setIsEditingNotes(false)}
                          className="w-full text-xs text-on-surface p-1 bg-surface-container rounded border border-primary focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <p
                          onClick={() => setIsEditingNotes(true)}
                          className="text-xs text-on-surface italic cursor-pointer hover:text-primary transition-colors"
                        >
                          "{notes || "Click to add instructions..."}"
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingNotes(!isEditingNotes)}
                      aria-label="Edit instructions"
                      className="text-primary hover:opacity-80 p-1 flex-shrink-0"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Pickup Store Info & Interactive Map */
              <div className="mt-2 flex flex-col gap-3 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-on-surface">
                    Store Pickup Location
                  </span>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>Ready in 15-20 Min</span>
                  </span>
                </div>

                {/* Store Info Card */}
                <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm border border-surface-container/80 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-secondary-fixed/50 text-on-secondary-fixed-variant px-2 py-0.5 rounded font-bold uppercase">
                          STORE COUNTER
                        </span>
                        <span className="text-xs text-secondary font-medium">
                          • {distanceKm.toFixed(1)} km away
                        </span>
                      </div>
                      <p className="font-bold text-sm text-on-surface mt-1 truncate">
                        {restaurantName}
                      </p>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                        {restaurantAddress}
                      </p>
                      <p className="text-[11px] text-on-surface-variant/80 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>
                          Open Hours: {openingTime} – {closingTime}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons: Directions & Call */}
                  <div className="flex items-center gap-2 pt-2 border-t border-surface-container/60">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${storeLat},${storeLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-surface-container-high"
                    >
                      <Navigation className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span>Get Directions</span>
                      <ExternalLink className="w-3 h-3 text-on-surface-variant" />
                    </a>

                    <a
                      href={`tel:${restaurantPhone}`}
                      className="py-2 px-3 rounded-lg border border-outline hover:bg-surface-container text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>Call Store</span>
                    </a>
                  </div>
                </div>

                {/* Interactive Map showing Store Location */}
                <div className="space-y-1 mt-1">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Store GPS Map Location
                  </span>
                  <CheckoutDeliveryMap
                    currentAddress={restaurantAddress}
                    onAddressChange={() => {}}
                    storeLat={storeLat}
                    storeLng={storeLng}
                    maxRadiusKm={maxRadiusKm}
                  />
                </div>
              </div>
            )}

            {/* Section: Courier Tip Selection (Delivery Mode Only) */}
            {fulfillmentMode === "delivery" && (
              <div className="mt-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary fill-primary/20" />
                    <h2 className="font-bold text-base text-on-surface">
                      Courier Tip
                    </h2>
                  </div>
                  <span className="text-xs text-secondary font-semibold bg-secondary-fixed/50 px-2.5 py-0.5 rounded-full">
                    100% to Driver
                  </span>
                </div>

                <div className="p-3.5 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/80 flex flex-col gap-3">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Show appreciation to your delivery courier. Every dollar
                    goes directly to your driver.
                  </p>

                  {/* Tip Options Preset Grid */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { amount: 1.5, label: "$1.50" },
                      { amount: 2.5, label: "$2.50", popular: true },
                      { amount: 3.5, label: "$3.50" },
                      { amount: 5.0, label: "$5.00" },
                    ].map((option) => {
                      const isSelected =
                        !isCustomTip && tipAmount === option.amount;
                      return (
                        <button
                          key={option.amount}
                          type="button"
                          onClick={() => {
                            setIsCustomTip(false);
                            setTipAmount(option.amount);
                          }}
                          className={`relative py-2 px-1 rounded-lg text-center font-bold text-xs transition-all duration-150 flex flex-col items-center justify-center ${
                            isSelected
                              ? "bg-primary text-on-primary shadow-sm ring-2 ring-primary/40"
                              : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                          }`}
                        >
                          {option.popular && !isSelected && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-secondary text-on-secondary px-1 rounded font-extrabold uppercase">
                              Popular
                            </span>
                          )}
                          <span>{option.label}</span>
                        </button>
                      );
                    })}

                    {/* Custom Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomTip(true);
                      }}
                      className={`py-2 px-1 rounded-lg text-center font-bold text-xs transition-all duration-150 flex items-center justify-center ${
                        isCustomTip
                          ? "bg-primary text-on-primary shadow-sm ring-2 ring-primary/40"
                          : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {/* Custom Tip Input field */}
                  {isCustomTip && (
                    <div className="flex items-center gap-2 pt-1 animate-in fade-in slide-in-from-top-1">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.50"
                          min="0"
                          placeholder="0.00"
                          value={customTipInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomTipInput(val);
                            const num = parseFloat(val);
                            setTipAmount(isNaN(num) || num < 0 ? 0 : num);
                          }}
                          className="w-full pl-7 pr-3 py-2 bg-surface-container-low rounded-lg font-bold text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomTip(false);
                          setTipAmount(0);
                          setCustomTipInput("");
                        }}
                        className="px-3 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface bg-surface-container rounded-lg"
                      >
                        No Tip
                      </button>
                    </div>
                  )}
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
                onClick={() => handleSelectPayment("khqr")}
                className={`cursor-pointer relative p-3 bg-surface-container-lowest rounded-xl shadow-sm transition-all duration-150 flex items-center justify-between border ${
                  paymentMethod === "khqr"
                    ? "ring-2 ring-primary border-primary/40 shadow-md"
                    : "border-surface-container hover:bg-surface-container-low"
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
                    paymentMethod === "khqr"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-variant text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Option 2: Cash on Delivery (COD) */}
              <div
                onClick={() => handleSelectPayment("cod")}
                className={`cursor-pointer relative p-3 rounded-xl shadow-sm transition-all duration-150 flex items-center justify-between border ${
                  paymentMethod === "cod"
                    ? "bg-surface-container-lowest ring-2 ring-primary border-primary/40 shadow-md"
                    : "bg-surface-container-low border-surface-container hover:bg-surface-container"
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
                    paymentMethod === "cod"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-variant text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Option 3: Pay at Restaurant Counter */}
              <div
                onClick={() => handleSelectPayment("counter")}
                className={`cursor-pointer relative p-3 rounded-xl shadow-sm transition-all duration-150 flex items-center justify-between border ${
                  fulfillmentMode === "delivery"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                } ${
                  paymentMethod === "counter"
                    ? "bg-surface-container-lowest ring-2 ring-primary border-primary/40 shadow-md"
                    : "bg-surface-container-low border-surface-container"
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
                    paymentMethod === "counter"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-variant text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Order Items Preview Recap Card */}
            <div className="mt-4 bg-surface-container-lowest rounded-xl p-3.5 shadow-sm border border-surface-container/80 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-on-surface">
                    Order Summary (
                    {items.reduce((acc, i) => acc + i.quantity, 0)} items)
                  </h3>
                </div>
                <span className="text-xs text-primary font-bold">
                  Receipt Details
                </span>
              </div>

              {/* Dynamic Live Items List */}
              {items.map((item) => {
                const priceNum =
                  typeof item.price === "string"
                    ? parseFloat(item.price)
                    : Number(item.price || 0);
                const itemSubtotal = priceNum * item.quantity;
                return (
                  <div
                    key={item.food_id}
                    className="flex items-center justify-between py-1.5 text-on-surface border-b border-surface-container/30 last:border-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.food?.image_url ? (
                        <img
                          src={item.food.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-surface-container"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant font-bold text-xs flex-shrink-0">
                          {item.quantity}x
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-on-surface truncate">
                          {item.quantity}x {item.name}
                        </p>
                        {item.food?.description && (
                          <p className="text-[10px] text-on-surface-variant truncate">
                            {item.food.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-xs text-on-surface ml-2 flex-shrink-0">
                      ${itemSubtotal.toFixed(2)}
                    </span>
                  </div>
                );
              })}

              {/* Price Calculation Rows */}
              <div className="mt-1 pt-2 border-t border-surface-container flex flex-col gap-1 text-xs text-on-surface-variant">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    {fulfillmentMode === "delivery"
                      ? `Delivery Fee (${distanceKm.toFixed(1)} km)`
                      : "Pickup Packaging"}
                  </span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{`Packaging & Tax (${taxRate}%)`}</span>
                  <span>${packagingAndTax.toFixed(2)}</span>
                </div>
                {fulfillmentMode === "delivery" && (
                  <div className="flex items-center justify-between text-secondary font-medium">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-secondary/20" />
                      Courier Tip
                    </span>
                    <span>${effectiveTip.toFixed(2)}</span>
                  </div>
                )}
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
                Packed in artisanal thermal foil to preserve woodfired heat and
                aroma straight to your table.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Order Execution Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-surface/95 backdrop-blur-xl px-space-lg py-3 border-t border-surface-container/60 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-on-surface-variant px-1 text-[11px]">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-secondary" />
                256-Bit SSL Encrypted Checkout
              </span>
              <span className="text-primary font-bold">
                Amber & Ember Kitchen
              </span>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || isOutOfZone}
              className={`w-full h-13 py-3.5 transition-all rounded-xl flex items-center justify-between px-space-lg shadow-lg font-bold text-sm ${
                isOutOfZone
                  ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-80"
                  : "bg-primary hover:bg-primary-container text-on-primary active:scale-[0.98]"
              }`}
            >
              <div className="flex items-center gap-2">
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isOutOfZone ? (
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
                <span>
                  {isOutOfZone
                    ? "Delivery Unavailable (Out of Zone)"
                    : paymentMethod === "khqr"
                      ? "Proceed with KHQR"
                      : "Place Order"}
                </span>
              </div>
              <div className="flex items-center gap-2 font-extrabold text-base">
                <span>${totalAmount.toFixed(2)}</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentAddress={deliveryAddress}
        onSelectAddress={handleSelectAddress}
      />

      {/* Confirmation Modal */}
      {isConfirmationOpen && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsConfirmationOpen(false)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-md rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-300 border border-surface-container"
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
              <span>Order {confirmedOrder?.order_number || "#ORD-8942"}</span>
              <span className="text-primary">
                ${confirmedOrder?.total_amount?.toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsConfirmationOpen(false);
                router.push("/orders");
              }}
              className="mt-4 w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm shadow hover:bg-primary-container transition-colors"
            >
              Track My Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
