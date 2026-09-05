"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDeliveryStore } from "@/lib/store/useDeliveryStore";
import { Radar, Bike, Receipt, User } from "lucide-react";

export type DeliveryTab = "available" | "my-deliveries" | "history" | "profile";

export const DeliveryBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { myDeliveries } = useDeliveryStore();

  const getActiveTab = (): DeliveryTab => {
    if (pathname === "/delivery/my-deliveries") return "my-deliveries";
    if (pathname === "/delivery/history") return "history";
    if (pathname === "/delivery/profile") return "profile";
    return "available";
  };

  const activeTab = getActiveTab();

  const navItems = [
    {
      id: "available" as DeliveryTab,
      label: "Available",
      path: "/delivery",
      icon: Radar,
    },
    {
      id: "my-deliveries" as DeliveryTab,
      label: "Deliveries",
      path: "/delivery/my-deliveries",
      icon: Bike,
      badge: myDeliveries.length,
    },
    {
      id: "history" as DeliveryTab,
      label: "History",
      path: "/delivery/history",
      icon: Receipt,
    },
    {
      id: "profile" as DeliveryTab,
      label: "Profile",
      path: "/delivery/profile",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-4px_20px_-2px_rgba(26,23,21,0.06)]">
      <div className="flex justify-around items-center h-16 px-space-xs max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-space-2xs transition-colors ${
                isActive
                  ? "text-primary font-bold"
                  : "text-on-surface-variant hover:text-on-surface font-medium"
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-4 px-1 rounded-full bg-primary text-on-primary font-label-sm text-[10px] flex items-center justify-center font-bold shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="font-label-sm text-label-sm mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
