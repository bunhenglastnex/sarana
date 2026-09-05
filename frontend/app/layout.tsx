import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import { I18nProvider } from "@/components/I18nProvider";

import { CustomerLayout } from "@/layouts/customer";

export const metadata: Metadata = {
  title: "Restaurant Online Ordering & Delivery System",
  description:
    "Single-brand restaurant online ordering, kitchen admin, and in-house delivery system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface text-on-surface antialiased flex flex-col font-sans">
        <I18nProvider>
          <CustomerLayout>{children}</CustomerLayout>
        </I18nProvider>
      </body>
    </html>
  );
}
