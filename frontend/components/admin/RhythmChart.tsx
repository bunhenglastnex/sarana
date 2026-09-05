"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const rhythmData = [
  { time: "11 AM", orders: 2, revenue: 45 },
  { time: "12 PM", orders: 7, revenue: 140 },
  { time: "1 PM", orders: 9, revenue: 185 },
  { time: "2 PM", orders: 5, revenue: 95 },
  { time: "3 PM", orders: 2, revenue: 40 },
  { time: "4 PM", orders: 3, revenue: 65 },
  { time: "5 PM", orders: 6, revenue: 130 },
  { time: "6 PM", orders: 11, revenue: 245, label: "6 PM (Peak)" },
  { time: "7 PM", orders: 8, revenue: 170 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-lowest p-3 rounded-lg shadow-md border border-border/60 text-xs space-y-1">
        <p className="font-bold text-on-surface">{label}</p>
        <div className="flex items-center gap-2 text-primary font-semibold">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span>Orders: {payload[0]?.value}</span>
        </div>
        <div className="flex items-center gap-2 text-secondary font-semibold">
          <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
          <span>Revenue: ${payload[1]?.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const RhythmChart: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-border/40 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Today's Dispatch Rhythm
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[11px] font-bold">
              Live Kitchen Timeline
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Order count paired with gross sales volume across service hours (11:00 AM - 10:00 PM).
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-space-md shrink-0">
          <div className="flex items-center gap-1.5 font-label-sm text-xs text-on-surface font-semibold">
            <span className="w-3 h-3 rounded bg-primary"></span>
            <span>Orders (Count)</span>
          </div>
          <div className="flex items-center gap-1.5 font-label-sm text-xs text-on-surface-variant font-medium">
            <span className="w-3 h-3 rounded bg-secondary-container"></span>
            <span>Revenue ($)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={rhythmData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fea047" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#fea047" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a43700" />
                <stop offset="100%" stopColor="#c64e1b" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#58423a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e5e2dc" }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#58423a"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#58423a"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#8f4e00"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#areaGrad)"
            />
            <Bar
              yAxisId="left"
              dataKey="orders"
              fill="url(#barGrad)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Metrics Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-space-sm mt-space-sm bg-surface-container-low p-space-sm rounded-lg border border-border/30">
        <div className="flex flex-col">
          <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
            Peak Rush Window
          </span>
          <span className="font-headline-sm text-sm text-on-surface font-bold">
            1:15 PM & 6:45 PM
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
            Average Ticket
          </span>
          <span className="font-headline-sm text-sm text-on-surface font-bold">
            $23.85 <span className="text-primary font-normal text-xs">/ ticket</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
            Hearth Prep Speed
          </span>
          <span className="font-headline-sm text-sm text-on-surface font-bold">
            14.2 min <span className="text-secondary font-normal text-xs">(Optimal)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
