"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.count === 0 && data.revenue === 0) {
      return (
        <div className="bg-surface-container-lowest p-2.5 rounded-lg shadow-md border border-border/60 text-xs">
          <p className="font-bold text-on-surface">No Activity</p>
          <p className="text-on-surface-variant font-medium">0 Orders in this period</p>
        </div>
      );
    }
    return (
      <div className="bg-surface-container-lowest p-2.5 rounded-lg shadow-md border border-border/60 text-xs">
        <p className="font-bold text-on-surface">{data.name}</p>
        <p className="text-on-surface-variant font-medium">
          {data.count} Orders • ${data.revenue.toFixed(2)}
        </p>
        <p className="text-primary font-bold">{data.value}% of channel mix</p>
      </div>
    );
  }
  return null;
};

interface OrderMixChartProps {
  data?: {
    totalOrders: number;
    delivery: { name: string; value: number; count: number; revenue: number; color: string };
    pickup: { name: string; value: number; count: number; revenue: number; color: string };
  };
}

export const OrderMixChart: React.FC<OrderMixChartProps> = ({ data }) => {
  const deliveryCount = data?.delivery?.count ?? 0;
  const deliveryRev = data?.delivery?.revenue ?? 0;
  const pickupCount = data?.pickup?.count ?? 0;
  const pickupRev = data?.pickup?.revenue ?? 0;

  const computedTotal = deliveryCount + pickupCount;
  const totalOrders = (data?.totalOrders && data.totalOrders > 0) ? data.totalOrders : computedTotal;
  const hasOrders = totalOrders > 0;

  const deliveryPct = hasOrders ? Math.round((deliveryCount / totalOrders) * 100) : 0;
  const pickupPct = hasOrders ? (100 - deliveryPct) : 0;


  const currentPieData = hasOrders
    ? [
        data?.delivery || { name: "Delivery", value: 0, count: 0, revenue: 0, color: "#a43700" },
        data?.pickup || { name: "Pickup / Dine", value: 0, count: 0, revenue: 0, color: "#fea047" },
      ]
    : [{ name: "No Orders", value: 100, count: 0, revenue: 0, color: "#e5e7eb" }];

  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-border/40 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-base font-bold text-on-surface">
          Order Channel Mix
        </h3>
        <span className="font-label-sm text-xs text-on-surface-variant font-medium">
          {totalOrders} Orders total
        </span>
      </div>

      {/* Donut & Legend representation */}
      <div className="my-space-md flex items-center justify-around gap-2">
        {/* Recharts Pie */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={currentPieData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={54}
                paddingAngle={hasOrders ? 3 : 0}
                dataKey="value"
              >
                {currentPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-display-lg text-xl font-bold text-on-surface leading-none">
              {hasOrders ? `${deliveryPct}%` : "0%"}
            </span>
            <span className="font-label-sm text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">
              {hasOrders ? "Delivery" : "Orders"}
            </span>
          </div>
        </div>

        {/* Legend metrics */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <div className="w-3.5 h-3.5 rounded bg-primary shrink-0"></div>
            <div className="flex flex-col">
              <span className="font-label-md text-xs font-bold text-on-surface leading-tight">
                Delivery ({deliveryPct}%)
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                {deliveryCount} Orders • ${deliveryRev.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <div className="w-3.5 h-3.5 rounded bg-secondary-container shrink-0"></div>
            <div className="flex flex-col">
              <span className="font-label-md text-xs font-bold text-on-surface leading-tight">
                Pickup / Dine ({pickupPct}%)
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                {pickupCount} Orders • ${pickupRev.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-space-xs px-space-sm rounded-lg flex items-center justify-between border border-border/30">
        <span className="font-label-sm text-xs text-on-surface-variant">
          Courier Active Fulfillment
        </span>
        <span className="font-label-sm text-xs text-primary font-bold">
          {hasOrders ? "Fastest: 18 min" : "Inactive"}
        </span>
      </div>
    </div>
  );
};

