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
  Upload,
  ArrowRightLeft,
  QrCode,
  ShieldCheck,
  FileCheck,
  Eye,
  ZoomIn,
  Image as ImageIcon,
  CheckCircle2,
  X,
} from "lucide-react";
import { OrderRecord } from "@/types/orders";

interface AdminRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderRecord;
  onConfirmRefund: (orderId: string, refundProofUrl: string) => void;
}

export const AdminRefundModal: React.FC<AdminRefundModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmRefund,
}) => {
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("No file chosen");
  const [showOriginalSlipZoom, setShowOriginalSlipZoom] = useState(false);
  const [showRefundSlipZoom, setShowRefundSlipZoom] = useState(false);

  const customerPaidSlip =
    order.proofImageUrl ||
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const fakeUrl = URL.createObjectURL(file);
      setSelectedProofUrl(fakeUrl);
    }
  };

  const handleSubmit = () => {
    if (!selectedProofUrl) return;
    onConfirmRefund(order.id, selectedProofUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-surface-container-lowest border-border/40 p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header Title & Refund Value */}
        <DialogHeader className="border-b border-border/30 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8.5 h-8.5 rounded-xl bg-error-container/30 text-error flex items-center justify-center font-bold">
                <ArrowRightLeft className="w-4.5 h-4.5" />
              </div>
              <DialogTitle className="text-lg font-extrabold text-on-surface">
                Manual ABA Refund — Order {order.id}
              </DialogTitle>
            </div>
            <Badge
              variant="destructive"
              className="bg-error-container/40 text-error border-none text-xs font-bold px-3 py-1"
            >
              ${order.totalPrice.toFixed(2)} to Refund
            </Badge>
          </div>
          <DialogDescription className="text-xs text-on-surface-variant mt-1">
            Check customer KHQR payment slip below, transfer the refund via your
            ABA Mobile App, and attach the transfer receipt screenshot.
          </DialogDescription>
        </DialogHeader>

        {/* 2-Column Split: Left = Customer Original Payment, Right = Refund Action & Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT SIDE: Customer Paid Slip & Information */}
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-border/30 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-primary" />
                  Customer Recipient Details
                </span>
                <span className="font-label-sm text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Paid KHQR
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-on-surface-variant font-medium">
                  Customer Recipient:{" "}
                  <span className="font-bold text-on-surface">
                    {order.customerName} ({order.customerPhone})
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Original KHQR Slip Image Preview */}
            <div className="space-y-1.5 pt-2 border-t border-border/20">
              <div className="flex items-center justify-between text-xs">
                <span className="font-label-sm text-[11px] font-bold text-on-surface-variant">
                  Customer Paid KHQR Slip:
                </span>
                <span className="font-price-lg text-xs font-bold text-primary">
                  ${order.totalPrice.toFixed(2)} Paid
                </span>
              </div>

              <div
                onClick={() => setShowOriginalSlipZoom(true)}
                className="relative w-full h-32 rounded-xl overflow-hidden bg-surface-container-highest border border-border/30 cursor-pointer group shadow-xs"
              >
                <img
                  src={customerPaidSlip}
                  alt="Customer Original Payment Slip"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-white font-label-sm text-xs font-bold bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Click to Zoom</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Admin Refund Transfer Receipt Upload & Selection */}
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-border/30 flex flex-col justify-between gap-3">
            <div className="space-y-3">
              <div>
                <label className="font-label-md text-xs font-bold text-on-surface flex items-center justify-between mb-1">
                  <span>Attach ABA Refund Receipt Screenshot:</span>
                  <span className="text-[10px] text-primary font-bold">
                    *Audit Required
                  </span>
                </label>

                {/* File Input Control with File Name Display */}
                <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-xl border border-border/30">
                  <label className="cursor-pointer bg-primary hover:bg-primary-container text-on-primary font-label-sm text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="font-body-sm text-xs text-on-surface-variant truncate">
                    {fileName}
                  </span>
                </div>
                <span className="font-body-sm text-[10px] text-on-surface-variant block mt-1">
                  Supports JPG, PNG, WEBP receipts
                </span>
              </div>
            </div>

            {/* Live Uploaded Refund Image Preview Box */}
            <div className="space-y-1.5 pt-2 border-t border-border/20">
              <div className="flex items-center justify-between text-xs font-label-sm">
                <span className="font-bold text-on-surface flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-primary" />
                  Refund Receipt Preview:
                </span>
                {selectedProofUrl ? (
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                    ✓ Ready to attach
                  </span>
                ) : (
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    No image uploaded yet
                  </span>
                )}
              </div>

              {selectedProofUrl ? (
                <div
                  onClick={() => setShowRefundSlipZoom(true)}
                  className="relative w-full h-28 rounded-xl overflow-hidden bg-surface-container-highest border border-emerald-500/40 cursor-pointer group shadow-xs flex items-center justify-center"
                >
                  <img
                    src={selectedProofUrl}
                    alt="Selected Refund Slip Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 text-white font-label-sm text-xs font-bold bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Zoom Proof</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-28 rounded-xl border-2 border-dashed border-border/40 bg-surface-container-lowest flex flex-col items-center justify-center gap-1 text-center p-3">
                  <ImageIcon className="w-6 h-6 text-on-surface-variant/40" />
                  <span className="font-label-sm text-xs font-bold text-on-surface-variant">
                    No refund receipt attached yet
                  </span>
                  <span className="font-body-sm text-[10px] text-on-surface-variant/70">
                    Upload an ABA transfer screenshot
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Notice */}
        <div className="bg-surface-container-low border border-border/30 p-2.5 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span className="font-body-sm text-[11px] text-on-surface-variant font-medium">
            Customer will receive receipt notification in their Order History
            upon confirmation.
          </span>
        </div>

        <DialogFooter className="border-t border-border/30 pt-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!selectedProofUrl}
            className="h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            <span>Confirm Refund &amp; Notify Customer</span>
          </Button>
        </DialogFooter>

        {/* Original Slip Zoom Modal Overlay */}
        {showOriginalSlipZoom && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowOriginalSlipZoom(false);
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest p-4 rounded-2xl max-w-sm w-full space-y-3 border border-border/40 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <div className="font-label-sm text-xs font-bold text-on-surface truncate pr-2">
                  Customer Original KHQR Paid Slip (${order.totalPrice.toFixed(2)})
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOriginalSlipZoom(false);
                  }}
                  className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full h-80 rounded-xl overflow-hidden bg-surface-container-highest border border-border/20 shadow-inner flex items-center justify-center">
                <img
                  src={customerPaidSlip}
                  alt="Full Original Slip"
                  className="w-full h-full object-contain"
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOriginalSlipZoom(false);
                }}
                className="w-full h-9 text-xs font-bold bg-surface-container-high hover:bg-surface-container text-on-surface transition-colors"
              >
                Close Zoom
              </Button>
            </div>
          </div>
        )}

        {/* Refund Proof Zoom Modal Overlay */}
        {showRefundSlipZoom && selectedProofUrl && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowRefundSlipZoom(false);
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest p-4 rounded-2xl max-w-sm w-full space-y-3 border border-border/40 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <div className="font-label-sm text-xs font-bold text-emerald-800 flex items-center gap-1 truncate pr-2">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Admin ABA Refund Transfer Receipt Proof</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRefundSlipZoom(false);
                  }}
                  className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full h-80 rounded-xl overflow-hidden bg-surface-container-highest border border-border/20 shadow-inner flex items-center justify-center">
                <img
                  src={selectedProofUrl}
                  alt="Full Refund Slip Proof"
                  className="w-full h-full object-contain"
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRefundSlipZoom(false);
                }}
                className="w-full h-9 text-xs font-bold bg-surface-container-high hover:bg-surface-container text-on-surface transition-colors"
              >
                Close Zoom
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

