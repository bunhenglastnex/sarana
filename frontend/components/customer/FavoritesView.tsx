"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Search,
  Star,
  Plus,
  Check,
  Flame,
  Utensils,
  X,
  Loader2,
} from "lucide-react";
import { FoodItem } from "./FoodCard";
import { useAuthStore, useFavoritesStore, useCartStore } from "@/lib/store";
import { useApi, Api } from "@/lib/api";

export const FavoritesView: React.FC = () => {
  const router = useRouter();
  const { userId, phone } = useAuthStore();
  const addItemToCart = useCartStore((state) => state.addItem);

  const localFavoriteIds = useFavoritesStore((state) => state.localFavoriteIds);
  const toggleLocalFavorite = useFavoritesStore((state) => state.toggleLocalFavorite);
  const syncFavoritesToDatabase = useFavoritesStore((state) => state.syncFavoritesToDatabase);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [guestFoods, setGuestFoods] = useState<FoodItem[]>([]);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  // Auto-sync guest IndexedDB favorites to backend DB if logged in
  useEffect(() => {
    if (userId || phone) {
      syncFavoritesToDatabase(userId, phone);
    }
  }, [userId, phone, syncFavoritesToDatabase]);

  // Fetch live categories from customer menu API
  const { data: menuRes } = useApi<any>("/customer-menu.php");
  const rawCategories = menuRes?.data?.categories || menuRes?.categories;

  // Build dynamic categories list starting with "All Items"
  const categories = useMemo(() => {
    const list = Array.isArray(rawCategories)
      ? rawCategories.map((c: any) => ({
          id: c.slug || String(c.id),
          label: c.name,
        }))
      : [
          { id: "burgers", label: "Burgers" },
          { id: "pizza", label: "Pizza" },
          { id: "chicken", label: "Chicken" },
          { id: "drinks", label: "Drinks" },
          { id: "dessert", label: "Desserts" },
        ];

    return [{ id: "all", label: "All Items" }, ...list];
  }, [rawCategories]);

  // Fetch logged-in user favorites from API
  const endpoint = userId || phone ? "/favorites.php" : null;
  const { data: rawFavoritesResponse, loading: isLoadingFavs, refetch } = useApi<any>(
    endpoint,
    { phone, user_id: userId }
  );

  // Fetch guest favorites from IndexedDB IDs if not logged in
  useEffect(() => {
    if (!userId && !phone && localFavoriteIds.length > 0) {
      setIsGuestLoading(true);
      Api.get("/customer-menu.php?all=1")
        .then((res) => {
          const resData = res.data?.data || res.data || {};
          const allFoods = Array.isArray(resData.foods) ? resData.foods : [];
          const localSet = new Set(localFavoriteIds);

          const matched = allFoods
            .filter((item: any) => localSet.has(String(item.id)))
            .map((item: any) => ({
              id: String(item.id),
              slug: item.slug || String(item.id),
              name: item.name || "Saved Item",
              category: item.category_slug || item.category || "mains",
              price: Number(item.price || 0),
              description: item.description || "",
              imageUrl:
                item.image_url ||
                item.imageUrl ||
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
              badge: item.badge_text
                ? { text: item.badge_text, type: item.badge_type || "chef" }
                : undefined,
            }));

          setGuestFoods(matched);
        })
        .catch(() => {})
        .finally(() => setIsGuestLoading(false));
    } else if (!userId && !phone && localFavoriteIds.length === 0) {
      setGuestFoods([]);
    }
  }, [userId, phone, localFavoriteIds]);

  const rawFavorites = rawFavoritesResponse?.data || rawFavoritesResponse;

  // Format favorites strictly from API or guest IndexedDB
  const favorites: FoodItem[] = useMemo(() => {
    if (userId || phone) {
      if (!Array.isArray(rawFavorites)) return [];
      return rawFavorites.map((item: any) => ({
        id: String(item.food_id || item.id),
        slug: item.slug || String(item.food_id || item.id),
        name: item.name || "Saved Item",
        category: item.category_slug || item.category || "mains",
        price: Number(item.price || 0),
        description: item.description || "",
        imageUrl:
          item.image_url ||
          item.imageUrl ||
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        badge: item.badge_text
          ? { text: item.badge_text, type: item.badge_type || "chef" }
          : undefined,
      }));
    } else {
      return guestFoods;
    }
  }, [userId, phone, rawFavorites, guestFoods]);

  const toggleFavorite = async (id: string) => {
    if (userId || phone) {
      try {
        await Api.post("/favorites.php", { food_id: Number(id), phone, user_id: userId });
        refetch();
      } catch (err) {
        console.error("Failed to toggle favorite:", err);
      }
    } else {
      toggleLocalFavorite(id);
    }
  };

  const handleQuickAdd = (item: FoodItem) => {
    addItemToCart(
      {
        id: Number(item.id),
        name: item.name,
        price: item.price,
        image_url: item.imageUrl,
        category: item.category,
        description: item.description,
        is_available: true,
      } as any,
      1
    );

    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1200);
  };

  const filteredFavorites = useMemo(() => {
    return favorites.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const itemCat = (item.category || "").toLowerCase();
      const selCat = selectedCategory.toLowerCase();
      const matchesCategory =
        selectedCategory === "all" ||
        itemCat === selCat ||
        itemCat.includes(selCat);
      return matchesSearch && matchesCategory;
    });
  }, [favorites, searchQuery, selectedCategory]);

  const isLoading = isLoadingFavs || isGuestLoading;

  return (
    <main className="flex flex-col relative w-full max-w-md px-screen-edge-padding pt-4 pb-28 bg-surface min-h-screen">
      {/* Title & Badge */}
      <div className="flex items-end justify-between mb-space-md pt-2">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold block">
            Saved Dishes
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
            My Favorites
          </h1>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-high px-space-xs py-1 rounded-full text-on-surface-variant border border-surface-container-highest/60">
          <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
          <span className="font-label-sm text-label-sm font-semibold">
            {favorites.length} Saved
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-space-md">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your favorite dishes..."
            className="w-full bg-surface-container-lowest border border-surface-container-high rounded-full py-2.5 pl-10 pr-10 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-space-md">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              selectedCategory === cat.id
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Favorites Feed / Loading / Empty */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="font-label-md text-xs font-bold">Loading favorites...</span>
        </div>
      ) : filteredFavorites.length > 0 ? (
        <div className="flex flex-col gap-space-md">
          {filteredFavorites.map((item) => {
            const isAdded = addedIds[item.id];
            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] border border-surface-container/80 flex flex-col gap-3 group transition-all hover:border-primary/20"
              >
                <div className="flex items-start gap-3">
                  {/* Dish Thumbnail */}
                  <div
                    onClick={() =>
                      router.push(`/items-detail/${item.slug || item.id}`)
                    }
                    className="relative w-24 h-24 rounded-xl overflow-hidden bg-surface-variant flex-shrink-0 cursor-pointer border border-surface-container"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.badge && (
                      <div className="absolute top-1.5 left-1.5 bg-surface-bright/90 backdrop-blur-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                        {item.badge.type === "fire" ? (
                          <Flame className="w-3 h-3 text-primary" />
                        ) : (
                          <Star className="w-3 h-3 text-secondary fill-secondary" />
                        )}
                        <span className="text-[9px] font-bold text-on-surface">
                          {item.badge.text}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dish Specs & Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3
                          onClick={() =>
                            router.push(`/items-detail/${item.slug || item.id}`)
                          }
                          className="font-bold text-sm text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                        >
                          {item.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(item.id)}
                          aria-label="Remove from favorites"
                          className="p-1 text-red-500 hover:scale-110 active:scale-95 transition-transform flex-shrink-0 -mr-1"
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </button>
                      </div>
                      <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>

                    {/* Rating & Price Row */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-extrabold text-sm text-primary">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Quick Add Button */}
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(item)}
                        className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs ${
                          isAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-primary hover:bg-primary-container text-on-primary"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Favorites View */
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-surface-container-lowest rounded-2xl border border-surface-container/80 shadow-xs my-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-base text-on-surface mb-1">
            No Favorites Found
          </h3>
          <p className="text-xs text-on-surface-variant max-w-[240px] mb-5 leading-relaxed">
            {searchQuery
              ? `No saved items matching "${searchQuery}"`
              : "Save your favorite wood-fired dishes & burgers to access them quickly anytime!"}
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="bg-primary text-on-primary px-space-md py-2.5 rounded-full font-label-md text-label-md font-bold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5"
          >
            <Utensils className="w-4 h-4" />
            <span>Explore Menu</span>
          </button>
        </div>
      )}
    </main>
  );
};
