"use client";

import React from "react";
import { Truck, DollarSign, MapPin, ShieldAlert, Bike } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DeliveryRulesTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const DeliveryRulesTab: React.FC<DeliveryRulesTabProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="space-y-space-md">
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            <span>Delivery Pricing &amp; Thresholds</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Set customer delivery charges and minimum order amounts for free delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Default Standard Delivery Fee ($)
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-3 top-3 text-on-surface-variant" />
                <Input
                  type="number"
                  step="0.5"
                  value={formData.defaultDeliveryFee}
                  onChange={(e) =>
                    onChange("defaultDeliveryFee", parseFloat(e.target.value) || 0)
                  }
                  className="pl-8 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Free Delivery Order Minimum ($)
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-3 top-3 text-on-surface-variant" />
                <Input
                  type="number"
                  step="1"
                  value={formData.freeDeliveryMinimum}
                  onChange={(e) =>
                    onChange("freeDeliveryMinimum", parseFloat(e.target.value) || 0)
                  }
                  className="pl-8 text-xs font-bold"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Bike className="w-4 h-4 text-primary" />
            <span>Fleet Dispatch &amp; Cash Limits</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Set max distance boundaries and COD cash holding caps for delivery drivers.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Max Courier Dispatch Radius (km)
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-on-surface-variant" />
                <Input
                  type="number"
                  step="0.5"
                  value={formData.maxDispatchRadiusKm}
                  onChange={(e) =>
                    onChange("maxDispatchRadiusKm", parseFloat(e.target.value) || 0)
                  }
                  className="pl-8 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Max Driver COD Cash Limit ($)
              </label>
              <div className="relative">
                <ShieldAlert className="w-3.5 h-3.5 absolute left-3 top-3 text-amber-600" />
                <Input
                  type="number"
                  step="10"
                  value={formData.maxDriverCodLimit}
                  onChange={(e) =>
                    onChange("maxDriverCodLimit", parseFloat(e.target.value) || 0)
                  }
                  className="pl-8 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border/30">
            <div>
              <div className="text-xs font-bold text-on-surface">
                Auto-Assign Nearest Available Driver
              </div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">
                Automatically dispatches order tickets to online couriers based on proximity.
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.autoAssignDrivers}
              onChange={(e) => onChange("autoAssignDrivers", e.target.checked)}
              className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
