'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { indexedDBStorage } from './indexedDBStorage';
import Api from '@/lib/api';

export interface FavoritesState {
  localFavoriteIds: string[];

  // Local IndexedDB Actions
  addLocalFavorite: (foodId: string) => void;
  removeLocalFavorite: (foodId: string) => void;
  toggleLocalFavorite: (foodId: string) => boolean; // returns true if now favorited
  isLocalFavorite: (foodId: string) => boolean;
  clearLocalFavorites: () => void;

  // Sync to MySQL Database when account is available
  syncFavoritesToDatabase: (userId?: number | string | null, phone?: string | null) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      localFavoriteIds: [],

      addLocalFavorite: (foodId) => {
        const current = get().localFavoriteIds;
        if (!current.includes(foodId)) {
          set({ localFavoriteIds: [...current, foodId] });
        }
      },

      removeLocalFavorite: (foodId) => {
        set({
          localFavoriteIds: get().localFavoriteIds.filter((id) => id !== foodId),
        });
      },

      toggleLocalFavorite: (foodId) => {
        const current = get().localFavoriteIds;
        const exists = current.includes(foodId);
        if (exists) {
          get().removeLocalFavorite(foodId);
          return false;
        } else {
          get().addLocalFavorite(foodId);
          return true;
        }
      },

      isLocalFavorite: (foodId) => {
        return get().localFavoriteIds.includes(foodId);
      },

      clearLocalFavorites: () => {
        set({ localFavoriteIds: [] });
      },

      syncFavoritesToDatabase: async (userId, phone) => {
        const localIds = get().localFavoriteIds;
        if (!localIds || localIds.length === 0) return;
        if (!userId && !phone) return;

        try {
          for (const foodId of localIds) {
            const numId = Number(foodId);
            if (numId > 0) {
              await Api.post('/favorites.php', {
                food_id: numId,
                user_id: userId,
                phone: phone,
              });
            }
          }
          // Clear local IndexedDB buffer once synced to database
          set({ localFavoriteIds: [] });
        } catch (err) {
          console.error('[Favorites Store] Failed to sync local favorites to database:', err);
        }
      },
    }),
    {
      name: 'sarana_offline_favorites_idb',
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
);
