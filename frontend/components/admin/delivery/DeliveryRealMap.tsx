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
import {
  Navigation,
  Layers,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourierRecord, StoreConfig } from "@/types/deliveryFleet";

// Override Leaflet default divIcon background & border boxes
if (typeof window !== "undefined" && typeof document !== "undefined") {
  const styleId = "leaflet-custom-marker-override";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .custom-leaflet-marker {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Default Kitchen HQ Location (Phnom Penh Hub)
const DEFAULT_HQ_COORDS: [number, number] = [11.5564, 104.9282];

// Custom HTML Icons using L.divIcon
const createHqIcon = (storeName: string, storeSubtitle: string) =>
  L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div className="flex flex-col items-center group cursor-pointer -translate-x-1/2 -translate-y-full z-40">
        <!-- Floating Card Badge with Solid Dark Glass Background -->
        <div className="p-0.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 shadow-2xl mb-1.5 transform group-hover:scale-105 transition-all">
          <div className="bg-slate-950 text-white px-3.5 py-2 rounded-[14px] flex items-center gap-3 border border-amber-500/30">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                <svg className="w-5 h-5 fill-current text-slate-950" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-950"></span>
            </div>
            <div className="flex flex-col leading-tight min-w-[170px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-amber-300 font-extrabold font-sans text-xs tracking-wider uppercase">
                  ${storeName}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                  ACTIVE HQ
                </span>
              </div>
              <span className="text-slate-200 font-sans text-[10px] font-semibold opacity-95 mt-0.5">
                ${storeSubtitle}
              </span>
            </div>
          </div>
        </div>

        <!-- Animated Center Pin Hub -->
        <div className="relative flex items-center justify-center">
          <div className="absolute w-10 h-10 rounded-full bg-amber-500/40 animate-ping"></div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center ring-4 ring-slate-950 shadow-2xl transform group-hover:rotate-12 transition-transform">
            <svg className="w-5 h-5 fill-current text-slate-950" viewBox="0 0 24 24">
              <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"/>
            </svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const createCourierIcon = (courier: CourierRecord, isSelected: boolean) =>
  L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div className="flex flex-col items-center cursor-pointer group -translate-x-1/2 -translate-y-full z-30">
        <!-- Courier Card Badge -->
        <div className="px-3 py-1.5 rounded-xl ${
          isSelected
            ? "bg-slate-950 text-white ring-2 ring-amber-400 border border-amber-500/50 shadow-2xl"
            : "bg-slate-900/95 text-slate-100 border border-slate-700 shadow-xl"
        } font-sans text-xs font-bold whitespace-nowrap mb-1.5 flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full ${
              isSelected ? "bg-amber-400 animate-ping" : "bg-emerald-400"
            }"></span>
            <span className="w-2.5 h-2.5 rounded-full ${
              isSelected ? "bg-amber-400" : "bg-emerald-400"
            } absolute"></span>
          </div>
          <span className="${isSelected ? "text-amber-300 font-extrabold" : "text-white"}">
            ${courier.name} (${courier.vehicleLabel.split("#")[0].trim()})
          </span>
          <span className="bg-slate-800 text-amber-400 px-1.5 py-0.2 rounded text-[10px] font-mono border border-slate-700">
            ⚡ ${courier.speedKmH} km/h
          </span>
        </div>

        <!-- Bike Pin Circle -->
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full ${
            isSelected
              ? "bg-gradient-to-tr from-amber-600 to-orange-500 text-white ring-4 ring-amber-400/50 animate-bounce shadow-2xl"
              : "bg-slate-900 text-amber-400 ring-2 ring-slate-700 shadow-xl"
          } flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const createDestIcon = (courier: CourierRecord, isSelected: boolean) =>
  L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div className="flex flex-col items-center group cursor-pointer -translate-x-1/2 -translate-y-full z-20">
        <!-- Customer Address Badge -->
        <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-sans text-xs font-bold shadow-2xl whitespace-nowrap mb-1.5 border border-slate-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span className="text-white">${courier.destName || courier.customerName}</span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase">
            ${courier.paymentBadgeLabel} $${courier.amount.toFixed(2)}
          </span>
        </div>

        <!-- Destination Marker Pin -->
        <div className="w-8 h-8 rounded-full ${
          isSelected ? "bg-amber-500 text-slate-950 ring-4 ring-amber-300 shadow-2xl" : "bg-emerald-600 text-white ring-2 ring-slate-950 shadow-xl"
        } flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          </svg>
        </div>
        <div className="font-sans text-[10px] font-bold text-amber-300 mt-1 bg-slate-950 px-2 py-0.5 rounded-full shadow border border-slate-700">
          📍 ${courier.remainingKm} km · ${courier.remainingMinutes}m left
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

