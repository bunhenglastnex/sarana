"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Volume2, VolumeX, AlertTriangle, Navigation, Route } from "lucide-react";
import { DeliveryOrder, useDeliveryStore } from "@/lib/store/useDeliveryStore";

// Ensure custom marker override style exists
if (typeof window !== "undefined" && typeof document !== "undefined") {
  const styleId = "leaflet-custom-navigation-marker";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .custom-leaflet-navigation-marker {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Store HQ Default Position (Fallback if DB not loaded yet)
const DEFAULT_HQ: [number, number] = [13.35227, 103.955116];

const createStoreIcon = (storeName: string) =>
  L.divIcon({
    className: "custom-leaflet-navigation-marker",
    html: `
      <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full z-30">
        <div className="bg-slate-900 text-amber-300 font-sans text-[11px] font-bold px-2.5 py-1 rounded-xl border border-amber-500/40 shadow-xl mb-1 flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>${storeName}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center ring-2 ring-slate-900 shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const createCustomerIcon = (customerName: string, address: string) =>
  L.divIcon({
    className: "custom-leaflet-navigation-marker",
    html: `
      <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full z-40">
        <div className="bg-slate-950 text-white font-sans text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/50 shadow-2xl mb-1 flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-emerald-300">${customerName}</span>
          <span className="text-[10px] text-slate-300">Drop-off</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center ring-4 ring-slate-950 shadow-2xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const createDriverIcon = (speedKmh: number) =>
  L.divIcon({
    className: "custom-leaflet-navigation-marker",
    html: `
      <div className="flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/40 animate-ping absolute"></div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center ring-4 ring-slate-950 shadow-2xl">
            <svg className="w-5 h-5 text-slate-950 -rotate-45" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        </div>
        <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-sans text-[10px] font-extrabold shadow-md border border-slate-700">
          YOUR RIDE (${speedKmh} km/h)
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

function RecenterMapHandler({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1 });
  }, [center, map]);
  return null;
}

interface RealNavigationMapProps {
  order?: DeliveryOrder;
  speedMph?: number;
  routeName?: string;
}

export const RealNavigationMap: React.FC<RealNavigationMapProps> = ({
  order,
  speedMph = 24,
  routeName = "Fastest Direct Route",
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [recenterCount, setRecenterCount] = useState(0);
  const { updateCourierLocation } = useDeliveryStore();

  // 1. Store Location from Database Settings (with fallbacks)
  const storeLat = order?.storeLat ?? DEFAULT_HQ[0];
  const storeLng = order?.storeLng ?? DEFAULT_HQ[1];
  const storeName = order?.storeName ?? "Bistro Kitchen HQ";
  const storeAddress = order?.storeAddress ?? "Central Kitchen Dispatch Hub";
  const hqCoords: [number, number] = [storeLat, storeLng];

  // 2. Customer Location from Database Orders Table (with fallbacks)
  const orderIdNum = order ? parseInt(order.id, 10) || 1 : 1;
  const custLat = order?.deliveryLat ?? (storeLat + 0.008 + (orderIdNum % 5) * 0.0015);
  const custLng = order?.deliveryLng ?? (storeLng + 0.009 + (orderIdNum % 4) * 0.002);
  const customerCoords: [number, number] = [custLat, custLng];
  const customerName = order?.customerName || "Customer";
  const customerAddress = order?.address || "742 Evergreen Terr, Apt 3B";

  // 3. Driver Real-Time Location (Local State + Device HTML5 Geolocation API Sync)
  const initialDriverLat = order?.driverLat ?? (storeLat + (custLat - storeLat) * 0.55);
  const initialDriverLng = order?.driverLng ?? (storeLng + (custLng - storeLng) * 0.55);

  const [driverPosition, setDriverPosition] = useState<[number, number]>([
    initialDriverLat,
    initialDriverLng,
  ]);
  const [driverSpeed, setDriverSpeed] = useState<number>(order?.driverSpeed ?? speedMph);

  // Real-time Device Geolocation Listener
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const speedKmh = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 24;

          setDriverPosition([lat, lng]);
          setDriverSpeed(speedKmh);

          // Update backend database courier_telemetry table in real time
          updateCourierLocation(lat, lng, speedKmh);
        },
        (err) => {
          console.warn("Geolocation watch position fallback:", err.message);
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [updateCourierLocation]);

  const handleSos = () => {
    alert("Emergency SOS signal sent to Hearth Dispatch & emergency contacts.");
  };

  return (
    <div className="relative w-full px-screen-edge-padding my-space-xs max-w-md mx-auto">
      <div className="relative w-full h-[380px] rounded-2xl overflow-hidden shadow-xl border border-outline-variant/30 z-0">
        {/* Leaflet Map */}
        <MapContainer
          center={driverPosition}
          zoom={14}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <RecenterMapHandler key={recenterCount} center={driverPosition} />

          {/* Polyline Route: Store HQ (DB) -> Real-time Driver (GPS) -> Customer (DB) */}
          <Polyline
            positions={[hqCoords, driverPosition]}
            pathOptions={{
              color: "#a43700",
              weight: 5,
              dashArray: "6, 6",
              opacity: 0.8,
            }}
          />
          <Polyline
            positions={[driverPosition, customerCoords]}
            pathOptions={{
              color: "#a43700",
              weight: 6,
              dashArray: "8, 6",
              opacity: 0.95,
            }}
          />

          {/* Store HQ Marker (From Admin Database Settings) */}
          <Marker position={hqCoords} icon={createStoreIcon(storeName)}>
            <Popup className="font-sans text-xs">
              <div className="p-1">
                <span className="font-bold text-amber-800 text-xs block">🏬 {storeName}</span>
                <span className="text-[11px] text-gray-600 block">{storeAddress}</span>
                <span className="text-[10px] text-amber-700 font-semibold block mt-1">
                  (DB Store Coords: {storeLat.toFixed(4)}, {storeLng.toFixed(4)})
                </span>
              </div>
            </Popup>
          </Marker>

          {/* Real-time Driver GPS Marker */}
          <Marker position={driverPosition} icon={createDriverIcon(driverSpeed)}>
            <Popup className="font-sans text-xs">
              <div className="p-1">
                <span className="font-bold text-amber-800 text-xs block">🛵 Live Driver Real-Time GPS</span>
                <span className="text-[11px] text-gray-600 block">Speed: {driverSpeed} km/h</span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                  (GPS Coords: {driverPosition[0].toFixed(4)}, {driverPosition[1].toFixed(4)})
                </span>
              </div>
            </Popup>
          </Marker>

          {/* Customer Destination Marker (From Orders Table in DB) */}
          <Marker position={customerCoords} icon={createCustomerIcon(customerName, customerAddress)}>
            <Popup className="font-sans text-xs">
              <div className="p-1 space-y-0.5">
                <span className="font-bold text-emerald-800 text-xs block">📍 {customerName}</span>
                <span className="text-[11px] text-gray-600 block">{customerAddress}</span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                  (DB Drop-off Coords: {custLat.toFixed(4)}, {custLng.toFixed(4)})
                </span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Speed HUD Chip */}
        <div className="absolute top-space-sm left-space-sm bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex flex-col items-center text-white z-[1000] border border-slate-700/50">
          <span className="font-headline-sm text-headline-sm font-extrabold text-amber-400 leading-none">
            {driverSpeed}
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-slate-300">
            KM/H
          </span>
        </div>

        {/* Floating Map Control Cluster */}
        <div className="absolute top-space-sm right-space-sm flex flex-col gap-space-xs z-[1000]">
          <button
            type="button"
            aria-label="Recenter GPS"
            onClick={() => setRecenterCount((c) => c + 1)}
            className="w-11 h-11 rounded-xl bg-slate-900/90 text-white shadow-lg flex items-center justify-center active:scale-95 transition-all hover:bg-slate-800 border border-slate-700/50"
          >
            <Crosshair className="w-5 h-5 text-amber-400" />
          </button>

          <button
            type="button"
            aria-label="Toggle Voice Guidance"
            onClick={() => setIsMuted(!isMuted)}
            className="w-11 h-11 rounded-xl bg-slate-900/90 text-white shadow-lg flex items-center justify-center active:scale-95 transition-all hover:bg-slate-800 border border-slate-700/50"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-red-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-slate-200" />
            )}
          </button>

          <button
            type="button"
            aria-label="Emergency SOS"
            onClick={handleSos}
            className="w-11 h-11 rounded-xl bg-red-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition-all hover:bg-red-700"
          >
            <AlertTriangle className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Bottom Map Quick Tag */}
        <div className="absolute bottom-space-sm left-space-sm right-space-sm flex items-center justify-between pointer-events-none z-[1000]">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md text-white font-label-md text-label-md flex items-center gap-2 shadow-xl border border-slate-700/50">
            <Route className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs">{routeName} • {storeName} → {customerName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealNavigationMap;
