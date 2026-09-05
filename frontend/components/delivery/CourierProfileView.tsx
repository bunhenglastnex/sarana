"use client";

import React from "react";
import { HeroProfileCard } from "./profile/HeroProfileCard";
import { ShiftPerformanceCard } from "./profile/ShiftPerformanceCard";
import { EquipmentCard } from "./profile/EquipmentCard";
import { ProfileMenuList } from "./profile/ProfileMenuList";
import { EndShiftSection } from "./profile/EndShiftSection";

export const CourierProfileView: React.FC = () => {
  return (
    <div className="flex flex-col w-full px-screen-edge-padding space-y-space-lg max-w-md mx-auto pt-2 pb-24">
      {/* 1. Top Hero Profile Card */}
      <HeroProfileCard
        name="Liem Vance"
        driverCode="#AE-DRV-4791"
        courierTitle="Senior Bistro Courier • Motorbike #2"
        rating={4.95}
        totalDeliveries="320+ deliveries"
      />

      {/* 2. Today's Performance & Shift Tracker */}
      <ShiftPerformanceCard
        ordersCompleted={8}
        onlineHours="4.2h"
        onTimeRate="98%"
        todayEarnings={42.0}
      />

      {/* 3. Quick Vehicle & Equipment Card */}
      <EquipmentCard
        vehicleName="Honda PCX 150"
        vehiclePlate="Plate: 68-B2 491.20 • Insured"
        fleetCode="Fleet #02"
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
