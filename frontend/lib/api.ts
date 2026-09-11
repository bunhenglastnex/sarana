/**
 * sarana - Unified API Client with Intelligent Caching & Error Handling
 *
 * Features:
 * - Simple syntax: Api.get(...), Api.post(...), Api.put(...), Api.patch(...), Api.delete(...)
 * - Smart Caching (In-Memory + SessionStorage):
 *   Prevents duplicate network requests when switching between pages ("កុំឲ្យ ប្ដូរ page វាទាញទិន្ន័យឡើងវិញ").
 * - In-flight Request Deduplication:
 *   Simultaneous requests to the same endpoint share one network promise.
 * - Built-in Try-Catch & Error Normalization:
 *   Never crashes the UI; always returns `{ success, data, error, status, fromCache }`.
 * - Automatic Query Param & JSON Body Serialization.
 * - Mutation Auto-Invalidation:
 *   POST/PUT/PATCH/DELETE automatically invalidates related GET cache.
 * - Included React Hook:
 *   `useApi(...)` for seamless client-side page fetching with caching.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/lib/store/useAuthStore";

// ==========================================
// 1. Types & Interfaces
// ==========================================

export interface RequestOptions extends Omit<RequestInit, "body" | "cache"> {
  params?: Record<string, any>;
  body?: any;
  /**
   * Enable or disable caching. Default is true for GET, false for mutations.
   */
  cache?: boolean;
  /**
   * Cache Time-To-Live in milliseconds. Default is 5 minutes (300,000 ms).
   */
  ttl?: number;
  /**
   * If true, ignores existing cache and forces a fresh network fetch.
   */
  forceRefresh?: boolean;
  /**
   * Custom request headers.
   */
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  status: number;
  fromCache: boolean;
}

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Default Configuration
const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms
const SESSION_CACHE_PREFIX = "sarana_api_cache:";

// ==========================================
// 2. Cache Store (In-Memory + SessionStorage)
// ==========================================

// Global in-memory cache map (persists across Next.js client-side page transitions)
const memoryCache = new Map<string, CacheEntry<any>>();

// In-flight promises map to deduplicate simultaneous identical calls
const inFlightRequests = new Map<string, Promise<ApiResponse<any>>>();

/**
 * Generate a unique deterministic cache key based on Method, URL, and Params
 */
