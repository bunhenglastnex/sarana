'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, Plus, Navigation, Loader2, Trash2, Star } from 'lucide-react';
import { useAddressStore, SavedAddress } from '@/lib/store/useAddressStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onSelectAddress: (addr: string, lat?: number, lng?: number) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onSelectAddress,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Address Form State
  const [newLabel, setNewLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');
  const [newLat, setNewLat] = useState<number | null>(null);
  const [newLng, setNewLng] = useState<number | null>(null);
  const [isFormLocating, setIsFormLocating] = useState(false);
  const [newTag, setNewTag] = useState('Home');
  const [isNewDefault, setIsNewDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address & Auth Store
  const { savedAddresses, addAddress, removeAddress, setDefaultAddress, fetchOrSyncAddresses } = useAddressStore();
  const { userId } = useAuthStore();

  useEffect(() => {
    if (isOpen && userId) {
      fetchOrSyncAddresses(userId);
    }
  }, [isOpen, userId, fetchOrSyncAddresses]);

  if (!isOpen) return null;

  const handleAutoFillFormGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsFormLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setNewLat(latitude);
        setNewLng(longitude);

        let formattedAddress = `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',');
              formattedAddress = parts.slice(0, 3).join(',').trim();
            }
          }
        } catch {
          // Geocoding fallback
        }

        setNewAddressText(formattedAddress);
        setIsFormLocating(false);
      },
      (error) => {
        setIsFormLocating(false);
        console.warn('Geolocation error:', error);
        alert('Could not retrieve GPS location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFetchCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let formattedAddress = `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',');
              formattedAddress = parts.slice(0, 3).join(',').trim();
            }
          }
        } catch {
          // Fallback to coordinates
        }

        setIsLocating(false);
        onSelectAddress(formattedAddress, latitude, longitude);
        onClose();
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        alert('Could not retrieve GPS location. Please select an address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newAddressText.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await addAddress(
        {
          label: newLabel.trim(),
          address: newAddressText.trim(),
          lat: newLat,
          lng: newLng,
          tag: newTag,
          isDefault: isNewDefault,
        },
        userId
      );

      setIsSubmitting(false);
      setIsAddingNew(false);
      setNewLabel('');
      setNewAddressText('');
      setNewLat(null);
      setNewLng(null);
      setNewTag('Home');
      setIsNewDefault(false);

      if (created) {
        onSelectAddress(created.address, created.lat || undefined, created.lng || undefined);
        onClose();
      }
    } catch (err) {
      setIsSubmitting(false);
      console.warn('Failed to save address:', err);
    }
  };

  const handleDeleteAddress = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this saved address?')) {
      removeAddress(id, userId);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl p-space-lg flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-300 border border-surface-container max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-lg text-on-surface">
              {isAddingNew ? 'Add New Saved Address' : 'Select Delivery Address'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isAddingNew) {
                setIsAddingNew(false);
              } else {
                onClose();
              }
            }}
            aria-label="Close location modal"
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add New Address Form Mode */}
        {isAddingNew ? (
          <form onSubmit={handleSaveNewAddress} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Address Label (e.g. Home, Work, Beach Villa) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Home, Work, Gym"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-on-surface">
                  Full Street Address <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoFillFormGPS}
                  disabled={isFormLocating}
                  className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  {isFormLocating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Locating...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5 fill-primary text-primary" />
                      <span>Use Current GPS</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                required
                rows={2}
                placeholder="House #, Street name, District, City"
                value={newAddressText}
                onChange={(e) => setNewAddressText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline text-xs text-on-surface focus:outline-none focus:border-primary resize-none"
              />
              {newLat && newLng && (
                <p className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  GPS Pin captured ({newLat.toFixed(4)}, {newLng.toFixed(4)})
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Badge Tag</label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Default">Default</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-on-surface">
                  <input
                    type="checkbox"
                    checked={isNewDefault}
                    onChange={(e) => setIsNewDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-outline"
                  />
                  <span>Set as Default</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="flex-1 py-2.5 rounded-full border border-outline font-bold text-xs text-on-surface hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Address</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Current Location Quick Button */}
            <button
              type="button"
              onClick={handleFetchCurrentGPS}
              disabled={isLocating}
              className="flex items-center justify-center gap-3 p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all font-bold text-xs active:scale-98"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Detecting GPS Location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 fill-primary text-primary" />
                  <span>Use Current GPS Location</span>
                </>
              )}
            </button>

            {/* Saved Addresses List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Saved Addresses ({savedAddresses.length})
                </span>
                {userId && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Synced with Account
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {savedAddresses.map((item) => {
                  const isSelected = item.address === currentAddress;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectAddress(item.address, item.lat || undefined, item.lng || undefined);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-surface-container-high bg-surface-container-lowest hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 pr-2">
                        <MapPin
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            isSelected ? 'text-primary' : 'text-outline'
                          }`}
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-on-surface">
                              {item.label}
                            </span>
                            {item.isDefault && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                                Default
                              </span>
                            )}
                            {item.tag && !item.isDefault && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                                {item.tag}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-on-surface-variant truncate">
                            {item.address}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isSelected && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAddress(e, item.id)}
                          title="Delete address"
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add New Address Button */}
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2.5 px-4 rounded-full border border-dashed border-primary text-primary font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
