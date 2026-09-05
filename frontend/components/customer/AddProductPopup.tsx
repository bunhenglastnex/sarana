'use client';

import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { FoodItem } from './FoodCard';

interface AddProductPopupProps {
  item: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: {
    item: FoodItem;
    quantity: number;
    selectedOptions: Record<string, string>;
    specialInstructions: string;
    totalPrice: number;
  }) => void;
}

export const AddProductPopup: React.FC<AddProductPopupProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!isOpen || !item) return null;

  // Calculate extra cost based on selected options
  const calculateTotal = () => {
    let extra = 0;
    if (item.options) {
      item.options.forEach((optGroup) => {
        const chosenLabel = selectedOptions[optGroup.name];
        if (chosenLabel) {
          const found = optGroup.choices.find((c) => c.label === chosenLabel);
          if (found) extra += found.priceExtra;
        }
      });
    }
    return (item.price + extra) * quantity;
  };

  const handleOptionChange = (groupName: string, choiceLabel: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupName]: choiceLabel,
    }));
  };

  const handleAdd = () => {
    const totalPrice = calculateTotal();
    onAddToCart({
      item,
      quantity,
      selectedOptions,
      specialInstructions,
      totalPrice,
    });
    // Reset modal internal state
    setQuantity(1);
    setSelectedOptions({});
    setSpecialInstructions('');
    onClose();
  };

  const totalCost = calculateTotal();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 border border-surface-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image & Dismiss Button */}
        <div className="relative w-full h-52 bg-surface-container">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/70 active:scale-90 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-space-lg flex-1 flex flex-col gap-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-extrabold text-xl text-on-surface">
                {item.name}
              </h3>
              <span className="font-extrabold text-lg text-primary flex-shrink-0">
                ${item.price.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Option Groups (Sizes / Sides / Sauces) */}
          {item.options && item.options.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-surface-container">
              {item.options.map((optGroup) => (
                <div key={optGroup.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-on-surface uppercase tracking-wider">
                      {optGroup.name}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Select 1</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {optGroup.choices.map((choice) => {
                      const isSelected = selectedOptions[optGroup.name] === choice.label;
                      return (
                        <button
                          key={choice.label}
                          type="button"
                          onClick={() => handleOptionChange(optGroup.name, choice.label)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-surface-container-high bg-surface-container-lowest text-on-surface hover:border-outline'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-primary bg-primary text-white' : 'border-outline'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{choice.label}</span>
                          </div>
                          {choice.priceExtra > 0 && (
                            <span className="text-on-surface-variant font-medium">
                              +${choice.priceExtra.toFixed(2)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Instructions Input */}
          <div className="pt-2 border-t border-surface-container">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
              Special Instructions
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra sauce, no onions, allergies..."
              className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Quantity Controls & Add Button */}
          <div className="pt-3 border-t border-surface-container flex items-center gap-3">
            <div className="flex items-center bg-surface-container-high rounded-full p-1 border border-surface-container-highest">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                className="w-9 h-9 rounded-full bg-surface-bright flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-90 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-on-surface">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
                className="w-9 h-9 rounded-full bg-surface-bright flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-90 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 bg-primary text-on-primary py-3 px-4 rounded-full font-bold text-sm flex items-center justify-between shadow-md hover:bg-primary-container active:scale-95 transition-all"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Order</span>
              </div>
              <span>${totalCost.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
