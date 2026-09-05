"use client";

import React from "react";
import { CornerUpRight, Clock } from "lucide-react";

interface ActiveNavigationHUDProps {
  distanceToTurn?: string;
  turnInstruction?: string;
  etaTime?: string;
  etaMinutes?: string;
  distanceLeft?: string;
}

export const ActiveNavigationHUD: React.FC<ActiveNavigationHUDProps> = ({
  distanceToTurn = "In 400 ft",
  turnInstruction = "Turn right onto Elm Street",
  etaTime = "7:32 PM",
  etaMinutes = "8 mins",
  distanceLeft = "1.4",
}) => {
  return (
    <div className="sticky top-0 z-30 px-screen-edge-padding pt-space-xs pb-space-sm bg-gradient-to-b from-surface via-surface/95 to-transparent backdrop-blur-md max-w-md mx-auto w-full">
      <div className="w-full bg-inverse-surface text-inverse-on-surface rounded-xl p-space-md shadow-xl flex flex-col gap-space-xs">
        <div className="flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md min-w-0">
            <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-md">
              <CornerUpRight className="w-8 h-8 text-on-secondary-container" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-space-2xs">
                <span className="font-headline-lg text-headline-lg font-bold tracking-tight text-surface-bright">
                  {distanceToTurn}
                </span>
              </div>
              <p className="font-headline-sm text-headline-sm text-surface-variant font-medium truncate">
                {turnInstruction}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 pl-space-xs">
            <span className="inline-flex items-center gap-1 font-label-md text-label-md px-2 py-0.5 rounded-full bg-surface-variant/20 text-secondary-fixed">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
              LIVE
            </span>
          </div>
        </div>

        {/* Live Trip Telemetry Bar */}
        <div className="flex items-center justify-between pt-space-xs mt-space-2xs border-t-0 bg-surface-variant/10 rounded-lg px-space-sm py-1.5">
          <div className="flex items-center gap-space-xs">
            <Clock className="w-4 h-4 text-secondary-container" />
            <span className="font-headline-sm text-headline-sm font-bold text-surface-bright">
              {etaTime}
            </span>
            <span className="font-label-md text-label-md text-surface-dim">
              ({etaMinutes})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-headline-sm text-headline-sm font-bold text-surface-bright">
              {distanceLeft}
            </span>
            <span className="font-label-md text-label-md text-surface-dim uppercase tracking-wider">
              miles left
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
