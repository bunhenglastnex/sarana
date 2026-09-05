"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDeliveryStore } from "@/lib/store/useDeliveryStore";

interface DeliveryHeaderProps {
  title?: string;
}

export const DeliveryHeader: React.FC<DeliveryHeaderProps> = ({ title }) => {
  const pathname = usePathname();
  const { isOnline } = useDeliveryStore();

  const getPageTitle = () => {
    if (title) return title;
    if (pathname === "/delivery/my-deliveries") return "My Deliveries";
    if (pathname === "/delivery/history") return "Delivery History";
    if (pathname === "/delivery/profile") return "Courier Profile";
    return "Available Orders";
  };

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-screen-edge-padding flex items-center justify-between gap-space-xs max-w-md mx-auto">
        <div className="flex items-center gap-space-xs min-w-0 flex-1">
          <Link href="/delivery" className="flex items-center gap-2 min-w-0">
            <img
              alt="Amber & Ember Logo"
              className="h-9 w-9 rounded-md object-cover shrink-0 border border-outline-variant/40 shadow-xs"
              src="/logo.jpg"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider truncate font-semibold">
                Amber & Ember
              </span>
              <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight truncate leading-tight">
                {getPageTitle()}
              </h1>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-space-xs shrink-0">
          <div className="inline-flex items-center gap-1.5 px-space-xs py-1 bg-surface-container-high rounded-full">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-emerald-600 animate-pulse" : "bg-tertiary"
              }`}
            ></span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold select-none">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <Link
            href="/delivery/profile"
            aria-label="Courier Profile"
            className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/20 block"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFgSCPH_D_P89baxhACYIj6Q2wbutJp62w19yulHEwoZj5uLw76X4auNlAQwC8QilaCC7ZLj8lg9-ds-zz6T47rTJ4pvLNsLVPjiItTdbl9mP6acLkdxcLMMIaLmJVi5XnnJ-J7Tk_h5KKbA1v3WW4xKpKXVsqigU8wcQTFIr37DBLz_ayvnYjOXC3Z9qpsw4ABYD21JrhKAmJ_4qduv1qd2qJIzLO0Bg-EoEkquOYxLGiPTrgQqDx"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};
