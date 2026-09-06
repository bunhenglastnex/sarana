"use client";

import React, { useEffect, useRef } from "react";
import { Search, Timer, Bell, SlidersHorizontal, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";

export const AdminHeader: React.FC = () => {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { name, role, clearSession } = useAuthStore();

  // Focus search input on pressing '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/admin/login");
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-border/40 z-40 px-space-lg flex items-center justify-between gap-space-md">
      {/* Left Search Bar Container */}
      <div className="flex items-center gap-space-md flex-1 max-w-xl">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            ref={searchInputRef}
            suppressHydrationWarning
            className="w-full pl-9 pr-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-sm placeholder:text-on-surface-variant outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 transition-all border border-border/40"
            placeholder="Quick search Order #, Dish, or Customer (Press '/' to focus)..."
            type="text"
          />
        </div>
      </div>

      {/* Right Telemetry & Station Info */}
      <div className="flex items-center gap-space-md shrink-0">
        {/* Shift Duration Counter */}
        <div className="hidden lg:flex items-center gap-space-xs px-space-sm py-1 bg-surface-container rounded-full text-on-surface-variant border border-border/40">
          <Timer className="w-4 h-4 text-secondary" />
          <span className="font-label-sm text-xs text-on-surface font-medium">
            Shift: Active
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-space-xs">
          <button
            onClick={() => alert("Notifications: System operational.")}
            aria-label="Notifications"
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface"></span>
          </button>
          <button
            onClick={() => alert("Station display configuration")}
            aria-label="Station Settings"
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-surface-container-high"></div>

        {/* Admin Profile & Logout Button */}
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
            {name ? name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-label-md text-xs text-on-surface leading-tight font-semibold">
              {name || "Restaurant Admin"}
            </span>
            <span className="font-label-sm text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">
              {role === "admin" ? "Super Admin" : role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out of Admin Console"
            className="p-1.5 ml-1 rounded-lg text-error/80 hover:bg-error-container/20 hover:text-error transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
