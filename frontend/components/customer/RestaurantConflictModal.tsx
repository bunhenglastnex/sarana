'use client';

import React from 'react';
import { AlertTriangle, ShoppingBag, ArrowRight } from 'lucide-react';

interface RestaurantConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRestaurantName: string;
  newRestaurantName: string;
  onConfirmReplace: () => void;
}

export const RestaurantConflictModal: React.FC<RestaurantConflictModalProps> = ({
  isOpen,
  onClose,
  currentRestaurantName,
  newRestaurantName,
  onConfirmReplace,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-surface-container flex flex-col items-center text-center">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="font-extrabold text-lg text-on-surface">
          Switch Restaurant?
        </h3>

        <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
          Your cart currently contains items from <strong className="text-on-surface font-bold">{currentRestaurantName}</strong>.
        </p>

        <div className="my-4 py-3 px-4 w-full bg-surface-container-low rounded-xl border border-surface-container/60 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
          <ShoppingBag className="w-4 h-4 text-on-surface-variant" />
          <span className="truncate">{currentRestaurantName}</span>
          <ArrowRight className="w-4 h-4 shrink-0 text-on-surface-variant" />
          <span className="truncate font-bold">{newRestaurantName}</span>
        </div>

        <p className="text-xs text-on-surface-variant/90 mb-6">
          Adding this item will clear your existing cart items.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl border border-surface-container hover:bg-surface-container-low font-bold text-xs text-on-surface transition-colors"
          >
            Keep Current Cart
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmReplace();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs transition-colors shadow-sm"
          >
            Clear & Replace Cart
          </button>
        </div>
      </div>
    </div>
  );
};
