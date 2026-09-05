"use client";

import React from "react";
import { Store, Phone, MapPin, Clock, DollarSign, Percent } from "lucide-react";
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
    </div>
  );
};
