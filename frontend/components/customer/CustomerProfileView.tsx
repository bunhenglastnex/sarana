"use client";

import React, { useState } from "react";
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
  Headphones,
  Utensils,
  ChevronRight,
  LogOut,
  Globe,
} from "lucide-react";
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
  name = "Elena Rostova",
  phone = "+1 (555) 382-9012",
  email = "elena.rostova@example.com",
  avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAiE9xKCdnv_bglgxg_2LERQbUBlAt1FErmCjJlM_VLK5dW_V-8xiETqMbrDniEM2ZCbQDo_2QKUNG1OinMh1B4XXpwt9n7cccMS_56WCxtMvDwQxsI8pYloDdLducI9tPkTmY9k1J9DgWvY0tNX2DVDPQwP05xPeK0_ZTRvRRrm17jeMPPglgidJwtV3vvobKKha1REpz9pb_kGucgUkNYqPL8qWHCW-ebONnap7f-tdnyxqvtE7Q9",
  points = 340,
  maxPoints = 500,
  tierName = "Firebrand Patron",
}) => {
  const router = useRouter();
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [currentAddress, setCurrentAddress] = useState(
    "244 Oak Street, Apt 4B",
  );
  const [isLocationOpen, setIsLocationOpen] = useState(false);

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
    <main className="flex flex-col relative w-full max-w-md px-space-lg pt-4 pb-28 bg-surface min-h-screen">
      <div className="flex flex-col w-full pb-6 space-y-space-lg">
        {/* Customer Info Card */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_4px_20px_-2px_rgba(26,23,21,0.06)] border border-surface-container/60">
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
            <div className="mt-space-sm">
              <h2 className="font-extrabold text-lg text-on-surface">{name}</h2>
              <div className="flex flex-col items-center gap-0.5 mt-1">
                <span className="text-xs text-on-surface-variant font-medium">
                  {phone}
                </span>
                <span className="text-xs text-on-surface-variant">{email}</span>
              </div>
            </div>

            {/* VIP Loyalty Badge */}
            <div className="mt-space-md inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed shadow-sm">
              <Flame className="w-4 h-4 text-secondary fill-secondary" />
              <span className="font-bold text-xs tracking-wide">
                Amber Member • {points} Ember Points
              </span>
            </div>
          </div>

          {/* Tier Milestone Progress Bar */}
          <div className="mt-space-md pt-space-sm bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1.5 border border-surface-container">
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
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            </div>
          </div>
        </div>

        {/* Quick Stats Counter Row */}
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

            {/* About Bistro */}
            <button
              type="button"
              onClick={() =>
                alert("Amber & Ember Bistro - Woodfired craft comfort kitchen")
              }
              className="flex items-center justify-between p-space-md hover:bg-surface-container-low transition-colors active:bg-surface-container w-full text-left group"
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface flex-shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-on-surface">
                    About Amber & Ember Bistro
                  </span>
                  <span className="text-[11px] text-on-surface-variant truncate">
                    Opening hours, woodfire craft, story
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
            onClick={() => alert("Logged out successfully")}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-error-container text-on-error-container font-bold text-xs hover:brightness-95 active:scale-[0.99] transition-all shadow-sm"
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
    </main>
  );
};
