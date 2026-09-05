"use client";

import React from "react";
import {
  XCircle,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Info,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CancellationReason {
  id: string;
  reason: string;
  count: number;
  percentage: number;
  refundAmount: number;
  impactLevel: "high" | "medium" | "low";
  indicatorColor: string;
  recommendation: string;
}

const mockReasons: CancellationReason[] = [
  {
    id: "sold_out",
    reason: "Ingredient Sold Out / Capacity Limit",
    count: 4,
    percentage: 57,
    refundAmount: 112.5,
    impactLevel: "high",
    indicatorColor: "bg-error",
    recommendation: "Auto-toggle 80% stock alert on KDS",
  },
  {
    id: "customer_change",
    reason: "Customer Requested Change / Address",
    count: 2,
    percentage: 29,
    refundAmount: 52.0,
    impactLevel: "medium",
    indicatorColor: "bg-amber-500",
    recommendation: "Customer app address radius check",
  },
  {
    id: "invalid_slip",
    reason: "Invalid KHQR Slip / Payment Issue",
    count: 1,
    percentage: 14,
    refundAmount: 20.5,
    impactLevel: "low",
    indicatorColor: "bg-slate-400",
    recommendation: "Bakong API automated hash verify",
  },
];

export const CancellationAnalyticsCard: React.FC = () => {
  const totalRefunded = mockReasons.reduce(
    (sum, item) => sum + item.refundAmount,
    0
  );
  const totalIncidents = mockReasons.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <Card className="bg-surface-container-lowest border-border/40 shadow-xs flex flex-col justify-between h-full">
      {/* Card Header with Shadcn Typography & Badges */}
      <CardHeader className="p-4 pb-3 border-b border-border/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
              <XCircle className="w-4.5 h-4.5 text-error shrink-0" />
              <span>Cancellation &amp; Loss Reasons</span>
            </CardTitle>
            <CardDescription className="text-xs text-on-surface-variant mt-1">
              Breakdown of order rejections, refunded amounts &amp; loss prevention insights.
            </CardDescription>
          </div>

          <Badge variant="destructive" className="bg-error-container/40 text-error border-none text-[11px] font-bold shrink-0 px-2.5 py-1">
            {totalIncidents} Incidents (${totalRefunded.toFixed(2)})
          </Badge>
        </div>
      </CardHeader>

      {/* Card Content with Shadcn Progress & Metrics */}
      <CardContent className="p-4 space-y-4 flex-1">
        {/* Total Financial Impact Strip */}
        <div className="bg-surface-container-low p-3 rounded-xl border border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-error-container/30 text-error flex items-center justify-center font-bold text-xs">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <div className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                Total Revenue Refunded
              </div>
              <div className="font-display-lg text-base font-extrabold text-error">
                ${totalRefunded.toFixed(2)}{" "}
                <span className="text-[11px] font-semibold text-on-surface-variant">
                  (1.4% of total sales)
                </span>
              </div>
            </div>
          </div>

          <Badge variant="outline" className="text-[10px] font-bold border-error/30 text-error bg-error-container/20">
            Healthy Threshold (&lt;3%)
          </Badge>
        </div>

        {/* Reason Breakdown List using Shadcn Progress */}
        <div className="space-y-3 pt-1">
          {mockReasons.map((item) => (
            <div key={item.id} className="space-y-1.5 bg-surface-container-lowest p-2.5 rounded-xl border border-border/20 hover:border-border/40 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-label-md text-xs font-bold text-on-surface truncate">
                    {item.reason}
                  </span>
                  <Badge
                    variant={
                      item.impactLevel === "high"
                        ? "destructive"
                        : item.impactLevel === "medium"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-[9px] px-1.5 py-0 font-bold uppercase shrink-0"
                  >
                    {item.impactLevel}
                  </Badge>
                </div>
                <span className="font-headline-sm text-xs font-extrabold text-on-surface shrink-0 ml-2">
                  {item.count} orders ({item.percentage}%) • ${item.refundAmount.toFixed(2)}
                </span>
              </div>

              {/* Shadcn Progress Indicator Bar */}
              <Progress
                value={item.percentage}
                indicatorClassName={item.indicatorColor}
                className="h-2 bg-surface-container-high"
              />

              <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-0.5">
                <span className="flex items-center gap-1">
                  <Info className="w-3 h-3 text-secondary shrink-0" />
                  <span>Recommendation: {item.recommendation}</span>
                </span>
                <span className="font-bold text-on-surface">
                  ${(item.refundAmount / item.count).toFixed(2)} avg/order
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Card Footer with Prevention Status */}
      <CardFooter className="p-4 pt-0 border-t border-border/20 mt-auto">
        <div className="w-full bg-surface-container-low p-2.5 rounded-xl border border-border/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-label-sm text-[11px] font-semibold text-on-surface">
              Automated inventory guard active: oversell prevention enabled.
            </span>
          </div>
          <span className="font-label-sm text-[10px] text-emerald-700 font-bold uppercase shrink-0">
            ✓ Active
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
