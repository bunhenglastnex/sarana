"use client";

import React from "react";
import {
  Phone,
  Bike,
  Navigation,
  CheckCircle2,
  LogOut,
  Banknote,
  Star,
  MapPin,
  HeartHandshake,
  ExternalLink,
} from "lucide-react";
import { StaffRecord } from "@/types/staff";

interface StaffMemberCardProps {
  staff: StaffRecord;
  onSelect: (staff: StaffRecord) => void;
  onCall: (name: string, phone: string) => void;
}

export const StaffMemberCard: React.FC<StaffMemberCardProps> = ({
  staff,
  onSelect,
  onCall,
}) => {
  const getStatusBadge = () => {
    switch (staff.status) {
      case "on_delivery":
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1 border border-emerald-300/60 shrink-0">
            <Navigation className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>ON DELIVERY</span>
          </span>
        );
      case "available":
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black flex items-center gap-1 border border-blue-300/60 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>ONLINE</span>
          </span>
        );
      case "logout":
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold border border-border/30 shrink-0 flex items-center gap-1">
            <LogOut className="w-3 h-3 text-on-surface-variant" />
            <span>LOGOUT</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-2xl shadow-sm hover:shadow-md border border-border/40 transition-all flex flex-col justify-between gap-3 group">
      {/* Top Header: Driver Avatar, Name, Code & Status */}
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          {/* Driver Avatar & Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={staff.avatarUrl}
                alt={staff.name}
                className="w-11 h-11 rounded-xl object-cover border border-border/40 shadow-xs"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-container-lowest ${
                  staff.status === "on_delivery"
                    ? "bg-emerald-500"
                    : staff.status === "available"
                    ? "bg-blue-500"
                    : "bg-surface-container-high"
                }`}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1 truncate">
                <h3 className="font-headline-sm text-xs sm:text-sm font-black text-on-surface group-hover:text-primary transition-colors truncate">
                  {staff.name}
                </h3>
              </div>
              <div className="font-body-sm text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-on-surface-variant/80">
                  {staff.code}
                </span>
                {staff.rating && (
                  <span className="text-amber-600 font-bold flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{staff.rating}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Status Badge */}
          {getStatusBadge()}
        </div>

        {/* Vehicle Badge */}
        {staff.vehicleLabel && (
          <div className="bg-surface-container-low p-2 rounded-xl border border-border/20 flex items-center justify-between text-xs gap-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant font-medium min-w-0 truncate">
              <Bike className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">Vehicle: <strong className="text-on-surface">{staff.vehicleLabel}</strong></span>
            </div>
            {staff.vehiclePlate && (
              <span className="font-label-sm text-[10px] font-extrabold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                {staff.vehiclePlate}
              </span>
            )}
          </div>
        )}

        {/* Active Order Banner */}
        {staff.status === "on_delivery" && staff.activeOrderId && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-label-sm text-[11px] font-extrabold text-emerald-800 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-emerald-600 shrink-0" />
                Active {staff.activeOrderId}
              </span>
              <span className="font-price-lg text-[11px] font-bold text-emerald-700 truncate">
                To: {staff.activeCustomerName}
              </span>
            </div>
            {staff.activeDestination && (
              <p className="font-body-sm text-[10px] text-emerald-900/80 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0 text-emerald-600" />
                <span className="truncate">{staff.activeDestination}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Driver Performance Stats (2x2 Clean Responsive Grid) */}
      <div className="space-y-2 pt-2 border-t border-border/20">
        <div className="grid grid-cols-2 gap-1.5 bg-surface-container-low p-2 rounded-xl border border-border/20 text-xs">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-sm text-[10px] text-on-surface-variant">Today</span>
            <span className="font-headline-sm font-extrabold text-on-surface text-[11px]">
              {staff.deliveriesToday || 0} Deliv.
            </span>
          </div>

          <div className="flex items-center justify-between px-1 border-l border-border/20 pl-1.5">
            <span className="font-label-sm text-[10px] text-on-surface-variant">Avg ETA</span>
            <span className="font-headline-sm font-extrabold text-primary text-[11px]">
              {staff.avgDeliveryMinutes || 0}m
            </span>
          </div>

          <div className="flex items-center justify-between px-1 pt-1 border-t border-border/20">
            <span className="font-label-sm text-[10px] text-on-surface-variant flex items-center gap-0.5">
              <HeartHandshake className="w-3 h-3 text-primary" /> Tips
            </span>
            <span className="font-headline-sm font-extrabold text-primary text-[11px]">
              +${(staff.tipsToday || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between px-1 pt-1 border-t border-l border-border/20 pl-1.5">
            <span className="font-label-sm text-[10px] text-on-surface-variant flex items-center gap-0.5">
              <Banknote className="w-3 h-3 text-amber-600" /> COD
            </span>
            <span className="font-headline-sm font-extrabold text-amber-700 text-[11px]">
              ${(staff.codCashCollected || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCall(staff.name, staff.phone)}
            className="flex-1 py-1.5 sm:py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-sm text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Driver</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(staff)}
            className="py-1.5 sm:py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-sm text-xs font-bold border border-border/30 flex items-center justify-center gap-1 transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
