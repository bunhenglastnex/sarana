"use client";

import React, { useState } from "react";
import { useApi } from "@/lib/api";
import { AnalyticsHeader } from "@/components/admin/reports/AnalyticsHeader";
import { AnalyticsKpiCards } from "@/components/admin/reports/AnalyticsKpiCards";
import { RhythmChart } from "@/components/admin/RhythmChart";
import { OrderMixChart } from "@/components/admin/OrderMixChart";
import { TopDishesTable } from "@/components/admin/reports/TopDishesTable";
import { CancellationAnalyticsCard } from "@/components/admin/reports/CancellationAnalyticsCard";
import { Loader2, RefreshCw } from "lucide-react";

export default function ReportsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>("7days");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-05");

  const handleClearFilters = () => {
    setTimeRange("7days");
    setChannelFilter("all");
    setSelectedDate("2026-09-05");
  };

  const { data: reportsData, loading, error, refetch } = useApi<{
    kpi: any;
    rhythmData: any[];
    orderMixData: any;
    topDishes: any[];
    cancellationReasons: any[];
  }>("/reports.php", {
    time_range: timeRange,
    channel: channelFilter,
    selected_date: selectedDate,
  });

  const handleExportCSV = () => {
    if (!reportsData) {
      alert("Analytics data is currently loading.");
      return;
    }

    const rows: string[] = [];
    rows.push("Executive Performance & Financial Analytics Report");
    rows.push(`Period: ${timeRange.toUpperCase()} | Channel Filter: ${channelFilter.toUpperCase()} | Date: ${selectedDate}`);
    rows.push("");
    rows.push("--- KPI STATS ---");
    rows.push(`Gross Sales Revenue,${reportsData.kpi?.grossSales || '$0.00'}`);
    rows.push(`Gross Growth,${reportsData.kpi?.grossGrowth || '+0.0%'}`);
    rows.push(`Total Completed Orders,${reportsData.kpi?.totalOrders || '0'}`);
    rows.push(`Avg Ticket Value,${reportsData.kpi?.avgTicket || '$0.00'}`);
    rows.push(`KHQR Settlement Ratio,${reportsData.kpi?.khqrRatio || 0}%`);
    rows.push(`Cancelled Orders Count,${reportsData.kpi?.cancelledCount || '0'}`);
    rows.push(`Cancelled Amount,${reportsData.kpi?.cancelledAmount || '$0.00'}`);
    rows.push("");
    rows.push("--- TOP 5 SELLING DISHES ---");
    rows.push("Rank,Item Name,Category,Quantity Sold,Gross Sales ($)");
    if (reportsData.topDishes) {
      reportsData.topDishes.forEach((d) => {
        rows.push(`${d.rank},"${d.name.replace(/"/g, '""')}",${d.category},${d.quantitySold},${d.grossRevenue}`);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `executive_analytics_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-2xl">
      {/* Executive Header & Filter Control Bar */}
      <AnalyticsHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        channelFilter={channelFilter}
        onChannelFilterChange={setChannelFilter}
        selectedDate={selectedDate}
        onSelectedDateChange={setSelectedDate}
        onExportCSV={handleExportCSV}
        onClearFilters={handleClearFilters}
      />

      {/* Error Retry Banner */}
      {error && (
        <div className="bg-error-container/20 border border-error/30 p-space-md rounded-2xl flex items-center justify-between text-error text-xs font-bold">
          <span>Failed to load reports API data: {error}</span>
          <button
            type="button"
            onClick={() => refetch(true)}
            className="px-3 py-1 bg-error text-white rounded-lg hover:bg-error/80 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !reportsData ? (
        <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-border/40 p-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant min-h-[300px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="font-label-md text-sm font-bold">Computing executive reports &amp; analytics...</span>
        </div>
      ) : (
        <>
          {/* Top 4 KPI Executive Stat Cards */}
          <AnalyticsKpiCards timeRange={timeRange} kpi={reportsData?.kpi} />

          {/* Row 1: Financial Rhythm & Channel Mix Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-stretch">
            <div className="xl:col-span-8 min-h-[380px]">
              <RhythmChart data={reportsData?.rhythmData} />
            </div>
            <div className="xl:col-span-4 min-h-[380px]">
              <OrderMixChart data={reportsData?.orderMixData} />
            </div>
          </div>

          {/* Row 2: Product Performance & Cancellation / Loss Analysis */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-stretch">
            <div className="xl:col-span-7">
              <TopDishesTable data={reportsData?.topDishes} />
            </div>
            <div className="xl:col-span-5 flex flex-col">
              <CancellationAnalyticsCard
                data={reportsData?.cancellationReasons}
                cancelledAmount={reportsData?.kpi?.cancelledAmount}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

