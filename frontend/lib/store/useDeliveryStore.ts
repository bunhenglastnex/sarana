import { create } from "zustand";
import { Api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";

export interface DeliveryItemDetail {
  id: string;
  name: string;
  quantity: number;
  optionsNote?: string;
  image: string;
  isVerified?: boolean;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  createdAt?: string;
  timeAgo?: string;
  prepStatus: string;
  prepStatusType: "urgent" | "warning" | "ready";
  totalPrice: number;
  itemCount: number;
  distance: string;
  eta: string;
  address: string;
  dropOffDistrict?: string;
  dropOffInstruction?: string;
  estDropOffWindow?: string;
  estTimeLeft?: string;
  itemsSummary: string;
  itemsNote?: string;
  itemImage: string;
  itemsList?: DeliveryItemDetail[];
  paymentType: "cod" | "khqr";
  codAmount?: number;
  khqrNote?: string;
  tipAmount?: number;
  deliveryStage?: "accepted" | "picked_up" | "arrived" | "completed";
  storeLat?: number;
  storeLng?: number;
  storeName?: string;
  storeAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  driverLat?: number;
  driverLng?: number;
  driverSpeed?: number;
}

interface DeliveryState {
  isOnline: boolean;
  activeZone: string;
  availableOrders: DeliveryOrder[];
  myDeliveries: DeliveryOrder[];
  completedHistory: DeliveryOrder[];
  toastMessage: string | null;
  selectedFilter: string;
  isLoading: boolean;

  toggleShift: () => void;
  setOnline: (online: boolean) => void;
  setSelectedFilter: (filter: string) => void;
  acceptOrder: (orderId: string) => void;
  updateDeliveryStage: (orderId: string, stage: DeliveryOrder["deliveryStage"]) => void;
  updateCourierLocation: (lat: number, lng: number, speed?: number) => Promise<void>;
  showToast: (msg: string) => void;
  clearToast: () => void;
  resetAvailableOrders: () => void;
  fetchLiveOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<DeliveryOrder | undefined>;
  getOrderById: (id: string) => DeliveryOrder | undefined;
}

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getTimeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const formatted = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T");
  const created = new Date(formatted).getTime();
  if (isNaN(created)) return "";
  const now = Date.now();
  const diffMinutes = Math.floor((now - created) / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getDistanceAndEta(
  storeLat?: number,
  storeLng?: number,
  deliveryLat?: number,
  deliveryLng?: number
): { distance: string; eta: string } {
  if (storeLat && storeLng && deliveryLat && deliveryLng) {
    const distKm = calculateDistanceKm(storeLat, storeLng, deliveryLat, deliveryLng);
    const distMiles = distKm * 0.621371;
    const estMinutes = Math.max(5, Math.round((distKm / 20) * 60 + 5));
    return {
      distance: `${distMiles.toFixed(1)} mi`,
      eta: `${estMinutes} min drive`,
    };
  }
  return {
    distance: "1.8 mi",
    eta: "10 min drive",
  };
}

export function mapRawOrderToDeliveryOrder(o: any): DeliveryOrder {
  const isCod = o.payment_method === "cod" || o.payment_method === "cash_on_delivery";
  const isCompleted = o.status === "completed" || o.status === "delivered";
  const isOnWay = o.status === "on_the_way";

  const storeLat = o.store?.lat ? Number(o.store.lat) : undefined;
  const storeLng = o.store?.lng ? Number(o.store.lng) : undefined;
  const deliveryLat = o.delivery_lat ? Number(o.delivery_lat) : undefined;
  const deliveryLng = o.delivery_lng ? Number(o.delivery_lng) : undefined;

  const { distance, eta } = getDistanceAndEta(storeLat, storeLng, deliveryLat, deliveryLng);
  const createdAt = o.created_at ? String(o.created_at) : undefined;
  const timeAgo = getTimeAgo(o.created_at);

  const itemsList: DeliveryItemDetail[] = Array.isArray(o.items)
    ? o.items.map((i: any) => ({
        id: String(i.id || i.food_id),
        name: i.food_name || "Menu Item",
        quantity: Number(i.quantity || 1),
        optionsNote: i.notes || undefined,
        image:
          i.image_url ||
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
        isVerified: true,
      }))
    : [];

  const itemsSummary =
    itemsList.length > 0
      ? itemsList.map((i) => `${i.quantity}x ${i.name}`).join(", ")
      : "Delivery Order Ticket";

  return {
    id: String(o.id),
    orderNumber: o.order_number
      ? o.order_number.startsWith("#")
        ? o.order_number
        : `#${o.order_number}`
      : `#${o.id}`,
    customerName: o.customer_name || "Customer",
    customerPhone: o.customer_phone || "+855 12 345 678",
    createdAt,
    timeAgo,
    prepStatus: isOnWay
      ? "Out for Delivery"
      : isCompleted
      ? "Delivered & Completed"
      : "Ready for Pickup",
    prepStatusType: isOnWay ? "urgent" : isCompleted ? "ready" : "ready",
    totalPrice: Number(o.total_amount || 0),
    itemCount: itemsList.length > 0 ? itemsList.length : 1,
    distance,
    eta,
    address: o.delivery_address || "Customer Delivery Address",
    dropOffInstruction: o.notes || "Ring bell upon arrival.",
    itemsSummary,
    itemImage:
      itemsList[0]?.image ||
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
    itemsList,
    paymentType: isCod ? "cod" : "khqr",
    codAmount: isCod ? Number(o.total_amount || 0) : undefined,
    deliveryStage: isCompleted
      ? "completed"
      : isOnWay
      ? "picked_up"
      : "accepted",
    storeLat,
    storeLng,
    storeName: o.store?.name || undefined,
    storeAddress: o.store?.address || undefined,
    deliveryLat,
    deliveryLng,
    driverLat: o.driver_lat ? Number(o.driver_lat) : undefined,
    driverLng: o.driver_lng ? Number(o.driver_lng) : undefined,
    driverSpeed: o.driver_speed ? Number(o.driver_speed) : undefined,
  };
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  isOnline: true,
  activeZone: "Zone 1 • Downtown Hearth",
  availableOrders: [],
  myDeliveries: [],
  completedHistory: [],
  toastMessage: null,
  selectedFilter: "all",
  isLoading: false,

  toggleShift: async () => {
    const current = get().isOnline;
    const nextState = !current;
    set({
      isOnline: nextState,
      toastMessage: nextState
        ? "You are now Online and receiving deliveries."
        : "Shift paused. No new tickets will be assigned.",
    });

    try {
      const authUserId = useAuthStore.getState().userId;
      await Api.post("/delivery.php", {
        action: "update_duty_status",
        staff_id: authUserId ? Number(authUserId) : undefined,
        is_online: nextState,
        status: nextState ? "active" : "offline",
      });
    } catch (err) {
      console.error("Failed to sync shift status to server:", err);
    }
  },

  setOnline: (online) => set({ isOnline: online }),

  setSelectedFilter: (filter) => set({ selectedFilter: filter }),

  updateCourierLocation: async (lat, lng, speed = 0) => {
    try {
      const authUserId = useAuthStore.getState().userId;
      await Api.post("/delivery.php", {
        action: "update_location",
        staff_id: authUserId ? Number(authUserId) : undefined,
        lat,
        lng,
        speed,
      });
    } catch (err) {
      console.error("Failed to update driver real-time GPS in database:", err);
    }
  },

  acceptOrder: async (orderId) => {
    const orderToAccept = get().availableOrders.find((o) => o.id === orderId);

    set((state) => ({
      availableOrders: state.availableOrders.filter((o) => o.id !== orderId),
      myDeliveries: orderToAccept
        ? [
            ...state.myDeliveries.filter((o) => o.id !== orderId),
            { ...orderToAccept, prepStatus: "Assigned & In Progress", deliveryStage: "accepted" },
          ]
        : state.myDeliveries,
      toastMessage: orderToAccept
        ? `Assigned Order ${orderToAccept.orderNumber} to your route!`
        : `Order #${orderId} accepted!`,
    }));

    try {
      const authUserId = useAuthStore.getState().userId;
      await Api.post("/delivery.php", {
        action: "accept_order",
        order_id: Number(orderId),
        staff_id: authUserId ? Number(authUserId) : undefined,
      });
      await get().fetchLiveOrders();
    } catch (err) {
      console.error("Failed to accept order on server:", err);
    }
  },

  updateDeliveryStage: (orderId, stage) => {
    set((state) => ({
      myDeliveries: state.myDeliveries.map((order) => {
        if (order.id === orderId) {
          const prepText =
            stage === "picked_up"
              ? "Out for Delivery"
              : stage === "arrived"
              ? "Arrived at Drop-off"
              : stage === "completed"
              ? "Delivered & Completed"
              : order.prepStatus;
          return { ...order, deliveryStage: stage, prepStatus: prepText };
        }
        return order;
      }),
    }));
  },

  showToast: (msg) => set({ toastMessage: msg }),
  clearToast: () => set({ toastMessage: null }),

  resetAvailableOrders: () => {
    set({
      toastMessage: "Feed synced with Hearth kitchen dispatch.",
    });
    get().fetchLiveOrders();
  },

  fetchLiveOrders: async () => {
    set({ isLoading: true });
    try {
      const [resAvailable, resMyDeliveries, resHistory] = await Promise.all([
        Api.get("/delivery-available.php", undefined, { forceRefresh: true }),
        Api.get("/delivery-my-deliveries.php", undefined, { forceRefresh: true }),
        Api.get("/delivery-history.php", { period: "all" }, { forceRefresh: true }),
      ]);

      let availableOrders: DeliveryOrder[] = [];
      let myDeliveries: DeliveryOrder[] = [];
      let completedHistory: DeliveryOrder[] = [];

      if (resAvailable.success && resAvailable.data) {
        const rawAvail = Array.isArray(resAvailable.data.orders)
          ? resAvailable.data.orders
          : Array.isArray(resAvailable.data)
          ? resAvailable.data
          : [];
        availableOrders = rawAvail.map(mapRawOrderToDeliveryOrder);
      }

      if (resMyDeliveries.success && resMyDeliveries.data) {
        if (typeof resMyDeliveries.data.is_online === "boolean") {
          set({ isOnline: resMyDeliveries.data.is_online });
        }
        const rawMy = Array.isArray(resMyDeliveries.data.orders)
          ? resMyDeliveries.data.orders
          : Array.isArray(resMyDeliveries.data)
          ? resMyDeliveries.data
          : [];
        myDeliveries = rawMy.map(mapRawOrderToDeliveryOrder);
      }

      if (resHistory.success && resHistory.data) {
        const rawHist = Array.isArray(resHistory.data.orders)
          ? resHistory.data.orders
          : [];
        completedHistory = rawHist.map(mapRawOrderToDeliveryOrder);
      }

      set({
        availableOrders,
        myDeliveries,
        completedHistory,
        isLoading: false,
      });
    } catch (err) {
      console.error("Failed to fetch live delivery orders:", err);
      set({ isLoading: false });
    }
  },

  fetchOrderById: async (id: string) => {
    try {
      const res = await Api.get(`/delivery.php`, { order_id: id }, { forceRefresh: true });
      if (res.success && res.data) {
        const order = mapRawOrderToDeliveryOrder(res.data);

        // Cache into myDeliveries state
        set((state) => {
          const exists = state.myDeliveries.some((item) => item.id === order.id);
          return {
            myDeliveries: exists
              ? state.myDeliveries.map((item) => (item.id === order.id ? order : item))
              : [...state.myDeliveries, order],
          };
        });

        return order;
      }
    } catch (err) {
      console.error(`Failed to fetch order #${id}:`, err);
    }
    return undefined;
  },

  getOrderById: (id) => {
    const { availableOrders, myDeliveries } = get();
    return (
      myDeliveries.find((o) => o.id === String(id) || o.orderNumber === `#${id}` || o.orderNumber === id) ||
      availableOrders.find((o) => o.id === String(id) || o.orderNumber === `#${id}` || o.orderNumber === id)
    );
  },
}));
