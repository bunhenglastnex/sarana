'use client';

import React from 'react';
import { Star, Clock, Bike, Flame } from 'lucide-react';

interface BistroInfoCardProps {
  name?: string;
  categoryTag?: string;
  subtitle?: string;
  rating?: number;
  reviewsCount?: string;
  deliveryTime?: string;
  deliveryFee?: string;
  featureTag?: string;
}

export const BistroInfoCard: React.FC<BistroInfoCardProps> = ({
  name = 'Downtown Flagship',
  categoryTag = 'Bistro',
  subtitle = 'Wood-fired hearth & craft comfort kitchen',
  rating = 4.9,
  reviewsCount = '1.2k',
  deliveryTime = '20–30 mins',
  deliveryFee = 'Free over $30',
  featureTag = 'Artisanal',
}) => {
  return (
    <section className="mt-space-xs mb-space-md bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container/60">
      <div className="flex items-start justify-between gap-space-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-2xs">
            <span className="font-bold text-lg text-on-surface tracking-tight">
              {name}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-bold text-xs">
              {categoryTag}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Rating Pill */}
        <div className="flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-full flex-shrink-0">
          <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
          <span className="font-bold text-xs text-on-surface">{rating}</span>
          <span className="text-[11px] text-on-surface-variant">({reviewsCount})</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center justify-between pt-space-sm mt-space-sm bg-surface-container-low/60 rounded-lg px-space-sm py-2">
        <div className="flex items-center gap-1.5 text-on-surface">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-semibold text-xs">{deliveryTime}</span>
        </div>

        <div className="w-1 h-1 rounded-full bg-outline-variant" />

        <div className="flex items-center gap-1.5 text-on-surface">
          <Bike className="w-4 h-4 text-secondary" />
          <span className="font-semibold text-xs">{deliveryFee}</span>
        </div>

        <div className="w-1 h-1 rounded-full bg-outline-variant" />

        <div className="flex items-center gap-1 text-primary">
          <Flame className="w-4 h-4 fill-primary/20 text-primary" />
          <span className="font-semibold text-xs">{featureTag}</span>
        </div>
      </div>
    </section>
  );
};
