"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { BottomNav, NavTab } from "@/components/customer/BottomNav";
import { LocationModal } from "@/components/customer/LocationModal";
import { ProfileModal } from "@/components/customer/ProfileModal";

import { useAuthStore } from "@/lib/store/useAuthStore";

export const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { token, userId } = useAuthStore();
  const isLoggedIn = Boolean(token || userId);

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(
    "Phnom Penh, Cambodia",
  );

  const currentPath = pathname || "";

  // Determine which routes should show the global header and bottom navigation
  const isCustomerRoute =
    currentPath !== "" &&
    !currentPath.startsWith("/admin") &&
    !currentPath.startsWith("/delivery") &&
    !currentPath.startsWith("/login") &&
    !currentPath.startsWith("/checkout") &&
    !currentPath.startsWith("/khqr-payment");

  // Non-customer routes bypass CustomerLayout entirely
  if (!isCustomerRoute) {
    return <>{children}</>;
  }

  // Automatically determine active tab based on current pathname
  const getActiveTab = (): NavTab => {
    if (currentPath === "/favorites" || currentPath === "/favorite")
      return "favorites";
    if (currentPath === "/cart") return "cart";
    if (currentPath === "/orders" || currentPath === "/order") return "orders";
    if (currentPath === "/customer-profile" || currentPath === "/profile")
      return "profile";
    return "home";
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: NavTab) => {
    if (tab === "home") {
      router.push("/");
    } else if (tab === "favorites") {
      if (!isLoggedIn) router.push("/login");
      else router.push("/favorites");
    } else if (tab === "cart") {
      router.push("/cart");
    } else if (tab === "orders") {
      if (!isLoggedIn) router.push("/login");
      else router.push("/orders");
    } else if (tab === "profile") {
      if (!isLoggedIn) router.push("/login");
      else router.push("/customer-profile");
    }
  };

  const handleOpenProfile = () => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setIsProfileOpen(true);
    }
  };

  const showBottomNav = !currentPath.startsWith("/items-detail");

  const showCustomerHeader =
    !currentPath.startsWith("/items-detail") &&
    !currentPath.startsWith("/order-success") &&
    !currentPath.startsWith("/customer-profile");

  return (
    <div className="bg-surface text-on-surface font-sans text-sm min-h-screen flex flex-col items-center selection:bg-primary/20 selection:text-primary w-full">
      {/* Global Customer Header */}
      {showCustomerHeader && (
        <CustomerHeader
          currentAddress={currentAddress}
          onOpenLocation={() => setIsLocationOpen(true)}
          onOpenProfile={handleOpenProfile}
          onOpenNotifications={() => alert("You have 2 active order updates!")}
        />
      )}

      {/* Main Page View Container */}
      <div className="w-full flex-1 flex flex-col items-center">{children}</div>

      {/* Global Location Selector Modal */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentAddress={currentAddress}
        onSelectAddress={setCurrentAddress}
      />

      {/* Global User Profile Slide-over Sheet */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Global Customer Bottom Navigation */}
      {showBottomNav && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
};

export default CustomerLayout;
