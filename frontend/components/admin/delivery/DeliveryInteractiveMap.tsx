"use client";

import React, { useState } from "react";
import {
  Navigation,
  Layers,
  Plus,
  Minus,
  Store,
  Flame,
  Bike,
  Home,
  MapPin,
  Clock,
  Compass,
} from "lucide-react";
import { CourierRecord } from "@/types/deliveryFleet";

interface DeliveryInteractiveMapProps {
  activeCouriers: CourierRecord[];
  selectedCourierId: string;
  onSelectCourier: (id: string) => void;
}

export const DeliveryInteractiveMap: React.FC<DeliveryInteractiveMapProps> = ({
  activeCouriers,
  selectedCourierId,
  onSelectCourier,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);

  const focusedCourier =
    activeCouriers.find((c) => c.id === selectedCourierId) || activeCouriers[0];

  return (
    <div className="w-full flex flex-col gap-space-md">
      {/* Map Container */}
      <div className="relative w-full h-[520px] rounded-2xl bg-surface-container-high overflow-hidden shadow-md border border-border/40">
        {/* Styled Street / City Map Canvas (Simulated Vector Map) */}
        <div className="absolute inset-0 bg-[#ebe5dc] opacity-95 transition-transform duration-300">
          {/* SVG Vector Map Grid */}
          <svg
            className="w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 1200 560"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="routeGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#8f4e00" />
                <stop offset="50%" stopColor="#a43700" />
                <stop offset="100%" stopColor="#c64e1b" />
              </linearGradient>
            </defs>

            {/* Background Land / Parks */}
            <rect fill="#f5f0e6" height="200" rx="12" width="280" x="60" y="40" />
            <rect fill="#e8f0e4" height="160" rx="16" width="380" x="760" y="30" />
            <rect fill="#f5f0e6" height="180" rx="12" width="340" x="140" y="340" />
            <rect fill="#e8f0e4" height="150" rx="12" width="320" x="720" y="370" />

            {/* Main Road Network Arteries */}
            <path d="M -10 150 L 1220 150" stroke="#ffffff" strokeWidth="16" />
            <path d="M -10 150 L 1220 150" stroke="#e0dacb" strokeWidth="12" />
            <path d="M -10 350 L 1220 350" stroke="#ffffff" strokeWidth="18" />
            <path d="M -10 350 L 1220 350" stroke="#e0dacb" strokeWidth="14" />
            <path d="M 260 -10 L 260 580" stroke="#ffffff" strokeWidth="16" />
            <path d="M 260 -10 L 260 580" stroke="#e0dacb" strokeWidth="12" />
            <path d="M 680 -10 L 680 580" stroke="#ffffff" strokeWidth="20" />
            <path d="M 680 -10 L 680 580" stroke="#e0dacb" strokeWidth="14" />
            <path d="M 1020 -10 L 1020 580" stroke="#ffffff" strokeWidth="14" />
            <path d="M 1020 -10 L 1020 580" stroke="#e0dacb" strokeWidth="10" />

            {/* Diagonal Oakridge Bypass Avenue */}
            <path
              d="M 260 350 Q 480 300 700 220 T 1020 150"
              fill="none"
              stroke="#ffffff"
              strokeWidth="20"
            />
            <path
              d="M 260 350 Q 480 300 700 220 T 1020 150"
              fill="none"
              stroke="#ded4c3"
              strokeWidth="16"
            />

            {/* Traffic Overlay Layer */}
            {showTrafficLayer && (
              <>
                <path
                  d="M -10 150 L 500 150"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                  opacity="0.7"
                />
                <path
                  d="M 260 350 Q 480 300 700 220"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                  opacity="0.8"
                />
              </>
            )}

            {/* Active Route Polyline for Primary Focus Courier (Liem Vance #1024) */}
            <path
              className="animate-pulse"
              d="M 260 350 Q 420 320 560 260"
              fill="none"
              stroke="#ffdbcf"
              strokeLinecap="round"
              strokeWidth="8"
            />
            <path
              d="M 260 350 Q 420 320 560 260"
              fill="none"
              stroke="url(#routeGrad)"
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeWidth="5"
            />
            {/* Remaining Route to Customer Drop-Off */}
            <path
              d="M 560 260 Q 700 210 880 150 L 980 150"
              fill="none"
              opacity="0.75"
              stroke="#a43700"
              strokeDasharray="4 6"
              strokeLinecap="round"
              strokeWidth="4"
            />

            {/* Secondary Courier Path (David Chen #1027) */}
            <path
              d="M 260 350 L 260 460 L 680 460"
              fill="none"
              opacity="0.6"
              stroke="#8f4e00"
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeWidth="3.5"
            />
          </svg>
        </div>

        {/* Map Floating Top Overlay Controls */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20 flex-wrap">
          <div className="bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 text-on-surface border border-border/20">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-label-sm text-xs font-bold">
              Oakridge Sector · Traffic Normal (Clear)
            </span>
          </div>
          <div className="bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 text-on-surface border border-border/20">
            <Navigation className="w-3.5 h-3.5 text-primary" />
            <span className="font-label-sm text-xs font-bold">
              3 Active Routes Monitored
            </span>
          </div>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          <button
            onClick={() => setShowTrafficLayer(!showTrafficLayer)}
            className={`w-9 h-9 rounded-lg shadow-md flex items-center justify-center transition-colors border border-border/20 ${
              showTrafficLayer
                ? "bg-primary text-on-primary"
                : "bg-surface-container-lowest text-on-surface hover:bg-surface-container"
            }`}
            title="Toggle Traffic Layer"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.6))}
            className="w-9 h-9 rounded-lg bg-surface-container-lowest shadow-md flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors border border-border/20"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="w-9 h-9 rounded-lg bg-surface-container-lowest shadow-md flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors border border-border/20"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Map Marker 1: Bistro Kitchen Origin (Amber & Ember HQ) */}
        <div className="absolute left-[225px] top-[300px] z-20 flex flex-col items-center group cursor-pointer">
          <div className="px-2 py-0.5 rounded-md bg-inverse-surface text-inverse-on-surface font-label-sm text-[11px] font-bold shadow-md whitespace-nowrap mb-1 flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-secondary-fixed" />
            <span>Bistro Kitchen HQ</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-inverse-surface text-inverse-on-surface flex items-center justify-center ring-4 ring-secondary-fixed/50 shadow-lg">
            <Flame className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Map Marker 2: Primary Active Courier (Liem Vance) */}
        <div
          onClick={() => onSelectCourier("AE-DRV-4791")}
          className="absolute left-[520px] top-[210px] z-30 flex flex-col items-center cursor-pointer group"
        >
          <div className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-xs font-bold shadow-lg whitespace-nowrap mb-1 flex items-center gap-1.5 ring-1 ring-primary/30 border border-border/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-primary font-bold">Liem Vance (CB150)</span>
            <span className="text-on-surface-variant font-mono">· 28 km/h</span>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg ring-4 ring-primary-fixed animate-bounce">
              <Bike className="w-5 h-5" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[10px] shadow-xs">
              <Compass className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Map Marker 3: Customer Drop-off Destination (John Smith) */}
        <div className="absolute left-[920px] top-[100px] z-20 flex flex-col items-center group cursor-pointer">
          <div className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-xs font-bold shadow-lg whitespace-nowrap mb-1 ring-1 ring-secondary/30 border border-border/20 flex items-center gap-1.5">
            <Home className="w-4 h-4 text-secondary" />
            <span>John Smith (Apt 3B)</span>
            <span className="bg-secondary-fixed text-on-secondary-fixed px-1.5 py-0.2 rounded text-[10px]">
              COD $34.50
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-lg ring-4 ring-secondary-fixed">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="font-label-sm text-[11px] font-bold text-primary mt-0.5 bg-surface-container-lowest px-1.5 rounded shadow-xs border border-border/20">
            0.8 km · 5m left
          </div>
        </div>

        {/* Map Marker 4: Secondary Courier (David Chen) */}
        <div
          onClick={() => onSelectCourier("AE-DRV-4798")}
          className="absolute left-[580px] top-[410px] z-20 flex flex-col items-center cursor-pointer group opacity-90 hover:opacity-100"
        >
          <div className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface font-label-sm text-[11px] font-semibold shadow whitespace-nowrap mb-1 flex items-center gap-1 border border-border/20">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span>David Chen · To Riverside (2.1 km)</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shadow ring-2 ring-surface">
            <Bike className="w-4 h-4" />
          </div>
        </div>

        {/* Bottom Map Status Corridor Bar */}
        <div className="absolute bottom-3 left-3 right-3 bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-space-sm shadow-md flex items-center justify-between z-20 gap-2 flex-wrap border border-border/20">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-on-surface font-bold">
                Active Route Corridor: Oakridge Bypass ({focusedCourier.name})
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                Speed: {focusedCourier.speedKmH} km/h · Remaining: {focusedCourier.remainingKm} km · Light traffic
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-xs bg-primary text-on-primary font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-xs">
              <Clock className="w-3.5 h-3.5" /> {focusedCourier.etaLabel} ({focusedCourier.remainingMinutes} mins)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
