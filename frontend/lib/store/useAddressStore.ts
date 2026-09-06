'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { indexedDBStorage } from './indexedDBStorage';
import Api from '@/lib/api';

export interface SavedAddress {
  id: string | number;
  userId?: number | string | null;
  label: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  tag?: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface AddressState {
  savedAddresses: SavedAddress[];

  // Actions
  addAddress: (addr: Omit<SavedAddress, 'id'>, userId?: number | string | null) => Promise<SavedAddress>;
  updateAddress: (id: string | number, updates: Partial<SavedAddress>, userId?: number | string | null) => Promise<void>;
  removeAddress: (id: string | number, userId?: number | string | null) => Promise<void>;
  setDefaultAddress: (id: string | number, userId?: number | string | null) => Promise<void>;
  fetchOrSyncAddresses: (userId?: number | string | null) => Promise<void>;
}

const DEFAULT_INITIAL_ADDRESSES: SavedAddress[] = [
  { id: 'def-1', label: 'Home', address: '520 N Michigan Ave, Apt 14F', lat: 13.354000, lng: 103.956000, tag: 'Default', isDefault: true },
  { id: 'def-2', label: 'Work', address: '742 Evergreen Terrace, Suite 100', lat: 13.358000, lng: 103.960000, tag: 'Office', isDefault: false },
  { id: 'def-3', label: "Partner's Place", address: '120 Broadway Ave, Apt 12', lat: 13.349000, lng: 103.951000, tag: 'Home', isDefault: false },
];

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      savedAddresses: DEFAULT_INITIAL_ADDRESSES,

      addAddress: async (newAddrData, userId) => {
        const id = `addr-${Date.now()}`;
        const newAddress: SavedAddress = {
          ...newAddrData,
          id,
          tag: newAddrData.tag || 'Home',
          isDefault: !!newAddrData.isDefault,
        };

        const current = get().savedAddresses;
        let updatedList = newAddress.isDefault
          ? current.map((a) => ({ ...a, isDefault: false }))
          : [...current];

        updatedList = [newAddress, ...updatedList];
        set({ savedAddresses: updatedList });

        // If user logged in, save to backend API as well
        if (userId) {
          try {
            const res: any = await Api.post('/customer-addresses.php', {
              user_id: userId,
              label: newAddress.label,
              address: newAddress.address,
              lat: newAddress.lat,
              lng: newAddress.lng,
              tag: newAddress.tag,
              is_default: newAddress.isDefault ? 1 : 0,
            });
            if (res?.data?.id) {
              const apiAddress = { ...newAddress, id: res.data.id };
              set({
                savedAddresses: get().savedAddresses.map((a) => (a.id === id ? apiAddress : a)),
              });
              return apiAddress;
            }
          } catch (err) {
            console.warn('[AddressStore] Failed to save to API:', err);
          }
        }

        return newAddress;
      },

      updateAddress: async (id, updates, userId) => {
        const current = get().savedAddresses;
        const updatedList = current.map((addr) => {
          if (addr.id === id) {
            return { ...addr, ...updates };
          }
          if (updates.isDefault && addr.id !== id) {
            return { ...addr, isDefault: false };
          }
          return addr;
        });

        set({ savedAddresses: updatedList });

        if (userId && typeof id === 'number') {
          try {
            await Api.put('/customer-addresses.php', {
              id,
              user_id: userId,
              ...updates,
            });
          } catch (err) {
            console.warn('[AddressStore] Failed to update address API:', err);
          }
        }
      },

      removeAddress: async (id, userId) => {
        set({
          savedAddresses: get().savedAddresses.filter((a) => a.id !== id),
        });

        if (userId && typeof id === 'number') {
          try {
            await Api.delete(`/customer-addresses.php?id=${id}&user_id=${userId}`);
          } catch (err) {
            console.warn('[AddressStore] Failed to delete address from API:', err);
          }
        }
      },

      setDefaultAddress: async (id, userId) => {
        const current = get().savedAddresses;
        const updatedList = current.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }));
        set({ savedAddresses: updatedList });

        if (userId && typeof id === 'number') {
          try {
            await Api.put('/customer-addresses.php', {
              id,
              user_id: userId,
              isDefault: true,
            });
          } catch (err) {
            console.warn('[AddressStore] Failed to set default address API:', err);
          }
        }
      },

      fetchOrSyncAddresses: async (userId) => {
        if (!userId) return;

        try {
          // Fetch backend addresses
          const res: any = await Api.get(`/customer-addresses.php?user_id=${userId}`);
          const apiAddresses: SavedAddress[] = res?.data || res || [];

          if (Array.isArray(apiAddresses) && apiAddresses.length > 0) {
            set({ savedAddresses: apiAddresses });
          } else {
            // Bulk sync guest addresses up to backend
            const local = get().savedAddresses;
            if (local.length > 0) {
              const syncRes: any = await Api.post('/customer-addresses.php', {
                user_id: userId,
                addresses: local,
              });
              if (syncRes?.data && Array.isArray(syncRes.data)) {
                set({ savedAddresses: syncRes.data });
              }
            }
          }
        } catch (err) {
          console.warn('[AddressStore] Error fetching/syncing addresses:', err);
        }
      },
    }),
    {
      name: 'sarana_user_addresses',
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
);
