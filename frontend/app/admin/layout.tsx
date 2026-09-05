"use client";

import React from "react";
import AdminLayout from "@/layouts/admin";

export default function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
