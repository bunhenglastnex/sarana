"use client";

import React, { useState, useEffect } from "react";
import { CourierRecord, StoreConfig } from "@/types/deliveryFleet";
import { DeliveryRadarHeader } from "@/components/admin/delivery/DeliveryRadarHeader";
import { DeliveryInteractiveMap } from "@/components/admin/delivery/DeliveryInteractiveMap";
import { DeliveryFleetRoster } from "@/components/admin/delivery/DeliveryFleetRoster";
import { Api } from "@/lib/api";
import { Loader2 } from "lucide-react";

const defaultStore: StoreConfig = {
  name: "Store HQ",
  subtitle: "Central Dispatch Hub",
  address: "520 N Michigan Ave, Suite 14F",
  lat: 13.35227,
  lng: 103.955116,
};

export default function DeliveryManagementPage() {
  const [couriers, setCouriers] = useState<CourierRecord[]>([]);
  const [store, setStore] = useState<StoreConfig>(defaultStore);
  const [stats, setStats] = useState({
    activeCourierCount: 0,
    avgFulfillmentMinutes: 0,
    totalCodOnRoad: 0,
  });
  const [selectedCourierId, setSelectedCourierId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLiveTelemetry = async () => {
    try {
      const res = await Api.get<any>(
        "/delivery.php",
        { action: "fleet_radar" },
        { forceRefresh: true }
      );

      if (res.success && res.data) {
        let fetchedCouriers: CourierRecord[] = [];
        if (res.data.couriers && Array.isArray(res.data.couriers)) {
          fetchedCouriers = res.data.couriers;
        } else if (Array.isArray(res.data)) {
          fetchedCouriers = res.data;
        }

        setCouriers(fetchedCouriers);

        if (fetchedCouriers.length > 0 && !selectedCourierId) {
          setSelectedCourierId(fetchedCouriers[0].id);
        }

        if (res.data.store) {
          setStore(res.data.store);
        }
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch live fleet telemetry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCallCourier = (name: string, phone: string) => {
    alert(`Initiating dispatch radio call to ${name} (${phone})...`);
  };

  if (isLoading && couriers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] w-full bg-surface-container-lowest rounded-2xl border border-border/40 p-12 text-on-surface-variant gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="font-label-md text-sm font-bold">Connecting to Live GPS Radar Telemetry...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl">
      {/* Header & Telemetry Bar */}
      <DeliveryRadarHeader
        activeCourierCount={stats.activeCourierCount || couriers.length}
        avgFulfillmentMinutes={stats.avgFulfillmentMinutes || 18.4}
        totalCodOnRoad={stats.totalCodOnRoad}
      />

      {/* Main Interactive GPS Radar Map */}
      <DeliveryInteractiveMap
        activeCouriers={couriers}
        selectedCourierId={selectedCourierId || (couriers[0]?.id ?? "")}
        onSelectCourier={setSelectedCourierId}
        store={store}
      />

      {/* In-Transit Courier Roster & Health Footer */}
      <DeliveryFleetRoster
        couriers={couriers}
        selectedCourierId={selectedCourierId || (couriers[0]?.id ?? "")}
        onSelectCourier={setSelectedCourierId}
        onCallCourier={handleCallCourier}
      />
    </div>
  );
}
