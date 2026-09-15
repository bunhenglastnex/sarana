"use client";

import React from "react";
import Link from "next/link";
import { Store, Utensils, CheckCircle2, ChevronRight } from "lucide-react";

export interface RestaurantItem {
  id: number;
  name: string;
  slug?: string;
  logo_url?: string;
  banner_url?: string;
  address?: string;
  total_foods_count?: number;
  is_active?: boolean;
}

interface RestaurantScrollProps {
  restaurants: RestaurantItem[];
  selectedRestaurantId: string | number;
  onSelectRestaurant: (id: string | number) => void;
}

export const RestaurantScroll: React.FC<RestaurantScrollProps> = ({
  restaurants = [],
  selectedRestaurantId = "all",
  onSelectRestaurant,
}) => {
  // Filter out restaurants with 0 items as strictly required
  const activeRestaurantsWithItems = restaurants.filter(
    (r) => (r.total_foods_count ?? 0) > 0
  );

  if (activeRestaurantsWithItems.length === 0) {
    return null;
  }

  return (
    <section className="mb-space-lg -mx-4">
      {/* Section Title */}
      <div className="flex items-center justify-between px-4 mb-2.5">
        <div className="flex items-center gap-1.5">
          <Store className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">
            Restaurants & Kitchens
          </h3>
        </div>
        <Link
          href="/all-restaurant"
          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
        >
          <span>View All ({activeRestaurantsWithItems.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="flex items-center gap-3 overflow-x-auto px-4 no-scrollbar py-1 snap-x">
        {/* "All Stores" Card */}
        <button
          type="button"
          onClick={() => onSelectRestaurant("all")}
          className={`flex flex-col items-center justify-between p-3 rounded-2xl min-w-[100px] max-w-[110px] flex-shrink-0 snap-start border transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
            selectedRestaurantId === "all" || selectedRestaurantId === ""
              ? "bg-primary/10 border-primary ring-2 ring-primary/20 text-primary shadow-md"
              : "bg-surface-container-lowest border-surface-container/70 text-on-surface hover:border-surface-container-high hover:bg-surface-container-low"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-2 shadow-inner">
            <Utensils className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xs text-center line-clamp-1">
            All Stores
          </span>
          <span className="text-[10px] text-on-surface-variant mt-0.5 font-medium">
            Full Menu
          </span>
        </button>

        {/* Individual Restaurant Cards */}
        {activeRestaurantsWithItems.map((resto) => {
          const isSelected =
            String(resto.id) === String(selectedRestaurantId);
          return (
            <button
              key={resto.id}
              type="button"
              onClick={() => onSelectRestaurant(resto.id)}
              className={`relative flex flex-col items-center justify-between p-3 rounded-2xl min-w-[115px] max-w-[130px] flex-shrink-0 snap-start border transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
                isSelected
                  ? "bg-primary/10 border-primary ring-2 ring-primary/20 text-primary shadow-md"
                  : "bg-surface-container-lowest border-surface-container/70 text-on-surface hover:border-surface-container-high hover:bg-surface-container-low"
              }`}
            >
              {/* Active check badge */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 bg-primary text-on-primary rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3 fill-primary stroke-on-primary" />
                </div>
              )}

              {/* Logo / Image Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container flex items-center justify-center mb-2 border border-surface-container-high shadow-sm">
                {resto.logo_url ? (
                  <img
                    src={resto.logo_url}
                    alt={resto.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback icon on broken image load
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="font-extrabold text-sm text-primary uppercase">
                    {resto.name.substring(0, 2)}
                  </span>
                )}
              </div>

              {/* Restaurant Name */}
              <span className="font-bold text-xs text-center line-clamp-1 w-full text-on-surface">
                {resto.name}
              </span>

              {/* Food items count badge */}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high/60 text-on-surface-variant mt-1 font-semibold">
                {resto.total_foods_count}{" "}
                {resto.total_foods_count === 1 ? "item" : "items"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
