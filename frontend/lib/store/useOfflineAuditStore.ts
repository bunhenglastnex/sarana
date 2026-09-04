'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { indexedDBStorage } from './indexedDBStorage';
import { SystemLog } from '@/types';

export interface OfflineOrderDraft {
  id: string;
  customerName: string;
  customerPhone: string;
  items: Array<{ foodId: number; name: string; price: number; quantity: number }>;
  totalAmount: number;
  timestamp: string;
}

export interface OfflineAuditState {
  cachedLogs: SystemLog[];
  offlineOrderDrafts: OfflineOrderDraft[];
  recentSearchTerms: string[];
  lastSyncedTimestamp: string | null;

  // Actions
  cacheLogEntries: (logs: SystemLog[]) => void;
  addOfflineOrderDraft: (draft: Omit<OfflineOrderDraft, 'id' | 'timestamp'>) => void;
  removeOfflineOrderDraft: (id: string) => void;
  addSearchTerm: (term: string) => void;
  clearSearchTerms: () => void;
  clearOfflineCache: () => void;
}

export const useOfflineAuditStore = create<OfflineAuditState>()(
  persist(
    (set, get) => ({
      cachedLogs: [],
      offlineOrderDrafts: [],
      recentSearchTerms: [],
      lastSyncedTimestamp: null,

      cacheLogEntries: (logs) =>
        set({
          cachedLogs: logs,
          lastSyncedTimestamp: new Date().toISOString(),
        }),

      addOfflineOrderDraft: (draft) => {
        const newDraft: OfflineOrderDraft = {
          ...draft,
          id: 'DRAFT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          timestamp: new Date().toISOString(),
        };
        set({ offlineOrderDrafts: [newDraft, ...get().offlineOrderDrafts] });
      },

      removeOfflineOrderDraft: (id) =>
        set({
          offlineOrderDrafts: get().offlineOrderDrafts.filter((d) => d.id !== id),
        }),

      addSearchTerm: (term) => {
        if (!term || !term.trim()) return;
        const filtered = get().recentSearchTerms.filter((t) => t.toLowerCase() !== term.toLowerCase());
        set({ recentSearchTerms: [term.trim(), ...filtered].slice(0, 10) });
      },

      clearSearchTerms: () => set({ recentSearchTerms: [] }),

      clearOfflineCache: () =>
        set({
          cachedLogs: [],
          offlineOrderDrafts: [],
          recentSearchTerms: [],
          lastSyncedTimestamp: null,
        }),
    }),
    {
      name: 'sarana_offline_audit_idb', // Key in IndexedDB
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
);
