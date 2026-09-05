"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Receipt,
  Volume2,
  VolumeX,
  Headset,
  ShieldCheck,
  ChevronRight,
  Phone,
} from "lucide-react";

export const ProfileMenuList: React.FC = () => {
  const [audioAlertsOn, setAudioAlertsOn] = useState(true);

  return (
    <section className="w-full bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05),0_1px_3px_0_rgba(26,23,21,0.03)] divide-y divide-surface-container border border-outline-variant/30">
      {/* 1. Cash Bag & Daily Settlement */}
      <Link
        href="/delivery/history"
        className="flex items-center justify-between p-card-inner-padding hover:bg-surface-container-low active:bg-surface-container transition-colors min-h-[56px]"
      >
        <div className="flex items-center gap-space-md min-w-0">
          <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
            <Banknote className="w-[22px] h-[22px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
                Cash Bag &amp; Settlement
              </span>
              <span className="font-label-sm text-label-sm px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold">
                $18.50 Due
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Remit cash collected to bistro counter
            </span>
          </div>
        </div>
        <ChevronRight className="w-[22px] h-[22px] text-outline shrink-0" />
      </Link>

      {/* 2. Delivery History & Receipts */}
      <Link
        href="/delivery/history"
        className="flex items-center justify-between p-card-inner-padding hover:bg-surface-container-low active:bg-surface-container transition-colors min-h-[56px]"
      >
        <div className="flex items-center gap-space-md min-w-0">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
            <Receipt className="w-[22px] h-[22px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
              Delivery History &amp; Receipts
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Completed orders, tip summaries &amp; routes
            </span>
          </div>
        </div>
        <ChevronRight className="w-[22px] h-[22px] text-outline shrink-0" />
      </Link>

      {/* 3. Push Notifications & Audio Alerts */}
      <div className="flex items-center justify-between p-card-inner-padding min-h-[56px]">
        <div className="flex items-center gap-space-md min-w-0">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
            {audioAlertsOn ? (
              <Volume2 className="w-[22px] h-[22px]" />
            ) : (
              <VolumeX className="w-[22px] h-[22px] text-tertiary" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
              Push &amp; High-Volume Alerts
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Order chime audio &amp; street alerts
            </span>
          </div>
        </div>

        {/* Interactive Audio Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={audioAlertsOn}
          onClick={() => setAudioAlertsOn(!audioAlertsOn)}
          id="audio-toggle-btn"
          className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0 relative flex items-center ${
            audioAlertsOn ? "bg-primary" : "bg-surface-variant"
          }`}
        >
          <span
            id="audio-toggle-thumb"
            className={`w-6 h-6 rounded-full bg-on-primary shadow transform transition-transform duration-200 ${
              audioAlertsOn ? "translate-x-5" : "translate-x-0"
            }`}
          ></span>
        </button>
      </div>

      {/* 4. Kitchen Concierge & Dispatch Support */}
      <a
        href="tel:055538290"
        className="flex items-center justify-between p-card-inner-padding hover:bg-surface-container-low active:bg-surface-container transition-colors min-h-[56px]"
      >
        <div className="flex items-center gap-space-md min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Headset className="w-[22px] h-[22px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
                Kitchen Concierge &amp; Dispatch
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Instant bistro phone line &amp; live chat
            </span>
          </div>
        </div>
        <Phone className="w-[22px] h-[22px] text-primary shrink-0" />
      </a>

      {/* 5. Courier Guidelines & Food Safety */}
      <div className="flex items-center justify-between p-card-inner-padding hover:bg-surface-container-low active:bg-surface-container transition-colors min-h-[56px] cursor-pointer">
        <div className="flex items-center gap-space-md min-w-0">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
            <ShieldCheck className="w-[22px] h-[22px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
              Courier Guidelines &amp; Food Safety
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Hearth handling, temperature laws &amp; hygiene
            </span>
          </div>
        </div>
        <ChevronRight className="w-[22px] h-[22px] text-outline shrink-0" />
      </div>
    </section>
  );
};
