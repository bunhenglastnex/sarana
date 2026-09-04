'use client';

import React, { useState } from 'react';
import { Heart, Plus, ThumbsUp, Flame, Award, Check } from 'lucide-react';

export interface FoodItem {
  id: string;
  slug?: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  badge?: {
    text: string;
    type?: 'chef' | 'fire' | 'award';
  };
  options?: {
    name: string;
    choices: { label: string; priceExtra: number }[];
  }[];
}

interface FoodCardProps {
  item: FoodItem;
  onSelect?: (item: FoodItem) => void;
  onQuickAdd?: (item: FoodItem) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  item,
  onSelect,
  onQuickAdd,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [fav, setFav] = useState(isFavorite);
  const [added, setAdded] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFav(!fav);
    onToggleFavorite?.(item.id);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdded(true);
    onQuickAdd?.(item);
    setTimeout(() => {
      setAdded(false);
    }, 1000);
  };

  const renderBadgeIcon = () => {
    if (!item.badge) return null;
    switch (item.badge.type) {
      case 'fire':
        return <Flame className="w-3.5 h-3.5 text-primary" />;
      case 'award':
        return <Award className="w-3.5 h-3.5 text-secondary" />;
      case 'chef':
      default:
        return <ThumbsUp className="w-3.5 h-3.5 text-secondary fill-secondary" />;
    }
  };

  return (
    <article
      onClick={() => onSelect?.(item)}
      className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md border border-surface-container/60 cursor-pointer group"
    >
      {/* Product Image Section */}
      <div className="relative w-full h-44 bg-surface-container overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge Overlay */}
        {item.badge && (
          <div className="absolute top-3 left-3 bg-surface-bright/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            {renderBadgeIcon()}
            <span className="font-bold text-xs text-on-surface">
              {item.badge.text}
            </span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          aria-label="Favorite"
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-bright/80 backdrop-blur-md flex items-center justify-center transition-all shadow-sm active:scale-90 ${
            fav ? 'text-red-500 fill-red-500' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Product Information Section */}
      <div className="p-space-md flex flex-col justify-between flex-1">
        <div>
          <h4 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
            {item.name}
          </h4>
          <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Add Button */}
        <div className="flex items-center justify-between mt-space-md pt-space-xs">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xs text-primary font-bold">$</span>
            <span className="font-extrabold text-lg text-on-surface">
              {item.price.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddClick}
            aria-label={`Add ${item.name}`}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all ${
              added
                ? 'bg-secondary text-on-secondary'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`}
          >
            {added ? (
              <Check className="w-5 h-5 animate-scale-up" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
