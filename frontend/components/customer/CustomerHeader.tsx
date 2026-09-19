'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MapPin, ChevronDown, Bell, User, LogIn, ShoppingBag, Heart, Store, Receipt } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/lib/store';

interface CustomerHeaderProps {
  currentAddress?: string;
  onOpenLocation?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  unreadNotifications?: boolean;
  avatarUrl?: string;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  currentAddress = 'Delivery Location',
  onOpenLocation,
  onOpenNotifications,
  onOpenProfile,
  unreadNotifications = false,
  avatarUrl,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { token, userId, avatarUrl: storeAvatarUrl } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const isLoggedIn = Boolean(token || userId);
  const userAvatar = storeAvatarUrl || avatarUrl;

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
    } else if (onOpenProfile) {
      onOpenProfile();
    } else {
      router.push('/customer-profile');
    }
  };

  const navLinks = [
    { label: 'Menu', href: '/', icon: Store },
    { label: 'Favorites', href: '/favorites', icon: Heart, reqAuth: true },
    { label: 'My Orders', href: '/orders', icon: Receipt, reqAuth: true },
  ];

  return (
    <header className="sticky top-0 w-full z-40 bg-surface/95 backdrop-blur-xl border-b border-surface-container/60 shadow-sm transition-all">
      <div className="w-full max-w-7xl mx-auto h-16 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Brand Logo & Delivery Location Picker */}
        <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-1 sm:flex-initial">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 group flex-shrink-0">
            <img
              src="/logo.jpg"
              alt="Amber & Ember Bistro Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-primary/20 shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-xs sm:text-base tracking-tight text-on-surface leading-none group-hover:text-primary transition-colors">
                Amber & Ember
              </span>
              <span className="hidden sm:block text-[10px] font-bold text-primary tracking-wide uppercase leading-tight">
                Bistro & Delivery
              </span>
            </div>
          </Link>

          <button
            onClick={onOpenLocation}
            className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container border border-surface-container/80 transition-all group text-left max-w-[110px] xs:max-w-[150px] sm:max-w-[260px] min-w-0"
            type="button"
            title="Change Delivery Location"
          >
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold truncate text-on-surface-variant group-hover:text-on-surface">
              {currentAddress}
            </span>
            <ChevronDown className="w-3 h-3 text-on-surface-variant group-hover:text-primary flex-shrink-0 ml-auto hidden xs:block" />
          </button>
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.reqAuth && !isLoggedIn ? '/login' : link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons: Desktop Cart, Notifications & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Cart Shortcut Button */}
          <Link
            href="/cart"
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bold text-xs relative group"
            title="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Cart</span>
            {totalCartCount > 0 && (
              <span className="min-w-[18px] h-4 px-1 rounded-full bg-primary text-on-primary font-bold text-[10px] flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          {isLoggedIn && (
            <button
              aria-label="Notifications"
              onClick={onOpenNotifications}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative active:scale-95 border border-transparent hover:border-surface-container"
              type="button"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotifications && (
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-surface animate-pulse" />
              )}
            </button>
          )}

          {/* User Profile / Login Button */}
          {isLoggedIn ? (
            <button
              aria-label="User Profile"
              onClick={handleProfileClick}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full p-0.5 hover:ring-2 hover:ring-primary/40 transition-all active:scale-95 overflow-hidden border border-outline-variant/50 shadow-xs"
              type="button"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-container text-on-primary-container flex items-center justify-center rounded-full font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              type="button"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-primary text-on-primary font-bold text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
