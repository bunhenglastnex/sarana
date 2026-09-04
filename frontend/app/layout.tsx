import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, ShoppingBag, Store, Bike, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Restaurant Order & Delivery System',
  description: 'Production-ready single restaurant online ordering and in-house delivery system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
          <div className="container flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-foreground hover:text-primary transition-colors">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              <span>Restaurant Order System</span>
            </Link>

            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Customer Menu
              </Link>
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Kitchen Admin
              </Link>
              <Link
                href="/delivery"
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Delivery Staff
              </Link>
              <Link
                href="/track"
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Track Order
              </Link>
            </nav>
          </div>
        </header>

        <main className="container py-8">{children}</main>
      </body>
    </html>
  );
}
