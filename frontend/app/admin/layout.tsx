"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminLayout from "@/layouts/admin";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const { token, role } = useAuthStore();
  const currentPath = pathname || "";
  const isAdminLogin = currentPath.startsWith("/admin/login");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Automatically redirect unauthenticated or non-admin users to login after mounting
  useEffect(() => {
    if (isMounted && !isAdminLogin) {
      if (!token || !["admin", "super_admin"].includes(role)) {
        router.push("/admin/login");
      }
    }
  }, [isMounted, isAdminLogin, token, role, router]);

  // Login page bypasses layout
  if (isAdminLogin) {
    return <>{children}</>;
  }

  // Prevent SSR/hydration mismatches while reading cookie/localStorage auth state
  if (!isMounted) {
    return (
      <div className="w-full min-h-screen bg-surface flex flex-col items-center justify-center gap-3 text-on-surface-variant">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="font-label-md text-xs font-bold">Verifying Admin Session...</span>
      </div>
    );
  }

  // RBAC Access Control Guard: Only role === 'admin' or 'super_admin' with valid token permitted
  const isAuthorizedAdmin = Boolean(token && ["admin", "super_admin"].includes(role));

  if (!isAuthorizedAdmin) {
    return (
      <div className="w-full min-h-screen bg-surface flex items-center justify-center p-space-md">
        <div className="bg-surface-container-lowest border border-border/40 rounded-3xl max-w-md w-full p-space-xl shadow-2xl space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-error-container/20 text-error flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-headline-sm text-xl font-black text-on-surface tracking-tight">
              Restricted Admin Console Access
            </h1>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              This area requires verified <strong className="text-on-surface">Restaurant Administrator</strong> privileges.
              You are currently unauthenticated or signed in with a non-admin account.
            </p>
          </div>

          <Button
            onClick={() => router.push("/admin/login")}
            className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <span>Sign In as Admin</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}

