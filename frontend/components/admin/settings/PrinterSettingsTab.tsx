"use client";

import React from "react";
import { Printer, FileText, CheckCircle2, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PrinterSettingsTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const PrinterSettingsTab: React.FC<PrinterSettingsTabProps> = ({
  formData,
  onChange,
}) => {
  const testPrintChit = () => {
    alert(`Sending test print ticket to printer at ${formData.printerIpAddress}... 🖨️📄`);
  };

  return (
    <div className="space-y-space-md">
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Printer className="w-4 h-4 text-primary" />
            <span>Thermal ESC/POS Kitchen Printer Integration</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Configure automatic chit printing for line cooks and expediter stations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border/30">
            <div>
              <div className="text-xs font-bold text-on-surface">
                Auto-Print Kitchen Chit Ticket on Order Acceptance
              </div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">
                Automatically prints kitchen ticket when an order status changes to PREPARING.
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.autoPrintKitchenChit}
              onChange={(e) => onChange("autoPrintKitchenChit", e.target.checked)}
              className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Thermal Printer Network IP / Connection
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Wifi className="w-3.5 h-3.5 absolute left-3 top-3 text-on-surface-variant" />
                  <Input
                    value={formData.printerIpAddress}
                    onChange={(e) => onChange("printerIpAddress", e.target.value)}
                    className="pl-8 text-xs font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={testPrintChit}
                  className="px-3 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container transition-colors shrink-0 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Test Ticket</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Thermal Paper Width
              </label>
              <Select
                value={formData.paperWidth}
                onValueChange={(val) => onChange("paperWidth", val)}
              >
                <SelectTrigger className="text-xs font-semibold">
                  <SelectValue placeholder="Select Width" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80mm">Standard 80mm ESC/POS Receipt</SelectItem>
                  <SelectItem value="58mm">Compact 58mm Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>Receipt Footer Note &amp; Customization</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Text printed at the bottom of customer receipts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Receipt Footer Note Text
            </label>
            <Input
              value={formData.receiptFooterNote}
              onChange={(e) => onChange("receiptFooterNote", e.target.value)}
              className="text-xs"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
