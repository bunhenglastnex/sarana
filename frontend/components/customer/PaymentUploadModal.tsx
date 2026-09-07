'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Camera,
  FileCheck,
  X,
  CheckCircle2,
} from 'lucide-react';

interface PaymentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUpload: (imageUrl: string) => void;
}

export const PaymentUploadModal: React.FC<PaymentUploadModalProps> = ({
  isOpen,
  onClose,
  onConfirmUpload,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDemoReceipt = () => {
    setPreviewImage(
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
    );
  };

  const handleSubmit = () => {
    if (previewImage) {
      onConfirmUpload(previewImage);
      setPreviewImage(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-md rounded-2xl p-5 shadow-2xl flex flex-col gap-4 border border-surface-container-high animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface">
                Upload Payment Slip
              </h3>
              <p className="text-[11px] text-on-surface-variant font-medium">
                ផ្ញើររូបភាពបង់ប្រាក់ / Upload Transaction Receipt
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-tertiary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          id="slip-image-upload"
        />

        {/* Upload Area / Preview Box */}
        <div className="flex flex-col items-center">
          {previewImage ? (
            <div className="relative w-full h-52 rounded-xl overflow-hidden border-2 border-primary/40 shadow-inner group">
              <img
                src={previewImage}
                alt="Payment Slip Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-surface-container-lowest text-on-surface rounded-lg font-bold text-xs shadow flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                </button>
              </div>
              <div className="absolute top-2 right-2 px-2.5 py-1 bg-secondary text-on-secondary rounded-full font-bold text-[10px] flex items-center gap-1 shadow">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Slip Attached</span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-44 rounded-xl border-2 border-dashed border-outline/40 hover:border-primary/60 bg-surface-container-low flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition-all hover:bg-surface-container-low/80 group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-bold text-xs text-on-surface">
                  Tap to select screenshot or photo
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Supports JPG, PNG, WEBP (Max 5MB)
                </p>
              </div>
            </div>
          )}

          {/* Sample receipt shortcut button */}
          {!previewImage && (
            <button
              type="button"
              onClick={handleUseDemoReceipt}
              className="mt-2.5 text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Use Sample Receipt Demo</span>
            </button>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-surface-container text-tertiary hover:text-on-surface font-bold text-xs active:scale-98 transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!previewImage}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-98 transition-all ${
              previewImage
                ? 'bg-primary text-on-primary hover:bg-primary-container'
                : 'bg-surface-container-highest text-outline cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
