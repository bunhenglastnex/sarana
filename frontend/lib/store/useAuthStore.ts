'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cookieStorage } from './cookieStorage';

export interface AuthState {
  token: string | null;
  userId: number | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: 'super_admin' | 'admin' | 'staff' | 'delivery' | 'customer';
  restaurantId: number | null;
  selectedTenantId: number | null;
  telegramChatId: string | null;
  telegramUsername: string | null;
  isTelegramLinked: boolean;

  // Actions
  setSession: (session: Partial<AuthState>) => void;
  setSelectedTenantId: (tenantId: number | null) => void;
  clearSession: () => void;
  setTelegramLink: (chatId: string, username?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      name: null,
      phone: null,
      email: null,
      avatarUrl: null,
      role: 'customer',
      restaurantId: null,
      selectedTenantId: null,
      telegramChatId: null,
      telegramUsername: null,
      isTelegramLinked: false,

      setSession: (session) =>
        set((state) => ({
          ...state,
          ...session,
          isTelegramLinked: Boolean(session.telegramChatId || state.telegramChatId),
        })),

      setSelectedTenantId: (tenantId) =>
        set({ selectedTenantId: tenantId }),

      clearSession: () =>
        set({
          token: null,
          userId: null,
          name: null,
          phone: null,
          email: null,
          avatarUrl: null,
          role: 'customer',
          restaurantId: null,
          selectedTenantId: null,
          telegramChatId: null,
          telegramUsername: null,
          isTelegramLinked: false,
        }),

      setTelegramLink: (chatId, username = '') =>
        set({
          telegramChatId: chatId,
          telegramUsername: username,
          isTelegramLinked: true,
        }),
    }),
    {
      name: 'sarana_auth_cookies', // Key in Browser Cookies
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);
