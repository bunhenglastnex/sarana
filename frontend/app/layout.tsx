import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, ShoppingCart, ChefHat, Bike } from 'lucide-react';
import { I18nProvider } from '@/components/I18nProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <I18nProvider>
          {/* Main Application Global Navigation Header */}
          <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur">
            <div className="container mx-auto px-4 flex h-14 items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-foreground hover:text-primary transition-colors">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <span className="text-lg">Restaurant App</span>
              </Link>

              <div className="flex items-center gap-3">
                <nav className="flex items-center gap-1 text-sm font-medium">
                  <Link
                    href="/"
                    className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Public Customer</span>
                  </Link>
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>Kitchen Admin</span>
                  </Link>
                  <Link
                    href="/delivery"
                    className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                  >
                    <Bike className="w-4 h-4" />
                    <span>Delivery Staff</span>
                  </Link>
                </nav>

                <div className="w-px h-6 bg-border" />

                {/* Language Switcher Dropdown */}
                <LanguageSwitcher />
              </div>
            </div>
          </header>

          {/* Global Page Content Container */}
          <div className="flex-1">{children}</div>
        </I18nProvider>
      </body>
    </html>
  );
}
