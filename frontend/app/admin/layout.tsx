"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminLayout from "@/layouts/admin";

export default function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentPath = pathname || "";
  const isAdminLogin = currentPath.startsWith("/admin/login");

  if (isAdminLogin) {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
