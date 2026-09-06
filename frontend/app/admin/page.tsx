"use client";

import React, { useState } from "react";
import { HearthStatusStrip } from "@/components/admin/HearthStatusStrip";
import { KpiMosaic } from "@/components/admin/KpiMosaic";
import { RhythmChart } from "@/components/admin/RhythmChart";
import { OrderMixChart } from "@/components/admin/OrderMixChart";
import { SignatureItemCard } from "@/components/admin/SignatureItemCard";
import { LiveOrdersTable } from "@/components/admin/LiveOrdersTable";
import { useApi, Api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const [selectedRange, setSelectedRange] = useState<"today" | "week" | "month" | "custom">("today");

  const { data, loading, refetch } = useApi<any>("/dashboard.php", {
    range: selectedRange,
  });

  const kpis = data?.kpis;
  const rhythm = data?.rhythm;
  const orderMix = data?.orderMix;
  const signatureItem = data?.signatureItem;
  const recentOrders = data?.recentOrders || [];

  const handleAction = async (action: string, orderId: string, payload?: any) => {
    try {
      const res = await Api.post("/orders.php", { action, order_id: orderId, ...payload });
      if (res.success) {
        refetch(true);
      } else {
        alert("Operation failed: " + (res.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Failed: " + err.message);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* Top Greeting & Hearth Control Strip */}
      <HearthStatusStrip
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        onRefresh={() => refetch(true)}
      />

      {/* Loading Skeleton */}
      {loading && !data ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-border/40 p-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant min-h-[300px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="font-label-md text-sm font-bold">Loading live operations dashboard...</span>
        </div>
      ) : (
        <>
          {/* KPI Summary Cards: 6-Metric Mosaic */}
          <KpiMosaic kpis={kpis} />

          {/* Visual Analytics & Dispatch Rhythm Section (70/30 Asymmetric Layout) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
            {/* Rhythm Chart Column (8 Cols) */}
            <div className="xl:col-span-8">
              <RhythmChart data={rhythm} />
            </div>

            {/* Channel Mix & Top Seller Column (4 Cols) */}
            <div className="xl:col-span-4 flex flex-col gap-space-md">
              <OrderMixChart data={orderMix} />
              <SignatureItemCard item={signatureItem} />
            </div>
          </div>

          {/* Operational Orders Table Section */}
          <LiveOrdersTable
            initialOrders={recentOrders}
            onAction={handleAction}
            onRefresh={() => refetch(true)}
          />
        </>
      )}
    </div>
  );
}
