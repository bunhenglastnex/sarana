'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, Loader2, MapPin, RefreshCw, Check } from 'lucide-react';

const DynamicDeliveryMapInner = dynamic(
  () => import('./CheckoutDeliveryMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-44 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant font-bold text-xs gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Loading Interactive Map...</span>
      </div>
    ),
  }
);

interface CheckoutDeliveryMapProps {
  currentAddress: string;
  onAddressChange: (newAddress: string, lat?: number, lng?: number) => void;
  storeLat?: number;
  storeLng?: number;
  maxRadiusKm?: number;
}

export const CheckoutDeliveryMap: React.FC<CheckoutDeliveryMapProps> = ({
  currentAddress,
  onAddressChange,
  storeLat,
  storeLng,
  maxRadiusKm,
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: storeLat || 13.352270,
    lng: storeLng || 103.955116,
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Attempt reverse geocoding on coordinates change
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          // Format concise display address
          const parts = data.display_name.split(',');
          const concise = parts.slice(0, 3).join(',').trim();
          return concise;
        }
      }
    } catch {
      // Ignore geocoding network failures
    }
    return `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  };

  // Auto-detect user's real GPS location on page load
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          const fetchedAddress = await reverseGeocode(latitude, longitude);
          onAddressChange(fetchedAddress, latitude, longitude);
        },
        (error) => {
          console.log('GPS auto-detect skipped or denied by browser:', error);
          if (storeLat && storeLng) {
            setCoords({ lat: storeLat, lng: storeLng });
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, [storeLat, storeLng]);

  const handleLocationSelect = async (newLat: number, newLng: number) => {
    setCoords({ lat: newLat, lng: newLng });
    const fullAddress = await reverseGeocode(newLat, newLng);
    onAddressChange(fullAddress, newLat, newLng);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Locating your GPS position...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        const fetchedAddress = await reverseGeocode(latitude, longitude);

        onAddressChange(fetchedAddress, latitude, longitude);
        setIsLocating(false);
        setLocationStatus('GPS Position Acquired!');
        setTimeout(() => setLocationStatus(null), 3000);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsLocating(false);
        let errorMsg = 'Could not access GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please click on the map to place your pin.';
        }
        setLocationStatus(errorMsg);
        setTimeout(() => setLocationStatus(null), 4000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Map Container Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-on-surface font-bold text-xs">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Interactive Location Pin</span>
        </div>

        {/* Request Real GPS Location Button */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full font-bold text-xs transition-all active:scale-95 shadow-xs border border-primary/20"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5 fill-primary text-primary" />
          )}
          <span>{isLocating ? 'Locating...' : 'Use My GPS Location'}</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      {locationStatus && (
        <div className="px-3 py-1.5 bg-primary-fixed/50 text-on-primary-fixed-variant rounded-lg text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{locationStatus}</span>
          <Check className="w-3.5 h-3.5 text-primary" />
        </div>
      )}

      {/* Real Map Render Container */}
      <div className="w-full h-44 rounded-xl overflow-hidden border border-surface-container/80 shadow-inner relative">
        <DynamicDeliveryMapInner
          lat={coords.lat}
          lng={coords.lng}
          onLocationSelect={handleLocationSelect}
          addressName={currentAddress}
          storeLat={storeLat}
          storeLng={storeLng}
          maxRadiusKm={maxRadiusKm}
        />

        <div className="absolute bottom-2 left-2 z-10 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-on-surface text-[11px] font-bold flex items-center gap-1.5 shadow-sm border border-surface-container">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Click map to place pin</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDeliveryMap;