// Component to smoothly pan map when selected courier changes
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, {
      duration: 1.2,
    });
  }, [lat, lng, map]);
  return null;
}

// Helper to force Leaflet to recalculate container bounds on resize / fullscreen
function InvalidateSizeOnToggle({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [isFullscreen, map]);
  return null;
}

interface DeliveryRealMapProps {
  activeCouriers: CourierRecord[];
  selectedCourierId: string;
  onSelectCourier: (id: string) => void;
  store?: StoreConfig;
}

export const DeliveryRealMap: React.FC<DeliveryRealMapProps> = ({
  activeCouriers,
  selectedCourierId,
  onSelectCourier,
  store,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapTileStyle, setMapTileStyle] = useState<"standard" | "dark">("dark");

  const storeName = store?.name || "Bistro Kitchen HQ";
  const storeSubtitle = store?.subtitle || "Central Dispatch Hub · Phnom Penh";
  const storeAddress = store?.address || "520 N Michigan Ave, Suite 14F, Phnom Penh";

  const hqCoords: [number, number] = [
    store?.lat || DEFAULT_HQ_COORDS[0],
    store?.lng || DEFAULT_HQ_COORDS[1],
  ];

  const focusedCourier =
    activeCouriers.find((c) => c.id === selectedCourierId) || activeCouriers[0];

  const mapCenter: [number, number] = [
    focusedCourier?.lat || hqCoords[0],
    focusedCourier?.lng || hqCoords[1],
  ];

  // ESC key listener to exit fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const tileUrl =
    mapTileStyle === "dark"
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="w-full flex flex-col gap-space-md">
      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-[9999] w-screen h-screen bg-slate-950 p-4 flex flex-col space-y-3 animate-fadeIn"
            : "relative w-full h-[540px] rounded-2xl overflow-hidden shadow-xl border border-border/40"
        }
      >
        {/* Fullscreen Header Controls */}
        {isFullscreen && (
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-border/50 flex items-center justify-between gap-4 shrink-0 shadow-lg z-[1001]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">
                  Live Delivery &amp; Fleet GPS Radar Map (Fullscreen)
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Tracking <strong className="text-amber-600">{activeCouriers.length} Active Couriers</strong> · Primary Corridor: <strong className="text-amber-600">{focusedCourier.name}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant hidden sm:inline font-mono">
                Press [ESC] to exit
              </span>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsFullscreen(false)}
                className="h-9 px-4 text-xs font-bold bg-surface-container text-on-surface hover:bg-surface-container-high border border-border/50 flex items-center gap-1.5"
              >
                <Minimize2 className="w-4 h-4 text-primary" />
                <span>Exit Fullscreen</span>
              </Button>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div
          className={
            isFullscreen
              ? "w-full flex-1 rounded-2xl overflow-hidden relative z-0"
              : "w-full h-full relative z-0"
          }
        >
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={tileUrl}
            />

            {/* Recenter hook when selected courier changes */}
            <RecenterMap lat={mapCenter[0]} lng={mapCenter[1]} />
            <InvalidateSizeOnToggle isFullscreen={isFullscreen} />

            {/* Bistro Kitchen HQ Marker */}
            <Marker position={hqCoords} icon={createHqIcon(storeName, storeSubtitle)}>
              <Popup className="font-sans text-xs">
                <div className="p-2 space-y-1.5 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                    <span className="font-bold text-amber-800 text-sm flex items-center gap-1.5">
                      🏬 {storeName}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      ACTIVE HQ
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 font-semibold">
                    {storeSubtitle}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    📍 {storeAddress}
                  </p>
                  <div className="bg-amber-50 p-1.5 rounded border border-amber-200 text-[10px] text-amber-900 font-medium">
                    ⚡ Central Order Processing &amp; Live Dispatch Center
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Courier & Destination Markers & Route Polylines */}
            {activeCouriers.map((courier) => {
              const isSelected = courier.id === selectedCourierId;
              const courierLat = typeof courier.lat === "number" && !isNaN(courier.lat) ? courier.lat : hqCoords[0];
              const courierLng = typeof courier.lng === "number" && !isNaN(courier.lng) ? courier.lng : hqCoords[1];
              const destLat = typeof courier.destLat === "number" && !isNaN(courier.destLat) ? courier.destLat : courierLat + 0.005;
              const destLng = typeof courier.destLng === "number" && !isNaN(courier.destLng) ? courier.destLng : courierLng + 0.006;

              const courierPos: [number, number] = [courierLat, courierLng];
              const destPos: [number, number] = [destLat, destLng];

              return (
                <React.Fragment key={courier.id}>
                  {/* Route Polyline HQ -> Courier -> Dest (All using Primary Theme Colors) */}
                  <Polyline
                    positions={[hqCoords, courierPos]}
                    pathOptions={{
                      color: isSelected ? "#a43700" : "#c64e1b",
                      weight: isSelected ? 6 : 4,
                      dashArray: isSelected ? "8, 6" : "5, 5",
                      opacity: isSelected ? 0.95 : 0.65,
                    }}
                  />
                  <Polyline
                    positions={[courierPos, destPos]}
                    pathOptions={{
                      color: isSelected ? "#a43700" : "#c64e1b",
                      weight: isSelected ? 5 : 3.5,
                      dashArray: "6, 6",
                      opacity: isSelected ? 0.9 : 0.6,
                    }}
                  />

                  {/* Courier Marker */}
                  <Marker
                    position={courierPos}
                    icon={createCourierIcon(courier, isSelected)}
                    eventHandlers={{
                      click: () => onSelectCourier(courier.id),
                    }}
                  >
                    <Popup className="font-sans text-xs">
                      <div className="p-1.5 space-y-1">
                        <div className="font-bold text-slate-900 text-sm flex items-center justify-between gap-2">
                          <span>{courier.name}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            {courier.vehicleLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Speed: <strong>{courier.speedKmH} km/h</strong> · Status: {courier.statusText}
                        </p>
                        <p className="text-[11px] text-amber-700 font-semibold">
                          Order {courier.orderId} for {courier.customerName}
                        </p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Destination Marker */}
                  <Marker position={destPos} icon={createDestIcon(courier, isSelected)}>
                    <Popup className="font-sans text-xs">
                      <div className="p-1 space-y-1">
                        <span className="font-bold text-slate-900 block text-sm">
                          📍 Drop-off: {courier.customerName}
                        </span>
                        <span className="text-[11px] text-slate-600 block">
                          {courier.destinationAddress}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-bold block">
                          {courier.paymentBadgeLabel} · ${courier.amount.toFixed(2)}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>

          {/* Floating Top Controls Overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-[1000] flex-wrap">
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-white border border-slate-700/50">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-sans text-xs font-bold">
                Oakridge Sector · Traffic Normal (Clear)
              </span>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-white border border-slate-700/50">
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-sans text-xs font-bold">
                {activeCouriers.length} Active Routes Monitored
              </span>
            </div>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-[1000]">
            <button
              onClick={() =>
                setMapTileStyle((s) => (s === "dark" ? "standard" : "dark"))
              }
              className={`px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold transition-colors border border-slate-700/50 ${
                mapTileStyle === "dark"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-900 text-amber-400 hover:bg-slate-800"
              }`}
              title="Toggle Map Radar Theme"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">
                {mapTileStyle === "dark" ? "Radar View" : "Street View"}
              </span>
            </button>
            {!isFullscreen && (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                title="Fullscreen Map"
                className="p-2 rounded-xl bg-slate-900/90 text-white hover:bg-slate-800 transition-colors shadow-lg border border-slate-700/50"
              >
                <Maximize2 className="w-4 h-4 text-amber-400" />
              </button>
            )}
          </div>

          {/* Bottom Active Corridor Bar */}
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-xl flex items-center justify-between z-[1000] gap-2 flex-wrap border border-slate-700/50 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600/30 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xs text-white font-bold">
                  Active Route Corridor: Oakridge Bypass ({focusedCourier.name})
                </span>
                <span className="font-sans text-[11px] text-slate-300">
                  Speed: {focusedCourier.speedKmH} km/h · Remaining: {focusedCourier.remainingKm} km · Light traffic
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs bg-amber-600 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3.5 h-3.5" /> {focusedCourier.etaLabel} ({focusedCourier.remainingMinutes} mins)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryRealMap;
