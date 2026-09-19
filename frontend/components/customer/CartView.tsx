"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Minus,
  Plus,
  Truck,
  Utensils,
  Lock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  User,
  LogIn,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useCartStore, useAuthStore } from "@/lib/store";
import { useApi } from "@/lib/api";

export const CartView: React.FC = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { name: customerName, userId, token, phone } = useAuthStore();
  const {
    items: cartItems,
    restaurantName,
    updateQuantity,
    removeItem,
    clearCart,
    addItem,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [includeCutlery, setIncludeCutlery] = useState(true);
  const [addedUpsells, setAddedUpsells] = useState<Record<string, boolean>>({});
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Fetch live top seller food items for upsell recommendations
  const { data: menuRes } = useApi<any>("/customer-menu.php?limit=6");
  const rawFoods = menuRes?.data?.foods || menuRes?.foods || [];

  const upsellItems = useMemo(() => {
    if (!Array.isArray(rawFoods)) return [];
    return rawFoods.slice(0, 5).map((f: any) => ({
      id: Number(f.id),
      name: f.name,
      price: Number(f.price || 0),
      imageUrl:
        f.image_url ||
        f.imageUrl ||
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      rawFood: f,
    }));
  }, [rawFoods]);

  const handleUpdateQty = (
    foodId: number,
    delta: number,
    optionsKey?: string,
  ) => {
    const existing = cartItems.find(
      (item) =>
        Number(item.food_id) === foodId &&
        (optionsKey === undefined ||
          JSON.stringify(item.options || {}) === optionsKey),
    );
    if (existing) {
      updateQuantity(foodId, existing.quantity + delta, optionsKey);
    }
  };

  const handleRemoveItem = (foodId: number, optionsKey?: string) => {
    removeItem(foodId, optionsKey);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleAddUpsell = (upsellItem: (typeof upsellItems)[0]) => {
    if (addedUpsells[upsellItem.id]) return;
    setAddedUpsells((prev) => ({ ...prev, [upsellItem.id]: true }));
    addItem(upsellItem.rawFood, 1);
  };

  const handleProceedToCheckout = () => {
    const isAuth = Boolean(token || userId);
    if (isAuth) {
      router.push("/checkout");
    } else {
      setShowAuthModal(true);
    }
  };

  // Fetch live admin settings for dynamic tax & delivery fee threshold
  const { data: settingsRes } = useApi<any>("/settings.php");
  const settings = settingsRes?.data || settingsRes || {};

  const taxRate = parseFloat(settings.tax_rate ?? "2");
  const freeDeliveryMinSubtotal = parseFloat(
    settings.free_delivery_min_subtotal ?? "25.00",
  );

  // Financial calculations from store items
  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      (typeof item.price === "string"
        ? parseFloat(item.price)
        : Number(item.price || 0)) *
        item.quantity,
    0,
  );
  const discount = 0;
  const isFreeDelivery = subtotal >= freeDeliveryMinSubtotal;
  const estimatedDeliveryFee = subtotal > 0 ? (isFreeDelivery ? 0 : 0) : 0;
  const serviceTax = subtotal > 0 ? (subtotal * taxRate) / 100 : 0;
  const finalTotal = Math.max(
    0,
    subtotal - discount + estimatedDeliveryFee + serviceTax,
  );
  const totalItemCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  if (!mounted) {
    return (
      <main className="flex flex-col relative w-full max-w-md px-space-lg pt-4 pb-28 bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-6">
          <div className="flex items-center justify-between py-space-sm">
            <h1 className="font-extrabold text-xl text-on-surface">My Cart</h1>
          </div>
          <div className="space-y-4 mt-4 animate-pulse">
            <div className="h-24 bg-surface-container-low rounded-xl" />
            <div className="h-24 bg-surface-container-low rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen bg-surface">
      <div className="flex flex-col w-full pb-6">
        {/* Top Cart Header */}
        <div className="flex items-center justify-between py-space-sm mb-4">
          <div className="flex items-center gap-3">
            <h1 className="font-extrabold text-2xl text-on-surface">My Cart</h1>
            <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs">
              {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
            </span>
          </div>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className="text-xs font-bold text-primary hover:text-primary-container transition-colors active:scale-95 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-primary/10"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {/* Active Restaurant / Multi-Restaurant Banner */}
        {cartItems.length > 0 && (
          Object.keys(
            cartItems.reduce((acc, item) => {
              const rId = item.restaurant_id || item.food?.restaurant_id || 0;
              acc[rId] = true;
              return acc;
            }, {} as Record<number, boolean>)
          ).length > 1 ? (
            <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-500/10 rounded-2xl mb-6 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 shadow-sm animate-in fade-in">
              <Sparkles className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm text-amber-800 dark:text-amber-200">
                  Multi-Restaurant Cart
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                  You have items from multiple restaurants. Separate orders will be automatically placed for each kitchen.
                </p>
              </div>
            </div>
          ) : restaurantName ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-2xl mb-6 border border-primary/20 text-xs font-bold text-primary shadow-sm">
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Ordering from: <strong className="font-extrabold text-sm">{restaurantName}</strong></span>
            </div>
          ) : null
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-lowest rounded-3xl p-8 border border-surface-container max-w-md mx-auto my-8 shadow-sm">
            <ShoppingBag className="w-16 h-16 text-outline mx-auto mb-3 opacity-40" />
            <p className="font-extrabold text-on-surface text-lg">
              Your cart is empty
            </p>
            <p className="text-xs text-on-surface-variant mt-1 mb-6">
              Explore our wood-fired hearth menu and add delicious items.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-xs hover:bg-primary-container transition-all shadow-md active:scale-95"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          /* Desktop 2-Column Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items & Cutlery & Upsells */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
              {/* Cart Items List Grouped by Restaurant */}
              <div className="flex flex-col gap-4">
                {Object.values(
                  cartItems.reduce((acc, item) => {
                    const rId = item.restaurant_id || item.food?.restaurant_id || 0;
                    const rName =
                      item.restaurant_name ||
                      item.food?.restaurant_name ||
                      (item.food as any)?.restaurant_name ||
                      restaurantName ||
                      "Restaurant";
                    if (!acc[rId]) {
                      acc[rId] = { restaurantId: rId, restaurantName: rName, items: [] };
                    }
                    acc[rId].items.push(item);
                    return acc;
                  }, {} as Record<number, { restaurantId: number; restaurantName: string; items: typeof cartItems }>)
                ).map((group) => (
                  <div
                    key={group.restaurantId}
                    className="flex flex-col gap-3 bg-surface-container-lowest p-4 rounded-3xl border border-surface-container/80 shadow-sm"
                  >
                    {/* Kitchen Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-surface-container/60 px-1">
                      <div className="flex items-center gap-2 font-extrabold text-sm text-primary">
                        <Utensils className="w-4 h-4 text-primary" />
                        <span className="truncate">{group.restaurantName}</span>
                      </div>
                      <span className="text-xs font-extrabold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        {group.items.length} {group.items.length === 1 ? "item" : "items"}
                      </span>
                    </div>

                    {/* Restaurant Items */}
                    {group.items.map((cartItem, idx) => {
                      const foodId = Number(cartItem.food_id);
                      const imgUrl =
                        cartItem.food?.image_url ||
                        (cartItem.food as any)?.imageUrl ||
                        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80";
                      const optionsKey = JSON.stringify(cartItem.options || {});
                      const hasOptions =
                        cartItem.options && Object.keys(cartItem.options).length > 0;

                      return (
                        <div
                          key={`${cartItem.food_id}-${optionsKey}-${idx}`}
                          className="bg-surface p-4 rounded-2xl shadow-xs flex gap-4 relative transition-all duration-200 border border-surface-container/60 items-center"
                        >
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                            <img
                              src={imgUrl}
                              alt={cartItem.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex flex-col flex-1 min-w-0 justify-between gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-base text-on-surface truncate">
                                  {cartItem.name}
                                </h4>

                                {/* Selected Customization Options Badge Tags */}
                                {hasOptions ? (
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {Object.entries(cartItem.options!).map(
                                      ([grp, val]) => (
                                        <span
                                          key={grp}
                                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-surface-container-low text-on-surface-variant border border-surface-container-high"
                                        >
                                          <span className="text-outline font-normal">
                                            {grp}:
                                          </span>
                                          <span className="text-primary font-bold">
                                            {val}
                                          </span>
                                        </span>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                                    {cartItem.food?.description ||
                                      "Freshly cooked to order"}
                                  </p>
                                )}

                                {/* Customize / Edit Options Link */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const slug =
                                      cartItem.food?.slug ||
                                      (cartItem.food as any)?.id ||
                                      cartItem.food_id;
                                    router.push(`/items-detail/${slug}`);
                                  }}
                                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-2 transition-colors"
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5" />
                                  <span>Customize / Edit Options</span>
                                </button>
                              </div>
                              <button
                                type="button"
                                aria-label="Remove item"
                                onClick={() => handleRemoveItem(foodId, optionsKey)}
                                className="text-tertiary hover:text-error transition-colors p-1.5 rounded-full hover:bg-surface-container"
                              >
                                <Trash2 className="w-4.5 h-4.5 text-outline hover:text-red-500" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                              <span className="font-extrabold text-lg text-primary">
                                $
                                {(
                                  (typeof cartItem.price === "string"
                                    ? parseFloat(cartItem.price)
                                    : Number(cartItem.price || 0)) * cartItem.quantity
                                ).toFixed(2)}
                              </span>
                              <div className="flex items-center bg-surface-container-low rounded-full px-1.5 py-1 border border-surface-container-high">
                                <button
                                  type="button"
                                  aria-label="Decrease quantity"
                                  onClick={() =>
                                    handleUpdateQty(foodId, -1, optionsKey)
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface hover:bg-surface transition-transform active:scale-90"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-extrabold text-sm px-3 text-on-surface">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  type="button"
                                  aria-label="Increase quantity"
                                  onClick={() => handleUpdateQty(foodId, 1, optionsKey)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-xs hover:bg-surface transition-transform active:scale-90"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Utensils / Eco Toggle Card */}
              <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm flex items-center justify-between border border-surface-container/60">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 text-secondary">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-on-surface leading-tight">
                      Cutlery & paper napkins
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Included at no extra charge
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeCutlery}
                  onClick={() => setIncludeCutlery(!includeCutlery)}
                  className={`w-12 h-7 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer flex-shrink-0 ${
                    includeCutlery ? "bg-primary" : "bg-surface-container-highest"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                      includeCutlery ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Upsell Recommendation Grid / Carousel */}
              {upsellItems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="font-bold text-sm text-on-surface">
                      Frequently paired with
                    </span>
                    <span className="text-xs text-secondary font-bold flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Chef's pick
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {upsellItems.map((upsell) => {
                      const isAdded = addedUpsells[upsell.id];
                      return (
                        <div
                          key={upsell.id}
                          className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm flex items-center gap-3 border border-surface-container/60"
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                            <img
                              src={upsell.imageUrl}
                              alt={upsell.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs text-on-surface truncate">
                              {upsell.name}
                            </h5>
                            <span className="font-extrabold text-xs text-primary">
                              ${upsell.price.toFixed(2)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddUpsell(upsell)}
                            disabled={isAdded}
                            className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all flex items-center gap-1 ${
                              isAdded
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface"
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isAdded ? "Added" : "Add"}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Desktop Order Financial Breakdown & Checkout Button */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 flex flex-col gap-4">
              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-md flex flex-col gap-3.5 border border-surface-container/80">
                <h4 className="font-extrabold text-base text-on-surface border-b border-surface-container pb-3">
                  Order Summary
                </h4>

                <div className="flex justify-between items-center text-xs text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="text-on-surface font-extrabold text-sm">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-on-surface-variant">
                  <div className="flex flex-col">
                    <span>Delivery Fee</span>
                    <span className="text-[11px] font-bold text-secondary">
                      {isFreeDelivery
                        ? "Free Delivery Unlocked"
                        : "Calculated at checkout"}
                    </span>
                  </div>
                  <span className="text-on-surface font-extrabold text-sm">
                    {isFreeDelivery ? "$0.00" : "At Checkout"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-on-surface-variant">
                  <span>{`Packaging & Tax (${taxRate}%)`}</span>
                  <span className="text-on-surface font-extrabold text-sm">
                    ${serviceTax.toFixed(2)}
                  </span>
                </div>

                <div className="w-full h-px bg-surface-container my-1" />

                <div className="flex justify-between items-baseline pt-1">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-lg text-on-surface">
                      Total Amount
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Includes taxes & fees
                    </span>
                  </div>
                  <span className="font-extrabold text-2xl text-primary">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full h-14 mt-3 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-between px-6 hover:bg-primary-container transition-transform active:scale-[0.98] font-extrabold text-base"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-5 h-5 text-on-primary" />
                    <span>Proceed to Checkout</span>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guest Checkout Auth Choice Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-300 border border-surface-container/80 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <User className="w-7 h-7 text-primary" />
            </div>

            <h3 className="font-extrabold text-lg text-on-surface">
              Account Required?
            </h3>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Sign in to earn rewards, save delivery addresses, and track live
              order status. Or continue as guest.
            </p>

            <div className="w-full flex flex-col gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => router.push("/login?redirect=/checkout")}
                className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-bold text-xs shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In / Register</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  router.push("/checkout");
                }}
                className="w-full py-3 px-4 bg-surface-container-low border border-surface-container-high text-on-surface rounded-xl font-bold text-xs hover:bg-surface-container transition-all flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-on-surface-variant" />
                <span>Continue as Guest</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
