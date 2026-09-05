"use client";

import React from "react";
import { UserCheck, ShieldCheck } from "lucide-react";

export default function StaffPage() {
  return (
    <div className="space-y-space-lg">
      <div className="border-b border-border/40 pb-space-md">
        <h1 className="font-headline-xl text-2xl font-bold text-on-surface">
          Staff & Station Roster
        </h1>
        <p className="font-body-sm text-sm text-on-surface-variant mt-0.5">
          Manage bistro kitchen personnel, shift assignments, and terminal permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">Elena Rostova</h4>
              <p className="text-xs text-on-surface-variant">General Manager</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">ON SHIFT</span>
        </div>
      </div>
    </div>
  );
}
