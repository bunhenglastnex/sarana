"use client";

import React from "react";
import { Star, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopDish {
  rank: number;
  name: string;
  category: string;
  quantitySold: number;
  grossRevenue: number;
  rating: number;
  imageUrl: string;
  marginBadge: string;
}

interface TopDishesTableProps {
  data?: TopDish[];
}

export const TopDishesTable: React.FC<TopDishesTableProps> = ({ data }) => {
  const dishes = data || [];
  const hasDishes = dishes.length > 0;

  return (
    <Card className="bg-surface-container-lowest border-border/40 shadow-xs">
      <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between space-y-0 border-b border-border/30">
        <div>
          <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary fill-primary/20" />
            Top 5 Best-Selling Dishes
          </CardTitle>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Ranked by quantity sold, net gross revenue, and customer feedback.
          </p>
        </div>
        <Badge variant="outline" className="text-[11px] font-bold text-primary border-primary/30">
          Live Backend Data
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-surface-container-low">
            <TableRow className="border-b border-border/30">
              <TableHead className="w-16 text-center text-[11px]">Rank</TableHead>
              <TableHead className="text-[11px]">Item &amp; Category</TableHead>
              <TableHead className="text-center text-[11px]">Qty Sold</TableHead>
              <TableHead className="text-right text-[11px]">Gross Sales</TableHead>
              <TableHead className="text-center text-[11px]">Rating</TableHead>
              <TableHead className="text-right text-[11px]">Profitability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/20 text-xs">
            {hasDishes ? (
              dishes.map((dish) => (
                <TableRow key={dish.rank} className="hover:bg-surface-container-low/60 border-b border-border/20">
                  <TableCell className="text-center font-bold">
                    <span
                      className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-label-sm text-xs font-bold ${
                        dish.rank === 1
                          ? "bg-amber-100 text-amber-900 ring-1 ring-amber-400"
                          : dish.rank === 2
                          ? "bg-slate-200 text-slate-800"
                          : dish.rank === 3
                          ? "bg-amber-800/10 text-amber-900"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      #{dish.rank}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-10 h-10 rounded-lg object-cover shadow-xs border border-border/20 shrink-0"
                      />
                      <div>
                        <div className="font-label-lg text-xs font-bold text-on-surface">
                          {dish.name}
                        </div>
                        <div className="font-body-sm text-[11px] text-on-surface-variant">
                          {dish.category}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center font-label-md text-xs font-bold text-on-surface">
                    {dish.quantitySold} units
                  </TableCell>

                  <TableCell className="text-right font-price-lg text-xs font-extrabold text-on-surface">
                    ${dish.grossRevenue.toFixed(2)}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200 font-bold text-[11px] inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {dish.rating}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Badge variant="secondary" className="bg-secondary-fixed/40 text-on-secondary-fixed font-bold text-[10px]">
                      {dish.marginBadge}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="font-label-md text-xs font-bold text-on-surface">No Top Dishes Sold</span>
                    <span className="font-body-sm text-[11px]">No food item sales recorded for the selected date range.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

