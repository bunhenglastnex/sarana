"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  Bike,
  Navigation,
  ShieldCheck,
  Star,
  MapPin,
  Banknote,
  HeartHandshake,
  CheckCircle2,
  ArrowRightLeft,
} from "lucide-react";
import { StaffRecord } from "@/types/staff";

interface StaffDetailModalProps {
  staff: StaffRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onReconcileCash: (staffId: string) => void;
}

export const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
  staff,
  isOpen,
  onClose,
  onReconcileCash,
}) => {
  const [showSettlementSuccess, setShowSettlementSuccess] = useState(false);

  if (!staff) return null;

  const codCash = staff.codCashCollected || 0;
  const tips = staff.tipsToday || 0;
  const netSettlement = codCash - tips;
  const hasOutstandingBalance = codCash > 0 || tips > 0;

  const handleConfirmSettlement = () => {
    onReconcileCash(staff.id);
    setShowSettlementSuccess(true);
    setTimeout(() => setShowSettlementSuccess(false), 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-surface-container-lowest border-border/40 p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="border-b border-border/30 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={staff.avatarUrl}
              alt={staff.name}
              className="w-14 h-14 rounded-2xl object-cover border border-border/40 shadow-xs"
            />
            <div>
              <DialogTitle className="text-lg font-black text-on-surface flex items-center gap-2">
                <span>{staff.name}</span>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold"
                >
                  {staff.code}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-2">
                <span className="font-semibold">{staff.roleLabel}</span>
                <span>•</span>
                <span>Shift Started: {staff.shiftStartTime || "11:00 AM"}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Contact Info Box */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-border/30 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" /> Phone Number:
            </span>
            <a
              href={`tel:${staff.phone}`}
              className="font-bold text-primary hover:underline"
            >
              {staff.phone}
            </a>
          </div>

          {staff.email && (
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> Driver Email:
              </span>
              <span className="font-medium text-on-surface">{staff.email}</span>
            </div>
          )}

          {staff.vehicleLabel && (
            <div className="flex items-center justify-between border-t border-border/20 pt-2">
              <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-primary" /> Vehicle Details:
              </span>
              <span className="font-bold text-on-surface">
                {staff.vehicleLabel} ({staff.vehiclePlate || "N/A"})
              </span>
            </div>
          )}
        </div>

        {/* Driver Financial Breakdown: COD Cash vs Driver Tips */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
              Financial Settlement Calculation
            </span>
            {hasOutstandingBalance ? (
              <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                Pending Reconciliation
              </span>
            ) : (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                ✓ Fully Settled
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 space-y-1">
              <span className="font-label-sm text-[11px] font-bold text-amber-800 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-amber-600" /> COD Cash
                Held
              </span>
              <div className="font-display-lg text-lg font-black text-amber-700">
                ${codCash.toFixed(2)}
              </div>
              <span className="font-body-sm text-[10px] text-amber-800/70 block">
                Cash driver owes admin
              </span>
            </div>

            <div className="bg-primary-container/20 p-3 rounded-xl border border-primary/30 space-y-1">
              <span className="font-label-sm text-[11px] font-bold text-primary flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5" /> Driver Tips Today
              </span>
              <div className="font-display-lg text-lg font-black text-primary">
                +${tips.toFixed(2)}
              </div>
              <span className="font-body-sm text-[10px] text-on-surface-variant block">
                Tips admin owes driver
              </span>
            </div>
          </div>

          {/* Net Balance Calculation Banner */}
          {hasOutstandingBalance ? (
            <div
              className={`p-3 rounded-xl border flex flex-col gap-1 text-xs ${
                netSettlement > 0
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : netSettlement < 0
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-surface-container-low border-border/30 text-on-surface"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>Net Shift Settlement:</span>
                <span className="font-display-lg text-sm font-black">
                  {netSettlement > 0
                    ? `Driver owes Admin $${netSettlement.toFixed(2)}`
                    : netSettlement < 0
                      ? `Admin owes Driver $${Math.abs(netSettlement).toFixed(2)}`
                      : "Balanced ($0.00)"}
                </span>
              </div>
              <p className="font-body-sm text-[11px] opacity-80">
                {netSettlement > 0
                  ? `Driver collected $${codCash.toFixed(2)} cash minus $${tips.toFixed(2)} tips. Driver hands over $${netSettlement.toFixed(2)} cash.`
                  : netSettlement < 0
                    ? `Admin pays driver $${Math.abs(netSettlement).toFixed(2)} tips.`
                    : "COD cash collected equals tips earned."}
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">
                Driver cash and tips for this shift are 100% reconciled and
                cleared.
              </span>
            </div>
          )}

          {/* Settlement Action Button */}
          {hasOutstandingBalance && (
            <Button
              size="sm"
              onClick={handleConfirmSettlement}
              className="w-full h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>
                {netSettlement >= 0
                  ? `Collect Net $${netSettlement.toFixed(2)} Cash & Clear Balance`
                  : `Pay Net $${Math.abs(netSettlement).toFixed(2)} Tips & Clear Balance`}
              </span>
            </Button>
          )}

          {showSettlementSuccess && (
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-fadeIn shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>✓ Driver Shift Settlement Reconciled &amp; Recorded!</span>
            </div>
          )}
        </div>

        {/* Active Delivery Order Card if on delivery */}
        {staff.status === "on_delivery" && staff.activeOrderId && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
                Active Dispatch {staff.activeOrderId}
              </span>
              <Badge className="bg-emerald-600 text-white border-none text-[10px] font-bold">
                In Transit
              </Badge>
            </div>
            <div className="text-xs text-emerald-900 space-y-1">
              <div>
                Recipient:{" "}
                <span className="font-bold">{staff.activeCustomerName}</span>
              </div>
              {staff.activeDestination && (
                <div className="flex items-start gap-1 text-[11px] text-emerald-800">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{staff.activeDestination}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-border/30 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full h-9 text-xs font-bold"
          >
            Close Driver Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
