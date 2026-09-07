"use client";

import React from "react";
import { Store, Phone, MapPin, Clock, DollarSign, Percent, QrCode, Upload, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface GeneralSettingsTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="space-y-space-md">
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            <span>Store Profile &amp; Contact Details</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Basic store information displayed on customer receipts, invoices, and online ordering apps.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Bistro / Restaurant Name
              </label>
              <Input
                value={formData.storeName}
                onChange={(e) => onChange("storeName", e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-on-surface-variant" />
                <Input
                  value={formData.storePhone}
                  onChange={(e) => onChange("storePhone", e.target.value)}
                  className="pl-8 text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Bistro Address Location
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-on-surface-variant" />
              <Input
                value={formData.storeAddress}
                onChange={(e) => onChange("storeAddress", e.target.value)}
                className="pl-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Operating Hours &amp; Tax Configuration</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Set daily opening/closing schedules and default billing tax rates.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Opening Time
              </label>
              <Input
                type="time"
                value={formData.openingTime}
                onChange={(e) => onChange("openingTime", e.target.value)}
                className="text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Closing Time
              </label>
              <Input
                type="time"
                value={formData.closingTime}
                onChange={(e) => onChange("closingTime", e.target.value)}
                className="text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                State Sales Tax Rate (%)
              </label>
              <div className="relative">
                <Percent className="w-3.5 h-3.5 absolute left-3 top-3 text-on-surface-variant" />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => onChange("taxRate", parseFloat(e.target.value) || 0)}
                  className="pl-8 text-xs font-bold"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Bakong KHQR Merchant Code & Image Upload */}
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <QrCode className="w-4 h-4 text-red-600" />
            <span>Bakong KHQR Merchant Payment QR Image</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Upload your official Bakong KHQR image or paste a URL. This QR code image will be displayed to customers on the KHQR payment page.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Upload & Link Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Upload KHQR Image File
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all border border-primary/30 shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Choose Image File...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            onChange("khqrImageUrl", reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1.5">
                  Supports JPG, PNG, WEBP, or SVG images (Recommended size 500x500).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Or Paste KHQR Image URL
                </label>
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-on-surface-variant" />
                  <Input
                    type="text"
                    value={formData.khqrImageUrl || ""}
                    onChange={(e) => onChange("khqrImageUrl", e.target.value)}
                    placeholder="https://domain.com/khqr.png or /uploads/qr/..."
                    className="pl-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* QR Image Preview Card */}
            <div className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-2xl border border-border/40 text-center">
              <span className="text-xs font-bold text-on-surface mb-2 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-red-600" />
                KHQR Customer Display Preview
              </span>
              {formData.khqrImageUrl ? (
                <div className="relative group">
                  <img
                    src={
                      formData.khqrImageUrl.startsWith("/")
                        ? `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "") : "http://localhost:8000"}${formData.khqrImageUrl}`
                        : formData.khqrImageUrl
                    }
                    alt="KHQR Preview"
                    className="w-48 h-48 object-contain rounded-xl shadow-md bg-white p-2 border border-surface-container"
                  />
                  <button
                    type="button"
                    onClick={() => onChange("khqrImageUrl", "")}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow-md hover:bg-red-700 transition-all font-bold"
                    title="Remove Image"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-48 h-48 rounded-xl bg-surface-container flex flex-col items-center justify-center text-on-surface-variant p-4 border border-dashed border-border">
                  <QrCode className="w-12 h-12 stroke-[1.5] mb-2 opacity-50 text-red-600" />
                  <span className="text-[11px] font-bold">No KHQR Image Uploaded</span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5">
                    Upload an image to display custom QR to customers.
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
