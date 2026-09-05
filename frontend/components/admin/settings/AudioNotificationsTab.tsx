"use client";

import React, { useState } from "react";
import {
  BellRing,
  Volume2,
  Radio,
  VolumeX,
  CheckCircle2,
  Play,
  Loader2,
  Sparkles,
  Send,
  BellPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AudioNotificationsTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const AudioNotificationsTab: React.FC<AudioNotificationsTabProps> = ({
  formData,
  onChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pushTestStatus, setPushTestStatus] = useState<string | null>(null);

  // Helper to play one single ring pulse
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

  // REAL WEB AUDIO SYNTHESIZER PLAYBACK WITH REPEAT LOOP (AUTO 2 TIMES)
  const playRealAudioChime = () => {
    try {
      setIsPlaying(true);

      // Volume Gain Scaling
      let volMultiplier = 1.0;
      if (formData.volumeLevel === "80%") volMultiplier = 0.8;
      if (formData.volumeLevel === "50%") volMultiplier = 0.5;

      const tone = formData.chimeTone || "Classic Bistro Bell";
      const repeatCount = 2; // Auto 2 times ring alert

      // Loop repeat 2 times with 700ms interval
      for (let i = 0; i < repeatCount; i++) {
        setTimeout(() => {
          playSingleRing(tone, volMultiplier);
        }, i * 700);
      }

      setTimeout(() => {
        setIsPlaying(false);
      }, repeatCount * 700 + 300);

    } catch (err) {
      console.error("Audio playback error:", err);
      setIsPlaying(false);
    }
  };

  // TEST DESKTOP PUSH NOTIFICATION
  const handleTestPushNotification = () => {
    setPushTestStatus("Sending test notification toast...");
    playRealAudioChime();

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("🔔 New Order #1048 Received!", {
          body: "Amber & Ember Bistro • 2x Wagyu Burger ($34.00)",
          icon: "/favicon.ico",
        });
        setPushTestStatus("✓ Desktop push notification dispatched to browser!");
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("🔔 New Order #1048 Received!", {
              body: "Amber & Ember Bistro • 2x Wagyu Burger ($34.00)",
            });
            setPushTestStatus("✓ Desktop push notification dispatched!");
          } else {
            setPushTestStatus("⚠️ Notification permission was blocked by browser.");
          }
        });
      } else {
        setPushTestStatus("⚠️ Browser notification permission denied.");
      }
    } else {
      setPushTestStatus("✓ Simulated alert triggered with audio chime!");
    }

    setTimeout(() => setPushTestStatus(null), 4500);
  };

  return (
    <div className="space-y-space-md">
      {/* 1. AUDIO CHIME CONFIGURATION CARD */}
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BellRing className="w-4 h-4 text-primary" />
              <span>Real-Time Sound Chimes &amp; Audio Alerts</span>
            </CardTitle>

            {isPlaying && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold animate-bounce flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-emerald-600" />
                <span>🔊 PLAYING SOUND...</span>
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Configure sound effects played when new incoming orders arrive on the Live Kitchen Board.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Toggle 1: Enable Audio Chime */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border/30">
            <div>
              <div className="text-xs font-bold text-on-surface">
                Play Audio Chime on New Incoming Orders
              </div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">
                Triggers loud sound notification whenever a customer places an order.
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.enableAudioChimes ?? true}
              onChange={(e) => onChange("enableAudioChimes", e.target.checked)}
              className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          {/* Tone Selector & Volume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Select Audio Chime Sound Tone
              </label>
              <div className="flex items-center gap-2">
                <Select
                  value={formData.chimeTone || "Classic Bistro Bell"}
                  onValueChange={(val) => onChange("chimeTone", val)}
                >
                  <SelectTrigger className="text-xs font-semibold flex-1">
                    <SelectValue placeholder="Select Tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Classic Bistro Bell">🔔 Classic Bistro Bell</SelectItem>
                    <SelectItem value="Hearth Chime">🔥 Hearth Chime</SelectItem>
                    <SelectItem value="Digital Beep">⚡ Digital Beep</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  disabled={isPlaying}
                  onClick={playRealAudioChime}
                  className="px-3.5 h-9 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container transition-colors shrink-0 flex items-center gap-1.5"
                >
                  {isPlaying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Ringing (2x)...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Test Sound</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Volume Level */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Audio Chime Volume Level
              </label>
              <Select
                value={formData.volumeLevel || "100%"}
                onValueChange={(val) => onChange("volumeLevel", val)}
              >
                <SelectTrigger className="text-xs font-semibold">
                  <SelectValue placeholder="Volume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100%">🔊 Maximum Volume (100%)</SelectItem>
                  <SelectItem value="80%">🔉 Normal Volume (80%)</SelectItem>
                  <SelectItem value="50%">🔈 Low Volume (50%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. KITCHEN BOARD & DESKTOP PUSH NOTIFICATION CARD */}
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            <span>Kitchen Board Auto-Refresh &amp; Desktop Push</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Manage polling speed and test browser desktop notification alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border/30">
            <div>
              <div className="text-xs font-bold text-on-surface">
                Browser Desktop Push Notifications
              </div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">
                Displays pop-up alert toasts even when operating in background tabs.
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.enablePushAlerts ?? true}
              onChange={(e) => onChange("enablePushAlerts", e.target.checked)}
              className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          {/* Test Desktop Push Notification Button */}
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-on-surface block">
                Test Push Notification &amp; Sound Payload
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Triggers a sample order notification toast and chime to test browser permissions.
              </span>
            </div>

            <Button
              type="button"
              onClick={handleTestPushNotification}
              variant="outline"
              className="h-9 px-4 text-xs font-bold border-primary/40 text-primary hover:bg-primary/10 shrink-0 flex items-center gap-1.5"
            >
              <BellPlus className="w-3.5 h-3.5 text-primary" />
              <span>Test Desktop Push Alert</span>
            </Button>
          </div>

          {pushTestStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pushTestStatus}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Live Order Board Auto-Refresh Rate
            </label>
            <Select
              value={formData.autoRefreshSeconds || "5s"}
              onValueChange={(val) => onChange("autoRefreshSeconds", val)}
            >
              <SelectTrigger className="text-xs font-semibold">
                <SelectValue placeholder="Select Refresh Rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5s">⚡ Ultra-Fast (Every 5 seconds)</SelectItem>
                <SelectItem value="10s">⏱️ Standard (Every 10 seconds)</SelectItem>
                <SelectItem value="30s">🔋 Battery Saving (Every 30 seconds)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

