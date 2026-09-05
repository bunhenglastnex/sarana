'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="w-full flex-1 min-h-[50vh] flex flex-col items-center justify-center p-6 gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
      </div>
      <span className="text-xs font-medium text-on-surface-variant animate-pulse">
        Loading...
      </span>
    </div>
  );
}
