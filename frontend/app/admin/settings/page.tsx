"use client";

import React from "react";
import { Settings, SlidersHorizontal } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-space-lg">
      <div className="border-b border-border/40 pb-space-md">
        <h1 className="font-headline-xl text-2xl font-bold text-on-surface">
          System & Station Settings
        </h1>
        <p className="font-body-sm text-sm text-on-surface-variant mt-0.5">
          Configure hearth operational parameters, notification chimes, and printer integration.
        </p>
      </div>

      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-border/40 text-center py-16">
        <Settings className="w-10 h-10 text-on-surface-variant mx-auto mb-2 opacity-50" />
        <h3 className="font-headline-sm text-base font-bold text-on-surface">Station & Kitchen Configuration</h3>
        <p className="text-xs text-on-surface-variant mt-1">Adjust sound alerts, auto-acceptance rules, and receipt printing.</p>
      </div>
    </div>
  );
}
