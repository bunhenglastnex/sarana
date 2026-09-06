"use client";

import React, { useState, useRef } from "react";
import { Camera, ShieldCheck, X, CheckCircle2 } from "lucide-react";

interface ConfirmProofCardProps {
  onPhotoSelect?: (base64: string | null) => void;
}

export const ConfirmProofCard: React.FC<ConfirmProofCardProps> = ({
  onPhotoSelect,
}) => {
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoUrl(base64);
        setHasPhoto(true);
        if (onPhotoSelect) {
          onPhotoSelect(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-screen-edge-padding max-w-md mx-auto w-full">
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Proof of Drop-off
            </h3>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            {hasPhoto ? "Photo Attached ✓" : "Recommended"}
          </span>
        </div>

        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Photo Camera Action Button */}
        <button
          type="button"
          onClick={handleButtonClick}
          className={`w-full flex items-center justify-center gap-3 p-space-md rounded-xl text-center active:scale-98 transition-all group border ${
            hasPhoto
              ? "bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20"
              : "bg-surface-container-low hover:bg-surface-container border-transparent hover:border-primary/20"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              hasPhoto
                ? "bg-emerald-600 text-white"
                : "bg-primary/10 text-primary"
            }`}
          >
            <Camera className="w-6 h-6" />
          </div>
          <div className="flex flex-col text-left min-w-0 flex-1">
            <span className="font-label-lg text-label-lg text-on-surface font-bold leading-tight">
              {hasPhoto ? "Retake / Replace Drop-off Photo" : "Take Drop-off Photo"}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-[12px] mt-0.5">
              {hasPhoto
                ? "Tap to open camera/gallery and replace photo proof"
                : "Capture doorstep, porch, or lobby hand-off photo"}
            </span>
          </div>
        </button>

        {/* Captured Photo Preview Card */}
        {hasPhoto && (
          <div className="relative rounded-lg overflow-hidden bg-surface-container-high h-40 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-2">
            <img
              src={photoUrl}
              alt="Drop-off proof"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-3">
              <div className="text-white">
                <p className="font-label-sm text-label-sm font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Photo Attached
                </p>
                <p className="font-body-sm text-body-sm text-gray-200 text-[11px]">
                  742 Evergreen Terr • GPS Tagged
                </p>
              </div>
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => {
                  setHasPhoto(false);
                  setPhotoUrl("");
                  if (onPhotoSelect) onPhotoSelect(null);
                }}
                className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
