import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, ShoppingBag, Store, Bike, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sarana Restaurant | Online Ordering (Cash Only)',
  description: 'Order fresh food online with in-house delivery or store pickup. Cash on delivery & counter cash.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-amber-500/30">
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight">
              <span className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
              </span>
              <span>Sarana Restaurant</span>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Menu</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Kitchen</span>
              </Link>
              <Link
                href="/delivery"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Bike className="w-4 h-4" />
                <span className="hidden sm:inline">Delivery</span>
              </Link>
              <Link
                href="/track"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Track</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="pb-16">{children}</main>
      </body>
    </html>
  );
}
