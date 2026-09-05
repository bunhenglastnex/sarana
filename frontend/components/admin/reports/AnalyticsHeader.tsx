"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Printer,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";

interface AnalyticsHeaderProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  channelFilter: string;
  onChannelFilterChange: (channel: string) => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  timeRange,
  onTimeRangeChange,
  channelFilter,
  onChannelFilterChange,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-05");

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("CSV Analytics Report exported successfully!");
    }, 800);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-border/40 flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
      {/* Title & Description */}
      <div>
        <div className="flex items-center gap-space-xs">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-headline-xl text-xl font-extrabold text-on-surface tracking-tight">
              Reports &amp; Performance Analytics
            </h1>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              Live executive metrics, hourly kitchen rhythms, product performance &amp; loss analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar using Shadcn Components */}
      <div className="flex flex-wrap items-center gap-space-xs w-full xl:w-auto justify-between xl:justify-end">
        {/* Date Picker (Shadcn Popover + Calendar) */}
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder="Filter date"
        />

        {/* Time Range Selector (Shadcn Tabs) */}
        <Tabs value={timeRange} onValueChange={onTimeRangeChange} className="w-auto">
          <TabsList className="bg-surface-container-low border border-border/30 p-0.5 h-9">
            <TabsTrigger value="today" className="text-xs px-3 font-semibold">
              Today
            </TabsTrigger>
            <TabsTrigger value="7days" className="text-xs px-3 font-semibold">
              Last 7 Days
            </TabsTrigger>
            <TabsTrigger value="month" className="text-xs px-3 font-semibold">
              This Month
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Channel Dropdown Filter (Shadcn Select) */}
        <Select value={channelFilter} onValueChange={onChannelFilterChange}>
          <SelectTrigger className="w-[150px] h-9 text-xs font-semibold bg-surface-container-low border border-border/30 rounded-xl">
            <SelectValue placeholder="Select Channel" />
          </SelectTrigger>
          <SelectContent align="end" className="bg-surface-container-lowest border border-border/60 z-[100]">
            <SelectItem value="all" className="text-xs font-medium">All Channels</SelectItem>
            <SelectItem value="delivery" className="text-xs font-medium">Direct Delivery</SelectItem>
            <SelectItem value="pickup" className="text-xs font-medium">Express Pickup</SelectItem>
          </SelectContent>
        </Select>

        {/* Action Buttons (Shadcn Button) */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="h-9 px-3 text-xs font-bold bg-surface-container-low hover:bg-surface-container border border-border/30"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handlePrintPDF}
            className="h-9 px-3 text-xs font-bold bg-primary text-on-primary hover:bg-primary-container"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
