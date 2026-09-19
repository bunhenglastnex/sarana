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
  const toggleLocalFavorite = useFavoritesStore(
    (state) => state.toggleLocalFavorite,
  );
  const syncFavoritesToDatabase = useFavoritesStore(
    (state) => state.syncFavoritesToDatabase,
  );

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
  const {
    data: rawFavoritesResponse,
    loading: isLoadingFavs,
    refetch,
  } = useApi<any>(endpoint, { phone, user_id: userId });

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
        await Api.post("/favorites.php", {
          food_id: Number(id),
          phone,
          user_id: userId,
        });
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
      1,
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
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen bg-surface flex flex-col relative pb-28">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-surface-container pb-4">
        <div>
          <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-extrabold block mb-1">
            Saved Culinary Collection
          </span>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-extrabold tracking-tight">
            My Favorite Dishes
          </h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-surface-container-high px-4 py-2 rounded-full text-on-surface-variant border border-surface-container-highest/60 shadow-xs">
          <Heart className="w-4 h-4 text-primary fill-primary" />
          <span className="font-bold text-xs text-on-surface">
            {favorites.length}{" "}
            {favorites.length === 1 ? "Saved Item" : "Saved Items"}
          </span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                selectedCategory === cat.id
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Favorites Feed / Loading / Empty */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="font-bold text-xs text-on-surface-variant">
            Loading saved favorites feed...
          </span>
        </div>
      ) : filteredFavorites.length > 0 ? (
        /* Responsive Favorites Grid Layout (1 col mobile -> 2 sm -> 3 lg -> 4 xl) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredFavorites.map((item) => {
            const isAdded = addedIds[item.id];
            return (
              <article
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-surface-container/80 flex flex-col justify-between group transition-all hover:border-primary/20"
              >
                {/* Dish Thumbnail */}
                <div
                  onClick={() =>
                    router.push(`/items-detail/${item.slug || item.id}`)
                  }
                  className="relative w-full h-44 sm:h-48 bg-surface-variant overflow-hidden cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.badge && (
                    <div className="absolute top-3 left-3 bg-surface-bright/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                      {item.badge.type === "fire" ? (
                        <Flame className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                      )}
                      <span className="text-[10px] font-bold text-on-surface">
                        {item.badge.text}
                      </span>
                    </div>
                  )}

                  {/* Favorite Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    aria-label="Remove from favorites"
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-bright/80 backdrop-blur-md flex items-center justify-center transition-all shadow-xs hover:scale-110 active:scale-90"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                </div>

                {/* Dish Specs & Details */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3
                      onClick={() =>
                        router.push(`/items-detail/${item.slug || item.id}`)
                      }
                      className="font-bold text-base text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                    >
                      {item.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Add Button */}
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-surface-container">
                    <span className="font-extrabold text-lg text-primary">
                      ${item.price.toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleQuickAdd(item)}
                      className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-primary hover:bg-primary-container text-on-primary"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty Favorites View */
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-surface-container-lowest rounded-3xl border border-surface-container/80 shadow-xs my-6 max-w-lg mx-auto w-full">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-lg text-on-surface mb-1">
            No Favorites Found
          </h3>
          <p className="text-xs text-on-surface-variant max-w-xs mb-6 leading-relaxed">
            {searchQuery
              ? `No saved items matching "${searchQuery}"`
              : "Save your favorite wood-fired dishes & burgers to access them quickly anytime!"}
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-xs shadow-md hover:bg-primary-container transition-all flex items-center gap-2"
          >
            <Utensils className="w-4 h-4" />
            <span>Explore Menu</span>
          </button>
        </div>
      )}
    </main>
  );
};
