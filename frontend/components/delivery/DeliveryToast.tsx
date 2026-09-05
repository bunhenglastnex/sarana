"use client";

import React, { useEffect } from "react";
import { useDeliveryStore } from "@/lib/store/useDeliveryStore";
import { CheckCircle2 } from "lucide-react";

export const DeliveryToast: React.FC = () => {
  const { toastMessage, clearToast } = useDeliveryStore();

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 2500);

    return () => clearTimeout(timer);
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-space-lg py-space-sm rounded-full shadow-xl flex items-center gap-2 pointer-events-none transition-all duration-300 z-50 animate-in fade-in slide-in-from-bottom-3 max-w-[90vw]">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <span className="font-label-md text-label-md font-medium truncate">
        {toastMessage}
      </span>
    </div>
  );
};
