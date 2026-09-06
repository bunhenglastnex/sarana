"use client";

import React from "react";
import {
  ShoppingBag,
  QrCode,
  XCircle,
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalyticsKpiCardsProps {
  timeRange: string;
  kpi?: {
    grossSales: string;
    grossGrowth: string;
    totalOrders: string;
    avgTicket: string;
    khqrRatio: number;
    cancelledCount: string;
    cancelledAmount: string;
  };
}

export const AnalyticsKpiCards: React.FC<AnalyticsKpiCardsProps> = ({
  timeRange,
  kpi,
}) => {
  const grossSales = kpi?.grossSales || "$0.00";
  const grossGrowth = kpi?.grossGrowth || "+0.0%";
  const totalOrders = kpi?.totalOrders || "0";
  const avgTicket = kpi?.avgTicket || "$0.00";
  const khqrRatio = kpi?.khqrRatio !== undefined ? `${kpi.khqrRatio}%` : "0%";
  const cancelledCount = kpi?.cancelledCount || "0";
  const cancelledAmount = kpi?.cancelledAmount || "$0.00";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
      {/* Card 1: Gross Sales Revenue */}
      <Card className="bg-surface-container-lowest border-border/40 shadow-xs flex flex-col justify-between">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Gross Sales Revenue
          </CardTitle>
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div>
            <div className="font-display-lg text-2xl font-extrabold text-on-surface tracking-tight">
              {grossSales}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-none font-bold text-[11px] px-2">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {grossGrowth}
              </Badge>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                vs previous period
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/20 flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
            <span>Target: $2,000/day</span>
            <span className="text-primary font-bold">124% Achieved</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Total Orders & Avg Ticket */}
      <Card className="bg-surface-container-lowest border-border/40 shadow-xs flex flex-col justify-between">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Total Orders Completed
          </CardTitle>
          <div className="w-9 h-9 rounded-xl bg-secondary-container/40 text-on-secondary-container flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-secondary" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div>
            <div className="font-display-lg text-2xl font-extrabold text-on-surface tracking-tight">
              {totalOrders} <span className="text-xs font-semibold text-on-surface-variant">Orders</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-label-sm text-[11px] text-on-surface font-bold">
                Avg Ticket Value: <span className="text-secondary font-extrabold">{avgTicket}</span>
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/20 flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
            <span>Direct Delivery: 65%</span>
            <span>Pickup: 35%</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: KHQR Instant Settlement Ratio */}
      <Card className="bg-surface-container-lowest border-border/40 shadow-xs flex flex-col justify-between">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            KHQR Settlement Ratio
          </CardTitle>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div>
            <div className="font-display-lg text-2xl font-extrabold text-emerald-700 tracking-tight flex items-center gap-1.5">
              {khqrRatio}
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-body-sm text-[11px] text-on-surface-variant font-medium">
                Verified Bakong / ABA Instant Transfers
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/20 flex items-center justify-between text-[11px] font-medium">
            <span className="text-on-surface-variant">Unpaid / COD: 5.2%</span>
            <span className="text-emerald-700 font-bold">0 Pending Refunds</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Cancelled & Refunded Orders Loss Metric */}
      <Card className="bg-surface-container-lowest border-border/40 shadow-xs flex flex-col justify-between">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Cancelled &amp; Refunded
          </CardTitle>
          <div className="w-9 h-9 rounded-xl bg-error-container/30 text-error flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div>
            <div className="font-display-lg text-2xl font-extrabold text-error tracking-tight">
              {cancelledAmount}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="destructive" className="bg-error-container/40 text-error border-none font-bold text-[11px] px-2">
                {cancelledCount} Orders Cancelled
              </Badge>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                (1.4% rate)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/20 flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
            <span>Main cause: Sold out</span>
            <span className="text-error font-bold">Low Loss Risk</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
