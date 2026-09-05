"use client";

import React from "react";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="space-y-space-lg">
      <div className="border-b border-border/40 pb-space-md">
        <h1 className="font-headline-xl text-2xl font-bold text-on-surface">
          Payments & Transactions
        </h1>
        <p className="font-body-sm text-sm text-on-surface-variant mt-0.5">
          Monitor KHQR digital settlements, cash on delivery (COD), and counter receipts.
        </p>
      </div>

      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-border/40 text-center py-16">
        <CreditCard className="w-10 h-10 text-on-surface-variant mx-auto mb-2 opacity-50" />
        <h3 className="font-headline-sm text-base font-bold text-on-surface">Payment Audit & KHQR Reconciliation</h3>
        <p className="text-xs text-on-surface-variant mt-1">Review settled invoices and pending transactions.</p>
      </div>
    </div>
  );
}
