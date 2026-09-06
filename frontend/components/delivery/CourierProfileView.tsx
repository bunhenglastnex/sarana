"use client";

import React from "react";
import { HeroProfileCard } from "./profile/HeroProfileCard";
import { ShiftPerformanceCard } from "./profile/ShiftPerformanceCard";
import { EquipmentCard } from "./profile/EquipmentCard";
import { ProfileMenuList } from "./profile/ProfileMenuList";
import { EndShiftSection } from "./profile/EndShiftSection";

import { useAuthStore } from "@/lib/store/useAuthStore";
import { useApi } from "@/lib/api";

export const CourierProfileView: React.FC = () => {
  const { name, userId, phone } = useAuthStore();
  const { data } = useApi<any>("/delivery.php");

  const displayName = name || "";
  const driverCode = `#AE-DRV-${4790 + (userId || 2)}`;
  const cashInHand = Number(
    data?.data?.cash_in_hand || data?.cash_in_hand || 0,
  );

  const completedOrdersCount = Array.isArray(data?.data?.orders || data?.orders)
    ? (data?.data?.orders || data?.orders).filter(
        (o: any) => o.status === "completed" || o.status === "delivered",
      ).length
    : 0;

  return (
    <div className="flex flex-col w-full px-screen-edge-padding space-y-space-lg max-w-md mx-auto pt-2 pb-24">
      {/* 1. Top Hero Profile Card */}
      <HeroProfileCard
        name={displayName}
        driverCode={driverCode}
        courierTitle={` · Phone: ${phone || ""}`}
        rating={4.95}
        totalDeliveries={`${completedOrdersCount} completed today`}
      />

      {/* 2. Today's Performance & Shift Tracker */}
      <ShiftPerformanceCard
        ordersCompleted={completedOrdersCount}
        onlineHours="4.2h"
        onTimeRate="98%"
        todayEarnings={cashInHand}
      />

      {/* 3. Quick Vehicle & Equipment Card */}
      <EquipmentCard
        vehicleName="Honda Click 150i"
        vehiclePlate="Plate: 1-AB 4910 • Insured"
        fleetCode={`Fleet #${userId || 2}`}
        thermalBagCode="Thermal Hearth Bag #04"
        thermalBagTempHold="Inspected Today: 68°C hold certified"
      />

      {/* 4. Action & Management Menu Sections */}
      <ProfileMenuList />

      {/* 5. Log Out / End Shift Actions */}
      <EndShiftSection />
    </div>
  );
};
