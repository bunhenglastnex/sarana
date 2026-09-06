'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, FulfillmentType, Food } from '@/types';
import { indexedDBStorage } from './indexedDBStorage';

export interface CartState {
  items: CartItem[];
  fulfillmentType: FulfillmentType;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  telegramChatId: string;

  // Actions
  addItem: (food: Food, quantity?: number) => void;
  removeItem: (foodId: number) => void;
  updateQuantity: (foodId: number, quantity: number) => void;
  clearCart: () => void;
  setFulfillmentType: (type: FulfillmentType) => void;
  setCustomerInfo: (info: Partial<{ customerName: string; customerPhone: string; deliveryAddress: string; notes: string; telegramChatId: string }>) => void;
  
  // Computed helpers
  getFoodSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotalAmount: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      fulfillmentType: 'delivery',
      customerName: '',
      customerPhone: '',
      deliveryAddress: '',
      notes: '',
      telegramChatId: '',

      addItem: (food, quantity = 1) => {
        const currentItems = get().items;
        const foodId = Number(food.id);
        const existingIndex = currentItems.findIndex((i) => Number(i.food_id) === foodId);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += quantity;
          set({ items: updated });
        } else {
          set({
            items: [
              ...currentItems,
              {
                food_id: foodId,
                name: food.name,
                price: typeof food.price === 'string' ? parseFloat(food.price) : Number(food.price || 0),
                quantity,
                food: {
                  ...food,
                  image_url: food.image_url || (food as any).imageUrl || '',
                },
              },
            ],
          });
        }
      },

      removeItem: (foodId) => {
        set({ items: get().items.filter((i) => Number(i.food_id) !== Number(foodId)) });
      },

      updateQuantity: (foodId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(foodId);
          return;
        }
        set({
          items: get().items.map((i) =>
            Number(i.food_id) === Number(foodId) ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      setFulfillmentType: (type) => set({ fulfillmentType: type }),

      setCustomerInfo: (info) => set((state) => ({ ...state, ...info })),

      getFoodSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + (typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price || 0)) * item.quantity,
          0
        );
      },

      getDeliveryFee: () => {
        return get().fulfillmentType === 'delivery' ? 2.0 : 0.0;
      },

      getTotalAmount: () => {
        return get().getFoodSubtotal() + get().getDeliveryFee();
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'sarana_cart_storage_idb',
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
);
