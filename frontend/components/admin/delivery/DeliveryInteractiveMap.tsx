"use client";

import React from "react";
import dynamic from "next/dynamic";
import { CourierRecord, StoreConfig } from "@/types/deliveryFleet";

// Dynamically import Leaflet Map component with SSR disabled
const DeliveryRealMap = dynamic(
  () => import("./DeliveryRealMap").then((mod) => mod.DeliveryRealMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[540px] rounded-2xl bg-surface-container-high border border-border/40 flex flex-col items-center justify-center gap-3 shadow-md animate-pulse">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <span className="font-label-md text-xs text-on-surface-variant font-bold">
          Initializing Live GPS Radar Map...
        </span>
      </div>
    ),
  }
);

interface DeliveryInteractiveMapProps {
  activeCouriers: CourierRecord[];
  selectedCourierId: string;
  onSelectCourier: (id: string) => void;
  store?: StoreConfig;
}

export const DeliveryInteractiveMap: React.FC<DeliveryInteractiveMapProps> = ({
  activeCouriers,
  selectedCourierId,
  onSelectCourier,
  store,
}) => {
  return (
    <DeliveryRealMap
      activeCouriers={activeCouriers}
      selectedCourierId={selectedCourierId}
      onSelectCourier={onSelectCourier}
      store={store}
    />
  );
};
