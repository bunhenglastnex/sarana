"use client";

import React, { useEffect, useRef } from "react";
import { useApi } from "@/lib/api";

export const GlobalAdminOrderListener: React.FC = () => {
  // Fetch Settings Config for Refresh Rate, Audio Chimes, and Push Alerts
  const { data: settingsRes } = useApi<any>("/settings.php");
  const settings = settingsRes?.data || settingsRes || {};

  const refreshRateStr = settings.auto_refresh_seconds || settings.autoRefreshSeconds || "5s";
  const refreshMs = (parseInt(refreshRateStr, 10) || 5) * 1000;
  const enableChime = settings.enable_audio_chimes ?? settings.enableAudioChimes ?? true;
  const enablePush = settings.enable_push_alerts ?? settings.enablePushAlerts ?? true;

  const { data, refetch } = useApi<any>("/orders.php", { limit: 20 });

  // Background Auto-Polling across all admin pages
  useEffect(() => {
    const interval = setInterval(() => {
      refetch(true);
    }, refreshMs);
    return () => clearInterval(interval);
  }, [refetch, refreshMs]);

  const rawOrders: any[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  const pendingOrders = rawOrders.filter((o: any) => String(o.status || "").toLowerCase() === "pending");
  const prevPendingCountRef = useRef<number>(0);

  // Trigger Audio Chime & Desktop Push Notification when a new pending order arrives
  useEffect(() => {
    if (pendingOrders.length > prevPendingCountRef.current && prevPendingCountRef.current > 0) {
      const latestOrder = pendingOrders[0];
      const orderNum = latestOrder?.order_number ? `#${String(latestOrder.order_number).replace(/^#/, "")}` : `#${latestOrder?.id}`;
      const customer = latestOrder?.customer_name || "Customer";
      const total = Number(latestOrder?.total_amount || 0).toFixed(2);

      // 1. Play Sound Chime
      if (enableChime) {
        try {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
          audio.play().catch(() => {});
        } catch (e) {}
      }

      // 2. Browser Desktop Push Notification
      if (enablePush && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(`🔔 New Order ${orderNum} Received!`, {
            body: `${customer} • Total: $${total}`,
            icon: "/favicon.ico",
          });
        } catch (e) {}
      }
    }
    prevPendingCountRef.current = pendingOrders.length;
  }, [pendingOrders.length, enableChime, enablePush]);

  return null; // Renderless background listener component
};
