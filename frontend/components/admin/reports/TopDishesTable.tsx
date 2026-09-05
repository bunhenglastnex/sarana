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

const mockTopDishes: TopDish[] = [
  {
    rank: 1,
    name: "Hearth-Smoked Angus Burger",
    category: "Gourmet Burgers",
    quantitySold: 184,
    grossRevenue: 3036.0,
    rating: 4.9,
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop",
    marginBadge: "High Margin (68%)",
  },
  {
    rank: 2,
    name: "Woodfire Smoked Pork Belly Bites",
    category: "Starters & Appetizers",
    quantitySold: 142,
    grossRevenue: 2201.0,
    rating: 4.8,
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop",
    marginBadge: "High Margin (72%)",
  },
  {
    rank: 3,
    name: "Truffle Parmesan Hand-Cut Fries",
    category: "Sides & Fries",
    quantitySold: 210,
    grossRevenue: 1365.0,
    rating: 4.9,
    imageUrl:
      "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=300&auto=format&fit=crop",
    marginBadge: "Top Add-on (81%)",
  },
  {
    rank: 4,
    name: "Woodfire Burrata & Fig Salad",
    category: "Salads & Larder",
    quantitySold: 98,
    grossRevenue: 1470.0,
    rating: 4.7,
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop",
    marginBadge: "Popular Healthy",
  },
  {
    rank: 5,
    name: "Charred Citrus Craft Lemonade",
    category: "Craft Beverages",
    quantitySold: 280,
    grossRevenue: 1400.0,
    rating: 4.9,
    imageUrl:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop",
    marginBadge: "Max Profit (88%)",
  },
];

export const TopDishesTable: React.FC = () => {
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
          Updated 5m ago
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
            {mockTopDishes.map((dish) => (
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
