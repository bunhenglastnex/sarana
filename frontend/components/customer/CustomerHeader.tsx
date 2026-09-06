'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronDown, Bell, User, LogIn } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface CustomerHeaderProps {
  currentAddress?: string;
  onOpenLocation?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  unreadNotifications?: boolean;
  avatarUrl?: string;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  currentAddress = 'Phnom Penh, Cambodia',
  onOpenLocation,
  onOpenNotifications,
  onOpenProfile,
  unreadNotifications = false,
  avatarUrl,
}) => {
  const router = useRouter();
  const { token, userId, avatarUrl: storeAvatarUrl } = useAuthStore();
  const isLoggedIn = Boolean(token || userId);
  const userAvatar = storeAvatarUrl || avatarUrl;

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
    } else if (onOpenProfile) {
      onOpenProfile();
    }
  };

  return (
    <header className="sticky top-0 w-full max-w-md mx-auto z-40 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-space-lg flex items-center justify-between gap-space-xs">
        {/* Brand Logo & Address Selector */}
        <div className="flex items-center gap-space-xs min-w-0 flex-1">
          <img
            src="/logo.jpg"
            alt="Amber & Ember Bistro Logo"
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-primary/20 shadow-xs"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-2xs text-on-surface font-bold text-sm tracking-tight leading-tight">
              Amber & Ember
            </div>
            <button
              onClick={onOpenLocation}
              className="flex items-center gap-0.5 text-on-surface-variant text-left hover:text-primary transition-colors group"
              type="button"
            >
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-xs font-semibold truncate max-w-[140px] text-on-surface-variant group-hover:text-primary">
                {currentAddress}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-primary flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Action Buttons: Notifications & Profile Avatar / Login */}
        <div className="flex items-center gap-space-xs flex-shrink-0">
          {isLoggedIn && (
            <button
              aria-label="Notifications"
              onClick={onOpenNotifications}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors relative active:scale-95"
              type="button"
            >
              <Bell className="w-5 h-5 text-on-surface" />
              {unreadNotifications && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface animate-pulse" />
              )}
            </button>
          )}

          {isLoggedIn ? (
            <button
              aria-label="User Profile"
              onClick={handleProfileClick}
              className="w-10 h-10 flex items-center justify-center rounded-full p-0.5 hover:ring-2 hover:ring-primary/40 transition-all active:scale-95 overflow-hidden border border-outline-variant/50 shadow-sm"
              type="button"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-container text-on-primary-container flex items-center justify-center rounded-full">
                  <User className="w-5 h-5" />
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary font-bold text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

