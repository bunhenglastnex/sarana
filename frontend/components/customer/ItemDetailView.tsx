"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Clock,
  Flame,
  Award,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { FoodItem } from "./FoodCard";
import { ShareModal } from "./ShareModal";
import { RestaurantConflictModal } from "./RestaurantConflictModal";
import Api, { useApi } from "@/lib/api";
import { useCartStore, useAuthStore, useFavoritesStore } from "@/lib/store";

interface ItemDetailViewProps {
  slug: string;
}

export const ItemDetailView: React.FC<ItemDetailViewProps> = ({ slug }) => {
  const router = useRouter();
  const addItemToCart = useCartStore((state) => state.addItem);
  const forceAddItemToCart = useCartStore((state) => state.forceAddItem);
  const { userId, phone } = useAuthStore();
  const isLocalFavorite = useFavoritesStore((state) => state.isLocalFavorite);
  const toggleLocalFavorite = useFavoritesStore(
    (state) => state.toggleLocalFavorite,
  );

  // Fetch live food detail by slug or ID from backend API
  const {
    data: apiResponse,
    loading,
    error,
  } = useApi<any>("/foods.php", {
    slug,
  });

  const rawItem = apiResponse?.data || apiResponse;

  // Format single food detail item
  const item: FoodItem | null = useMemo(() => {
    if (!rawItem || typeof rawItem !== "object" || !rawItem.name) {
      return null;
    }

    let parsedOptions = [];
    try {
      if (typeof rawItem.options === "string" && rawItem.options.trim()) {
        parsedOptions = JSON.parse(rawItem.options);
      } else if (Array.isArray(rawItem.options)) {
        parsedOptions = rawItem.options;
      }
    } catch {
      parsedOptions = [];
    }

    return {
      id: String(rawItem.id),
      restaurant_id: Number(rawItem.restaurant_id || 1),
      restaurant_name: rawItem.restaurant_name || "Amber Bistro",
      restaurant_logo: rawItem.restaurant_logo || "",
      slug: rawItem.slug || String(rawItem.id),
      name: rawItem.name,
      category: rawItem.category_slug || rawItem.category || "general",
      price: Number(rawItem.price || 0),
      description: rawItem.description || "",
      imageUrl:
        rawItem.imageUrl ||
        rawItem.image_url ||
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      badge:
        rawItem.badge ||
        (rawItem.badge_text
          ? { text: rawItem.badge_text, type: rawItem.badge_type || "fire" }
          : undefined),
      options: parsedOptions,
      stockQuantity: rawItem.stockQuantity ?? rawItem.stock_quantity ?? 50,
      prepTimeMinutes:
        rawItem.prepTimeMinutes ?? rawItem.prep_time_minutes ?? 15,
      is_available: rawItem.is_available ?? rawItem.isAvailable ?? true,
    };
  }, [rawItem]);

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Cart conflict state
  const [conflictModalState, setConflictModalState] = useState<{
    isOpen: boolean;
    currentRestaurantName: string;
    newRestaurantName: string;
  }>({
    isOpen: false,
    currentRestaurantName: "",
    newRestaurantName: "",
  });

  // Check initial favorite status (DB if logged in, IndexedDB if guest)
  useEffect(() => {
    if (!item?.id) return;
    if (userId || phone) {
      Api.get("/favorites.php", { phone, user_id: userId })
        .then((res) => {
          const favs = res.data?.data || res.data || [];
          if (Array.isArray(favs)) {
            const isFav = favs.some(
              (f: any) => String(f.food_id || f.id) === String(item.id),
            );
            setIsFavorite(isFav);
          }
        })
        .catch(() => {});
    } else {
      setIsFavorite(isLocalFavorite(item.id));
    }
  }, [item?.id, userId, phone, isLocalFavorite]);

  const toggleFavorite = async () => {
    if (!item?.id) return;
    const newFavState = !isFavorite;
    setIsFavorite(newFavState);

    if (userId || phone) {
      try {
        await Api.post("/favorites.php", {
          food_id: Number(item.id),
          phone,
          user_id: userId,
        });
      } catch {
        setIsFavorite(!newFavState);
      }
    } else {
      toggleLocalFavorite(item.id);
    }
  };

  const calculateTotal = () => {
    if (!item) return 0;
    let extra = 0;
    if (item.options) {
      item.options.forEach((group) => {
        const chosen = selectedOptions[group.name];
        if (chosen) {
          const match = group.choices?.find((c) => c.label === chosen);
          if (match) extra += match.priceExtra;
        }
      });
    }
    return (item.price + extra) * quantity;
  };

  const handleOptionSelect = (
    groupName: string,
    choiceLabel: string,
    isRequired: boolean,
  ) => {
    setSelectedOptions((prev) => {
      if (!isRequired && prev[groupName] === choiceLabel) {
        const next = { ...prev };
        delete next[groupName];
        return next;
      }
      return {
        ...prev,
        [groupName]: choiceLabel,
      };
    });
  };

  const handleAddToCart = () => {
    if (!item) return;

    const foodPayload = {
      id: Number(item.id),
      restaurant_id: item.restaurant_id || 1,
      restaurant_name: item.restaurant_name || "Restaurant",
      name: item.name,
      price: item.price,
      image_url: item.imageUrl,
      category: item.category,
      description: item.description,
      is_available: true,
    };

    const res = addItemToCart(
      foodPayload as any,
      quantity,
      selectedOptions
    );

    if (res.isConflict) {
      setConflictModalState({
        isOpen: true,
        currentRestaurantName: res.currentRestaurantName || "Current Restaurant",
        newRestaurantName: res.newRestaurantName || "New Restaurant",
      });
      return;
    }

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      router.push("/cart");
    }, 1000);
  };

  // Loading Spinner View
  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="font-bold text-sm text-on-surface-variant">
          Loading item details...
        </p>
      </div>
    );
  }

  // Not Found / Error View
  if (!item || error) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="font-extrabold text-lg text-on-surface">
          Item Not Found
        </h2>
        <p className="text-xs text-on-surface-variant mt-1 mb-6">
          The requested menu item could not be found or is currently
          unavailable.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="py-3 px-6 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md active:scale-95 transition-all"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const totalPrice = calculateTotal();
  const maxStock = item.stockQuantity ?? 50;

  return (
    <div className="bg-surface text-on-surface font-sans text-sm min-h-screen selection:bg-primary/20 selection:text-primary pb-16 w-full">
      {/* Top Desktop Navigation & Action Header */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back to home"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors font-bold text-xs text-on-surface border border-surface-container-highest"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            aria-label="Share item"
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors border border-surface-container-highest"
          >
            <Share2 className="w-4 h-4 text-on-surface-variant" />
          </button>

          <button
            type="button"
            onClick={toggleFavorite}
            aria-label="Toggle favorite"
            className={`w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors border border-surface-container-highest ${
              isFavorite
                ? "text-red-500 fill-red-500"
                : "text-on-surface-variant"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Main 2-Column Split Container Frame */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Hero Image Card */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="relative w-full h-80 sm:h-96 lg:h-[460px] bg-surface-container rounded-3xl overflow-hidden shadow-lg border border-surface-container/60">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Badge Overlay */}
            {item.badge && (
              <div className="absolute bottom-4 left-4 bg-surface-bright/90 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                {item.badge.type === "fire" ? (
                  <Flame className="w-4 h-4 text-primary" />
                ) : item.badge.type === "award" ? (
                  <Award className="w-4 h-4 text-secondary" />
                ) : (
                  <Star className="w-4 h-4 text-secondary fill-secondary" />
                )}
                <span className="font-bold text-xs text-on-surface">
                  {item.badge.text}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Product Info & Variant Options & Action Card */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Header Identity Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-surface-container/60 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-extrabold text-2xl text-on-surface leading-tight">
                {item.name}
              </h1>
              <span className="font-extrabold text-2xl text-primary flex-shrink-0">
                ${item.price.toFixed(2)}
              </span>
            </div>

            {/* Metrics & Stock Inventory Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-surface-container text-xs text-on-surface-variant">
              <div className="flex items-center gap-1 font-semibold">
                <Clock className="w-4 h-4 text-primary" />
                <span>{item.prepTimeMinutes || 15} mins prep time</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-outline-variant" />

              {/* Stock Inventory Pill */}
              {maxStock <= 0 ? (
                <div className="flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  <span>❌ Sold Out</span>
                </div>
              ) : maxStock <= 5 ? (
                <div className="flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 animate-pulse">
                  <span>⚠️ Only {maxStock} left in stock!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{maxStock} in stock</span>
                </div>
              )}
            </div>

            {/* Detailed Culinary Description */}
            {item.description && (
              <p className="text-sm text-on-surface-variant leading-relaxed pt-1">
                {item.description}
              </p>
            )}
          </div>

          {/* Customization Options */}
          {item.options && item.options.length > 0 && (
            <div className="space-y-4">
              {item.options.map((optGroup) => {
                const isRequired =
                  optGroup.required ??
                  (!optGroup.name.toLowerCase().includes("extra") &&
                    !optGroup.name.toLowerCase().includes("topping") &&
                    !optGroup.name.toLowerCase().includes("optional"));

                return (
                  <div
                    key={optGroup.name}
                    className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-surface-container/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-on-surface">
                        {optGroup.name}
                      </span>
                      {isRequired ? (
                        <span className="text-xs font-semibold text-primary">
                          Required
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-on-surface-variant">
                          Optional
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {optGroup.choices?.map((choice) => {
                        const isSelected =
                          selectedOptions[optGroup.name] === choice.label;
                        return (
                          <button
                            key={choice.label}
                            type="button"
                            onClick={() =>
                              handleOptionSelect(
                                optGroup.name,
                                choice.label,
                                isRequired,
                              )
                            }
                            className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition-all active:scale-[0.99] ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                : "border-surface-container-high bg-surface-container-lowest text-on-surface hover:border-outline"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? "border-primary bg-primary text-white"
                                    : "border-outline"
                                }`}
                              >
                                {isSelected && (
                                  <Check className="w-3 h-3 stroke-[3]" />
                                )}
                              </div>
                              <span>{choice.label}</span>
                            </div>
                            {choice.priceExtra > 0 && (
                              <span className="text-on-surface-variant font-medium">
                                +${choice.priceExtra.toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Desktop Add to Order Action Panel */}
          <div className="bg-surface-container-lowest border border-surface-container/80 p-4 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center justify-center bg-surface-container-high rounded-full p-1.5 border border-surface-container-highest w-full sm:w-auto">
              <button
                type="button"
                disabled={maxStock <= 0}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-90 transition-all disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold text-base text-on-surface">
                {quantity}
              </span>
              <button
                type="button"
                disabled={maxStock <= 0 || quantity >= maxStock}
                onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                aria-label="Increase quantity"
                className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-90 transition-all disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              disabled={maxStock <= 0}
              onClick={handleAddToCart}
              className={`w-full flex-1 py-3.5 px-6 rounded-full font-extrabold text-sm flex items-center justify-between shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                maxStock <= 0
                  ? "bg-surface-container-highest text-on-surface-variant"
                  : added
                    ? "bg-secondary text-on-secondary"
                    : "bg-primary text-on-primary hover:bg-primary-container"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {maxStock <= 0 ? (
                  <span>Out of Stock</span>
                ) : added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Order!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Order</span>
                  </>
                )}
              </div>
              {maxStock > 0 && <span className="text-base">${totalPrice.toFixed(2)}</span>}
            </button>
          </div>
        </div>
      </main>

      {/* Share Item Popup Modal */}
      {item && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          title={item.name}
          description={item.description}
          imageUrl={item.imageUrl}
          price={item.price}
        />
      )}

      {/* Multi-Restaurant Cart Conflict Modal */}
      {item && (
        <RestaurantConflictModal
          isOpen={conflictModalState.isOpen}
          currentRestaurantName={conflictModalState.currentRestaurantName}
          newRestaurantName={conflictModalState.newRestaurantName}
          onClose={() =>
            setConflictModalState((prev) => ({ ...prev, isOpen: false }))
          }
          onConfirmReplace={() => {
            const foodPayload = {
              id: Number(item.id),
              restaurant_id: item.restaurant_id || 1,
              restaurant_name: item.restaurant_name || "Restaurant",
              name: item.name,
              price: item.price,
              image_url: item.imageUrl,
              category: item.category,
              description: item.description,
              is_available: true,
            };
            forceAddItemToCart(foodPayload as any, quantity, selectedOptions);
            setAdded(true);
            setTimeout(() => {
              setAdded(false);
              router.push("/cart");
            }, 1000);
          }}
        />
      )}
    </div>
  );
};
