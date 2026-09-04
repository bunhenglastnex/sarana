'use client';

import React from 'react';

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'chicken', name: 'Chicken', icon: '🍗' },
  { id: 'drinks', name: 'Drinks', icon: '🍹' },
  { id: 'dessert', name: 'Dessert', icon: '🍰' },
];

interface CategoryScrollProps {
  categories?: Category[];
  activeCategoryId?: string;
  onSelectCategory?: (id: string) => void;
}

export const CategoryScroll: React.FC<CategoryScrollProps> = ({
  categories = DEFAULT_CATEGORIES,
  activeCategoryId = 'all',
  onSelectCategory,
}) => {
  return (
    <section className="mb-space-lg -mx-4">
      <div className="flex items-center gap-space-xs overflow-x-auto px-4 no-scrollbar py-1">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory?.(cat.id)}
              className={`flex items-center gap-1.5 px-space-md py-2 rounded-full font-bold text-xs flex-shrink-0 transition-all active:scale-95 shadow-sm ${
                isActive
                  ? 'bg-inverse-surface text-inverse-on-surface'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-surface-container/60'
              }`}
            >
              {cat.id === 'all' ? (
                <span className="w-2 h-2 rounded-full bg-secondary-container" />
              ) : (
                cat.icon && <span className="text-sm">{cat.icon}</span>
              )}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
