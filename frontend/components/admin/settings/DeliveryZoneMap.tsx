"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, Minimize2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

// Fix Leaflet default icon path bug in Next.js bundlers
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface DeliveryZoneMapProps {
  latitude: number;
  longitude: number;
  radiusKm: number;
  enableZoneBlocker: boolean;
  onLocationChange: (lat: number, lng: number) => void;
}

// Component to dynamically update map center when props change
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

// Component to force Leaflet to recalculate container bounds on resize / fullscreen
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

// Component to capture map click events for moving store pin
function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationChange(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6))
      );
    },
  });
  return null;
}

export const DeliveryZoneMap: React.FC<DeliveryZoneMapProps> = ({
  latitude,
  longitude,
  radiusKm,
  enableZoneBlocker,
  onLocationChange,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const validLat = isNaN(latitude) || latitude === 0 ? 13.35227 : latitude;
  const validLng = isNaN(longitude) || longitude === 0 ? 103.955116 : longitude;
  const radiusMeters = (radiusKm || 7.5) * 1000;

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

  const eventHandlers = {
    dragend(e: any) {
      const marker = e.target;
      if (marker != null) {
        const latLng = marker.getLatLng();
        onLocationChange(
          parseFloat(latLng.lat.toFixed(6)),
          parseFloat(latLng.lng.toFixed(6))
        );
      }
    },
  };

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[9999] w-screen h-screen bg-black/90 p-4 flex flex-col space-y-3 animate-fadeIn"
          : "w-full h-[360px] rounded-2xl overflow-hidden border border-border/40 shadow-inner relative z-0"
      }
    >
      {/* Fullscreen Navigation Header */}
      {isFullscreen && (
        <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-border/50 flex items-center justify-between gap-4 shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">
                Interactive Delivery Geofence Map (Fullscreen)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Hub Coordinates: Lat <strong className="text-emerald-700">{validLat}</strong>, Lng <strong className="text-emerald-700">{validLng}</strong> • Radius: <strong className="text-emerald-700">{radiusKm} KM</strong>
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

      {/* Map Renderer Wrapper */}
      <div className={isFullscreen ? "w-full flex-1 rounded-2xl overflow-hidden relative" : "w-full h-full relative"}>
        <MapContainer
          center={[validLat, validLng]}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Dynamic Center Controller */}
          <RecenterMap lat={validLat} lng={validLng} />

          {/* Invalidate Size Trigger on Fullscreen Toggle */}
          <InvalidateSizeOnToggle isFullscreen={isFullscreen} />

          {/* Map Click Listener */}
          <MapClickHandler onLocationChange={onLocationChange} />

          {/* Store Center Marker */}
          <Marker
            position={[validLat, validLng]}
            draggable={true}
            eventHandlers={eventHandlers}
          >
            <Popup className="font-sans text-xs">
              <div className="p-1 space-y-1">
                <span className="font-bold text-emerald-800 block">
                  📍 Main Restaurant Hub
                </span>
                <span className="text-[11px] text-gray-600 block">
                  Lat: {validLat}, Lng: {validLng}
                </span>
                <span className="text-[10px] text-gray-500 italic block">
                  💡 Drag pin or click map to move hub location.
                </span>
              </div>
            </Popup>
          </Marker>

          {/* Delivery Geofence Circle Radius */}
          <Circle
            center={[validLat, validLng]}
            radius={radiusMeters}
            pathOptions={{
              color: enableZoneBlocker ? "#059669" : "#d97706",
              fillColor: enableZoneBlocker ? "#10b981" : "#f59e0b",
              fillOpacity: 0.18,
              weight: 2,
              dashArray: enableZoneBlocker ? undefined : "6, 6",
            }}
          />
        </MapContainer>

        {/* Floating Info Overlay Pill */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 shadow-md text-xs font-semibold text-gray-800 flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              enableZoneBlocker ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span>
            Max Radius: <strong className="text-emerald-700">{radiusKm} KM</strong> ({radiusMeters.toLocaleString()}m)
          </span>
        </div>

        {/* Floating Top-Right Fullscreen Toggle Button (When in Normal Mode) */}
        {!isFullscreen && (
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            title="Open Map in Fullscreen View"
            className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md hover:bg-white text-gray-800 hover:text-emerald-700 px-3 py-1.5 rounded-xl border border-gray-200 shadow-md text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fullscreen</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DeliveryZoneMap;
