"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const pieData = [
  { name: "Delivery", value: 65, count: 16, revenue: 295.2, color: "#a43700" },
  { name: "Pickup / Dine", value: 35, count: 8, revenue: 130.3, color: "#fea047" },
];

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
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

export const OrderMixChart: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-border/40 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-base font-bold text-on-surface">
          Order Channel Mix
        </h3>
        <span className="font-label-sm text-xs text-on-surface-variant font-medium">
          24 Orders total
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
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={54}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-display-lg text-xl font-bold text-on-surface leading-none">
              65%
            </span>
            <span className="font-label-sm text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">
              Delivery
            </span>
          </div>
        </div>

        {/* Legend metrics */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <div className="w-3.5 h-3.5 rounded bg-primary shrink-0"></div>
            <div className="flex flex-col">
              <span className="font-label-md text-xs font-bold text-on-surface leading-tight">
                Delivery (65%)
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                16 Orders • $295.20
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <div className="w-3.5 h-3.5 rounded bg-secondary-container shrink-0"></div>
            <div className="flex flex-col">
              <span className="font-label-md text-xs font-bold text-on-surface leading-tight">
                Pickup / Dine (35%)
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                8 Orders • $130.30
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
          Fastest: 18 min
        </span>
      </div>
    </div>
  );
};
