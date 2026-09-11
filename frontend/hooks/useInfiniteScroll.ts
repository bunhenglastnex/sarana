"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface UseInfiniteScrollOptions {
  limit?: number;
  params?: Record<string, any>;
  enabled?: boolean;
}

export function useInfiniteScroll<T = any>(
  endpoint: string,
  options: UseInfiniteScrollOptions = {}
) {
  const selectedTenantId = useAuthStore((state) => state.selectedTenantId);
  const { limit = 12, params = {}, enabled = true } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [counts, setCounts] = useState<any>(null);
  const [extraData, setExtraData] = useState<any>(null);

  const isFetchingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const serializedParams = JSON.stringify(params);

  const fetchPage = useCallback(
    async (targetPage = 1, append = false) => {
      if (isFetchingRef.current || !enabled) return;
      isFetchingRef.current = true;
      setLoading(true);

      try {
        const queryParams = {
          ...params,
          page: targetPage,
          limit,
        };

        const res = await Api.get<any>(endpoint, queryParams, {
          forceRefresh: true,
        });

        if (res.success && res.data) {
          setExtraData(res.data);
          if (res.data.counts) {
            setCounts(res.data.counts);
          }

          let fetchedItems: T[] = [];
          if (Array.isArray(res.data)) {
            fetchedItems = res.data;
          } else if (res.data && typeof res.data === "object") {
            const dataKey = Object.keys(res.data).find((key) =>
              Array.isArray(res.data[key])
            );
            if (dataKey) {
              fetchedItems = res.data[dataKey];
            }
          }

          if (append) {
            setItems((prev) => [...prev, ...fetchedItems]);
          } else {
            setItems(fetchedItems);
          }

          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        }
      } catch (err) {
        console.error(`Infinite scroll fetch error on ${endpoint}:`, err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [endpoint, limit, serializedParams, enabled]
  );

  // Initial Fetch Page 1 (and re-fetch on tenant switch)
  useEffect(() => {
    setPage(1);
    fetchPage(1, false);
  }, [endpoint, serializedParams, selectedTenantId]);

  // IntersectionObserver Sentinel Binding
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !pagination || !pagination.hasMore || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current && pagination.hasMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchPage(nextPage, true);
            return nextPage;
          });
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [pagination, fetchPage, enabled]);

  const refresh = useCallback(() => {
    setPage(1);
    return fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (pagination?.hasMore && !loading && !isFetchingRef.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPage(nextPage, true);
    }
  }, [pagination, loading, page, fetchPage]);

  return {
    items,
    setItems,
    loading,
    page,
    pagination,
    counts,
    extraData,
    sentinelRef,
    refresh,
    loadMore,
  };
}
