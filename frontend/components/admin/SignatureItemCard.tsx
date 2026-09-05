"use client";

import React from "react";
import { Flame } from "lucide-react";

export const SignatureItemCard: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex items-center gap-space-md">
      <img
        className="w-20 h-20 rounded-lg object-cover shadow-xs shrink-0 border border-border/30"
        alt="Smoked Truffle Burger"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_8l7K-0OHzI5YpstCAWomtvxm-rTgU1y03HZOxoFT1w7tjBkrm5PClYFI9U41py1-PsPnYcKS3AMUIKXceTSBZsAnxC30gKDJ5KAUyL7UlI0y20Fje4-qBq-8qzFwxNKOuA87LLLpbs4Pw6s5EU6Y39RoUhiPskDy4zSqE1HFy7hvVXnFU3GyebdMLyY-2dPoG4LbSf5TepO4yEkhlDmG7JMTDIQVhj184XhdJe51L2HrHyvZUL0h"
      />
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-primary fill-primary" />
          <span className="font-label-sm text-[10px] text-primary font-bold uppercase tracking-wider">
            Top Seller Today
          </span>
        </div>
        <span className="font-headline-sm text-base font-bold text-on-surface truncate">
          Smoked Truffle Burger
        </span>
        <div className="flex items-center justify-between mt-1 text-on-surface-variant">
          <span className="font-body-sm text-xs">14 grilled today</span>
          <span className="font-label-md text-sm font-bold text-on-surface">
            $16.50
          </span>
        </div>
      </div>
    </div>
  );
};
