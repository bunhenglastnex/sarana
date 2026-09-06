"use client";

import React from "react";
import { BadgeCheck, Star, Zap } from "lucide-react";
import { useDeliveryStore } from "@/lib/store/useDeliveryStore";

interface HeroProfileCardProps {
  name?: string;
  driverCode?: string;
  courierTitle?: string;
  rating?: number;
  totalDeliveries?: string;
  avatarUrl?: string;
}

export const HeroProfileCard: React.FC<HeroProfileCardProps> = ({
  name = "",
  driverCode = "",
  courierTitle = "",
  rating = 0,
  totalDeliveries = "",
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
}) => {
  const { isOnline, toggleShift } = useDeliveryStore();

  return (
    <section className="w-full bg-surface-container-lowest rounded-xl p-card-inner-padding shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05),0_1px_3px_0_rgba(26,23,21,0.03)] flex flex-col space-y-space-md relative overflow-hidden border border-outline-variant/30">
      {/* Decorative Hearth Glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-start gap-space-md">
        {/* Courier Avatar */}
        <div className="relative shrink-0">
          <div className="w-18 h-18 rounded-full overflow-hidden shadow-sm ring-2 ring-primary/20 p-0.5 bg-surface-container-low">
            <img
              alt={`${name} - Profile`}
              className="w-16 h-16 rounded-full object-cover"
              src={avatarUrl}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-surface-container-lowest rounded-full p-1 shadow-sm flex items-center justify-center">
            <BadgeCheck className="w-4.5 h-4.5 text-primary fill-primary/10" />
          </div>
        </div>

        {/* Courier Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-space-2xs">
            <h2 className="font-headline-md text-headline-md text-on-surface truncate font-bold">
              {name}
            </h2>
            <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold shrink-0">
              PRO
            </span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase mt-0.5">
            {driverCode}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-1">
            {courierTitle}
          </p>

          {/* Rating Pill */}
          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-surface-container-low rounded-full">
            <Star className="w-4 h-4 text-secondary fill-secondary" />
            <span className="font-label-md text-label-md text-on-surface font-bold">
              {rating}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              ({totalDeliveries})
            </span>
          </div>
        </div>
      </div>

      {/* On-Duty Toggle Pill Area */}
      <div className="pt-2">
        <div
          id="duty-toggle-wrapper"
          className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low transition-all duration-300 ease-out"
        >
          <div className="flex items-center gap-space-sm min-w-0">
            <div
              id="duty-status-indicator"
              className={`w-3 h-3 rounded-full shrink-0 ${
                isOnline ? "bg-emerald-600 animate-ping" : "bg-tertiary"
              }`}
            ></div>
            <div className="flex flex-col min-w-0">
              <span
                id="duty-title"
                className="font-label-lg text-label-lg text-on-surface leading-tight font-bold truncate"
              >
                {isOnline ? "Accepting Orders" : "Paused / On Break"}
              </span>
              <span
                id="duty-subtitle"
                className="font-body-sm text-body-sm text-on-surface-variant leading-tight truncate"
              >
                {isOnline
                  ? "Woodfire delivery queue active"
                  : "Dispatch queue temporarily frozen"}
              </span>
            </div>
          </div>

          {/* Custom Interactive Switch Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={isOnline}
            onClick={toggleShift}
            id="duty-toggle-btn"
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none shrink-0 relative flex items-center ${
              isOnline ? "bg-primary" : "bg-surface-variant"
            }`}
          >
            <span
              id="duty-toggle-thumb"
              className={`w-6 h-6 rounded-full bg-on-primary shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                isOnline ? "translate-x-6" : "translate-x-0"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
