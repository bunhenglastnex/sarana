import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Restaurant Online Ordering & Delivery System',
  description: 'Single-brand restaurant online ordering, kitchen admin, and in-house delivery system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        {/* Main Application Global Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur">
          <div className="container mx-auto px-4 flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-foreground hover:text-primary transition-colors">
              <span className="text-xl">🍔</span>
              <span>Restaurant App</span>
            </Link>

            <nav className="flex items-center gap-1 text-sm font-medium">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                🛒 Public Customer
              </Link>
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                👨‍🍳 Kitchen Admin
              </Link>
              <Link
                href="/delivery"
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                🛵 Delivery Staff
              </Link>
            </nav>
          </div>
        </header>

        {/* Global Page Content Container */}
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
