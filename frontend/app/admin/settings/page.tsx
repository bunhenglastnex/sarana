"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Store,
  BellRing,
  ShieldCheck,
  Save,
  CheckCircle2,
  Bot,
  MapPin,
  Building2,
} from "lucide-react";
import { GeneralSettingsTab } from "@/components/admin/settings/GeneralSettingsTab";
import { AudioNotificationsTab } from "@/components/admin/settings/AudioNotificationsTab";
import { SecuritySettingsTab } from "@/components/admin/settings/SecuritySettingsTab";
import { TelegramSettingsTab } from "@/components/admin/settings/TelegramSettingsTab";
import { DeliveryZoneSettingsTab } from "@/components/admin/settings/DeliveryZoneSettingsTab";
import { Button } from "@/components/ui/button";

import Api, { useApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";

type SettingTabKey = "general" | "audio" | "security" | "telegram" | "delivery";

function SettingsPageContent() {
  const { role, selectedTenantId, setSelectedTenantId } = useAuthStore();
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

  const { data: restaurantsRes } = useApi<any>("/restaurants.php");
  const rawRestaurants = Array.isArray(restaurantsRes?.data)
    ? restaurantsRes.data
    : Array.isArray(restaurantsRes)
    ? restaurantsRes
    : [];

  const [formData, setFormData] = useState({
    // General
    storeName: "Amber & Ember Bistro",
    storePhone: "+855 23 888 999",
    storeAddress: "520 N Michigan Ave, Suite 14F",
    openingTime: "10:00",
    closingTime: "22:00",
    taxRate: 9.25,
    khqrImageUrl: "",

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
    storeLatitude: "13.35227",
    storeLongitude: "103.955116",
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
  const [saving, setSaving] = useState(false);

  // Fetch settings from live backend API on mount or tenant switch
  useEffect(() => {
    async function loadSettings() {
      const getParams: Record<string, any> = {};
      if (role === "super_admin" && selectedTenantId) {
        getParams.restaurant_id = selectedTenantId;
      }

      const res = await Api.get("/settings.php", getParams, { forceRefresh: true });
      if (res.success && res.data) {
        setFormData((prev) => ({
          ...prev,
          // General
          storeName: res.data.store_name ?? prev.storeName,
          storePhone: res.data.store_phone ?? prev.storePhone,
          storeAddress: res.data.store_address ?? prev.storeAddress,
          openingTime: res.data.opening_time ?? prev.openingTime,
          closingTime: res.data.closing_time ?? prev.closingTime,
          taxRate: res.data.tax_rate ?? prev.taxRate,
          khqrImageUrl: res.data.khqr_image_url ?? prev.khqrImageUrl,

          // Audio
          enableAudioChimes: res.data.enable_audio_chimes ?? prev.enableAudioChimes,
          chimeTone: res.data.chime_tone ?? prev.chimeTone,
          chimeRepeatCount: res.data.chime_repeat_count ?? prev.chimeRepeatCount,
          volumeLevel: res.data.volume_level ?? prev.volumeLevel,
          enablePushAlerts: res.data.enable_push_alerts ?? prev.enablePushAlerts,
          autoRefreshSeconds: res.data.auto_refresh_seconds ?? prev.autoRefreshSeconds,

          // Security
          sessionTimeout: res.data.session_timeout ?? prev.sessionTimeout,
          logRetentionDays: res.data.log_retention_days ?? prev.logRetentionDays,

          // Telegram
          telegramBotToken: res.data.telegram_bot_token ?? prev.telegramBotToken,
          telegramGroupId: res.data.telegram_group_id ?? prev.telegramGroupId,
          telegramKitchenGroupId: res.data.telegram_kitchen_group_id ?? prev.telegramKitchenGroupId,
          telegramDriverGroupId: res.data.telegram_driver_group_id ?? prev.telegramDriverGroupId,
          telegramNotifyNewOrder: res.data.telegram_notify_new_order ?? prev.telegramNotifyNewOrder,
          telegramNotifyKitchenReady: res.data.telegram_notify_kitchen_ready ?? prev.telegramNotifyKitchenReady,
          telegramNotifyDriverAssigned: res.data.telegram_notify_driver_assigned ?? prev.telegramNotifyDriverAssigned,
          telegramNotifyCancelled: res.data.telegram_notify_cancelled ?? prev.telegramNotifyCancelled,

          // Delivery
          storeLatitude: res.data.store_latitude ? String(res.data.store_latitude) : prev.storeLatitude,
          storeLongitude: res.data.store_longitude ? String(res.data.store_longitude) : prev.storeLongitude,
          maxDeliveryRadiusKm: res.data.max_delivery_radius_km ?? prev.maxDeliveryRadiusKm,
          enableZoneBlocker: res.data.enable_zone_blocker ?? prev.enableZoneBlocker,
          outOfZoneMessage: res.data.out_of_zone_message ?? prev.outOfZoneMessage,
          baseDeliveryFee: res.data.base_delivery_fee ?? prev.baseDeliveryFee,
          baseIncludedKm: res.data.base_included_km ?? prev.baseIncludedKm,
          extraFeePerKm: res.data.extra_fee_per_km ?? prev.extraFeePerKm,
          freeDeliveryMinSubtotal: res.data.free_delivery_min_subtotal ?? prev.freeDeliveryMinSubtotal,
        }));
      }
    }
    loadSettings();
  }, [role, selectedTenantId]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    const payload: Record<string, any> = {
      store_name: formData.storeName,
      store_phone: formData.storePhone,
      store_address: formData.storeAddress,
      opening_time: formData.openingTime,
      closing_time: formData.closingTime,
      tax_rate: formData.taxRate,
      khqr_image_url: formData.khqrImageUrl,

      enable_audio_chimes: formData.enableAudioChimes,
      chime_tone: formData.chimeTone,
      chime_repeat_count: formData.chimeRepeatCount,
      volume_level: formData.volumeLevel,
      enable_push_alerts: formData.enablePushAlerts,
      auto_refresh_seconds: formData.autoRefreshSeconds,

      session_timeout: formData.sessionTimeout,
      log_retention_days: formData.logRetentionDays,

      telegram_bot_token: formData.telegramBotToken,
      telegram_group_id: formData.telegramGroupId,
      telegram_kitchen_group_id: formData.telegramKitchenGroupId,
      telegram_driver_group_id: formData.telegramDriverGroupId,
      telegram_notify_new_order: formData.telegramNotifyNewOrder,
      telegram_notify_kitchen_ready: formData.telegramNotifyKitchenReady,
      telegram_notify_driver_assigned: formData.telegramNotifyDriverAssigned,
      telegram_notify_cancelled: formData.telegramNotifyCancelled,

      store_latitude: formData.storeLatitude,
      store_longitude: formData.storeLongitude,
      max_delivery_radius_km: formData.maxDeliveryRadiusKm,
      enable_zone_blocker: formData.enableZoneBlocker,
      out_of_zone_message: formData.outOfZoneMessage,
      base_delivery_fee: formData.baseDeliveryFee,
      base_included_km: formData.baseIncludedKm,
      extra_fee_per_km: formData.extraFeePerKm,
      free_delivery_min_subtotal: formData.freeDeliveryMinSubtotal,
    };

    if (role === "super_admin" && selectedTenantId) {
      payload.restaurant_id = selectedTenantId;
    }

    const res = await Api.post("/settings.php", payload);
    setSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
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

        {role === "super_admin" && (
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
        )}

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
          role === "super_admin" ? (
            <SecuritySettingsTab
              formData={formData}
              onChange={handleFieldChange}
            />
          ) : (
            <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-space-xl bg-surface-container-lowest rounded-2xl border border-border/40 shadow-xs animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 border border-amber-500/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-2">
                Super Admin Access Required
              </h2>
              <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
                System security settings, database snapshots, auto-lock timeouts, and backup restoration controls are restricted to <strong className="text-on-surface">Super Platform Administrators</strong>.
              </p>
            </div>
          )
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
