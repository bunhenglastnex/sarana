"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  LayoutDashboard,
  CookingPot,
  Receipt,
  Bike,
  UtensilsCrossed,
  Tags,
  Users,
  CreditCard,
  BarChart3,
  UserCheck,
  Settings,
  LogOut,
  User,
  ScrollText,
  Building2,
} from "lucide-react";

import { useState } from "react";
import { useApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { LogoutConfirmModal } from "./LogoutConfirmModal";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { name, role } = useAuthStore();

  const displayName = name || "Elena Rostova";
  const displayRole = role === "super_admin" ? "Super Platform Admin" : role === "admin" ? "Restaurant Manager" : (role || "Restaurant Manager");

  const { data } = useApi<any>("/orders.php", { limit: 50 });
  const rawOrders = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  const activeCount = rawOrders.filter(
    (o: any) => !["completed", "delivered", "picked_up", "cancelled"].includes(String(o.status || "").toLowerCase())
  ).length;

  const isNavActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navItemClass = (href: string) =>
    `flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-colors font-medium ${
      isNavActive(href)
        ? "bg-primary-container text-on-primary-container font-bold shadow-xs"
        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
    }`;

  const { data: settingsData } = useApi<any>("/settings.php");
  const storeName = settingsData?.data?.store_name || "Amber & Ember";
  const logoUrl = settingsData?.data?.logo_url || "/logo.jpg";
  const roleSubtitle = role === "super_admin" ? "Super Admin Portal" : "Restaurant Admin";

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-border/40 selection:bg-primary/20">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 px-space-md flex items-center gap-space-sm bg-surface-container-low shrink-0 border-b border-border/30">
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shadow-sm overflow-hidden border border-primary/20 shrink-0">
            <img
              src={logoUrl}
              alt={`${storeName} Logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.jpg";
              }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-sm text-on-surface leading-tight tracking-tight font-bold truncate" title={storeName}>
              {storeName}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px] truncate">
              {roleSubtitle}
            </span>
          </div>
        </div>

        {/* Kitchen Hearth Live Badge */}
        <div className="px-space-md py-space-xs shrink-0 mt-1">
          <div className="bg-surface-container-lowest rounded-lg p-space-xs px-space-sm flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-border/40">
            <div className="flex items-center gap-space-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                Kitchen Hearth
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-bold bg-primary-fixed px-space-xs py-0.5 rounded-full text-[11px]">
              OPEN
            </span>
          </div>
        </div>

        {/* Main Navigation Menu */}
        <nav className="flex-1 px-space-sm py-space-xs space-y-1 overflow-y-auto custom-scrollbar">
          {/* Operations Section */}
          <div className="px-space-xs pt-space-xs pb-1 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Operations
          </div>

          <Link href="/admin" className={navItemClass("/admin")}>
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className="font-label-lg text-label-lg">Dashboard</span>
          </Link>

          <Link
            href="/admin/live-order-board"
            className={`flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors font-medium ${
              isNavActive("/admin/live-order-board")
                ? "bg-primary-container text-on-primary-container font-bold shadow-xs"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <div className="flex items-center gap-space-sm min-w-0 pr-1">
              <CookingPot className="w-5 h-5 shrink-0" />
              <span className="font-label-lg text-label-lg truncate">
                Live Kitchen Board
              </span>
            </div>
            <span
              className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-extrabold shrink-0 flex items-center gap-1.5 transition-colors ${
                isNavActive("/admin/live-order-board")
                  ? "bg-surface-container-lowest text-primary shadow-xs"
                  : "bg-primary-fixed text-on-primary-fixed"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {activeCount} Live
            </span>
          </Link>

          <Link href="/admin/orders" className={navItemClass("/admin/orders")}>
            <Receipt className="w-5 h-5 shrink-0" />
            <span className="font-label-lg text-label-lg">Orders</span>
          </Link>

          <Link
            href="/admin/delivery-management"
            className={navItemClass("/admin/delivery-management")}
          >
            <Bike className="w-5 h-5 shrink-0" />
            <span className="font-label-lg text-label-lg">Delivery</span>
          </Link>

          {/* Culinary & Stock Section */}
          <div className="px-space-xs pt-space-md pb-1 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Culinary & Stock
          </div>

          <Link
            href="/admin/menu-management"
            className={navItemClass("/admin/menu-management")}
          >
            <UtensilsCrossed className="w-5 h-5 shrink-0" />
            <span className="font-label-lg text-label-lg">Menu Items</span>
          </Link>

          <Link
            href="/admin/categories"
            className={navItemClass("/admin/categories")}
          >
            <Tags className="w-5 h-5 shrink-0" />
            <span className="font-label-lg text-label-lg">Categories</span>
          </Link>

          {/* Platform & Multi-Tenant Section (Super Admin Only) */}
          {role === "super_admin" && (
            <>
              <div className="px-space-xs pt-space-md pb-1 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Platform &amp; Multi-Tenant
              </div>

              <Link
                href="/admin/restaurants"
                className={navItemClass("/admin/restaurants")}
              >
                <Building2 className="w-5 h-5 shrink-0" />
                <span className="font-label-lg text-label-lg">Restaurants</span>
              </Link>

              <Link href="/admin/staff" className={navItemClass("/admin/staff")}>
                <UserCheck className="w-5 h-5 shrink-0" />
                <span className="font-label-lg text-label-lg">Staff</span>
              </Link>

              <Link href="/admin/logs" className={navItemClass("/admin/logs")}>
                <ScrollText className="w-5 h-5 shrink-0" />
                <span className="font-label-lg text-label-lg">System Logs</span>
              </Link>
            </>
          )}

          {/* Business & People Section */}
          <div className="px-space-xs pt-space-md pb-1 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Business &amp; People
          </div>

          <Link
            href="/admin/customers"
            className={navItemClass("/admin/customers")}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span className="font-label-lg text-label-lg">Customers</span>
          </Link>

          <Link
            href="/admin/payments"
            className={navItemClass("/admin/payments")}
          >
            <CreditCard className="w-5 h-5 shrink-0" />
            <span className="font-label-lg text-label-lg">Payments</span>
          </Link>

          <Link
            href="/admin/reports-analytics"
            className={navItemClass("/admin/reports-analytics")}
          >
            <BarChart3 className="w-5 h-5 shrink-0" />
            <span className="font-label-lg text-label-lg">
              Reports & Analytics
            </span>
          </Link>

          <Link
            href="/admin/settings"
            className={navItemClass("/admin/settings")}
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span className="font-label-lg text-label-lg">Settings</span>
          </Link>
        </nav>

        {/* Manager User Footer */}
        <div className="p-space-sm bg-surface-container shrink-0 border-t border-border/40">
          <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-lowest shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-border/40">
            <div className="flex items-center gap-space-xs min-w-0 pr-1">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                  {displayName}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate text-xs">
                  {displayRole}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              title="Logout of Admin Console"
              className="text-on-surface-variant hover:text-error p-1.5 rounded-md hover:bg-error-container/20 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </aside>
  );
};
