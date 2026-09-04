import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-border bg-card p-4 space-y-6">
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Admin Portal
          </h2>
          <p className="text-sm font-bold text-foreground mt-0.5">Kitchen & Management</p>
        </div>

        <nav className="space-y-1 text-sm font-medium">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 text-primary font-semibold"
          >
            📋 Orders Management
          </Link>
        </nav>
      </aside>

      {/* Admin Main Content Slot */}
      <main className="flex-1 p-6 bg-background">{children}</main>
    </div>
  );
}
