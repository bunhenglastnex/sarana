'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LiveOrderMapInnerProps {
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

// Inject custom marker styles once
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const styleId = 'live-order-leaflet-marker-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .custom-live-map-pin {
        background: transparent !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Custom Leaflet Pin Icons
const createRestaurantIcon = (name = 'Bistro Kitchen') =>
  L.divIcon({
    className: 'custom-live-map-pin',
    html: `
      <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-full z-20">
        <div className="bg-slate-900 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 shadow-md mb-1 whitespace-nowrap">
          🏪 ${name}
        </div>
        <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-slate-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const createCustomerIcon = () =>
  L.divIcon({
    className: 'custom-live-map-pin',
    html: `
      <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-full z-20">
        <div className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap">
          🏠 Customer Destination
        </div>
        <div className="relative flex items-center justify-center">
          <span className="absolute w-8 h-8 rounded-full bg-red-500/30 animate-ping"></span>
          <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const createDriverIcon = (driverName = 'Delivery Courier') =>
  L.divIcon({
    className: 'custom-live-map-pin',
    html: `
      <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-full z-30">
        <div className="bg-primary text-on-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg mb-1 whitespace-nowrap flex items-center gap-1 border border-white">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          🛵 ${driverName}
        </div>
        <div className="relative flex items-center justify-center">
          <span className="absolute w-10 h-10 rounded-full bg-primary/40 animate-ping"></span>
          <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-2xl border-2 border-white transform scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="5.5" cy="17.5" r="2.5"/>
              <circle cx="18.5" cy="17.5" r="2.5"/>
              <path d="M15 6h2.57a2 2 0 0 1 1.61.8l3.1 4.13a2 2 0 0 1 .32 1.07V17h-2"/>
              <path d="M13 17H8"/>
              <path d="M5.5 17H3V11l4-5h6v11"/>
            </svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

// Recenter and fit bounds dynamically to show markers
function MapFitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [points, map]);
  return null;
}

export const LiveOrderMapInner: React.FC<LiveOrderMapInnerProps> = ({
  storeLat,
  storeLng,
  storeName = 'Amber & Ember Bistro',
  storeAddress = 'Restaurant Dispatch Center',
  customerLat,
  customerLng,
  customerAddress = 'Customer Address',
  driverLat,
  driverLng,
  driverName,
  orderStatus,
}) => {
  const storePos: [number, number] = [storeLat, storeLng];
  const customerPos: [number, number] = [customerLat, customerLng];

  // Driver pin is ONLY rendered when order is actively on_the_way or delivered AND a driver is assigned!
  const st = (orderStatus || '').toLowerCase();
  const showDriverPin =
    (st.includes('on_the_way') || st.includes('en route') || st.includes('delivered')) &&
    (driverLat !== undefined || Boolean(driverName));

  const activeDriverPos: [number, number] | null = showDriverPin
    ? [
        driverLat !== undefined ? driverLat : storeLat + (customerLat - storeLat) * 0.5,
        driverLng !== undefined ? driverLng : storeLng + (customerLng - storeLng) * 0.5,
      ]
    : null;

  const allPoints: [number, number][] = activeDriverPos
    ? [storePos, activeDriverPos, customerPos]
    : [storePos, customerPos];

  return (
    <div className="relative w-full h-full min-h-[240px] overflow-hidden rounded-2xl">
      <MapContainer
        center={storePos}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full rounded-2xl z-0"
        style={{ height: '100%', width: '100%', minHeight: '240px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFitBounds points={allPoints} />

        {/* Planned Delivery Route Line (Store -> Customer) */}
        <Polyline
          positions={[storePos, customerPos]}
          pathOptions={{
            color: '#a43700',
            weight: 4,
            opacity: 0.4,
            dashArray: '8, 8',
          }}
        />

        {/* Traveled Route Line (Only rendered when driver is actively en route) */}
        {showDriverPin && activeDriverPos && (
          <Polyline
            positions={[storePos, activeDriverPos]}
            pathOptions={{
              color: '#a43700',
              weight: 5,
              opacity: 0.9,
            }}
          />
        )}

        {/* Restaurant Pin */}
        <Marker position={storePos} icon={createRestaurantIcon(storeName)}>
          <Popup className="font-sans text-xs">
            <p className="font-bold text-amber-700">{storeName}</p>
            <p className="text-slate-600 text-[11px]">{storeAddress}</p>
          </Popup>
        </Marker>

        {/* Customer Pin */}
        <Marker position={customerPos} icon={createCustomerIcon()}>
          <Popup className="font-sans text-xs">
            <p className="font-bold text-red-600">Customer Delivery Address</p>
            <p className="text-slate-600 text-[11px]">{customerAddress}</p>
          </Popup>
        </Marker>

        {/* Courier Pin (ONLY rendered when order is on_the_way & driver assigned) */}
        {showDriverPin && activeDriverPos && (
          <Marker position={activeDriverPos} icon={createDriverIcon(driverName || 'Delivery Courier')}>
            <Popup className="font-sans text-xs">
              <p className="font-bold text-primary">{driverName || 'Delivery Courier'}</p>
              <p className="text-slate-600 text-[11px]">
                Status: <span className="font-semibold capitalize">{orderStatus || 'En Route'}</span>
              </p>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LiveOrderMapInner;
