'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CheckoutDeliveryMapInnerProps {
  lat: number;
  lng: number;
  onLocationSelect: (lat: number, lng: number, addressName?: string) => void;
  addressName?: string;
  storeLat?: number;
  storeLng?: number;
  maxRadiusKm?: number;
}

// Ensure custom marker CSS rule is injected cleanly
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const styleId = 'checkout-leaflet-marker-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .custom-delivery-pin {
        background: transparent !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Custom Leaflet Icons
const createCustomerPinIcon = () =>
  L.divIcon({
    className: 'custom-delivery-pin',
    html: `
      <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-full z-30">
        <span className="absolute w-8 h-8 rounded-full bg-red-500/30 animate-ping"></span>
        <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl border-2 border-white transform hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const createRestaurantPinIcon = () =>
  L.divIcon({
    className: 'custom-delivery-pin',
    html: `
      <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-full z-20">
        <div className="bg-slate-900 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 shadow-md mb-1 whitespace-nowrap">
          🔥 Amber & Ember
        </div>
        <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-slate-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

// Map helper to center on position change
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

// Map click listener to select location
function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const CheckoutDeliveryMapInner: React.FC<CheckoutDeliveryMapInnerProps> = ({
  lat,
  lng,
  onLocationSelect,
  addressName,
  storeLat = 13.352270,
  storeLng = 103.955116,
  maxRadiusKm = 7.5,
}) => {
  const restaurantCoords: [number, number] = [storeLat, storeLng];

  return (
    <div className="relative w-full h-full min-h-[160px] overflow-hidden rounded-xl">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full rounded-xl z-0"
        style={{ height: '100%', width: '100%', minHeight: '160px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter lat={lat} lng={lng} />
        <MapClickHandler onSelect={(newLat, newLng) => onLocationSelect(newLat, newLng)} />

        {/* Max Delivery Radius Geofence Circle */}
        {maxRadiusKm && maxRadiusKm < 999 && (
          <Circle
            center={restaurantCoords}
            radius={maxRadiusKm * 1000}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.12,
              weight: 2,
              dashArray: '6, 6',
            }}
          />
        )}

        {/* Customer Target Location Marker */}
        <Marker position={[lat, lng]} icon={createCustomerPinIcon()}>
          <Popup className="font-sans text-xs">
            <div className="p-1 text-center">
              <p className="font-bold text-slate-900">Your Delivery Location</p>
              <p className="text-slate-600 text-[11px] mt-0.5">{addressName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}</p>
            </div>
          </Popup>
        </Marker>

        {/* Kitchen HQ Location Marker */}
        <Marker position={restaurantCoords} icon={createRestaurantPinIcon()}>
          <Popup className="font-sans text-xs">
            <p className="font-bold text-amber-600">Amber & Ember Kitchen</p>
            <p className="text-slate-600 text-[11px]">Dispatch Center</p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default CheckoutDeliveryMapInner;

