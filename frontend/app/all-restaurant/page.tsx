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
  Filter,
  Star,
  CheckCircle2,
} from "lucide-react";

import { Api, useApi } from "@/lib/api";
import { useCartStore } from "@/lib/store/useCartStore";
import { FoodCard, FoodItem } from "@/components/customer/FoodCard";
import { AddProductPopup } from "@/components/customer/AddProductPopup";
import { RestaurantConflictModal } from "@/components/customer/RestaurantConflictModal";
import { FloatingCartBar } from "@/components/customer/FloatingCartBar";

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
  const [activeFilter, setActiveFilter] = useState<"all" | "open" | "popular">("all");
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

  // Filter restaurants by active tab & search query
  const filteredRestaurants = useMemo(() => {
    let list = restaurantsList;

    if (activeFilter === "open") {
      list = list.filter((r) => r.is_active);
    } else if (activeFilter === "popular") {
      list = list.filter((r) => (r.total_foods_count || 0) >= 3);
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter((resto) => {
      const matchRestoName = resto.name?.toLowerCase().includes(query);
      const matchAddress = resto.address?.toLowerCase().includes(query);
      const matchFoods = resto.foods?.some(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          (f.description && f.description.toLowerCase().includes(query))
      );
      return matchRestoName || matchAddress || matchFoods;
    });
  }, [restaurantsList, searchQuery, activeFilter]);

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
    <div className="min-h-screen bg-surface flex flex-col w-full pb-28">
      {/* Main Responsive Layout Wrapper */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Desktop & Mobile Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/15 via-surface-container-low to-secondary/15 border border-primary/20 p-6 sm:p-8 shadow-sm">
          {/* Decorative ambient glows */}
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="font-extrabold text-xs tracking-wide uppercase">
                  Multi-Tenant Partner Kitchens
                </span>
                <Sparkles className="w-3.5 h-3.5 text-primary fill-primary/30" />
              </div>

              <h1 className="font-black text-2xl sm:text-3xl lg:text-4xl text-on-surface tracking-tight">
                Explore All Partner Restaurants &amp; Bistros
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed">
                Discover woodfire craft menus, artisanal kitchens, and signature dishes with live order dispatch and unified delivery.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
              <div className="px-4 py-3 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md border border-surface-container/80 shadow-xs text-center flex-1 sm:flex-initial">
                <span className="font-black text-xl text-primary block leading-none">
                  {restaurantsList.length}
                </span>
                <span className="text-[11px] font-bold text-on-surface-variant mt-1 block uppercase tracking-wider">
                  Partner Kitchens
                </span>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md border border-surface-container/80 shadow-xs text-center flex-1 sm:flex-initial">
                <span className="font-black text-xl text-secondary block leading-none">
                  100%
                </span>
                <span className="text-[11px] font-bold text-on-surface-variant mt-1 block uppercase tracking-wider">
                  Live Dispatch
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar & Quick Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest p-3.5 sm:p-4 rounded-2xl border border-surface-container/80 shadow-xs">
          {/* Search Input Field */}
          <div className="relative flex items-center w-full sm:max-w-md">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/80 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 p-1 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Pill Chips */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === "all"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>All Kitchens ({restaurantsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("open")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === "open"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Open Now</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("popular")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === "popular"
                  ? "bg-secondary text-on-secondary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span>Popular Choice</span>
            </button>
          </div>
        </div>

        {/* Skeleton Loading State */}
        {isLoading && (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-3xl bg-surface-container-lowest border border-surface-container/60 p-6 shadow-sm animate-pulse space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-high" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-surface-container-high rounded-md w-1/3" />
                    <div className="h-3.5 bg-surface-container-high rounded-md w-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-52 rounded-2xl bg-surface-container-high" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="my-8 text-center p-8 rounded-3xl bg-error/10 border border-error/20 text-error max-w-md mx-auto">
            <p className="font-bold text-base">Failed to load restaurants</p>
            <p className="text-xs mt-1 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={() => refetch(true)}
              className="mt-4 px-5 py-2.5 rounded-full bg-error text-on-error font-bold text-xs shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Empty Search Result */}
        {!isLoading && !error && filteredRestaurants.length === 0 && (
          <div className="my-12 text-center p-10 rounded-3xl bg-surface-container-lowest border border-surface-container/60 shadow-xs flex flex-col items-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="font-black text-lg text-on-surface">
              No Restaurants Found
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              We couldn't find any kitchen or dish matching &quot;{searchQuery}&quot;. Try adjusting your search query or filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="mt-5 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary-container transition-all"
            >
              Reset Filters &amp; Search
            </button>
          </div>
        )}

        {/* Restaurant Cards Container */}
        {!isLoading && !error && filteredRestaurants.length > 0 && (
          <div className="space-y-8">
            {filteredRestaurants.map((resto) => {
              const restoFoods = resto.foods || [];

              return (
                <section
                  key={resto.id}
                  className="rounded-3xl bg-surface-container-lowest border border-surface-container/70 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Restaurant Header Banner Card */}
                  <div className="relative p-5 sm:p-6 bg-gradient-to-r from-surface-container-low/80 via-surface-container-lowest to-surface-container-low/40 border-b border-surface-container/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Logo Avatar */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-surface-container border border-surface-container-high shadow-xs flex items-center justify-center flex-shrink-0">
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
                            <span className="font-black text-xl text-primary uppercase">
                              {resto.name.substring(0, 2)}
                            </span>
                          )}
                        </div>

                        {/* Restaurant Information */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="font-black text-lg sm:text-xl text-on-surface truncate">
                              {resto.name}
                            </h2>
                            {resto.is_active && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Open Now
                              </span>
                            )}
                          </div>

                          {resto.address && (
                            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-1 truncate">
                              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="truncate">{resto.address}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-1.5 text-xs text-on-surface-variant font-medium flex-wrap">
                            <span className="flex items-center gap-1 text-primary font-extrabold">
                              <Utensils className="w-3.5 h-3.5" />
                              {resto.total_foods_count}{" "}
                              {resto.total_foods_count === 1 ? "Dish Available" : "Dishes Available"}
                            </span>
                            {resto.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-on-surface-variant/70" />
                                {resto.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* View Full Menu Action */}
                      <Link
                        href={`/?restaurant=${resto.id}`}
                        className="px-4 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all self-start sm:self-center"
                      >
                        <span>View Full Menu</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Food Items Section under each Restaurant */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-primary" />
                        <span>Featured Dishes &amp; Chef Specials</span>
                      </h3>
                      <Link
                        href={`/?restaurant=${resto.id}`}
                        className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>View all {resto.total_foods_count}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {restoFoods.length === 0 ? (
                      <div className="p-5 rounded-2xl bg-surface-container-low text-center text-xs text-on-surface-variant font-medium">
                        No public food items listed for this kitchen yet.
                      </div>
                    ) : (
                      /* Responsive Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

        {/* Floating Cart Bar */}
        <FloatingCartBar onViewCart={() => router.push("/cart")} />
      </main>
    </div>
  );
}
