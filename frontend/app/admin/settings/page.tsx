"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Store,
  BellRing,
  ShieldCheck,
  Save,
  CheckCircle2,
  Bot,
  MapPin,
} from "lucide-react";
import { GeneralSettingsTab } from "@/components/admin/settings/GeneralSettingsTab";
import { AudioNotificationsTab } from "@/components/admin/settings/AudioNotificationsTab";
import { SecuritySettingsTab } from "@/components/admin/settings/SecuritySettingsTab";
import { TelegramSettingsTab } from "@/components/admin/settings/TelegramSettingsTab";
import { DeliveryZoneSettingsTab } from "@/components/admin/settings/DeliveryZoneSettingsTab";
import { Button } from "@/components/ui/button";

type SettingTabKey = "general" | "audio" | "security" | "telegram" | "delivery";

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL query parameter "?tab=..." (defaults to "general")
  const rawTab = searchParams.get("tab") as SettingTabKey | null;
  const activeTab: SettingTabKey =
    rawTab &&
    ["general", "audio", "security", "telegram", "delivery"].includes(rawTab)
      ? rawTab
      : "general";

  const handleTabChange = (newTab: SettingTabKey) => {
    router.push(`/admin/settings?tab=${newTab}`, { scroll: false });
  };

  const [formData, setFormData] = useState({
    // General
    storeName: "Amber & Ember Bistro",
    storePhone: "+855 23 888 999",
    storeAddress: "520 N Michigan Ave, Suite 14F, Phnom Penh",
    openingTime: "10:00",
    closingTime: "22:00",
    taxRate: 9.25,

    // Audio & Notifications
    enableAudioChimes: true,
    chimeTone: "Classic Bistro Bell",
    chimeRepeatCount: "5",
    volumeLevel: "100%",
    enablePushAlerts: true,
    autoRefreshSeconds: "5s",

    // Security & Backup
    sessionTimeout: "4h",
    logRetentionDays: "7d",

    // Telegram Bot
    telegramBotToken: "5849302114:AAH9xK82NqP91_vB3-L0M",
    telegramGroupId: "-1001928374650",
    telegramKitchenGroupId: "-1001882736451",
    telegramDriverGroupId: "-1001773645210",
    telegramNotifyNewOrder: true,
    telegramNotifyKitchenReady: true,
    telegramNotifyDriverAssigned: true,
    telegramNotifyCancelled: true,

    // Delivery Zone & Radius Geofencing
    storeLatitude: "11.5564",
    storeLongitude: "104.9282",
    maxDeliveryRadiusKm: 7.5,
    enableZoneBlocker: true,
    outOfZoneMessage:
      "Sorry! Your delivery address is outside our maximum delivery radius of 7.5 km. Pickup is still available!",
    baseDeliveryFee: 1.5,
    baseIncludedKm: 3.0,
    extraFeePerKm: 0.5,
    freeDeliveryMinSubtotal: 25.0,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col w-full min-h-screen pb-space-2xl space-y-space-lg">
      {/* 2. Horizontal Tab Navigation Bar with URL Query Synchronization (?tab=...) */}
      <div className="bg-surface-container-lowest p-1.5 rounded-2xl shadow-sm border border-border/40 flex flex-wrap items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange("general")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "general"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>General &amp; Store Profile</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("delivery")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "delivery"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Delivery Zone &amp; Radius</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("audio")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "audio"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Audio &amp; Notifications</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("security")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "security"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security &amp; Backup</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("telegram")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "telegram"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Telegram Bot</span>
        </button>
      </div>

      {/* 3. Active Tab Content Section */}
      <div>
        {activeTab === "general" && (
          <GeneralSettingsTab
            formData={formData}
            onChange={handleFieldChange}
          />
        )}
        {activeTab === "delivery" && (
          <DeliveryZoneSettingsTab
            formData={formData}
            onChange={handleFieldChange}
          />
        )}
        {activeTab === "audio" && (
          <AudioNotificationsTab
            formData={formData}
            onChange={handleFieldChange}
          />
        )}
        {activeTab === "security" && (
          <SecuritySettingsTab
            formData={formData}
            onChange={handleFieldChange}
          />
        )}
        {activeTab === "telegram" && (
          <TelegramSettingsTab
            formData={formData}
            onChange={handleFieldChange}
          />
        )}
      </div>

      {/* 4. Sticky Bottom Save Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-lg border border-border/40 flex items-center justify-between gap-4 sticky bottom-4 z-40">
        <div className="flex items-center gap-2">
          {saveSuccess ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>✓ Settings Saved &amp; Applied Successfully!</span>
            </div>
          ) : (
            <span className="text-xs text-on-surface-variant font-medium hidden sm:inline">
              Changes take effect immediately on active terminals.
            </span>
          )}
        </div>

        <Button
          size="sm"
          onClick={handleSaveSettings}
          className="h-10 px-6 text-xs font-bold bg-primary hover:bg-primary-container text-on-primary shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings Changes</span>
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-on-surface-variant font-bold">
          Loading Station Settings...
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}
