"use client";

import React from "react";
import {
  X,
  Send,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  botUsername?: string;
  telegramUrl?: string;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({
  isOpen,
  onClose,
  userName = "Valued Customer",
  botUsername = "AmberBistro_order_bot",
  telegramUrl = "https://t.me/AmberBistro_order_bot",
}) => {
  const setTelegramLink = useAuthStore((state) => state.setTelegramLink);

  if (!isOpen) return null;

  const handleConnectTelegram = () => {
    // Save demo telegram link status in store
    setTelegramLink("@" + botUsername, botUsername);
    // Open official Telegram bot link in new tab
    if (typeof window !== "undefined") {
      window.open(telegramUrl, "_blank", "noopener,noreferrer");
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-900 border border-sky-500/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white animate-in zoom-in-95 duration-300 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#24A1DE] text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">
                TELEGRAM BOT SUITE
              </span>
              <h3 className="font-black text-base text-white leading-tight">
                Connect Telegram Notifications
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Telegram modal"
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Welcome Card & Benefits */}
        <div className="space-y-3 bg-zinc-800/60 border border-white/5 p-4 rounded-2xl z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <span>Welcome, {userName}</span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Link your account with our official Telegram bot to receive instant notifications, live status updates &amp; digital receipts.
          </p>

          <div className="space-y-2 pt-1 border-t border-white/5 text-xs text-zinc-300 font-medium">
            <div className="flex items-center gap-2 text-sky-300">
              <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>Real-Time Kitchen &amp; Driver Dispatch Alerts</span>
            </div>
            <div className="flex items-center gap-2 text-sky-300">
              <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>Instant Digital Receipts &amp; Order History</span>
            </div>
            <div className="flex items-center gap-2 text-sky-300">
              <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>Exclusive Telegram VIP Promo Codes</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 z-10">
          <button
            type="button"
            onClick={handleConnectTelegram}
            className="w-full h-11 bg-[#24A1DE] hover:bg-[#1f8ec4] text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>Open Telegram Bot (@{botUsername})</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-white text-center transition-colors"
          >
            Skip for Now &amp; Continue to Menu
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-semibold z-10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Official Amber Bistro Bot • Instant 1-Click Link</span>
        </div>
      </div>
    </div>
  );
};

export default TelegramBotModal;
