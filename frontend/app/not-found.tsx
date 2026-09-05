"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-surface p-space-lg text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mb-space-md shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="font-display-lg text-3xl font-bold text-on-surface tracking-tight mb-1">
        Page Not Found
      </h1>
      <p className="font-body-sm text-sm text-on-surface-variant max-w-md mb-space-lg">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="flex items-center gap-space-sm">
        <Link
          href="/admin"
          className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-sm text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-primary-container transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Admin</span>
        </Link>
        <Link
          href="/"
          className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-sm text-sm font-semibold flex items-center gap-2 hover:bg-surface-container-high transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Customer Store</span>
        </Link>
      </div>
    </div>
  );
}
