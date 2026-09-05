"use client";

import React from "react";
import { Users } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="space-y-space-lg">
      <div className="border-b border-border/40 pb-space-md">
        <h1 className="font-headline-xl text-2xl font-bold text-on-surface">
          Customers Directory
        </h1>
        <p className="font-body-sm text-sm text-on-surface-variant mt-0.5">
          View registered customer accounts, order histories, and contact profiles.
        </p>
      </div>

      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-border/40 text-center py-16">
        <Users className="w-10 h-10 text-on-surface-variant mx-auto mb-2 opacity-50" />
        <h3 className="font-headline-sm text-base font-bold text-on-surface">Customer CRM & History</h3>
        <p className="text-xs text-on-surface-variant mt-1">Track repeat diner orders and contact info.</p>
      </div>
    </div>
  );
}
