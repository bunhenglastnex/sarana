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
  const { name, userId, phone, avatarUrl: authAvatarUrl } = useAuthStore();
  const { data } = useApi<any>("/delivery-profile.php");

  const profileData = data?.data || data || {};
  const displayName = profileData.name || name || "Courier Driver";
  const driverCode = profileData.code || `#AE-DRV-${4790 + (userId || 2)}`;
  const avatar = profileData.avatar_url || authAvatarUrl || undefined;
  const deliveriesToday = profileData.deliveries_today ?? 0;
  const vehicleLabel = profileData.vehicle_label || "Honda Click 150i";

  return (
    <div className="flex flex-col w-full px-screen-edge-padding space-y-space-lg max-w-md mx-auto pt-2 pb-24">
      {/* 1. Top Hero Profile Card */}
      <HeroProfileCard
        name={displayName}
        driverCode={driverCode}
        courierTitle={` · Phone: ${profileData.phone || phone || ""}`}
        rating={profileData.rating || 4.95}
        totalDeliveries={`${deliveriesToday} completed today`}
        avatarUrl={avatar}
      />

      {/* 2. Today's Performance & Shift Tracker */}
      <ShiftPerformanceCard
        ordersCompleted={deliveriesToday}
        onlineHours="4.2h"
        onTimeRate="98%"
        todayEarnings={0}
      />

      {/* 3. Quick Vehicle & Equipment Card */}
      <EquipmentCard
        vehicleName={vehicleLabel}
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
