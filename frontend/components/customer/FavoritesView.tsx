"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Search,
  Star,
  Clock,
  Plus,
  Check,
  ShoppingBag,
  Flame,
  Utensils,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { CustomerHeader } from "./CustomerHeader";
import { BottomNav, NavTab } from "./BottomNav";
import { LocationModal } from "./LocationModal";
import { FoodItem } from "./FoodCard";

const MOCK_FAVORITES: FoodItem[] = [
  {
    id: "fav-1",
    slug: "smoked-bacon-truffle-burger",
    name: "Smoked Bacon Truffle Burger",
    category: "burgers",
    price: 14.5,
    description:
      "Brioche bun, smoked bacon, black truffle aioli, aged white cheddar, crisp wild arugula.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAls_8yd9WMO6M-1b39ScZJ3_O2nl_fNajJJlFCyeHNRbU-muCFVAlmqK3486SZJ2YfsJEvjvOztm389AsKdx6NG6YNEKVNFbRcfbLVppFLxUne_bqDsRpSK3l2AMI0JQBo_C17szpKlAQjRDrm3nnTIGqP6KGSssq7YCwimEAyJLy0CFe1OAhtWRFTSOzsLM8aFGH81iIHgYrOGDJZJmekiXCquwKA7kAm9YwaaSHLWJy2kCNMaDAi",
    badge: { text: "Chef's Pick", type: "chef" },
  },
  {
    id: "fav-2",
    slug: "wood-fired-burrata-prosciutto-pizza",
    name: "Wood-fired Burrata Prosciutto Pizza",
    category: "pizza",
    price: 18.0,
    description:
      "San Marzano tomatoes, fresh creamy burrata, 24-mo prosciutto di Parma, fresh basil.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBFN2QU32fKv_PeY6OJ6-_mQhNxcdfWBPa62PtLNx6iXX7JDMAzDMZ-d0CMe0nIG8jQKnqT0u3l7VOE3p0nJFZ9h8a_Y3Tc2gdgc-a3zrvN4vV2oCSbu2WoBg7ZxZFmOGlvDbSPFm1Y42TsacD8aQ5amuGIBaPXZdI8rgBYTDf2xx4tLL8ZMEp8byjuZTOEedY7Bi1oqUZIl4RV44g-yyLr-CoRm1FAFnkdStuZbGidFWj7VOnUaidt",
    badge: { text: "Wood-fired", type: "fire" },
  },
  {
    id: "fav-3",
    slug: "warm-valrhona-chocolate-lava-cake",
    name: "Warm Valrhona Chocolate Lava Cake",
    category: "dessert",
    price: 8.5,
    description:
      "Decadent 70% Valrhona dark chocolate cake with a molten warm core & vanilla bean gelato.",
    imageUrl:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    badge: { text: "Chef Special", type: "chef" },
  },
];

export const FavoritesView: React.FC = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FoodItem[]>(MOCK_FAVORITES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("244 Oak Street, Apt 4B");
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleTabChange = (tab: NavTab) => {
    if (tab === "home") router.push("/");
    else if (tab === "favorites") router.push("/favorites");
    else if (tab === "cart") router.push("/cart");
    else if (tab === "orders") router.push("/orders");
    else if (tab === "profile") router.push("/customer-profile");
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const handleQuickAdd = (id: string) => {
    setAddedIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [id]: false }));
    }, 1500);
  };

  const categories = [
    { id: "all", label: "All Items" },
    { id: "burgers", label: "Burgers" },
    { id: "pizza", label: "Pizza" },
    { id: "dessert", label: "Desserts" },
  ];

  const filteredFavorites = favorites.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-surface text-on-surface font-sans text-sm min-h-screen flex flex-col items-center selection:bg-primary/20 selection:text-primary pb-28">
      {/* Top Customer Header */}
      <CustomerHeader
        currentAddress={currentAddress}
        onOpenLocation={() => setIsLocationOpen(true)}
        onOpenProfile={() => router.push("/customer-profile")}
        onOpenNotifications={() => alert("You have 2 active order updates!")}
      />

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full max-w-md px-screen-edge-padding pt-4 pb-12 bg-surface min-h-screen">
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

        {/* Category Pills */}
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

        {/* Favorites List */}
        {filteredFavorites.length > 0 ? (
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
                              router.push(
                                `/items-detail/${item.slug || item.id}`
                              )
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
                          <span className="text-tertiary text-xs">•</span>
                          <div className="flex items-center gap-0.5 text-on-surface font-semibold text-[11px]">
                            <Star className="w-3 h-3 text-secondary fill-secondary" />
                            <span>4.9</span>
                          </div>
                        </div>

                        {/* Quick Add Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(item.id)}
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

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentAddress={currentAddress}
        onSelectAddress={setCurrentAddress}
      />

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab="favorites" onTabChange={handleTabChange} />
    </div>
  );
};
