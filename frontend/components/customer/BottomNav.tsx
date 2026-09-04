'use client';

import React from 'react';
import { Store, Search, ShoppingBag, Receipt, User } from 'lucide-react';

export type NavTab = 'home' | 'search' | 'cart' | 'orders' | 'profile';

interface BottomNavProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
  cartBadgeCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab = 'home',
  onTabChange,
  cartBadgeCount = 0,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Store },
    { id: 'search' as NavTab, label: 'Search', icon: Search },
    { id: 'cart' as NavTab, label: 'Cart', icon: ShoppingBag, badge: cartBadgeCount },
    { id: 'orders' as NavTab, label: 'Orders', icon: Receipt },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto z-40 pb-safe bg-surface/90 backdrop-blur-xl border-t border-surface-container/60 shadow-[0_-4px_20px_-2px_rgba(26,23,21,0.06)]">
      <div className="flex justify-around items-center h-16 px- space-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] py-1 transition-colors relative ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-primary text-on-primary font-bold text-[10px] flex items-center justify-center leading-none ring-2 ring-surface">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
