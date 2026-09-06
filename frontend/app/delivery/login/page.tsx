"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  User,
  Lock,
  Eye,
  EyeOff,
  Navigation,
  UtensilsCrossed,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function DeliveryDriverLoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [username, setUsername] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDriverLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await Api.post("/auth.php?action=login", {
        identifier: username,
        password: pinCode,
        required_role: "delivery",
      });

      if (res.success && res.data) {
        setSession({
          token: res.data.token,
          userId: res.data.userId,
          name: res.data.name,
          phone: res.data.phone,
          role: "delivery",
        });
        router.push("/delivery");
      } else {
        setErrorMessage(
          res.error || "Access denied. Delivery driver account required.",
        );
      }
    } catch (err: any) {
      setErrorMessage("Network error: Unable to connect to auth server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-zinc-950">
      {/* Full-Height Express Delivery Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{
          backgroundImage: `url('/images/driver_login_bg.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/40 backdrop-blur-[2px]" />

      {/* Main Delivery Driver Login Card */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white animate-fadeIn">
        {/* Driver Terminal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500 text-zinc-950 font-bold shadow-lg shadow-sky-500/20 mb-1">
            <Truck className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Driver Shift Terminal
            </h1>
          </div>
          <p className="text-xs text-sky-200">
            Sign in to start your delivery shift, receive dispatch alerts &amp;
            track tips.
          </p>
        </div>

        {/* Driver Login Form */}
        <form onSubmit={handleDriverLogin} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold text-center animate-fadeIn">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-300">
              Username / Driver ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
              <Input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or Driver ID"
                className="pl-10 h-11 bg-zinc-800/80 border-zinc-700/80 text-white placeholder:text-zinc-500 text-xs rounded-xl focus:border-sky-500"
              />
            </div>
          </div>

          {/* Security PIN / Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-300">
                Security PIN
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
              <Input
                type={showPin ? "text" : "password"}
                required
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="Enter your PIN"
                className="pl-10 pr-10 h-11 bg-zinc-800/80 border-zinc-700/80 text-white placeholder:text-zinc-500 text-xs rounded-xl focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPin ? (
                  <EyeOff className="w-4 h-4 text-sky-400" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                Connecting Shift...
              </span>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Clock In &amp; Start Shift</span>
              </>
            )}
          </Button>
        </form>

        {/* Role Switch Links */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <span className="text-[11px] font-semibold text-zinc-400 block text-center">
            Switch Terminal Access:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/login"
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-white/5 text-[11px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer Login</span>
            </Link>

            <Link
              href="/admin/login"
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-white/5 text-[11px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
