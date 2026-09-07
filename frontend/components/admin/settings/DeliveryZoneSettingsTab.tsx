"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Compass,
  AlertOctagon,
  DollarSign,
  ShieldAlert,
  Navigation,
  Info,
  CheckCircle2,
  Sliders,
  Globe,
  Crosshair,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Dynamically import Leaflet Map to bypass SSR window undefined errors in Next.js App Router
const DeliveryZoneMap = dynamic(() => import("./DeliveryZoneMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] rounded-2xl bg-surface-container-low border border-border/40 flex items-center justify-center text-xs font-bold text-on-surface-variant animate-pulse">
      🗺️ Loading OpenStreetMap Leaflet Engine...
    </div>
  ),
});

interface DeliveryZoneSettingsTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const DeliveryZoneSettingsTab: React.FC<
  DeliveryZoneSettingsTabProps
> = ({ formData, onChange }) => {
  const [isLocating, setIsLocating] = useState(false);
  const currentLat = parseFloat(formData.storeLatitude) || 13.35227;
  const currentLng = parseFloat(formData.storeLongitude) || 103.955116;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        onChange("storeLatitude", String(lat));
        onChange("storeLongitude", String(lng));
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        alert(`Could not fetch location: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-space-md">
      {/* 1. INTERACTIVE OPENSTREETMAP LEAFLET MAP CARD */}
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Interactive Delivery Geofence Map (OpenStreetMap)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Drag the marker or click anywhere on the map to set your store
                center. Radius circle expands live.
              </CardDescription>
            </div>

            {/* Use My Current Location Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLocating}
              onClick={handleUseCurrentLocation}
              className="h-8 text-xs font-bold px-3 border-emerald-500/40 text-emerald-800 hover:bg-emerald-100/50 shadow-xs flex items-center gap-1.5 shrink-0"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Detecting GPS Location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Use My Current Location</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Leaflet Map Renderer */}
          <DeliveryZoneMap
            latitude={currentLat}
            longitude={currentLng}
            radiusKm={formData.maxDeliveryRadiusKm ?? 7.5}
            enableZoneBlocker={formData.enableZoneBlocker ?? true}
            onLocationChange={(lat, lng) => {
              onChange("storeLatitude", String(lat));
              onChange("storeLongitude", String(lng));
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Store Latitude */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Store GPS Latitude <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.storeLatitude ?? "13.352270"}
                onChange={(e) => onChange("storeLatitude", e.target.value)}
                placeholder="e.g. 13.352270"
                className="text-xs font-mono border-border"
              />
              <p className="text-[11px] text-on-surface-variant">
                Updated automatically when clicking on the map.
              </p>
            </div>

            {/* Store Longitude */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Store GPS Longitude <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.storeLongitude ?? "103.955116"}
                onChange={(e) => onChange("storeLongitude", e.target.value)}
                placeholder="e.g. 103.955116"
                className="text-xs font-mono border-border"
              />
              <p className="text-[11px] text-on-surface-variant">
                Updated automatically when dragging the pin.
              </p>
            </div>

            {/* Max Delivery Radius */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Maximum Delivery Radius <span className="text-red-500">*</span>
              </label>
              <Select
                value={String(formData.maxDeliveryRadiusKm ?? "7.5")}
                onValueChange={(val) =>
                  onChange("maxDeliveryRadiusKm", parseFloat(val))
                }
              >
                <SelectTrigger className="text-xs font-semibold">
                  <SelectValue placeholder="Select Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">📍 3.0 KM (Inner City Only)</SelectItem>
                  <SelectItem value="5">📍 5.0 KM (Standard Zone)</SelectItem>
                  <SelectItem value="7.5">📍 7.5 KM (Recommended)</SelectItem>
                  <SelectItem value="10">
                    📍 10.0 KM (Extended Metro)
                  </SelectItem>
                  <SelectItem value="15">
                    📍 15.0 KM (Greater Suburbs)
                  </SelectItem>
                  <SelectItem value="25">📍 25.0 KM (Wide Area)</SelectItem>
                  <SelectItem value="999">
                    🌐 Unlimited (No Distance Restriction)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-on-surface-variant">
                Map circle resizes live as radius changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. OUT OF ZONE BLOCKING POLICY & CUSTOM ALERT MESSAGE */}
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-emerald-600" />
            <span>Out-of-Zone Customer Order Restrictions</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Control customer checkout behavior when their delivery address
            exceeds the max radius.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Toggle Switch */}
          <label className="p-4 rounded-2xl border border-emerald-300/60 bg-emerald-50/50 flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  Block Out-of-Zone Delivery Checkout
                </span>
                <span className="text-[11px] text-emerald-800">
                  When enabled, customers outside the{" "}
                  {formData.maxDeliveryRadiusKm || 7.5} km radius cannot place
                  delivery orders.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.enableZoneBlocker ?? true}
              onChange={(e) => onChange("enableZoneBlocker", e.target.checked)}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-border shrink-0"
            />
          </label>

          {/* Custom Customer Error Message */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface">
              Out-of-Zone Customer Message
            </label>
            <Input
              type="text"
              value={
                formData.outOfZoneMessage ??
                "Sorry! Your address is outside our maximum delivery radius of 7.5 km. Pickup is still available!"
              }
              onChange={(e) => onChange("outOfZoneMessage", e.target.value)}
              placeholder="Custom message shown to customer at checkout..."
              className="text-xs border-border"
            />
            <p className="text-[11px] text-on-surface-variant">
              Displayed in red alert box on customer checkout page when distance
              is exceeded.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. DISTANCE-BASED DELIVERY FEE & PACKAGING TAX RULES */}
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Distance Delivery Pricing &amp; Packaging Tax Settings</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Configure pure distance delivery fee per kilometer, packaging &amp; tax rate percentage, and free delivery threshold.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Delivery Fee Rate per KM */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Delivery Fee Rate per KM ($) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.10"
                value={formData.extraFeePerKm ?? 0.5}
                onChange={(e) =>
                  onChange("extraFeePerKm", parseFloat(e.target.value) || 0)
                }
                className="text-xs font-mono border-border"
              />
              <p className="text-[11px] text-on-surface-variant">
                Calculated strictly by distance (KM × rate per KM).
              </p>
            </div>

            {/* Packaging & Tax Rate (%) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Packaging &amp; Tax Rate (%) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.taxRate ?? 9.03}
                onChange={(e) =>
                  onChange("taxRate", parseFloat(e.target.value) || 0)
                }
                className="text-xs font-mono border-border"
              />
              <p className="text-[11px] text-on-surface-variant">
                Applied to food subtotal (e.g. 9.03% tax &amp; packaging).
              </p>
            </div>

            {/* Free Delivery Minimum Order */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Free Delivery Minimum Subtotal ($)
              </label>
              <Input
                type="number"
                step="1.00"
                value={formData.freeDeliveryMinSubtotal ?? 25.0}
                onChange={(e) =>
                  onChange(
                    "freeDeliveryMinSubtotal",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="text-xs font-mono border-border"
              />
              <p className="text-[11px] text-on-surface-variant">
                Orders equal or higher get $0 delivery fee.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
