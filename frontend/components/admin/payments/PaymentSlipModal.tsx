"use client";

import React from "react";
import { CheckCircle2, X, AlertTriangle, ShieldCheck, Download, ZoomIn } from "lucide-react";
import { TransactionRecord } from "@/types/payments";

interface PaymentSlipModalProps {
  transaction: TransactionRecord;
  onClose: () => void;
  onVerify?: (txnId: string) => void;
  onFlag?: (txnId: string) => void;
}

export const PaymentSlipModal: React.FC<PaymentSlipModalProps> = ({
  transaction,
  onClose,
  onVerify,
  onFlag,
}) => {
  const isVerified = transaction.status === "verified";
  const isPending = transaction.status === "pending_review";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-on-surface/60 backdrop-blur-xs z-[100] flex items-center justify-center p-space-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-md shadow-2xl space-y-space-md border border-border/40"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-sm font-bold text-on-surface">
              KHQR Slip Audit ({transaction.orderId})
            </span>
            {isVerified && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                VERIFIED PAID
              </span>
            )}
            {isPending && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-label-sm text-[10px] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                PENDING AUDIT
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* High Resolution Payment Slip Image */}
        <div className="w-full h-72 rounded-xl overflow-hidden bg-surface-container-highest border border-border/20 relative group">
          <img
            src={
              transaction.proofImageUrl ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10"
            }
            alt="KHQR Payment Proof Slip"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-black/60 text-white font-label-sm text-[10px] px-2 py-1 rounded-md backdrop-blur-xs flex items-center gap-1">
            <ZoomIn className="w-3 h-3" />
            <span>High-Res Audit</span>
          </div>
        </div>

        {/* Bank & Customer Transaction Details Card */}
        <div className="bg-surface-container-low p-3 rounded-xl border border-border/20 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-medium">Customer:</span>
            <span className="font-bold text-on-surface">
              {transaction.customerName} ({transaction.customerPhone})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-medium">Gateway &amp; Ref:</span>
            <span className="font-bold text-primary font-mono text-[11px]">
              {transaction.gateway} • {transaction.txnRef}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-medium">Timestamp:</span>
            <span className="font-medium text-on-surface">
              {transaction.dateLabel} ({transaction.timestamp})
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/20">
            <span className="font-bold text-on-surface">Amount Paid:</span>
            <div className="text-right">
              <span className="font-extrabold text-emerald-700 text-sm block">
                ${transaction.amountUsd.toFixed(2)}
              </span>
              <span className="text-[10px] text-on-surface-variant font-semibold">
                ({transaction.amountKhr.toLocaleString()} ៛)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center gap-2 pt-1">
          {isPending ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (onFlag) onFlag(transaction.id);
                  onClose();
                }}
                className="w-1/3 py-2 rounded-xl bg-error-container text-on-error-container hover:bg-error/20 font-label-md text-xs font-bold transition-colors"
              >
                Flag Invalid
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onVerify) onVerify(transaction.id);
                  onClose();
                }}
                className="w-2/3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-label-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify &amp; Settle Payment</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Close Slip Viewer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
