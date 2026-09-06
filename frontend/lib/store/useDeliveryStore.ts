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
      const authUserId = useAuthStore.getState().userId;
      const staffIdQuery = authUserId ? `?staff_id=${authUserId}` : "";
      const res = await Api.get(`/delivery.php${staffIdQuery}`, undefined, { forceRefresh: true });
      if (res.success && res.data) {
        if (typeof res.data.is_online === "boolean") {
          set({ isOnline: res.data.is_online });
        }
        if (Array.isArray(res.data.orders)) {
          const liveOrders: DeliveryOrder[] = res.data.orders.map((o: any) => {
            const isCod =
              o.payment_method === "cod" ||
              o.payment_method === "cash_on_delivery";
            const isCompleted =
              o.status === "completed" || o.status === "delivered";
            const isOnWay = o.status === "on_the_way";

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
              prepStatus: isOnWay
                ? "Out for Delivery"
                : isCompleted
                ? "Delivered & Completed"
                : "Ready for Pickup",
              prepStatusType: isOnWay
                ? "urgent"
                : isCompleted
                ? "ready"
                : "ready",
              totalPrice: Number(o.total_amount || 0),
              itemCount: itemsList.length > 0 ? itemsList.length : 1,
              distance: "1.8 mi",
              eta: "10 min",
              address: o.delivery_address || "Customer Delivery Address",
              dropOffInstruction: o.notes || "Ring bell upon arrival.",
              itemsSummary: itemsSummary,
              itemImage:
                itemsList[0]?.image ||
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
              itemsList: itemsList,
              paymentType: isCod ? "cod" : "khqr",
              codAmount: isCod ? Number(o.total_amount || 0) : undefined,
              deliveryStage: isCompleted
                ? "completed"
                : isOnWay
                ? "picked_up"
                : "accepted",
              storeLat: o.store?.lat ? Number(o.store.lat) : undefined,
              storeLng: o.store?.lng ? Number(o.store.lng) : undefined,
              storeName: o.store?.name || undefined,
              storeAddress: o.store?.address || undefined,
              deliveryLat: o.delivery_lat ? Number(o.delivery_lat) : undefined,
              deliveryLng: o.delivery_lng ? Number(o.delivery_lng) : undefined,
              driverLat: o.driver_lat ? Number(o.driver_lat) : undefined,
              driverLng: o.driver_lng ? Number(o.driver_lng) : undefined,
              driverSpeed: o.driver_speed ? Number(o.driver_speed) : undefined,
            };
          });

          const available = liveOrders.filter(
            (o) => o.deliveryStage !== "completed" && o.deliveryStage !== "picked_up"
          );
          const assigned = liveOrders.filter(
            (o) => o.deliveryStage === "picked_up" || o.deliveryStage === "accepted"
          );

          set({
            availableOrders: available,
            myDeliveries: assigned,
            isLoading: false,
          });
          return;
        }
      }
    } catch (err) {
      console.error("Failed to fetch live delivery orders:", err);
    }
    set({ isLoading: false });
  },

  fetchOrderById: async (id: string) => {
    try {
      const res = await Api.get(`/delivery.php`, { order_id: id }, { forceRefresh: true });
      if (res.success && res.data) {
        const o = res.data;
        const isCod =
          o.payment_method === "cod" ||
          o.payment_method === "cash_on_delivery";
        const isCompleted =
          o.status === "completed" || o.status === "delivered";
        const isOnWay = o.status === "on_the_way";

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

        const order: DeliveryOrder = {
          id: String(o.id),
          orderNumber: o.order_number
            ? o.order_number.startsWith("#")
              ? o.order_number
              : `#${o.order_number}`
            : `#${o.id}`,
          customerName: o.customer_name || "Customer",
          customerPhone: o.customer_phone || "+855 12 345 678",
          prepStatus: isOnWay
            ? "Out for Delivery"
            : isCompleted
            ? "Delivered & Completed"
            : "Ready for Pickup",
          prepStatusType: isOnWay
            ? "urgent"
            : isCompleted
            ? "ready"
            : "ready",
          totalPrice: Number(o.total_amount || 0),
          itemCount: itemsList.length > 0 ? itemsList.length : 1,
          distance: "1.8 mi",
          eta: "10 min",
          address: o.delivery_address || "Customer Delivery Address",
          dropOffInstruction: o.notes || "Ring bell upon arrival.",
          itemsSummary: itemsSummary,
          itemImage:
            itemsList[0]?.image ||
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
          itemsList: itemsList,
          paymentType: isCod ? "cod" : "khqr",
          codAmount: isCod ? Number(o.total_amount || 0) : undefined,
          deliveryStage: isCompleted
            ? "completed"
            : isOnWay
            ? "picked_up"
            : "accepted",
          storeLat: o.store?.lat ? Number(o.store.lat) : undefined,
          storeLng: o.store?.lng ? Number(o.store.lng) : undefined,
          storeName: o.store?.name || undefined,
          storeAddress: o.store?.address || undefined,
          deliveryLat: o.delivery_lat ? Number(o.delivery_lat) : undefined,
          deliveryLng: o.delivery_lng ? Number(o.delivery_lng) : undefined,
          driverLat: o.driver_lat ? Number(o.driver_lat) : undefined,
          driverLng: o.driver_lng ? Number(o.driver_lng) : undefined,
          driverSpeed: o.driver_speed ? Number(o.driver_speed) : undefined,
        };

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
