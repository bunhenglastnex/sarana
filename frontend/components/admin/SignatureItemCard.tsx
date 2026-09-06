"use client";

import React from "react";
import { Flame } from "lucide-react";

interface SignatureItemCardProps {
  item?: {
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  };
}

export const SignatureItemCard: React.FC<SignatureItemCardProps> = ({ item }) => {
  const name = item?.name || "Smoked Truffle Burger";
  const quantity = item?.quantity ?? 14;
  const price = item?.price ?? 16.50;
  const imageUrl =
    item?.imageUrl ||
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop";

  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex items-center gap-space-md">
      <img
        className="w-20 h-20 rounded-lg object-cover shadow-xs shrink-0 border border-border/30"
        alt={name}
        src={imageUrl}
      />
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-primary fill-primary" />
          <span className="font-label-sm text-[10px] text-primary font-bold uppercase tracking-wider">
            Top Seller Today
          </span>
        </div>
        <span className="font-headline-sm text-base font-bold text-on-surface truncate">
          {name}
        </span>
        <div className="flex items-center justify-between mt-1 text-on-surface-variant">
          <span className="font-body-sm text-xs">{quantity} ordered today</span>
          <span className="font-label-md text-sm font-bold text-on-surface">
            ${price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
