"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Store,
  Utensils,
  Search,
  MapPin,
  Phone,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Flame,
  Plus,
  Check,
  X,
  Building2,
  Clock,
} from "lucide-react";

import { Api, useApi } from "@/lib/api";
import { useCartStore } from "@/lib/store/useCartStore";
import { FoodCard, FoodItem } from "@/components/customer/FoodCard";
import { AddProductPopup } from "@/components/customer/AddProductPopup";
import { RestaurantConflictModal } from "@/components/customer/RestaurantConflictModal";
import { FloatingCartBar } from "@/components/customer/FloatingCartBar";
import { BottomNav } from "@/components/customer/BottomNav";

interface RestaurantWithFoods {
  id: number;
  name: string;
  slug?: string;
  logo_url?: string;
  banner_url?: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  total_foods_count: number;
  foods?: Array<{
    id: number;
    restaurant_id: number;
    category_id?: number;
    category_name?: string;
    name: string;
    slug?: string;
    price: number;
    description?: string;
    image_url?: string;
    badge_text?: string;
    badge_type?: "chef" | "fire" | "award";
    is_top_seller?: boolean;
    is_featured?: boolean;
    prep_time_minutes?: number;
    options?: any[];
    is_available?: boolean;
    stock_quantity?: number;
  }>;
}

