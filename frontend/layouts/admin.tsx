"use client";

import React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="bg-surface text-on-surface font-sans text-sm min-h-screen flex flex-col selection:bg-primary/20 selection:text-primary w-full antialiased">
      {/* Fixed Left Desktop Sidebar */}
      <AdminSidebar />

      {/* Main Admin Body Layout Wrapper matching w-64 sidebar */}
      <div className="pl-64 min-h-screen flex flex-col w-full bg-surface">
        {/* Fixed Desktop Top Header */}
        <AdminHeader />

        {/* Main Content Area */}
        <main className="w-full pt-16 bg-surface flex-1 px-space-lg py-space-lg">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
