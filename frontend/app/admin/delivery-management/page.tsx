"use client";

import React, { useState } from "react";
import { CourierRecord } from "@/types/deliveryFleet";
import { DeliveryRadarHeader } from "@/components/admin/delivery/DeliveryRadarHeader";
import { DeliveryInteractiveMap } from "@/components/admin/delivery/DeliveryInteractiveMap";
import { DeliveryFleetRoster } from "@/components/admin/delivery/DeliveryFleetRoster";

const mockCouriers: CourierRecord[] = [
  {
    id: "AE-DRV-4791",
    code: "AE-DRV-4791",
    name: "Liem Vance",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
    vehicleType: "motorbike",
    vehicleLabel: "Motorbike #2",
    orderId: "#1024",
    customerName: "John Smith",
    destinationAddress: "742 Evergreen Terrace, Apt 3B",
    speedKmH: 28,
    tempCelsius: 65,
    remainingKm: 0.8,
    remainingMinutes: 5,
    etaLabel: "19:31",
    statusText: "Approaching drop-off",
    paymentMethod: "cod",
    paymentBadgeLabel: "COD CASH",
    amount: 34.5,
    isFocused: true,
    coordinates: { x: 520, y: 210 },
  },
  {
    id: "AE-DRV-4798",
    code: "AE-DRV-4798",
    name: "David Chen",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
    vehicleType: "motorbike",
    vehicleLabel: "Motorbike #1",
    orderId: "#1027",
    customerName: "Elena Vance",
    destinationAddress: "12 Riverside Promenade (3.2 mi)",
    speedKmH: 24,
    tempCelsius: 68,
    remainingKm: 2.1,
    remainingMinutes: 14,
    etaLabel: "19:40",
    statusText: "Crossing South Bridge",
    paymentMethod: "khqr",
    paymentBadgeLabel: "KHQR PAID",
    amount: 62.0,
    coordinates: { x: 580, y: 410 },
  },
  {
    id: "AE-DRV-4802",
    code: "AE-DRV-4802",
    name: "Sokha Seng",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop",
    vehicleType: "e_scooter",
    vehicleLabel: "E-Scooter #4",
    orderId: "#1021",
    customerName: "Sophia Meng",
    destinationAddress: "88 Belmont St, Suite 12 (0.9 mi)",
    speedKmH: 22,
    tempCelsius: 62,
    remainingKm: 0.4,
    remainingMinutes: 2,
    etaLabel: "19:28",
    statusText: "At building entrance",
    paymentMethod: "cod",
    paymentBadgeLabel: "COD CASH",
    amount: 69.0,
    coordinates: { x: 740, y: 180 },
  },
];

export default function DeliveryManagementPage() {
  const [couriers] = useState<CourierRecord[]>(mockCouriers);
  const [selectedCourierId, setSelectedCourierId] =
    useState<string>("AE-DRV-4791");

  const totalCodOnRoad = couriers
    .filter((c) => c.paymentMethod === "cod")
    .reduce((sum, c) => sum + c.amount, 0);

  const handleCallCourier = (name: string, phone: string) => {
    alert(`Initiating dispatch radio call to ${name} (${phone})...`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl">
      {/* Header & Telemetry Bar */}
      <DeliveryRadarHeader
        activeCourierCount={couriers.length}
        avgFulfillmentMinutes={18.4}
        totalCodOnRoad={totalCodOnRoad}
      />

      {/* Main Interactive GPS Radar Map */}
      <DeliveryInteractiveMap
        activeCouriers={couriers}
        selectedCourierId={selectedCourierId}
        onSelectCourier={setSelectedCourierId}
      />

      {/* In-Transit Courier Roster & Health Footer */}
      <DeliveryFleetRoster
        couriers={couriers}
        selectedCourierId={selectedCourierId}
        onSelectCourier={setSelectedCourierId}
        onCallCourier={handleCallCourier}
      />
    </div>
  );
}
