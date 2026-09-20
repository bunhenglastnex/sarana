"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  Camera,
  Flame,
  Star,
  Receipt,
  MapPin,
  CreditCard,
  Gift,
  BellRing,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  Utensils,
  X,
  ExternalLink,
  User,
  Globe,
  Send,
  CheckCircle2,
  Headphones,
} from "lucide-react";
import { TelegramBotModal } from "@/components/customer/TelegramBotModal";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LocationModal } from "./LocationModal";

interface CustomerProfileViewProps {
  name?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  points?: number;
  maxPoints?: number;
  tierName?: string;
}

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({
  name: propName,
  phone: propPhone,
  email: propEmail,
  avatarUrl: propAvatarUrl,
  points = 340,
  maxPoints = 500,
  tierName = "Amber Patron",
}) => {
  const router = useRouter();
  const {
    userId: authUserId,
    name: authName,
    phone: authPhone,
    email: authEmail,
    avatarUrl: authAvatarUrl,
    isTelegramLinked,
    clearSession,
    setTelegramLink,
    _hasHydrated,
  } = useAuthStore();

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    // Only evaluate login prompt after store has finished rehydrating from cookies/storage
    if (_hasHydrated) {
      if (!authUserId && !authPhone && !authName) {
        setShowLoginPrompt(true);
      } else {
        setShowLoginPrompt(false);
      }
    }
  }, [_hasHydrated, authUserId, authPhone, authName]);

  const name = authName || propName || "Valued Customer";
  const phone = authPhone || propPhone || "No phone linked";
  const email = authEmail || propEmail || "No email linked";
  const avatarUrl = authAvatarUrl || propAvatarUrl;

  const [smsAlerts, setSmsAlerts] = useState(true);
  const [currentAddress, setCurrentAddress] = useState(
    "244 Oak Street, Apt 4B",
  );
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const botUsername =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "bunheng1dev_bot";

  let startParam = "";
  if (authUserId) {
    startParam = `usr_${authUserId}`;
  } else if (authPhone) {
    startParam = authPhone.replace(/[^0-9]/g, "");
  } else if (authEmail) {
    startParam = authEmail
      .replace(/@/g, "_at_")
      .replace(/\./g, "_dot_")
      .replace(/[^a-zA-Z0-9_]/g, "");
  } else if (authName) {
    startParam = authName.replace(/[^a-zA-Z0-9_]/g, "_");
  }

  const telegramBotUrl = startParam
    ? `https://t.me/${botUsername}?start=${startParam}`
    : `https://t.me/${botUsername}`;

  const handleOpenTelegram = () => {
    setTelegramLink("@" + botUsername, botUsername);
    if (typeof window !== "undefined") {
      window.open(telegramBotUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const progressPercent = Math.min(100, Math.round((points / maxPoints) * 100));
  const pointsRemaining = maxPoints - points;

  const handleTabChange = (tab: string) => {
    if (tab === "home") router.push("/");
    else if (tab === "favorites") router.push("/favorites");
    else if (tab === "cart") router.push("/cart");
    else if (tab === "orders") router.push("/orders");
    else if (tab === "profile") router.push("/customer-profile");
  };

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen bg-surface">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12">
        {/* Left Column: Customer Profile Identity & Loyalty Tier */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-6 shadow-md border border-surface-container/60">
            {/* Ambient hearth glow subtle gradient */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br from-secondary-container/20 to-transparent blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center text-center relative z-10">
              {/* Avatar with edit photo badge */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary-container shadow-md">
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Edit photo"
                  onClick={() => alert("Change profile photo")}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md active:scale-90 transition-transform"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Identity Details */}
              <div className="mt-4">
                <h2 className="font-extrabold text-xl text-on-surface">
                  {name}
                </h2>
                <div className="flex flex-col items-center gap-0.5 mt-1">
                  <span className="text-xs text-on-surface-variant font-medium">
                    {phone}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {email}
                  </span>
                </div>
              </div>

              {/* VIP Loyalty Badge */}
              <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed shadow-sm">
                <Flame className="w-4 h-4 text-secondary fill-secondary" />
                <span className="font-bold text-xs tracking-wide">
                  Amber Member • {points} Ember Points
                </span>
              </div>
            </div>

            {/* Tier Milestone Progress Bar */}
            <div className="mt-6 bg-surface-container-low rounded-2xl p-4 flex flex-col gap-2 border border-surface-container">
              <div className="flex justify-between items-center text-on-surface">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Tier Goal: {tierName}
                </span>
                <span className="text-xs font-bold text-primary">
                  {points} / {maxPoints} pts
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-variant overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-on-surface-variant pt-0.5">
                <span className="text-xs text-on-surface-variant">
                  {pointsRemaining} pts away from a $15 Bistro Voucher
                </span>
                <Star className="w-4 h-4 text-primary fill-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Stats & Navigation Stack */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-space-xs">
            <div className="flex flex-col items-center justify-center p-space-sm rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 text-center">
              <span className="font-extrabold text-xl text-primary">12</span>
              <span className="text-[11px] font-semibold text-on-surface-variant mt-0.5">
                Orders Placed
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-space-sm rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 text-center">
              <span className="font-extrabold text-xl text-secondary">3</span>
              <span className="text-[11px] font-semibold text-on-surface-variant mt-0.5">
                Addresses
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-space-sm rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 text-center">
              <span className="font-extrabold text-xl text-primary-container">
                2
              </span>
              <span className="text-[11px] font-semibold text-on-surface-variant mt-0.5">
                Favorites
              </span>
            </div>
          </div>

          {/* Account Menu Stack */}
          <div className="flex flex-col space-y-space-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
              Culinary Profile & Orders
            </span>
            <div className="flex flex-col rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden border border-surface-container/60 divide-y divide-surface-container">
              {/* My Orders */}
              <Link
                href="/orders"
                className="flex items-center justify-between p-space-md hover:bg-surface-container-low transition-colors active:bg-surface-container group"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-on-surface truncate">
                      My Orders
                    </span>
                    <span className="text-[11px] text-on-surface-variant truncate">
                      View active deliveries & past receipts
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                </div>
              </Link>

              {/* Saved Addresses */}
              <button
                type="button"
                onClick={() => setIsLocationOpen(true)}
                className="flex items-center justify-between p-space-md hover:bg-surface-container-low transition-colors active:bg-surface-container w-full text-left group"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-on-surface">
                      Saved Addresses
                    </span>
                    <span className="text-[11px] text-on-surface-variant truncate">
                      Home, Work, Studio (3 total)
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
              </button>

              {/* Payment Methods */}
              <button
                type="button"
                onClick={() => alert("Payment methods: KHQR Linked")}
                className="flex items-center justify-between p-space-md hover:bg-surface-container-low transition-colors active:bg-surface-container w-full text-left group"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary flex-shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-on-surface">
                      Payment Methods
                    </span>
                    <span className="text-[11px] text-on-surface-variant truncate">
                      KHQR Linked • Cash preferences
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
              </button>

              {/* Promos & Rewards */}
              <button
                type="button"
                onClick={() =>
                  alert("Promos: 1 complimentary truffle brioche voucher!")
                }
                className="flex items-center justify-between p-space-md hover:bg-surface-container-low transition-colors active:bg-surface-container w-full text-left group"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center text-on-primary-fixed flex-shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-on-surface">
                        Promos & Ember Rewards
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-bold text-[10px]">
                        1 available
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant truncate">
                      Seasonal complimentary truffle brioche
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>

          {/* Preferences & Support Section */}
          <div className="flex flex-col space-y-space-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
              Settings & Assistance
            </span>
            <div className="flex flex-col rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden border border-surface-container/60 divide-y divide-surface-container">
              {/* App Language Selector Row */}
              <div className="flex items-center justify-between p-space-md">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface flex-shrink-0">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <LanguageSwitcher />
              </div>

              {/* Notifications Toggle Row */}
              <div className="flex items-center justify-between p-space-md">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface flex-shrink-0">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-bold text-xs text-on-surface">
                      Notifications & SMS Alerts
                    </span>
                    <span className="text-[11px] text-on-surface-variant truncate">
                      Live dispatch alerts & chef updates
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={smsAlerts}
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`w-12 h-7 rounded-full transition-colors relative flex items-center p-1 cursor-pointer flex-shrink-0 ${
                    smsAlerts ? "bg-primary" : "bg-surface-variant"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-surface-container-lowest shadow-md transform transition-transform ${
                      smsAlerts ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Telegram Bot Link Row */}
              <button
                type="button"
                onClick={handleOpenTelegram}
                className="flex items-center justify-between p-space-md hover:bg-surface-container-low transition-colors active:bg-surface-container w-full text-left group"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#24A1DE]/15 flex items-center justify-center text-[#24A1DE] flex-shrink-0">
                    <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-on-surface">
                        Telegram Bot Alerts
                      </span>
                      {isTelegramLinked ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Linked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-[10px]">
                          Connect Bot
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-on-surface-variant truncate">
                      Receive live kitchen &amp; delivery notifications
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
              </button>

              {/* Help & Bistro Support */}
              <button
                type="button"
                onClick={() => alert("Support concierge live chat opened")}
                className="flex items-center justify-between p-space-md hover:bg-surface-container-low transition-colors active:bg-surface-container w-full text-left group"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface flex-shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-on-surface">
                      Help & Bistro Support
                    </span>
                    <span className="text-[11px] text-on-surface-variant truncate">
                      Chat with kitchen concierge / FAQs
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>

          {/* Logout Button & Version Footnote */}
          <div className="flex flex-col items-center gap-space-sm pt-space-xs">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-error-container text-on-error-container font-bold text-xs hover:brightness-95 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant opacity-75">
                Amber & Ember Bistro v2.4.0 (Mobile)
              </p>
              <p className="text-[11px] text-outline mt-0.5">
                Crafted with woodsmoke & artisanal hospitality
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Prompt Confirmation Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest border border-border/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <User className="w-7 h-7 text-primary" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                Sign In Required
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                You need to be signed in to access your saved profile and
                account settings. Would you like to sign in now?
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary-container transition-all"
              >
                Sign In / Register
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full py-2.5 rounded-xl bg-surface-container-low text-on-surface-variant font-semibold text-xs hover:bg-surface-container transition-all"
              >
                Explore Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
