"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/customer/SearchBar";
import { CategoryScroll } from "@/components/customer/CategoryScroll";
import {
  RestaurantScroll,
  RestaurantItem,
} from "@/components/customer/RestaurantScroll";
import { FoodCard, FoodItem } from "@/components/customer/FoodCard";
import { AddProductPopup } from "@/components/customer/AddProductPopup";
import { FloatingCartBar } from "@/components/customer/FloatingCartBar";
import { LocationModal } from "@/components/customer/LocationModal";
import { TelegramBotModal } from "@/components/customer/TelegramBotModal";
import { RestaurantConflictModal } from "@/components/customer/RestaurantConflictModal";
import { useAuthStore, useFavoritesStore, useCartStore } from "@/lib/store";
import Api from "@/lib/api";
import { Flame, ChevronRight, Loader2, X } from "lucide-react";

export default function CustomerPageLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { name: customerName, userId, phone } = useAuthStore();
  const [currentAddress, setCurrentAddress] = useState(
    "244 Oak Street, Apt 4B",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [restaurantsList, setRestaurantsList] = useState<RestaurantItem[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | number>(
    "all",
  );

  // Cart store integration (Persisted in IndexedDB)
  const cartItems = useCartStore((state) => state.items);
  const addFoodToCart = useCartStore((state) => state.addItem);
  const forceAddFoodToCart = useCartStore((state) => state.forceAddItem);

  // Cart multi-restaurant conflict modal state
  const [conflictModalState, setConflictModalState] = useState<{
    isOpen: boolean;
    currentRestaurantName: string;
    newRestaurantName: string;
    pendingFood: any;
    pendingQuantity?: number;
    pendingOptions?: Record<string, string>;
    pendingNotes?: string;
  }>({
    isOpen: false,
    currentRestaurantName: "",
    newRestaurantName: "",
    pendingFood: null,
  });

  // Pagination & infinite scroll states (12 limit per page)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFoodsLoading, setIsFoodsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [rawFoods, setRawFoods] = useState<any[]>([]);
  const [rawCategories, setRawCategories] = useState<any[]>([]);
  const [totalItemsCount, setTotalItemsCount] = useState(0);

  // Favorites state (Database + IndexedDB fallback for guests)
  const [userFavoriteIds, setUserFavoriteIds] = useState<Set<string>>(
    new Set(),
  );
  const localFavoriteIds = useFavoritesStore((state) => state.localFavoriteIds);
  const toggleLocalFavorite = useFavoritesStore(
    (state) => state.toggleLocalFavorite,
  );
  const syncFavoritesToDatabase = useFavoritesStore(
    (state) => state.syncFavoritesToDatabase,
  );

  const observerTargetRef = useRef<HTMLDivElement>(null);

  // Auto-sync guest IndexedDB favorites to MySQL database if logged in
  useEffect(() => {
    if (userId || phone) {
      syncFavoritesToDatabase(userId, phone).then(() => {
        Api.get("/favorites.php", { phone, user_id: userId })
          .then((res) => {
            const favs = res.data?.data || res.data || [];
            if (Array.isArray(favs)) {
              const ids = new Set<string>(
                favs.map((f: any) => String(f.food_id || f.id)),
              );
              setUserFavoriteIds(ids);
            }
          })
          .catch(() => {});
      });
    }
  }, [phone, userId, syncFavoritesToDatabase]);

  // Combined active favorites (Database + Local IndexedDB)
  const activeFavoriteIds = useMemo(() => {
    const set = new Set<string>(userFavoriteIds);
    localFavoriteIds.forEach((id) => set.add(id));
    return set;
  }, [userFavoriteIds, localFavoriteIds]);

  // Toggle favorite status (DB if logged in, IndexedDB if guest)
  const handleToggleFavorite = async (foodId: string) => {
    const numId = Number(foodId);
    if (!numId) return;

    if (userId || phone) {
      setUserFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(foodId)) {
          next.delete(foodId);
        } else {
          next.add(foodId);
        }
        return next;
      });

      try {
        await Api.post("/favorites.php", {
          food_id: numId,
          phone,
          user_id: userId,
        });
      } catch (err) {
        console.error("Failed to toggle favorite:", err);
      }
    } else {
      // Store in IndexedDB for guests
      toggleLocalFavorite(foodId);
    }
  };

  // Fetch active public restaurants list
  useEffect(() => {
    Api.get("/restaurants.php", { active_only: 1 })
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          setRestaurantsList(list);
        }
      })
      .catch((err) =>
        console.error("Failed to fetch active restaurants:", err),
      );
  }, []);

  // Fetch paginated public menu from backend API (12 items per batch)
  const fetchMenuPage = useCallback(
    async (pageNum: number, isInitial = false) => {
      if (isInitial) {
        setIsFoodsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      try {
        const params: Record<string, any> = {
          page: pageNum,
          limit: 12,
        };
        if (selectedCategory && selectedCategory !== "all") {
          params.category = selectedCategory;
        }
        if (selectedRestaurant && selectedRestaurant !== "all") {
          params.restaurant_id = selectedRestaurant;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const res = await Api.get("/customer-menu.php", params);
        const resData = res.data?.data || res.data || {};
        const newFoods = Array.isArray(resData.foods) ? resData.foods : [];
        const cats = Array.isArray(resData.categories)
          ? resData.categories
          : [];

        if (isInitial) {
          setRawFoods(newFoods);
          if (cats.length > 0) setRawCategories(cats);
        } else {
          setRawFoods((prev) => {
            const existingIds = new Set(prev.map((item) => String(item.id)));
            const filteredNew = newFoods.filter(
              (item: any) => !existingIds.has(String(item.id)),
            );
            return [...prev, ...filteredNew];
          });
        }

        setHasMore(Boolean(resData.has_more));
        if (resData.total !== undefined) {
          setTotalItemsCount(Number(resData.total));
        }
      } catch (err) {
        console.error("Failed to fetch customer menu page:", err);
      } finally {
        setIsFoodsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [selectedCategory, selectedRestaurant, searchQuery],
  );

  // Initial fetch or filter change reset
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMenuPage(1, true);
  }, [selectedCategory, selectedRestaurant, searchQuery, fetchMenuPage]);

  // Load next page function
  const loadNextPage = useCallback(() => {
    if (!hasMore || isFoodsLoading || isFetchingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMenuPage(nextPage, false);
  }, [hasMore, isFoodsLoading, isFetchingMore, page, fetchMenuPage]);

  // IntersectionObserver for smooth bottom-of-page infinite scroll trigger
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isFoodsLoading &&
          !isFetchingMore
        ) {
          loadNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "120px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isFoodsLoading, isFetchingMore, loadNextPage]);

  // Format categories list
  const categoriesList = useMemo(() => {
    const list = Array.isArray(rawCategories)
      ? rawCategories.map((c: any) => ({
          id: c.slug || String(c.id),
          name: c.name,
          icon: c.icon || undefined,
        }))
      : [];
    return [{ id: "all", name: "All" }, ...list];
  }, [rawCategories]);

  // Format food items list strictly from live API
  const foodItems: FoodItem[] = useMemo(() => {
    if (!Array.isArray(rawFoods)) return [];
    return rawFoods
      .filter((item: any) => item.name && item.name.trim() !== "")
      .map((item: any) => {
        let parsedOptions = [];
        try {
          if (typeof item.options === "string" && item.options.trim()) {
            parsedOptions = JSON.parse(item.options);
          } else if (Array.isArray(item.options)) {
            parsedOptions = item.options;
          }
        } catch {
          parsedOptions = [];
        }

        return {
          id: String(item.id),
          restaurant_id: Number(item.restaurant_id || 1),
          restaurant_name: item.restaurant_name || "Amber Bistro",
          restaurant_logo: item.restaurant_logo || "",
          slug: item.slug || String(item.id),
          name: item.name,
          category: item.category_slug || item.category || "all",
          price: Number(item.price || 0),
          description: item.description || "",
          imageUrl:
            item.image_url ||
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
          badge: item.badge_text
            ? { text: item.badge_text, type: item.badge_type || "fire" }
            : undefined,
          options: parsedOptions,
        };
      });
  }, [rawFoods]);

  // Modals state
  const [selectedItemForPopup, setSelectedItemForPopup] =
    useState<FoodItem | null>(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("telegram_prompt") === "1") {
      setIsTelegramModalOpen(true);
    }
  }, [searchParams]);

  // Add product handlers to Zustand store
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
      newItem.specialInstructions,
    );

    if (res.isConflict) {
      setConflictModalState({
        isOpen: true,
        currentRestaurantName:
          res.currentRestaurantName || "Current Restaurant",
        newRestaurantName: res.newRestaurantName || "New Restaurant",
        pendingFood: foodPayload,
        pendingQuantity: newItem.quantity,
        pendingOptions: newItem.selectedOptions,
        pendingNotes: newItem.specialInstructions,
      });
    }
  };

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

    const res = addFoodToCart(foodPayload as any, 1);

    if (res.isConflict) {
      setConflictModalState({
        isOpen: true,
        currentRestaurantName:
          res.currentRestaurantName || "Current Restaurant",
        newRestaurantName: res.newRestaurantName || "New Restaurant",
        pendingFood: foodPayload,
        pendingQuantity: 1,
      });
    }
  };

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const totalCartPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) =>
        sum +
        (typeof item.price === "string"
          ? parseFloat(item.price)
          : Number(item.price || 0)) *
          item.quantity,
      0,
    );
  }, [cartItems]);

  const currentSelectedRestoName = useMemo(() => {
    if (selectedRestaurant === "all" || !selectedRestaurant) return null;
    const found = restaurantsList.find(
      (r) => String(r.id) === String(selectedRestaurant),
    );
    return found ? found.name : null;
  }, [selectedRestaurant, restaurantsList]);

  return (
    <main className="flex flex-col relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 bg-surface min-h-screen">
      <div className="flex flex-col w-full">
        {/* Search & Quick Filter Bar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        {/* Horizontal Scroll Restaurant Carousel */}
        <RestaurantScroll
          restaurants={restaurantsList}
          selectedRestaurantId={selectedRestaurant}
          onSelectRestaurant={setSelectedRestaurant}
        />

        {/* Active Restaurant Filter Indicator Banner */}
        {currentSelectedRestoName && (
          <div className="flex items-center justify-between bg-primary/10 border border-primary/30 text-primary px-3 py-2 rounded-xl mb-3 text-xs font-semibold">
            <span className="truncate">
              Showing menu for: <strong>{currentSelectedRestoName}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedRestaurant("all")}
              className="p-1 rounded-full hover:bg-primary/20 transition-colors flex-shrink-0"
              title="Show all restaurants"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Horizontal Scroll Categories */}
        <CategoryScroll
          categories={categoriesList}
          activeCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Popular Items Section Header */}
        <section className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-lg text-on-surface">Popular Items</h3>
            <Flame className="w-5 h-5 text-primary fill-primary/20" />
          </div>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className="text-xs font-bold text-primary hover:text-primary-container transition-colors flex items-center gap-0.5"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        {/* Food Item Cards Feed */}
        <section className="flex flex-col gap-space-md mb-space-xl">
          {isFoodsLoading && page === 1 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="font-label-md text-xs font-bold">
                Loading menu...
              </span>
            </div>
          ) : foodItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {foodItems.map((food) => (
                  <FoodCard
                    key={food.id}
                    item={food}
                    isFavorite={activeFavoriteIds.has(food.id)}
                    onToggleFavorite={(id) => handleToggleFavorite(id)}
                    onSelect={(item) => {
                      const itemSlug = item.slug || item.id;
                      router.push(`/items-detail/${itemSlug}`);
                    }}
                    onQuickAdd={(item) => handleQuickAdd(item)}
                  />
                ))}
              </div>

              {/* Infinite Scroll Sentinel / Bottom Feed Load More Indicator */}
              <div
                ref={observerTargetRef}
                className="pt-4 pb-2 flex flex-col items-center justify-center min-h-[60px]"
              >
                {isFetchingMore ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading more items (Limit 12)...</span>
                  </div>
                ) : hasMore ? (
                  <button
                    type="button"
                    onClick={loadNextPage}
                    className="text-xs font-bold text-primary hover:underline py-2 px-4 rounded-full bg-primary/10 transition-colors"
                  >
                    Load More Items
                  </button>
                ) : (
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    Showing all {foodItems.length} of{" "}
                    {totalItemsCount || foodItems.length} items
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-surface-container-lowest rounded-xl p-6 border border-surface-container">
              <p className="font-bold text-on-surface text-base">
                No items found
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                Try adjusting your search query or category filter.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Floating Cart Preview Bar (Anchored above bottom navigation) */}
      <FloatingCartBar
        itemCount={totalCartCount}
        totalPrice={totalCartPrice}
        onViewCart={() => router.push("/cart")}
      />

      {/* Add Product Customization Popup Modal */}
      <AddProductPopup
        item={selectedItemForPopup}
        isOpen={Boolean(selectedItemForPopup)}
        onClose={() => setSelectedItemForPopup(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Delivery Location Selector Modal */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentAddress={currentAddress}
        onSelectAddress={setCurrentAddress}
      />

      {/* Telegram Bot Link Prompt Modal */}
      <TelegramBotModal
        isOpen={isTelegramModalOpen}
        userName={customerName || "Valued Customer"}
        onClose={() => {
          setIsTelegramModalOpen(false);
          // Clean query params from address bar
          router.replace("/", { scroll: false });
        }}
      />

      {/* Multi-Restaurant Cart Conflict Modal */}
      <RestaurantConflictModal
        isOpen={conflictModalState.isOpen}
        currentRestaurantName={conflictModalState.currentRestaurantName}
        newRestaurantName={conflictModalState.newRestaurantName}
        onClose={() =>
          setConflictModalState((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirmReplace={() => {
          if (conflictModalState.pendingFood) {
            forceAddFoodToCart(
              conflictModalState.pendingFood,
              conflictModalState.pendingQuantity || 1,
              conflictModalState.pendingOptions || {},
              conflictModalState.pendingNotes || "",
            );
          }
        }}
      />
    </main>
  );
}
