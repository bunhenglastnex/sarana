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
  restaurantId: number | null;
  restaurantName: string | null;

  // Actions
  addItem: (food: Food, quantity?: number, options?: Record<string, string>, notes?: string) => { isConflict: boolean; currentRestaurantName?: string; newRestaurantName?: string };
  forceAddItem: (food: Food, quantity?: number, options?: Record<string, string>, notes?: string) => void;
  removeItem: (foodId: number, optionsKey?: string) => void;
  updateQuantity: (foodId: number, quantity: number, optionsKey?: string) => void;
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
      restaurantId: null,
      restaurantName: null,

      addItem: (food, quantity = 1, options = {}, notes = '') => {
        const currentItems = get().items;
        const currentRestoId = get().restaurantId;
        const targetRestoId = food.restaurant_id || 1;
        const targetRestoName = food.restaurant_name || 'Restaurant';

        // Check for multi-restaurant conflict (Option B Single-Restaurant Enforcement)
        if (currentItems.length > 0 && currentRestoId && currentRestoId !== targetRestoId) {
          return {
            isConflict: true,
            currentRestaurantName: get().restaurantName || 'Current Restaurant',
            newRestaurantName: targetRestoName,
          };
        }

        const foodId = Number(food.id);
        const optionsKey = JSON.stringify(options || {});
        
        const existingIndex = currentItems.findIndex(
          (i) => Number(i.food_id) === foodId && JSON.stringify(i.options || {}) === optionsKey
        );

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += quantity;
          if (notes) updated[existingIndex].notes = notes;
          set({ items: updated, restaurantId: targetRestoId, restaurantName: targetRestoName });
        } else {
          set({
            restaurantId: targetRestoId,
            restaurantName: targetRestoName,
            items: [
              ...currentItems,
              {
                food_id: foodId,
                name: food.name,
                price: typeof food.price === 'string' ? parseFloat(food.price) : Number(food.price || 0),
                quantity,
                options: options || {},
                notes: notes || '',
                food: {
                  ...food,
                  image_url: food.image_url || (food as any).imageUrl || '',
                },
              },
            ],
          });
        }
        return { isConflict: false };
      },

      forceAddItem: (food, quantity = 1, options = {}, notes = '') => {
        const foodId = Number(food.id);
        const targetRestoId = food.restaurant_id || 1;
        const targetRestoName = food.restaurant_name || 'Restaurant';

        set({
          items: [
            {
              food_id: foodId,
              name: food.name,
              price: typeof food.price === 'string' ? parseFloat(food.price) : Number(food.price || 0),
              quantity,
              options: options || {},
              notes: notes || '',
              food: {
                ...food,
                image_url: food.image_url || (food as any).imageUrl || '',
              },
            },
          ],
          restaurantId: targetRestoId,
          restaurantName: targetRestoName,
        });
      },

      removeItem: (foodId, optionsKey) => {
        const remaining = get().items.filter((i) => {
          if (Number(i.food_id) !== Number(foodId)) return true;
          if (optionsKey !== undefined) {
            return JSON.stringify(i.options || {}) !== optionsKey;
          }
          return false;
        });

        if (remaining.length === 0) {
          set({ items: [], restaurantId: null, restaurantName: null });
        } else {
          set({ items: remaining });
        }
      },

      updateQuantity: (foodId, quantity, optionsKey) => {
        if (quantity <= 0) {
          get().removeItem(foodId, optionsKey);
          return;
        }
        set({
          items: get().items.map((i) => {
            const matchesFood = Number(i.food_id) === Number(foodId);
            const matchesOptions = optionsKey === undefined || JSON.stringify(i.options || {}) === optionsKey;
            if (matchesFood && matchesOptions) {
              return { ...i, quantity };
            }
            return i;
          }),
        });
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

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