export default function AllRestaurantsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemForPopup, setSelectedItemForPopup] = useState<FoodItem | null>(null);

  // Cart Store hooks
  const cartItems = useCartStore((state) => state.items);
  const addFoodToCart = useCartStore((state) => state.addItem);
  const forceAddFoodToCart = useCartStore((state) => state.forceAddItem);

  // Restaurant conflict modal state
  const [conflictModalState, setConflictModalState] = useState<{
    isOpen: boolean;
    currentRestaurantName: string;
    newRestaurantName: string;
    pendingFood: any;
    pendingQuantity: number;
    pendingOptions: any;
    pendingNotes: string;
  }>({
    isOpen: false,
    currentRestaurantName: "",
    newRestaurantName: "",
    pendingFood: null,
    pendingQuantity: 1,
    pendingOptions: {},
    pendingNotes: "",
  });

  // Fetch all active restaurants with their food list directly from PHP backend API
  const { data: rawRestaurants, loading: isLoading, error, refetch } = useApi<RestaurantWithFoods[]>(
    "/restaurants.php",
    { active_only: 1, include_foods: 1, foods_limit: 8 }
  );

  const restaurantsList: RestaurantWithFoods[] = useMemo(() => {
    if (!Array.isArray(rawRestaurants)) return [];
    return [...rawRestaurants].sort(
      (a, b) => (b.total_foods_count || 0) - (a.total_foods_count || 0)
    );
  }, [rawRestaurants]);

  // Filter restaurants by search query (matching restaurant name, address, or item names inside)
  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return restaurantsList;

    const query = searchQuery.toLowerCase().trim();
    return restaurantsList.filter((resto) => {
      const matchRestoName = resto.name?.toLowerCase().includes(query);
      const matchAddress = resto.address?.toLowerCase().includes(query);
      const matchFoods = resto.foods?.some(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          (f.description && f.description.toLowerCase().includes(query))
      );
      return matchRestoName || matchAddress || matchFoods;
    });
  }, [restaurantsList, searchQuery]);

  // Convert raw API food object into FoodItem standard
  const formatFoodItem = (f: any, resto: RestaurantWithFoods): FoodItem => {
    let parsedOptions = [];
    try {
      if (typeof f.options === "string" && f.options.trim()) {
        parsedOptions = JSON.parse(f.options);
      } else if (Array.isArray(f.options)) {
        parsedOptions = f.options;
      }
    } catch {
      parsedOptions = [];
    }

    return {
      id: String(f.id),
      restaurant_id: Number(resto.id),
      restaurant_name: resto.name,
      restaurant_logo: resto.logo_url || "",
      slug: f.slug || String(f.id),
      name: f.name,
      category: f.category_name || "General",
      price: Number(f.price || 0),
      description: f.description || "",
      imageUrl:
        f.image_url ||
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      badge: f.badge_text
        ? { text: f.badge_text, type: f.badge_type || "fire" }
        : f.is_top_seller
        ? { text: "Top Seller", type: "fire" }
        : undefined,
      options: parsedOptions,
      prepTimeMinutes: f.prep_time_minutes,
    };
  };

  // Add to cart handler
  const handleAddToCart = (newItem: {
    item: FoodItem;
    quantity: number;
    selectedOptions: Record<string, string>;
    specialInstructions: string;
    totalPrice: number;
  }) => {
    const foodPayload = {
      id: Number(newItem.item.id),
      restaurant_id: newItem.item.restaurant_id || 1,
      restaurant_name: newItem.item.restaurant_name || "Restaurant",
      name: newItem.item.name,
      price: newItem.item.price,
      image_url: newItem.item.imageUrl,
      category: newItem.item.category,
      description: newItem.item.description,
      is_available: true,
    };

    const res = addFoodToCart(
      foodPayload as any,
      newItem.quantity,
      newItem.selectedOptions,
      newItem.specialInstructions
    );

    if (res.isConflict) {
      setConflictModalState({
        isOpen: true,
        currentRestaurantName: res.currentRestaurantName || "Current Kitchen",
        newRestaurantName: res.newRestaurantName || "New Kitchen",
        pendingFood: foodPayload,
        pendingQuantity: newItem.quantity,
        pendingOptions: newItem.selectedOptions,
        pendingNotes: newItem.specialInstructions,
      });
    }
  };

  // Quick add (direct 1 item add)
  const handleQuickAdd = (foodItem: FoodItem) => {
    const foodPayload = {
      id: Number(foodItem.id),
      restaurant_id: foodItem.restaurant_id || 1,
      restaurant_name: foodItem.restaurant_name || "Restaurant",
      name: foodItem.name,
      price: foodItem.price,
      image_url: foodItem.imageUrl,
      category: foodItem.category,
      description: foodItem.description,
      is_available: true,
    };

    const res = addFoodToCart(foodPayload as any, 1, {}, "");
    if (res.isConflict) {
      setConflictModalState({
        isOpen: true,
        currentRestaurantName: res.currentRestaurantName || "Current Kitchen",
        newRestaurantName: res.newRestaurantName || "New Kitchen",
        pendingFood: foodPayload,
        pendingQuantity: 1,
        pendingOptions: {},
        pendingNotes: "",
      });
    }
  };

  // Confirm switching kitchen modal
  const handleConfirmSwitchKitchen = () => {
    if (conflictModalState.pendingFood) {
      forceAddFoodToCart(
        conflictModalState.pendingFood,
        conflictModalState.pendingQuantity,
        conflictModalState.pendingOptions,
        conflictModalState.pendingNotes
      );
    }
    setConflictModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-start pb-28">
      {/* Mobile-first Container Frame */}
      <main className="w-full max-w-md mx-auto min-h-screen flex flex-col relative px-4 pt-3">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md pt-2 pb-3 border-b border-surface-container/40 -mx-4 px-4 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full bg-surface-container/70 flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-extrabold text-base text-on-surface leading-tight">
                All Restaurants
              </h1>
              <p className="text-[11px] text-on-surface-variant font-medium">
                {restaurantsList.length} Kitchens Available
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="relative w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors active:scale-95"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-up">
                {totalCartCount}
              </span>
            )}
          </button>
        </header>

        {/* Search Input Bar */}
        <div className="my-3 relative">
          <div className="relative flex items-center w-full">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high/80 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 p-1 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Hero Section Badge */}
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-surface-container-low border border-primary/20 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-xs text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span>Multi-Tenant Dining</span>
              <Sparkles className="w-3.5 h-3.5 text-primary fill-primary/30" />
            </h2>
            <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium line-clamp-1">
              Order dishes across top partner kitchens with direct kitchen routing.
            </p>
          </div>
        </div>

        {/* Skeleton Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-3xl bg-surface-container-lowest border border-surface-container/60 p-4 shadow-sm animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-high" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-surface-container-high rounded-md w-1/2" />
                    <div className="h-3 bg-surface-container-high rounded-md w-3/4" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="h-36 rounded-xl bg-surface-container-high" />
                  <div className="h-36 rounded-xl bg-surface-container-high" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="my-8 text-center p-6 rounded-2xl bg-error/10 border border-error/20 text-error">
            <p className="font-bold text-sm">Failed to load restaurants</p>
            <p className="text-xs mt-1">{error}</p>
            <button
              type="button"
              onClick={() => refetch(true)}
              className="mt-3 px-4 py-2 rounded-full bg-error text-on-error font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty Search Result */}
        {!isLoading && !error && filteredRestaurants.length === 0 && (
          <div className="my-12 text-center p-8 rounded-3xl bg-surface-container-lowest border border-surface-container/60 shadow-xs flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Store className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-on-surface">
              No Restaurants Found
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
              We couldn't find any kitchen or dish matching &quot;{searchQuery}&quot;. Try another search keyword.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs transition-all"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Restaurant Cards Container */}
        {!isLoading && !error && filteredRestaurants.length > 0 && (
          <div className="space-y-6">
            {filteredRestaurants.map((resto) => {
              const restoFoods = resto.foods || [];

              return (
                <section
                  key={resto.id}
                  className="rounded-3xl bg-surface-container-lowest border border-surface-container/70 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Restaurant Header Banner Card */}
                  <div className="relative p-4 bg-gradient-to-b from-surface-container-low/60 to-surface-container-lowest border-b border-surface-container/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Logo Avatar */}
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container border border-surface-container-high shadow-xs flex items-center justify-center flex-shrink-0">
                          {resto.logo_url ? (
                            <img
                              src={resto.logo_url}
                              alt={resto.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="font-extrabold text-lg text-primary uppercase">
                              {resto.name.substring(0, 2)}
                            </span>
                          )}
                        </div>

                        {/* Restaurant Information */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-extrabold text-base text-on-surface truncate">
                              {resto.name}
                            </h3>
                            {resto.is_active && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Open Now
                              </span>
                            )}
                          </div>

                          {resto.address && (
                            <div className="flex items-center gap-1 text-xs text-on-surface-variant mt-0.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span className="truncate">{resto.address}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-1 text-[11px] text-on-surface-variant font-medium">
                            <span className="flex items-center gap-1 text-primary font-bold">
                              <Utensils className="w-3 h-3" />
                              {resto.total_foods_count}{" "}
                              {resto.total_foods_count === 1 ? "Dishes" : "Dishes Available"}
                            </span>
                            {resto.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-on-surface-variant/70" />
                                {resto.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* View Full Menu Action */}
                      <Link
                        href={`/?restaurant=${resto.id}`}
                        className="px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 transition-all active:scale-95 flex-shrink-0"
                      >
                        <span>Menu</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Food Items Section under each Restaurant */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-primary" />
                        <span>Featured Dishes</span>
                      </h4>
                      <Link
                        href={`/?restaurant=${resto.id}`}
                        className="text-[11px] font-bold text-primary hover:underline"
                      >
                        View all {resto.total_foods_count} &rarr;
                      </Link>
                    </div>

                    {restoFoods.length === 0 ? (
                      <div className="p-4 rounded-xl bg-surface-container-low text-center text-xs text-on-surface-variant font-medium">
                        No public food items listed for this kitchen yet.
                      </div>
                    ) : (
                      /* Horizontal Scrollable or 2-Column Responsive Grid */
                      <div className="grid grid-cols-2 gap-3">
                        {restoFoods.map((rawFood) => {
                          const item = formatFoodItem(rawFood, resto);
                          return (
                            <FoodCard
                              key={item.id}
                              item={item}
                              onSelect={(food) => setSelectedItemForPopup(food)}
                              onQuickAdd={(food) => handleQuickAdd(food)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Product Options Modal */}
        <AddProductPopup
          item={selectedItemForPopup}
          isOpen={Boolean(selectedItemForPopup)}
          onClose={() => setSelectedItemForPopup(null)}
          onAddToCart={handleAddToCart}
        />

        {/* Kitchen Switch Conflict Modal */}
        <RestaurantConflictModal
          isOpen={conflictModalState.isOpen}
          currentRestaurantName={conflictModalState.currentRestaurantName}
          newRestaurantName={conflictModalState.newRestaurantName}
          onClose={() =>
            setConflictModalState((prev) => ({ ...prev, isOpen: false }))
          }
          onConfirmReplace={handleConfirmSwitchKitchen}
        />

        {/* Floating Cart & Navigation */}
        <FloatingCartBar onViewCart={() => router.push("/cart")} />
        <BottomNav activeTab="home" cartBadgeCount={totalCartCount} />
      </main>
    </div>
  );
}
