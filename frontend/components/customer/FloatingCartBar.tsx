'use client';

import React from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';

interface FloatingCartBarProps {
  itemCount: number;
  totalPrice: number;
  onViewCart?: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  itemCount,
  totalPrice,
  onViewCart,
}) => {
  if (itemCount <= 0) return null;

  return (
    <aside className="sticky bottom-20 z-30 w-full max-w-md mx-auto mt-auto px-2 pointer-events-auto">
      <div className="bg-inverse-surface text-inverse-on-surface rounded-full px-space-md py-3 shadow-xl flex items-center justify-between mx-1 backdrop-blur-md border border-white/10 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shadow-inner">
            <span>{itemCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-surface-variant uppercase tracking-wider">
              Order Preview
            </span>
            <span className="text-xs font-bold text-inverse-on-surface">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} • ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewCart}
          className="flex items-center gap-1.5 bg-primary text-on-primary px-space-md py-2 rounded-full font-bold text-xs hover:bg-primary-container active:scale-95 transition-all shadow-sm"
        >
          <span>View Cart</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
