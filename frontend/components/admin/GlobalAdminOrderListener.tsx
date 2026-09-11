"use client";

import React, { useEffect, useRef } from "react";
import { useApi } from "@/lib/api";

const playSingleRing = (tone: string, volMultiplier: number) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (tone.includes("Beep")) {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1046.5, now);
      gain1.gain.setValueAtTime(0.3 * volMultiplier, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318.5, now + 0.15);
      gain2.gain.setValueAtTime(0.3 * volMultiplier, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.35);
    } else if (tone.includes("Hearth")) {
      [523.25, 659.25, 783.99].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2 * volMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      });
    } else {
      // Classic Bistro Bell / Default
      [880, 1760, 2640].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        const initialGain = (0.35 / (idx + 1)) * volMultiplier;
        gain.gain.setValueAtTime(initialGain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
      });
    }
  } catch (err) {
    console.error("Single ring playback error:", err);
  }
};

export const GlobalAdminOrderListener: React.FC = () => {
  // Fetch Settings Config for Refresh Rate, Audio Chimes, Tone, Volume, and Push Alerts
  const { data: settingsRes } = useApi<any>("/settings.php");
  const settings = settingsRes?.data || settingsRes || {};

  const refreshRateStr = settings.auto_refresh_seconds || settings.autoRefreshSeconds || "5s";
  const refreshMs = (parseInt(refreshRateStr, 10) || 5) * 1000;
  const enableChime = settings.enable_audio_chimes ?? settings.enableAudioChimes ?? true;
  const chimeTone = settings.chime_tone || settings.chimeTone || "Classic Bistro Bell";
  const volumeLevel = settings.volume_level || settings.volumeLevel || "100%";
  const repeatCountRaw = settings.chime_repeat_count || settings.chimeRepeatCount || 2;
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

      // 1. Play Sound Chime using Settings Configuration (Tone, Volume, Repeat Count)
      if (enableChime) {
        try {
          let volMultiplier = 1.0;
          if (volumeLevel === "80%") volMultiplier = 0.8;
          if (volumeLevel === "50%") volMultiplier = 0.5;

          const repeatTimes = parseInt(String(repeatCountRaw), 10) || 2;
          for (let i = 0; i < repeatTimes; i++) {
            setTimeout(() => {
              playSingleRing(chimeTone, volMultiplier);
            }, i * 700);
          }
        } catch (e) {
          // Fallback to MP3 audio if Web Audio is unsupported
          try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.play().catch(() => {});
          } catch (err) {}
        }
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
  }, [pendingOrders.length, enableChime, chimeTone, volumeLevel, repeatCountRaw, enablePush]);

  return null; // Renderless background listener component
};

