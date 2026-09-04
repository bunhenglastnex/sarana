'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cookieStorage } from './cookieStorage';

export interface AuthState {
  token: string | null;
  userId: number | null;
  name: string | null;
  phone: string | null;
  role: 'admin' | 'staff' | 'delivery' | 'customer';
  telegramChatId: string | null;
  telegramUsername: string | null;
  isTelegramLinked: boolean;

  // Actions
  setSession: (session: Partial<AuthState>) => void;
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
      role: 'customer',
      telegramChatId: null,
      telegramUsername: null,
      isTelegramLinked: false,

      setSession: (session) =>
        set((state) => ({
          ...state,
          ...session,
          isTelegramLinked: Boolean(session.telegramChatId || state.telegramChatId),
        })),

      clearSession: () =>
        set({
          token: null,
          userId: null,
          name: null,
          phone: null,
          role: 'customer',
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
