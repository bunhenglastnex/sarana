"use client";

import React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { PaginationMeta } from "@/hooks/useInfiniteScroll";

interface InfiniteScrollSentinelProps {
  sentinelRef: React.RefObject<HTMLDivElement>;
  loading: boolean;
  pagination: PaginationMeta | null;
  itemsCount: number;
  unitLabel?: string;
}

export const InfiniteScrollSentinel: React.FC<InfiniteScrollSentinelProps> = ({
  sentinelRef,
  loading,
  pagination,
  itemsCount,
  unitLabel = "items",
}) => {
  return (
    <>
      {/* Invisible IntersectionObserver Sentinel Element */}
      <div ref={sentinelRef} className="h-6 w-full opacity-0 pointer-events-none" />

      {/* Reusable Dynamic Status Bar */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-surface-container-lowest rounded-2xl shadow-xs border border-border/40 my-4">
          <div className="text-xs text-on-surface-variant font-medium">
            Showing <span className="font-bold text-on-surface">{itemsCount}</span> of{" "}
            <span className="font-bold text-on-surface">{pagination.total}</span> {unitLabel} (Page {pagination.page} of {pagination.totalPages})
          </div>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary-fixed/40 px-3 py-1.5 rounded-xl border border-primary/20">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading more {unitLabel}...</span>
              </div>
            ) : pagination.hasMore ? (
              <div className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-xl border border-border/30">
                <span>↓ Scroll down to load page {pagination.page + 1}</span>
              </div>
            ) : (
              <div className="text-xs text-emerald-800 bg-emerald-100 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All {pagination.total} {unitLabel} loaded</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
