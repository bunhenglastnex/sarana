"use client";

import React, { useState } from "react";
import { AnalyticsHeader } from "@/components/admin/reports/AnalyticsHeader";
import { AnalyticsKpiCards } from "@/components/admin/reports/AnalyticsKpiCards";
import { RhythmChart } from "@/components/admin/RhythmChart";
import { OrderMixChart } from "@/components/admin/OrderMixChart";
import { TopDishesTable } from "@/components/admin/reports/TopDishesTable";
import { CancellationAnalyticsCard } from "@/components/admin/reports/CancellationAnalyticsCard";

export default function ReportsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>("7days");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-2xl">
      {/* Executive Header & Filter Control Bar */}
      <AnalyticsHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        channelFilter={channelFilter}
        onChannelFilterChange={setChannelFilter}
      />

      {/* Top 4 KPI Executive Stat Cards */}
      <AnalyticsKpiCards timeRange={timeRange} />

      {/* Row 1: Financial Rhythm & Channel Mix Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-stretch">
        <div className="xl:col-span-8 min-h-[380px]">
          <RhythmChart />
        </div>
        <div className="xl:col-span-4 min-h-[380px]">
          <OrderMixChart />
        </div>
      </div>

      {/* Row 2: Product Performance & Cancellation / Loss Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-stretch">
        <div className="xl:col-span-7">
          <TopDishesTable />
        </div>
        <div className="xl:col-span-5 flex flex-col">
          <CancellationAnalyticsCard />
        </div>
      </div>
    </div>
  );
}
