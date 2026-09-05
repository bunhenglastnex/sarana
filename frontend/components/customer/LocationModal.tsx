'use client';

import React from 'react';
import { X, MapPin, Check, Plus, Navigation } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onSelectAddress: (addr: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onSelectAddress,
}) => {
  if (!isOpen) return null;

  const savedAddresses = [
    { label: 'Home', address: '244 Oak Street, Apt 4B', tag: 'Default' },
    { label: 'Work', address: '742 Evergreen Terrace, Suite 100', tag: 'Office' },
    { label: "Partner's Place", address: '120 Broadway Ave, Apt 12' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl p-space-lg flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-300 border border-surface-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-lg text-on-surface">
              Select Delivery Address
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close location modal"
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Location Quick Button */}
        <button
          type="button"
          onClick={() => {
            onSelectAddress('Current Location (GPS)');
            onClose();
          }}
          className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all font-bold text-xs"
        >
          <Navigation className="w-4 h-4 fill-primary text-primary" />
          <span>Use Current Location</span>
        </button>

        {/* Saved Addresses List */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Saved Addresses
          </span>

          <div className="space-y-2">
            {savedAddresses.map((item) => {
              const isSelected = item.address === currentAddress;
              return (
                <button
                  key={item.address}
                  type="button"
                  onClick={() => {
                    onSelectAddress(item.address);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-primary bg-surface-container-lowest ring-1 ring-primary'
                      : 'border-surface-container-high bg-surface-container-lowest hover:border-outline'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
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
                        {item.tag && (
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

                  {isSelected && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add New Address Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-full border border-dashed border-outline text-on-surface font-bold text-xs flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>
    </div>
  );
};
