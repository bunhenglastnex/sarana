"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DeliveryHeader } from "@/components/delivery/DeliveryHeader";
import { DeliveryBottomNav } from "@/components/delivery/DeliveryBottomNav";
import { DeliveryToast } from "@/components/delivery/DeliveryToast";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const { token, userId, role } = useAuthStore();
  const currentPath = pathname || "";
  const isDeliveryLogin = currentPath.startsWith("/delivery/login");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Automatically redirect unauthenticated users or non-delivery roles to /delivery/login
  useEffect(() => {
    if (isMounted && !isDeliveryLogin) {
      if (!token || !userId || role !== "delivery") {
        router.push("/delivery/login");
      }
    }
  }, [isMounted, isDeliveryLogin, token, userId, role, router]);

  // Login page bypasses layout
  if (isDeliveryLogin) {
    return <>{children}</>;
  }

  // Prevent hydration mismatch while reading auth cookies/storage
  if (!isMounted) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-surface text-on-surface-variant gap-3">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        <span className="text-xs font-bold text-zinc-400">Verifying Delivery Shift...</span>
      </div>
    );
  }

  // Guard against flash of protected content before redirect completes
  if (!token || !userId || role !== "delivery") {
    return null;
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
