"use client";

import React, { useState } from "react";
import { Crosshair, Volume2, VolumeX, AlertTriangle, Navigation, Route } from "lucide-react";

interface NavigationMapCanvasProps {
  speedMph?: number;
  routeName?: string;
}

export const NavigationMapCanvas: React.FC<NavigationMapCanvasProps> = ({
  speedMph = 24,
  routeName = "Fastest Route via Elm St",
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isRecentered, setIsRecentered] = useState(false);

  const handleRecenter = () => {
    setIsRecentered(true);
    setTimeout(() => setIsRecentered(false), 600);
  };

  const handleSos = () => {
    alert("Emergency SOS signal sent to Hearth Dispatch & emergency contacts.");
  };

  return (
    <div className="relative w-full px-screen-edge-padding my-space-xs max-w-md mx-auto">
      <div className="relative w-full h-[360px] rounded-2xl overflow-hidden shadow-md bg-surface-container-high border border-outline-variant/30">
        {/* Map Background Image */}
        <img
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80"
          alt="Active Map Navigation"
          className="w-full h-full object-cover"
        />

        {/* Ambient GPS Route Overlay Simulation Graphic */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent"></div>

        {/* Current Courier Location Marker Simulation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center z-10">
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-primary/30 animate-ping absolute"></div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg text-on-primary ring-2 ring-white">
              <Navigation className="w-4 h-4 text-on-primary -rotate-45" />
            </div>
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-full bg-inverse-surface/90 text-inverse-on-surface font-label-sm text-label-sm shadow-md font-bold">
            You
          </span>
        </div>

        {/* Speed HUD Chip */}
        <div className="absolute top-space-sm left-space-sm bg-inverse-surface/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex flex-col items-center text-inverse-on-surface z-10">
          <span className="font-headline-sm text-headline-sm font-extrabold text-secondary-container leading-none">
            {speedMph}
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-surface-variant">
            MPH
          </span>
        </div>

        {/* Floating Map Control Cluster */}
        <div className="absolute top-space-sm right-space-sm flex flex-col gap-space-xs z-20">
          <button
            type="button"
            aria-label="Recenter GPS"
            onClick={handleRecenter}
            className={`w-11 h-11 rounded-xl shadow-lg flex items-center justify-center active:scale-95 transition-all ${
              isRecentered
                ? "bg-primary-fixed text-on-primary-fixed"
                : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <Crosshair className="w-6 h-6 text-primary" />
          </button>

          <button
            type="button"
            aria-label="Toggle Voice Guidance"
            onClick={() => setIsMuted(!isMuted)}
            className="w-11 h-11 rounded-xl bg-surface-container-lowest text-on-surface shadow-lg flex items-center justify-center active:scale-95 transition-transform hover:bg-surface-container-high"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-error" />
            ) : (
              <Volume2 className="w-6 h-6 text-on-surface-variant" />
            )}
          </button>

          <button
            type="button"
            aria-label="Emergency SOS"
            onClick={handleSos}
            className="w-11 h-11 rounded-xl bg-error text-on-error shadow-lg flex items-center justify-center active:scale-95 transition-transform hover:bg-error/90"
          >
            <AlertTriangle className="w-5 h-5 text-on-error" />
          </button>
        </div>

        {/* Bottom Map Quick Tag */}
        <div className="absolute bottom-space-sm left-space-sm right-space-sm flex items-center justify-between pointer-events-none z-10">
          <div className="px-3 py-1 rounded-full bg-inverse-surface/85 backdrop-blur-sm text-inverse-on-surface font-label-md text-label-md flex items-center gap-1.5 shadow">
            <Route className="w-4 h-4 text-secondary-container" />
            <span>{routeName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
