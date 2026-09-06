"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Minus,
  Plus,
  Truck,
  Utensils,
  Ticket,
  Lock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { useCartStore, useAuthStore } from "@/lib/store";
import { useApi } from "@/lib/api";

export const CartView: React.FC = () => {
  const router = useRouter();
  const { name: customerName, userId, phone } = useAuthStore();
  const {
    items: cartItems,
    updateQuantity,
    removeItem,
    clearCart,
    addItem,
  } = useCartStore();

  const [includeCutlery, setIncludeCutlery] = useState(true);
  const [promoApplied, setPromoApplied] = useState(false);
  const [addedUpsells, setAddedUpsells] = useState<Record<string, boolean>>({});

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

  const handleUpdateQty = (foodId: number, delta: number) => {
    const existing = cartItems.find((item) => Number(item.food_id) === foodId);
    if (existing) {
      updateQuantity(foodId, existing.quantity + delta);
    }
  };

  const handleRemoveItem = (foodId: number) => {
    removeItem(foodId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleAddUpsell = (upsellItem: (typeof upsellItems)[0]) => {
    if (addedUpsells[upsellItem.id]) return;
    setAddedUpsells((prev) => ({ ...prev, [upsellItem.id]: true }));
    addItem(upsellItem.rawFood, 1);
  };

  // Financial calculations from store items
  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      (typeof item.price === "string" ? parseFloat(item.price) : Number(item.price || 0)) *
        item.quantity,
    0,
  );
  const discount = promoApplied ? 5.0 : 0;
  const deliveryThreshold = 40.0;
  const deliveryFee = subtotal >= deliveryThreshold || subtotal === 0 ? 0 : 2.5;
  const amountToFreeDelivery = Math.max(0, deliveryThreshold - subtotal);
  const deliveryProgressPercent = Math.min(
    100,
    Math.round((subtotal / deliveryThreshold) * 100),
  );

  const serviceTax = subtotal > 0 ? 2.45 : 0;
  const finalTotal = Math.max(
    0,
    subtotal - discount + deliveryFee + serviceTax,
  );
  const totalItemCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  return (
    <main className="flex flex-col relative w-full max-w-md px-space-lg pt-4 pb-28 bg-surface min-h-screen">
      <div className="flex flex-col w-full pb-6">
        {/* Top Cart Action Header */}
        <div className="flex items-center justify-between py-space-sm">
          <div className="flex items-center gap-space-2xs">
            <h1 className="font-extrabold text-xl text-on-surface">My Cart</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs">
              {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
            </span>
          </div>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className="text-xs font-bold text-primary hover:text-primary-container transition-colors active:scale-95 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {/* Delivery Progress Indicator */}
        <div className="bg-surface-container-low p-space-sm rounded-xl mb-space-md shadow-sm border border-surface-container/60">
          <div className="flex items-center justify-between mb-space-2xs">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-secondary" />
              <span className="font-bold text-xs text-on-surface">
                Free Delivery Threshold
              </span>
            </div>
            <span className="text-xs text-primary font-bold">
              {amountToFreeDelivery > 0
                ? `Add $${amountToFreeDelivery.toFixed(2)} more!`
                : "Free Delivery Unlocked!"}
            </span>
          </div>
          <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-500 rounded-full"
              style={{ width: `${deliveryProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        {cartItems.length > 0 ? (
          <div className="flex flex-col gap-space-sm mb-space-lg">
            {cartItems.map((cartItem) => {
              const foodId = Number(cartItem.food_id);
              const imgUrl =
                cartItem.food?.image_url ||
                (cartItem.food as any)?.imageUrl ||
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80";

              return (
                <div
                  key={cartItem.food_id}
                  className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex gap-space-sm relative transition-all duration-200 border border-surface-container/60"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                    <img
                      src={imgUrl}
                      alt={cartItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0 justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-on-surface truncate">
                          {cartItem.name}
                        </h4>
                        <p className="text-xs text-on-surface-variant line-clamp-1">
                          {cartItem.food?.description || "Freshly cooked to order"}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => handleRemoveItem(foodId)}
                        className="text-tertiary hover:text-error transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4 text-outline hover:text-red-500" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-space-2xs">
                      <span className="font-extrabold text-base text-primary">
                        $
                        {(
                          (typeof cartItem.price === "string"
                            ? parseFloat(cartItem.price)
                            : Number(cartItem.price || 0)) * cartItem.quantity
                        ).toFixed(2)}
                      </span>
                      <div className="flex items-center bg-surface-container-low rounded-full px-1 py-0.5 border border-surface-container-high">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => handleUpdateQty(foodId, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface hover:bg-surface transition-transform active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-xs px-2 text-on-surface">
                          {cartItem.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => handleUpdateQty(foodId, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface transition-transform active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface-container-lowest rounded-xl p-6 border border-surface-container mb-space-lg">
            <ShoppingBag className="w-12 h-12 text-outline mx-auto mb-2 opacity-50" />
            <p className="font-bold text-on-surface text-base">
              Your cart is empty
            </p>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">
              Explore our wood-fired hearth menu and add delicious items.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-xs hover:bg-primary-container transition-all"
            >
              Browse Menu
            </button>
          </div>
        )}

        {/* Utensils / Eco Toggle Card */}
        <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex items-center justify-between mb-space-md border border-surface-container/60">
          <div className="flex items-center gap-space-sm min-w-0 pr-2">
            <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 text-secondary">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-on-surface leading-tight">
                Cutlery & paper napkins
              </p>
              <p className="text-[11px] text-on-surface-variant">
                Included at no extra charge
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={includeCutlery}
            onClick={() => setIncludeCutlery(!includeCutlery)}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer flex-shrink-0 ${
              includeCutlery ? "bg-primary" : "bg-surface-container-highest"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                includeCutlery ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Promo Code Card */}
        <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm mb-space-md border border-surface-container/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                {promoApplied ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-[10px] uppercase tracking-wider bg-secondary-fixed text-on-secondary-fixed px-1.5 py-0.5 rounded">
                      AMBER20
                    </span>
                    <span className="text-xs text-primary font-semibold truncate">
                      ✓ $5.00 discount applied
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Have a promo code?
                  </span>
                )}
              </div>
            </div>

            {promoApplied ? (
              <button
                type="button"
                onClick={() => setPromoApplied(false)}
                className="text-xs font-bold text-error hover:opacity-80 transition-opacity"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPromoApplied(true)}
                className="text-xs font-bold text-primary hover:text-primary-container transition-colors"
              >
                Apply AMBER20
              </button>
            )}
          </div>
        </div>

        {/* Upsell Recommendation Carousel */}
        {upsellItems.length > 0 && (
          <div className="mb-space-lg">
            <div className="flex items-center justify-between mb-space-xs px-1">
              <span className="font-bold text-xs text-on-surface">
                Frequently paired with
              </span>
              <span className="text-[11px] text-secondary font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Chef's pick
              </span>
            </div>

            <div className="flex gap-space-sm overflow-x-auto pb-1 -mx-space-lg px-space-lg no-scrollbar">
              {upsellItems.map((upsell) => {
                const isAdded = addedUpsells[upsell.id];
                return (
                  <div
                    key={upsell.id}
                    className="bg-surface-container-lowest p-2 rounded-xl shadow-sm flex items-center gap-space-sm flex-shrink-0 w-64 border border-surface-container/60"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
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
                      <span className="font-bold text-xs text-primary">
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
                      <Plus className="w-3 h-3" />
                      <span>{isAdded ? "Added" : "Add"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Breakdown Card */}
        {cartItems.length > 0 && (
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-2.5 mb-space-xl border border-surface-container/60">
            <h4 className="font-bold text-sm text-on-surface border-b border-surface-container pb-2">
              Order Summary
            </h4>

            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <span>Subtotal</span>
              <span className="text-on-surface font-semibold">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {promoApplied && (
              <div className="flex justify-between items-center text-xs text-primary font-bold">
                <span>Promo Discount (AMBER20)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <div className="flex flex-col">
                <span>Delivery Fee</span>
                <span className="text-[10px] font-bold text-secondary">
                  {subtotal >= deliveryThreshold
                    ? "Free over $40.00"
                    : "Standard Delivery"}
                </span>
              </div>
              <span className="text-on-surface font-semibold">
                ${deliveryFee.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <span>Restaurant Service & Tax</span>
              <span className="text-on-surface font-semibold">
                ${serviceTax.toFixed(2)}
              </span>
            </div>

            <div className="w-full h-px bg-surface-container my-1" />

            <div className="flex justify-between items-baseline pt-1">
              <div className="flex flex-col">
                <span className="font-extrabold text-base text-on-surface">
                  Total Amount
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  Includes taxes & operational fees
                </span>
              </div>
              <span className="font-extrabold text-xl text-primary">
                ${finalTotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Sticky Checkout Trigger Button */}
        {cartItems.length > 0 && (
          <div className="sticky bottom-20 z-30 pt-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="w-full h-[52px] bg-primary text-on-primary rounded-xl shadow-xl flex items-center justify-between px-space-md hover:bg-primary-container transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-on-primary/20 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-on-primary" />
                </div>
                <span className="font-bold text-sm">Proceed to Checkout</span>
              </div>
              <div className="flex items-center gap-1.5 font-extrabold text-sm">
                <span>${finalTotal.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </main>
  );
};
