"use client";

import React from "react";
import dynamic from "next/dynamic";
import { DeliveryOrder } from "@/lib/store/useDeliveryStore";

// Dynamically import Leaflet Navigation Map with SSR disabled
const RealNavigationMap = dynamic(
  () => import("./RealNavigationMap").then((mod) => mod.RealNavigationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full px-screen-edge-padding my-space-xs max-w-md mx-auto">
        <div className="w-full h-[380px] rounded-2xl bg-surface-container-high border border-outline-variant/30 flex flex-col items-center justify-center gap-3 shadow-md animate-pulse">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="font-label-md text-xs text-on-surface-variant font-bold">
            Initializing Live GPS Navigation Map...
          </span>
        </div>
      </div>
    ),
  }
);

interface NavigationMapCanvasProps {
  order?: DeliveryOrder;
  speedMph?: number;
  routeName?: string;
}

export const NavigationMapCanvas: React.FC<NavigationMapCanvasProps> = ({
  order,
  speedMph = 24,
  routeName = "Fastest Route via Central Ave",
}) => {
  return (
    <RealNavigationMap
      order={order}
      speedMph={speedMph}
      routeName={routeName}
    />
  );
};
