"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  X,
  MapPin,
  Receipt,
  CreditCard,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  User,
  Globe,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  avatarUrl,
}) => {
  const router = useRouter();
  const {
    token,
    userId,
    name: authName,
    email: authEmail,
    phone: authPhone,
    avatarUrl: authAvatarUrl,
    clearSession,
  } = useAuthStore();

  if (!isOpen) return null;

  const isLoggedIn = Boolean(token || userId);

  if (!isLoggedIn) {
    onClose();
    router.push("/login");
    return null;
  }

  const displayName = userName || authName || "Valued Customer";
  const displayEmail = userEmail || authEmail || authPhone || "Customer Account";
  const displayAvatar = authAvatarUrl || avatarUrl;

  const handleLogout = () => {
    clearSession();
    onClose();
    router.push("/login");
  };

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const menuSections = [
    {
      title: "Orders & Saved",
      items: [
        { icon: Receipt, label: "Order History & Tracking", path: "/orders" },
        { icon: Heart, label: "Favorite Dishes", path: "/favorites" },
      ],
    },
    {
      title: "Settings & Account",
      items: [
        { icon: Settings, label: "Account Profile & Telegram", path: "/customer-profile" },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs bg-surface h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 border-l border-surface-container overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="p-space-lg bg-surface-container-low border-b border-surface-container flex items-center justify-between">
          <h2 className="font-extrabold text-lg text-on-surface">
            Customer Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile modal"
            className="w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center text-on-surface hover:bg-surface-container transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Card */}
        <div className="p-space-lg flex items-center gap-3 border-b border-surface-container bg-surface-container-lowest">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-sm flex-shrink-0">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                <User className="w-7 h-7" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-base text-on-surface truncate">
              {displayName}
            </span>
            <span className="text-xs text-on-surface-variant truncate">
              {displayEmail}
            </span>
            <span className="mt-1 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant w-fit">
              Active Account
            </span>
          </div>
        </div>

        {/* Language Selection Card */}
        <div className="px-space-md pt-space-md">
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Menu Sections */}
        <div className="p-space-md flex-1 space-y-6">
          {menuSections.map((sec) => (
            <div key={sec.title} className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-2">
                {sec.title}
              </span>
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-surface-container/60 divide-y divide-surface-container">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleNavigate(item.path)}
                      className="w-full p-3 flex items-center justify-between hover:bg-surface-container-low transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-surface-container text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-on-surface truncate">
                            {item.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <ChevronRight className="w-4 h-4 text-outline group-hover:text-on-surface transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button Footer */}
        <div className="p-space-lg border-t border-surface-container bg-surface-container-low">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl border border-destructive/30 text-destructive font-bold text-xs flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
