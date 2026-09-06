---
name: frontend-api-integration
description: Guidelines and code patterns for fetching live backend API data in Next.js frontend components and Zustand stores without using mock data. Use whenever building frontend UI, pages, or state management.
---

# 🌐 Frontend Real API Integration Workflow

This skill guides AI agents and frontend developers on connecting Next.js UI components and Zustand stores directly to **Pure PHP Backend REST APIs** (`/api/...`) without using any mock data or hardcoded dummy arrays.

---

## ⛔ Strict Rule: NO MOCK DATA
- **DO NOT** use hardcoded arrays (e.g. `const mockOrders = [...]`, `const DUMMY_FOODS = [...]`).
- **DO NOT** fall back to local mock data if an API fails or is pending.
- **ALWAYS** fetch real live data from backend API endpoints using `@/lib/api` (`Api.get`, `Api.post`, `Api.put`, `Api.patch`, `Api.delete`) or the `useApi` hook.
- If data is empty or loading, render proper UI loading skeletons, spinners, or empty states.

---

## 1. Unified API Client Usage (`@/lib/api`)

Your frontend contains a unified API client module at `frontend/lib/api.ts`. All network calls MUST go through this module.

### A. Direct Async Calls (`Api.get`, `Api.post`, etc.)
```typescript
import { Api } from '@/lib/api';

// GET Request
const response = await Api.get<Order[]>('/orders.php', {
  params: { status: 'pending' },
  forceRefresh: true // optional: bypass client cache when needed
});

if (response.success && response.data) {
  console.log('Orders loaded:', response.data);
} else {
  console.error('API Error:', response.error);
}

// POST Request
const res = await Api.post('/orders.php', {
  customer_name: 'John Doe',
  customer_phone: '012345678',
  fulfillment_type: 'delivery'
});
```

### B. Declarative React Hook (`useApi`)
For client components that fetch data on mount:
```typescript
'use client';

import { useApi } from '@/lib/api';

export default function OrderList() {
  const { data: orders, loading, error, refresh } = useApi<Order[]>('/orders.php');

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error loading orders: {error}</div>;
  if (!orders || orders.length === 0) return <div>No orders found.</div>;

  return (
    <div>
      {orders.map((order) => (
        <div key={order.id}>{order.order_number}</div>
      ))}
      <button onClick={refresh}>Refresh Orders</button>
    </div>
  );
}
```

---

## 2. Zustand Store Integration Standard

When building global stores in `frontend/store/` or `frontend/lib/store/`:
- Call `Api.<method>()` inside store actions.
- Store real backend response objects into Zustand state.

```typescript
import { create } from 'zustand';
import { Api } from '@/lib/api';

interface FoodStore {
  foods: Food[];
  loading: boolean;
  error: string | null;
  fetchFoods: () => Promise<void>;
}

export const useFoodStore = create<FoodStore>((set) => ({
  foods: [],
  loading: false,
  error: null,

  fetchFoods: async () => {
    set({ loading: true, error: null });
    const res = await Api.get<Food[]>('/foods.php');
    if (res.success && res.data) {
      set({ foods: res.data, loading: false });
    } else {
      set({ error: res.error || 'Failed to fetch foods', loading: false });
    }
  },
}));
```

---

## 3. Handling API Endpoint Pendings & Errors
If a backend endpoint is still under development:
1. Handle the non-200 / error state gracefully in UI (e.g. "Endpoint coming soon" or error toast).
2. Do **NOT** populate mock arrays to pretend the API works.
3. Coordinate with `Role: Backend` or `Role: Fullstack` to implement the endpoint in `backend/api/`.

---

## 4. Verification Checklist
- [ ] Zero `mockData` / `dummyData` variables in component files or store files.
- [ ] All network calls imported from `@/lib/api`.
- [ ] Proper loading skeleton / spinner while fetching.
- [ ] Error toasts / alerts displayed when `response.success` is `false`.
