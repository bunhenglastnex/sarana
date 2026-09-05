"use client";

import React from "react";
import { HearthStatusStrip } from "@/components/admin/HearthStatusStrip";
import { KpiMosaic } from "@/components/admin/KpiMosaic";
import { RhythmChart } from "@/components/admin/RhythmChart";
import { OrderMixChart } from "@/components/admin/OrderMixChart";
import { SignatureItemCard } from "@/components/admin/SignatureItemCard";
import { LiveOrdersTable } from "@/components/admin/LiveOrdersTable";
import { OperationalAlertsBar } from "@/components/admin/OperationalAlertsBar";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Top Greeting & Hearth Control Strip */}
      <HearthStatusStrip />

      {/* KPI Summary Cards: 6-Metric Mosaic */}
      <KpiMosaic />

      {/* Visual Analytics & Dispatch Rhythm Section (70/30 Asymmetric Layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        {/* Rhythm Chart Column (8 Cols) */}
        <div className="xl:col-span-8">
          <RhythmChart />
        </div>

        {/* Channel Mix & Top Seller Column (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          <OrderMixChart />
          <SignatureItemCard />
        </div>
      </div>

      {/* Operational Orders Table Section */}
      <LiveOrdersTable />

      {/* Operational Alert & Live Courier Dispatch Bar */}
      <OperationalAlertsBar />
    </div>
  );
}