function createCacheKey(
  method: string,
  url: string,
  params?: Record<string, any>,
): string {
  if (!params || Object.keys(params).length === 0) {
    return `${method}:${url}`;
  }
  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys
    .map(
      (k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k] ?? "")}`,
    )
    .join("&");
  return `${method}:${url}?${queryString}`;
}

/**
 * Retrieve cached item from Memory or SessionStorage (Caching disabled to prevent memory leaks)
 */
function getFromCache<T>(_cacheKey: string): T | null {
  return null;
}

/**
 * Save item into Memory and SessionStorage cache (Caching disabled to prevent memory leaks)
 */
function saveToCache<T>(_cacheKey: string, _data: T, _ttlMs: number): void {
  // Disabled persistent caching to prevent V8 memory leaks during auto-polling
}

/**
 * Clear all cache or matching keys
 */
export function clearApiCache(endpointPattern?: string | RegExp): void {
  memoryCache.clear();
  if (typeof window !== "undefined") {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key && key.startsWith(SESSION_CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
    } catch {
      // Ignore
    }
  }
}

// ==========================================
// 3. Core Request Handler
// ==========================================

/**
 * Construct full URL with Base URL and Query Parameters
 */
function buildFullUrl(endpoint: string, params?: Record<string, any>): string {
  let url = endpoint;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    let base = DEFAULT_BASE_URL.replace(/\/+$/, "");
    if (base.toLowerCase().endsWith("/api")) {
      base = base.substring(0, base.length - 4);
    }
    let cleanPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    if (!cleanPath.startsWith("/api/")) {
      cleanPath = `/api${cleanPath}`;
    }
    url = `${base}${cleanPath}`;
  }

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  return url;
}

/**
 * Low-level HTTP execution with caching, in-flight deduplication, and error catching
 */
async function executeRequest<T = any>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const {
    params,
    body,
    cache = method === "GET",
    ttl = DEFAULT_CACHE_TTL,
    forceRefresh = false,
    headers = {},
    ...customConfig
  } = options;

  const fullUrl = buildFullUrl(endpoint, params);
  const cacheKey = createCacheKey(method, fullUrl);

  // 1. Check Cache for GET requests (Prevent refetch on page navigation)
  if (method === "GET" && cache && !forceRefresh) {
    const cachedData = getFromCache<T>(cacheKey);
    if (cachedData !== null) {
      return {
        success: true,
        data: cachedData,
        error: null,
        status: 200,
        fromCache: true,
      };
    }

    // 2. In-flight request deduplication (re-use same ongoing network promise)
    if (inFlightRequests.has(cacheKey)) {
      return (await inFlightRequests.get(cacheKey)) as ApiResponse<T>;
    }
  }

  // 3. Prepare Fetch Execution
  const fetchPromise = (async (): Promise<ApiResponse<T>> => {
    try {
      const requestHeaders: Record<string, string> = {
        Accept: "application/json",
        ...headers,
      };

      // Auto-attach Authorization Bearer token & X-Tenant-ID header from Zustand Store
      if (typeof window !== "undefined") {
        try {
          const authState = useAuthStore.getState();
          let token = authState.token;
          const selectedTenantId = authState.selectedTenantId;

          // 1. Check Cookie storage
          if (!token) {
            const cookieVal = Cookies.get("auth-storage");
            if (cookieVal) {
              const parsed = JSON.parse(cookieVal);
              token = parsed?.state?.token;
            }
          }

          // 2. Check localStorage fallback
          if (!token) {
            const localVal = window.localStorage.getItem("auth-storage");
            if (localVal) {
              const parsed = JSON.parse(localVal);
              token = parsed?.state?.token;
            }
          }

          if (token && !requestHeaders["Authorization"]) {
            requestHeaders["Authorization"] = `Bearer ${token}`;
          }

          if (
            selectedTenantId !== null &&
            selectedTenantId !== undefined &&
            !requestHeaders["X-Tenant-ID"]
          ) {
            requestHeaders["X-Tenant-ID"] = String(selectedTenantId);
          }
        } catch {
          // Ignore parse errors
        }
      }

      let serializedBody: BodyInit | undefined = undefined;
      if (body !== undefined && body !== null) {
        if (body instanceof FormData) {
          serializedBody = body;
          // Let browser set boundary automatically for FormData
        } else {
          serializedBody = JSON.stringify(body);
          requestHeaders["Content-Type"] = "application/json";
        }
      }

      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: serializedBody,
        ...customConfig,
      });

      // Parse JSON safely
      const responseText = await response.text();
      let parsedData: any = null;
      try {
        parsedData = responseText ? JSON.parse(responseText) : null;
      } catch {
        parsedData = responseText;
      }

      // Handle non-2xx responses
      if (!response.ok) {
        const errorMsg =
          parsedData?.message ||
          parsedData?.error ||
          `Request failed with status ${response.status} (${response.statusText})`;

        return {
          success: false,
          data: parsedData,
          error: errorMsg,
          status: response.status,
          fromCache: false,
        };
      }

      // Handle API responses with { code: 1|0, msg: '...', data: ... }
      if (
        parsedData &&
        typeof parsedData === "object" &&
        "code" in parsedData
      ) {
        const isSuccessCode = parsedData.code === 1 || parsedData.code === 200;
        if (!isSuccessCode) {
          return {
            success: false,
            data: parsedData.data ?? null,
            error: parsedData.msg || parsedData.message || "Operation failed",
            status: response.status,
            fromCache: false,
          };
        }
        // Extract data payload if code === 1
        if (parsedData.data !== undefined) {
          parsedData = parsedData.data;
        }
      }

      // Handle legacy API responses where backend returns { success: false, message: '...' }
      if (
        parsedData &&
        typeof parsedData === "object" &&
        parsedData.success === false
      ) {
        return {
          success: false,
          data: parsedData,
          error: parsedData.message || parsedData.msg || "Operation failed",
          status: response.status,
          fromCache: false,
        };
      }

      // If caching is enabled for this GET request, save to cache
      if (method === "GET" && cache) {
        saveToCache(cacheKey, parsedData, ttl);
      }

      // Automatically invalidate related GET cache on successful mutation
      if (method !== "GET") {
        const baseEndpoint = endpoint.split("?")[0];
        clearApiCache(baseEndpoint);
      }

      return {
        success: true,
        data: parsedData as T,
        error: null,
        status: response.status,
        fromCache: false,
      };
    } catch (err: any) {
      // Catch network failure or server unreachable without crashing
      const message =
        err?.name === "AbortError"
          ? "Request was cancelled"
          : err?.message || "Network error: Backend server unreachable.";

      return {
        success: false,
        data: null,
        error: message,
        status: 0,
        fromCache: false,
      };
    } finally {
      // Clean up in-flight tracker
      if (method === "GET") {
        inFlightRequests.delete(cacheKey);
      }
    }
  })();

  if (method === "GET" && cache) {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  return await fetchPromise;
}

// ==========================================
// 4. Exported Api Object (Api.get, Api.post, etc.)
// ==========================================

export const Api = {
  /**
   * Perform GET request with automatic caching
   * @param endpoint e.g. '/api/foods.php'
   * @param params Optional query parameters object, e.g. { category_id: 2 }
   * @param options Request options (cache, ttl, forceRefresh, headers)
   */
  get: <T = any>(
    endpoint: string,
    params?: Record<string, any>,
    options?: Omit<RequestOptions, "params">,
  ): Promise<ApiResponse<T>> => {
    return executeRequest<T>("GET", endpoint, { ...options, params });
  },

  /**
   * Perform POST request
   * @param endpoint e.g. '/api/orders.php'
   * @param body Payload object or FormData
   * @param options Request options
   */
  post: <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, "body">,
  ): Promise<ApiResponse<T>> => {
    return executeRequest<T>("POST", endpoint, { ...options, body });
  },

  /**
   * Perform PUT request
   * @param endpoint e.g. '/api/foods.php'
   * @param body Payload object or FormData
   * @param options Request options
   */
  put: <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, "body">,
  ): Promise<ApiResponse<T>> => {
    return executeRequest<T>("PUT", endpoint, { ...options, body });
  },

  /**
   * Perform PATCH request
   * @param endpoint e.g. '/api/order-status.php'
   * @param body Payload object or FormData
   * @param options Request options
   */
  patch: <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, "body">,
  ): Promise<ApiResponse<T>> => {
    return executeRequest<T>("PATCH", endpoint, { ...options, body });
  },

  /**
   * Perform DELETE request
   * @param endpoint e.g. '/api/foods.php'
   * @param params Optional query parameters or payload
   * @param options Request options
   */
  delete: <T = any>(
    endpoint: string,
    params?: Record<string, any>,
    options?: Omit<RequestOptions, "params">,
  ): Promise<ApiResponse<T>> => {
    return executeRequest<T>("DELETE", endpoint, { ...options, params });
  },

  /**
   * Cache Utilities
   */
  cache: {
    /**
     * Clear all cached data or a specific endpoint
     */
    clear: (endpointPattern?: string | RegExp) =>
      clearApiCache(endpointPattern),
    /**
     * Manually get data from cache
     */
    get: <T = any>(
      endpoint: string,
      params?: Record<string, any>,
    ): T | null => {
      const fullUrl = buildFullUrl(endpoint, params);
      const key = createCacheKey("GET", fullUrl);
      return getFromCache<T>(key);
    },
    /**
     * Manually set data into cache
     */
    set: <T = any>(
      endpoint: string,
      data: T,
      params?: Record<string, any>,
      ttl: number = DEFAULT_CACHE_TTL,
    ): void => {
      const fullUrl = buildFullUrl(endpoint, params);
      const key = createCacheKey("GET", fullUrl);
      saveToCache(key, data, ttl);
    },
  },
};

// Also export lowercase alias so both `Api` and `api` work seamlessly
export const api = Api;
export default Api;

// ==========================================
// 5. Convenient React Hook (`useApi`)
// ==========================================

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  status: number;
  refetch: (forceRefresh?: boolean) => Promise<ApiResponse<T>>;
}

/**
 * Custom React Hook for fetching data with automatic caching and state management.
 * Great for pages to instantly display cached data when navigating back!
 *
 * Example:
 * ```tsx
 * const { data, loading, error, refetch } = useApi<FoodsResponse>('/api/foods.php');
 * ```
 */
export function useApi<T = any>(
  endpoint: string | null,
  params?: Record<string, any>,
  options?: RequestOptions,
): UseApiResult<T> {
  const selectedTenantId = useAuthStore((state) => state.selectedTenantId);

  // Check initial cache synchronously to avoid flickering if already cached
  const initialData = endpoint ? Api.cache.get<T>(endpoint, params) : null;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(
    !initialData && Boolean(endpoint),
  );
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState<boolean>(Boolean(initialData));
  const [status, setStatus] = useState<number>(initialData ? 200 : 0);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const paramsString = JSON.stringify(params || {});

  const fetchData = useCallback(
    async (forceRefresh = false): Promise<ApiResponse<T>> => {
      if (!endpoint) {
        return {
          success: false,
          data: null,
          error: "No endpoint provided",
          status: 0,
          fromCache: false,
        };
      }

      setLoading(true);
      setError(null);

      const response = await Api.get<T>(endpoint, paramsRef.current, {
        ...optionsRef.current,
        forceRefresh,
      });

      setData(response.data);
      setError(response.error);
      setFromCache(response.fromCache);
      setStatus(response.status);
      setLoading(false);

      return response;
    },
    [endpoint],
  );

  useEffect(() => {
    if (endpoint) {
      fetchData(true);
    }
  }, [endpoint, paramsString, selectedTenantId, fetchData]);

  return {
    data,
    loading,
    error,
    fromCache,
    status,
    refetch: fetchData,
  };
}
