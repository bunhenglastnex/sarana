import { openDB, IDBPDatabase } from 'idb';
import { StateStorage } from 'zustand/middleware';

const DB_NAME = 'sarana_restaurant_idb';
const STORE_NAME = 'zustand_key_val';

/**
 * Lazy singleton database connection
 */
let dbPromise: Promise<IDBPDatabase> | null = null;

function getIDB() {
  if (!dbPromise && typeof window !== 'undefined') {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Custom IndexedDB StateStorage implementation for Zustand `persist` middleware
 */
export const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    try {
      const db = await getIDB();
      if (!db) return null;
      const value = await db.get(STORE_NAME, name);
      return value !== undefined ? (value as string) : null;
    } catch (err) {
      console.warn(`[IndexedDB Storage] Failed to getItem (${name}):`, err);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    try {
      const db = await getIDB();
      if (!db) return;
      await db.put(STORE_NAME, value, name);
    } catch (err) {
      console.warn(`[IndexedDB Storage] Failed to setItem (${name}):`, err);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    try {
      const db = await getIDB();
      if (!db) return;
      await db.delete(STORE_NAME, name);
    } catch (err) {
      console.warn(`[IndexedDB Storage] Failed to removeItem (${name}):`, err);
    }
  },
};
