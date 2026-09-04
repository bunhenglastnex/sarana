import React from 'react';
import Link from 'next/link';

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      {/* Delivery Staff Portal Header */}
      <header className="border-b border-border bg-card px-6 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Delivery Portal
            </h2>
            <p className="text-sm font-bold text-foreground">In-House Courier & Cash Settlement</p>
          </div>

          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link
              href="/delivery"
              className="px-3 py-1.5 rounded-md bg-primary/10 text-primary font-semibold"
            >
              🛵 Dispatch Board
            </Link>
          </nav>
        </div>
      </header>

      {/* Delivery Main Content Slot */}
      <main className="flex-1 container mx-auto p-6">{children}</main>
    </div>
  );
}
