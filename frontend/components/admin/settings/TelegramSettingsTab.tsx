"use client";

import React, { useState } from "react";
import {
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BellRing,
  Sparkles,
  ShieldAlert,
  Bot,
  MessageSquare,
  Radio,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TelegramSettingsTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const TelegramSettingsTab: React.FC<TelegramSettingsTabProps> = ({
  formData,
  onChange,
}) => {
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestConnection = () => {
    if (!formData.telegramBotToken) {
      setTestResult({
        success: false,
        message: "Please enter a valid Telegram Bot Token before testing.",
      });
      return;
    }

    if (!formData.telegramGroupId) {
      setTestResult({
        success: false,
        message:
          "Please enter a valid Telegram Group / Chat ID before testing.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Simulate sending real-time Telegram Bot API dispatch
    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        success: true,
        message: `⚡ Test message dispatched successfully to Telegram Group (${formData.telegramGroupId})!`,
      });
    }, 1800);
  };

  return (
    <div className="space-y-space-md">
      {/* 1. BOT CREDENTIALS CARD */}
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Bot className="w-4 h-4 text-sky-600" />
            <span>Bot Token &amp; Chat Group Credentials</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your Telegram Bot Token from{" "}
            <span className="font-bold text-sky-600">@BotFather</span> and
            target Group Chat ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telegram Bot Token */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Telegram Bot Token <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  value={formData.telegramBotToken || ""}
                  onChange={(e) => onChange("telegramBotToken", e.target.value)}
                  placeholder="e.g. 5849302114:AAH9x..."
                  className="text-xs font-mono pr-10 border-border"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showToken ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Obtained from Telegram&apos;s Official{" "}
                <span className="font-semibold text-sky-600">@BotFather</span>.
              </p>
            </div>

            {/* Main Orders Group Chat ID */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Order Notifications Group Chat ID{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.telegramGroupId || ""}
                onChange={(e) => onChange("telegramGroupId", e.target.value)}
                placeholder="e.g. -1001928374650"
                className="text-xs font-mono border-border"
              />
              <p className="text-[11px] text-on-surface-variant">
                Telegram Supergroup or Channel ID starting with{" "}
                <span className="font-semibold">-100...</span>
              </p>
            </div>

            {/* Kitchen Alert Group Chat ID (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Kitchen Alert Group Chat ID{" "}
                <span className="text-on-surface-variant font-normal">
                  (Optional)
                </span>
              </label>
              <Input
                type="text"
                value={formData.telegramKitchenGroupId || ""}
                onChange={(e) =>
                  onChange("telegramKitchenGroupId", e.target.value)
                }
                placeholder="e.g. -1001882736451"
                className="text-xs font-mono border-border"
              />
              <p className="text-[11px] text-on-surface-variant">
                Separate Telegram group ID for kitchen prep alerts. Leave blank
                to use main group.
              </p>
            </div>

            {/* Delivery Driver Group Chat ID (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Driver Dispatch Group Chat ID{" "}
                <span className="text-on-surface-variant font-normal">
                  (Optional)
                </span>
              </label>
              <Input
                type="text"
                value={formData.telegramDriverGroupId || ""}
                onChange={(e) =>
                  onChange("telegramDriverGroupId", e.target.value)
                }
                placeholder="e.g. -1001773645210"
                className="text-xs font-mono border-border"
              />
              <p className="text-[11px] text-on-surface-variant">
                Separate group chat ID for delivery driver assignment
                broadcasts.
              </p>
            </div>
          </div>

          {/* Test Connection Action Bar */}
          <div className="pt-2 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="min-h-[24px]">
              {testResult && (
                <div
                  className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                    testResult.success
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            <Button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="h-9 px-4 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shrink-0 flex items-center gap-2"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching Test Payload...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Message to Telegram</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. AUTOMATIC BROADCAST TRIGGERS CARD */}
      <Card>
        <CardHeader className="border-b border-border/30 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-600" />
            <span>Automatic Broadcast Event Triggers</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Select which order status updates automatically post formatted cards
            to your Telegram group.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Trigger 1 */}
            <label className="p-3 rounded-xl border border-border/40 bg-surface-container-low flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">
                    New Customer Order Placed
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Instant alert with customer items, total price, and address.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.telegramNotifyNewOrder ?? true}
                onChange={(e) =>
                  onChange("telegramNotifyNewOrder", e.target.checked)
                }
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-border"
              />
            </label>

            {/* Trigger 2 */}
            <label className="p-3 rounded-xl border border-border/40 bg-surface-container-low flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">
                    Kitchen Preparation Ready
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Alert when order transitions to PREPARING / READY.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.telegramNotifyKitchenReady ?? true}
                onChange={(e) =>
                  onChange("telegramNotifyKitchenReady", e.target.checked)
                }
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-border"
              />
            </label>

            {/* Trigger 3 */}
            <label className="p-3 rounded-xl border border-border/40 bg-surface-container-low flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">
                    Driver Delivery Assignment
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Alert when a delivery driver accepts or is assigned to
                    order.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.telegramNotifyDriverAssigned ?? true}
                onChange={(e) =>
                  onChange("telegramNotifyDriverAssigned", e.target.checked)
                }
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-border"
              />
            </label>

            {/* Trigger 4 */}
            <label className="p-3 rounded-xl border border-border/40 bg-surface-container-low flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">
                    Order Cancelled / Refund Request
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    High-priority alert when an order is cancelled or refunded.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.telegramNotifyCancelled ?? true}
                onChange={(e) =>
                  onChange("telegramNotifyCancelled", e.target.checked)
                }
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-border"
              />
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
