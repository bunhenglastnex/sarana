'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const DynamicLiveOrderMapInner = dynamic(
  () => import('./LiveOrderMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 rounded-2xl bg-surface-container flex flex-col items-center justify-center text-on-surface-variant font-bold text-xs gap-2 border border-surface-container-high">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span>Loading Real-Time GPS Tracking Map...</span>
      </div>
    ),
  }
);

interface LiveOrderMapProps {
  storeLat: number;
  storeLng: number;
  storeName?: string;
  storeAddress?: string;
  customerLat: number;
  customerLng: number;
  customerAddress?: string;
  driverLat?: number;
  driverLng?: number;
  driverName?: string;
  orderStatus?: string;
}

export const LiveOrderMap: React.FC<LiveOrderMapProps> = (props) => {
  return <DynamicLiveOrderMapInner {...props} />;
};

export default LiveOrderMap;
