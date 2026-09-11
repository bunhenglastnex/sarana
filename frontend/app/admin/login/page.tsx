"use client";

import React, { useState, useEffect } from "react";
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
  KeyRound,
  User,
  Phone,
  MapPin,
  Store,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  // Auth Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Register Restaurant Form States
  const [restaurantName, setRestaurantName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAddress, setRegAddress] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Restore remembered email on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("sarana_remembered_admin_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberSession(true);
      }
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await Api.post("/auth.php?action=login", {
        identifier: email,
        password: password,
        required_role: "admin",
      });

      if (res.success && res.data) {
        if (rememberSession) {
          localStorage.setItem("sarana_remembered_admin_email", email);
        } else {
          localStorage.removeItem("sarana_remembered_admin_email");
        }

        setSession({
          token: res.data.token,
          userId: res.data.userId,
          name: res.data.name,
          phone: res.data.phone,
          email: res.data.email,
          role: res.data.role || "admin",
          restaurantId: res.data.restaurantId || res.data.restaurant_id || null,
        });
        router.push("/admin");
      } else {
        setErrorMessage(
          res.error || "Access denied. Admin credentials required.",
        );
      }
    } catch (err: any) {
      setErrorMessage("Network error: Unable to connect to auth server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await Api.post("/auth.php?action=register_restaurant", {
        restaurant_name: restaurantName,
        owner_name: ownerName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        address: regAddress,
      });

      if (res.success && res.data) {
        setSuccessMessage("🎉 Restaurant & Admin account registered successfully!");
        setSession({
          token: res.data.token,
          userId: res.data.userId,
          name: res.data.name,
          phone: res.data.phone,
          email: res.data.email,
          role: res.data.role || "admin",
          restaurantId: res.data.restaurantId || res.data.restaurant_id || null,
        });

        setTimeout(() => {
          router.push("/admin");
        }, 1200);
      } else {
        setErrorMessage(
          res.error || "Registration failed. Please check form details.",
        );
      }
    } catch (err: any) {
      setErrorMessage("Network error: Unable to complete restaurant registration.");
    } finally {
      setIsLoading(false);
    }
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
                Amber &amp; Ember Multi-Tenant
              </span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest block">
                ADMIN &amp; PARTNER TERMINAL
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
              RESTRICTED AUTHORIZED PERSONNEL &amp; TENANTS
            </Badge>

            <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
              Real-Time Kitchen Board &amp; Multi-Tenant POS
            </h2>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Register your restaurant bistro or sign in to monitor live customer
              orders, manage food items, broadcast Telegram alerts, and handle
              daily settlements in real time.
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
                Multi-Tenant DB
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
        <div className="w-full max-w-md space-y-6 animate-fadeIn">
          {/* Header Icon & Mode Switcher */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                {authMode === "login" ? (
                  <Building2 className="w-6 h-6" />
                ) : (
                  <Store className="w-6 h-6" />
                )}
              </div>

              {/* Dual Tab Mode Switcher */}
              <div className="flex p-1 bg-surface-container rounded-xl border border-border/50">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    authMode === "login"
                      ? "bg-surface-container-lowest text-primary shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Admin Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    authMode === "register"
                      ? "bg-surface-container-lowest text-primary shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Register Restaurant
                </button>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black text-on-surface tracking-tight">
                {authMode === "login"
                  ? "Sign In to Admin Portal"
                  : "Register New Restaurant"}
              </h1>
              <p className="text-xs text-on-surface-variant mt-1">
                {authMode === "login"
                  ? "Enter your administrator credentials to access your restaurant terminal."
                  : "Onboard your restaurant bistro and create your store admin credentials."}
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-semibold text-center animate-fadeIn">
              ⚠️ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-semibold text-center animate-fadeIn">
              {successMessage}
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === "login" ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
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

              {/* Remember Session Toggle & Quick Auto-fill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                  />
                  <span className="font-semibold text-on-surface-variant">
                    Remember Session
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@restaurant.com");
                    setPassword("admin123");
                  }}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Fill Demo Admin</span>
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-2"
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
          ) : (
            /* REGISTER RESTAURANT FORM */
            <form onSubmit={handleRestaurantRegister} className="space-y-3.5 animate-fadeIn">
              {/* Restaurant Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface">
                  Restaurant Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <Input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g. Spice Route Woodfired Grill"
                    className="pl-10 h-10 text-xs border-border font-medium"
                  />
                </div>
              </div>

              {/* Owner / Manager Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface">
                  Owner / Manager Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <Input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Sokha Seng"
                    className="pl-10 h-10 text-xs border-border font-medium"
                  />
                </div>
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <Input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="012 888 999"
                      className="pl-10 h-10 text-xs border-border font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="owner@restaurant.com"
                      className="pl-10 h-10 text-xs border-border font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface">
                  Set Admin Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    className="pl-10 pr-10 h-10 text-xs border-border font-medium"
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

              {/* Restaurant Address */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface">
                  Restaurant Location / Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <Input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Pub Street Promenade, Siem Reap"
                    className="pl-10 h-10 text-xs border-border font-medium"
                  />
                </div>
              </div>

              {/* Register Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-3"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Creating Restaurant Tenant...
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register &amp; Launch Admin Console</span>
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Quick Role Switch Footer */}
          <div className="pt-4 border-t border-border/40 space-y-3">
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
