"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { DeliveryHeader } from "@/components/delivery/DeliveryHeader";
import { DeliveryBottomNav } from "@/components/delivery/DeliveryBottomNav";
import { DeliveryToast } from "@/components/delivery/DeliveryToast";

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentPath = pathname || "";

  const isDeliveryLogin = currentPath.startsWith("/delivery/login");
  if (isDeliveryLogin) {
    return <>{children}</>;
  }

  // Check if current route is a delivery order detail page e.g. /delivery/1024
  const isDetailPage =
    currentPath.startsWith("/delivery/") &&
    currentPath !== "/delivery/my-deliveries" &&
    currentPath !== "/delivery/history" &&
    currentPath !== "/delivery/profile";

  return (
    <div className="min-h-screen w-full flex flex-col bg-surface font-sans text-body-md text-on-surface antialiased relative">
      {/* Mobile Top Header (Hidden on order detail view to show back button header) */}
      {!isDetailPage && <DeliveryHeader />}

      {/* Main Delivery View Area */}
      <main
        className={`flex-1 flex flex-col w-full bg-surface ${
          !isDetailPage ? "pt-16 pb-sticky-bottom-offset" : ""
        }`}
      >
        {children}
      </main>

      {/* Global Delivery Toast */}
      <DeliveryToast />

      {/* Mobile Bottom Navigation (Hidden on order detail view to show sticky action bar) */}
      {!isDetailPage && <DeliveryBottomNav />}
    </div>
  );
}
