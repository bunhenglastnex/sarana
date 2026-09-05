"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { RhythmChart } from "@/components/admin/RhythmChart";
import { OrderMixChart } from "@/components/admin/OrderMixChart";

export default function ReportsAnalyticsPage() {
  return (
    <div className="space-y-space-lg">
      <div className="border-b border-border/40 pb-space-md">
        <h1 className="font-headline-xl text-2xl font-bold text-on-surface">
          Reports & Performance Analytics
        </h1>
        <p className="font-body-sm text-sm text-on-surface-variant mt-0.5">
          In-depth sales metrics, hourly dispatch rhythms, and channel profitability reports.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        <div className="xl:col-span-8">
          <RhythmChart />
        </div>
        <div className="xl:col-span-4">
          <OrderMixChart />
        </div>
      </div>
    </div>
  );
}
