"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  SlidersHorizontal,
  Building2,
  UtensilsCrossed,
  Truck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin");
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-background text-on-surface">
      {/* LEFT UI SIDE: High-Resolution Culinary & Executive Kitchen Background */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-7/12 min-h-screen bg-zinc-950 p-8 lg:p-12 flex-col justify-between overflow-hidden">
        {/* Background Image with Dark Vignette Gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
          style={{
            backgroundImage: `url('/images/admin_login_bg.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/30 backdrop-blur-[1px]" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-lg shadow-primary/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block leading-tight">
                Amber &amp; Ember Bistro
              </span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest block">
                ADMIN TERMINAL SUITE
              </span>
            </div>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold px-3 py-1">
            ✓ SYSTEM v2.4 ONLINE
          </Badge>
        </div>

        {/* Bottom Banner Content & System Telemetry */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="space-y-3">
            <Badge
              variant="outline"
              className="text-[11px] font-bold border-amber-500/40 text-amber-300 bg-amber-500/10"
            >
              <Sparkles className="w-3 h-3 text-amber-400 mr-1" />
              RESTRICTED AUTHORIZED PERSONNEL ONLY
            </Badge>

            <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
              Real-Time Kitchen Board &amp; POS Station
            </h2>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Monitor live customer orders, manage delivery geofencing,
              broadcast Telegram notifications, and handle staff roster
              settlements in real time.
            </p>
          </div>

          {/* System Telemetry Pills */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                SSE Listener
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Healthy
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                Database
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                Auth Security
              </span>
              <span className="text-xs font-bold text-primary flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-primary" /> Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT UI SIDE: Admin Input Form Panel */}
      <div className="w-full md:w-1/2 lg:w-5/12 min-h-screen flex items-center justify-center p-6 sm:p-10 bg-surface-container-lowest">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="space-y-2 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-3 mx-auto md:mx-0">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-on-surface tracking-tight">
              Sign In to Admin Portal
            </h1>
            <p className="text-xs text-on-surface-variant">
              Enter your credentials to access the central administration
              terminal.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Admin Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bistro.com"
                  className="pl-10 h-11 text-xs border-border font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-on-surface">
                  Password <span className="text-red-500">*</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "Admin security recovery key sent to registered system administrator email!",
                    );
                  }}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  Forgot Key?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-10 pr-10 h-11 text-xs border-border font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Session Toggle */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                />
                <span className="font-semibold text-on-surface-variant">
                  Remember Session (4h Timeout)
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign In to Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Role Switch Footer */}
          <div className="pt-6 border-t border-border/40 space-y-3">
            <span className="text-[11px] font-semibold text-on-surface-variant block text-center">
              Other Station Logins:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="p-2.5 rounded-xl border border-border/50 bg-surface-container-low hover:bg-surface-container text-[11px] font-bold text-on-surface flex items-center justify-center gap-1.5 transition-all"
              >
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
                <span>Customer Login</span>
              </Link>

              <Link
                href="/delivery/login"
                className="p-2.5 rounded-xl border border-border/50 bg-surface-container-low hover:bg-surface-container text-[11px] font-bold text-on-surface flex items-center justify-center gap-1.5 transition-all"
              >
                <Truck className="w-3.5 h-3.5 text-sky-600" />
                <span>Delivery Driver</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
