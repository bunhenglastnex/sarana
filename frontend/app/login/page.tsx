"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function CustomerLoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (authMode === "signup" && password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === "signup") {
        // Customer Registration (Strictly creates role = 'customer')
        const res = await Api.post("/auth.php?action=register", {
          name: fullName,
          phone: phoneOrEmail,
          password: password,
        });

        if (res.success && res.data) {
          setSession({
            token: res.data.token,
            userId: res.data.userId,
            name: res.data.name,
            phone: res.data.phone,
            email: res.data.email || (phoneOrEmail.includes("@") ? phoneOrEmail : null),
            avatarUrl: res.data.avatarUrl || null,
            role: "customer",
            telegramChatId: null,
            telegramUsername: null,
          });
          router.push("/?telegram_prompt=1");
        } else {
          setErrorMessage(res.error || "Failed to create account.");
        }
      } else {
        // Customer Login
        const res = await Api.post("/auth.php?action=login", {
          identifier: phoneOrEmail,
          password: password,
          required_role: "customer",
        });

        if (res.success && res.data) {
          const hasTelegram = Boolean(res.data.telegramChatId || res.data.telegram_chat_id);
          setSession({
            token: res.data.token,
            userId: res.data.userId,
            name: res.data.name,
            phone: res.data.phone,
            email: res.data.email || (phoneOrEmail.includes("@") ? phoneOrEmail : null),
            avatarUrl: res.data.avatarUrl || null,
            role: res.data.role || "customer",
            telegramChatId: res.data.telegramChatId || res.data.telegram_chat_id || null,
            telegramUsername: res.data.telegramUsername || res.data.telegram_username || null,
          });

          // If customer has NOT linked Telegram yet, popup Telegram modal!
          if (!hasTelegram) {
            router.push("/?telegram_prompt=1");
          } else {
            router.push("/");
          }
        } else {
          setErrorMessage(res.error || "Invalid phone/email or password.");
        }
      }
    } catch (err: any) {
      setErrorMessage(
        "Network error: Unable to connect to authentication server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-zinc-950">
      {/* Full-Height Background Image with Dark Vignette Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{
          backgroundImage: `url('/images/customer_login_bg.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40 backdrop-blur-[2px]" />

      {/* Main Glassmorphism Customer Login/Signup Card */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white animate-fadeIn">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <img
            src="/logo.jpg"
            alt="Amber Bistro Logo"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg shadow-amber-500/20 mx-auto mb-1"
          />
          <h1 className="text-2xl font-black tracking-tight text-white">
            Welcome to Amber Bistro
          </h1>
          <p className="text-xs text-zinc-400">
            {authMode === "login"
              ? "Sign in to order gourmet dishes, track delivery & earn rewards."
              : "Create an account to save favorites, earn rewards & fast checkout."}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs (Log In vs Sign Up) */}
        <div className="grid grid-cols-2 p-1 bg-zinc-800/80 rounded-2xl border border-white/5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode("login");
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMode === "login"
                ? "bg-amber-500 text-zinc-950 shadow-md font-black"
                : "text-zinc-400 hover:text-white font-semibold"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("signup");
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMode === "signup"
                ? "bg-amber-500 text-zinc-950 shadow-md font-black"
                : "text-zinc-400 hover:text-white font-semibold"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold text-center animate-fadeIn">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Customer Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {/* Full Name field for Sign Up */}
          {authMode === "signup" && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-zinc-300">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="pl-10 h-11 bg-zinc-800/60 border-zinc-700/80 text-white placeholder:text-zinc-500 text-xs rounded-xl focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Phone Number or Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-300">
              Phone Number or Email
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                required
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="+855 12 345 678 or name@example.com"
                className="pl-10 h-11 bg-zinc-800/60 border-zinc-700/80 text-white placeholder:text-zinc-500 text-xs rounded-xl focus:border-amber-500"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-300">
                {authMode === "signup" ? "Create Password" : "Password"}
              </label>
              {authMode === "login" && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Password reset code sent to your phone/email!");
                  }}
                  className="text-[11px] font-semibold text-amber-400 hover:underline"
                >
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="pl-10 pr-10 h-11 bg-zinc-800/60 border-zinc-700/80 text-white placeholder:text-zinc-500 text-xs rounded-xl focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field for Sign Up */}
          {authMode === "signup" && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-zinc-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-10 pr-10 h-11 bg-zinc-800/60 border-zinc-700/80 text-white placeholder:text-zinc-500 text-xs rounded-xl focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                {authMode === "login" ? "Signing In..." : "Creating Account..."}
              </span>
            ) : (
              <>
                <span>
                  {authMode === "login"
                    ? "Sign In to Order"
                    : "Create Account & Order"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
