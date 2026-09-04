import Cookies from 'js-cookie';
import { StateStorage } from 'zustand/middleware';

/**
 * Custom Cookie StateStorage implementation for Zustand `persist` middleware
 */
export const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const val = Cookies.get(name);
      return val ?? null;
    } catch {
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      // Store cookie with 7 days expiration, sameSite strict
      Cookies.set(name, value, { expires: 7, sameSite: 'lax', path: '/' });
    } catch (err) {
      console.warn(`[Cookie Storage] Failed to setItem (${name}):`, err);
    }
  },

  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      Cookies.remove(name, { path: '/' });
    } catch (err) {
      console.warn(`[Cookie Storage] Failed to removeItem (${name}):`, err);
    }
  },
};
