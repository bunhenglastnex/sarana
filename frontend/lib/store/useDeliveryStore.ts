import { create } from "zustand";

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
}

interface DeliveryState {
  isOnline: boolean;
  activeZone: string;
  availableOrders: DeliveryOrder[];
  myDeliveries: DeliveryOrder[];
  completedHistory: DeliveryOrder[];
  toastMessage: string | null;
  selectedFilter: string;

  toggleShift: () => void;
  setOnline: (online: boolean) => void;
  setSelectedFilter: (filter: string) => void;
  acceptOrder: (orderId: string) => void;
  updateDeliveryStage: (orderId: string, stage: DeliveryOrder["deliveryStage"]) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  resetAvailableOrders: () => void;
  getOrderById: (id: string) => DeliveryOrder | undefined;
}

const DEFAULT_ORDER_1024: DeliveryOrder = {
  id: "1024",
  orderNumber: "#1024",
  customerName: "John Smith",
  customerPhone: "+1 (555) 382-9012",
  prepStatus: "Ready for Pickup",
  prepStatusType: "ready",
  totalPrice: 34.5,
  itemCount: 3,
  distance: "2.4 mi",
  eta: "8 min",
  address: "742 Evergreen Terr, Apt 3B",
  dropOffDistrict: "River North Culinary District",
  dropOffInstruction: "Door code #4910. Ring bell twice, leave on vestibule shelf if no answer.",
  estDropOffWindow: "7:25 PM – 7:35 PM",
  estTimeLeft: "~14m left",
  itemsSummary: "2x Smoked Bacon Truffle Burger, 1x Artisan Fries, 2x Cold Craft Kola",
  itemsNote: "Includes special packaging bag #A-14",
  itemImage:
    "https://lh3.googleusercontent.com/aida/AEtjO1VGumJS4gDc1gzBZdH2Af5pYUVVpNPBGV7UxAFhMX2tE0L6w4YiCc7DZ3Dwo86tN09up_n0zsCB2yR0p4g7csdtSrincNfAwxRTXmRkAyu52GOhUf23Io342wbUL7P00Z9o8s3Iqda0Bs8IojLuECkHUiMqjKehivuHSIpVhhzCPFCik8O-j_pGM8DUyNAqVBRS6ivpfFqBGALIOkMwaMfuOoPzhG7YOd-NgbWNBSrXUyaQBDah21G1Lg",
  paymentType: "cod",
  codAmount: 34.5,
  tipAmount: 3.5,
  deliveryStage: "accepted",
  itemsList: [
    {
      id: "it-1",
      name: "Smoked Bacon Truffle Burger",
      quantity: 2,
      optionsNote: "Brioche bun, medium-well, extra aioli",
      image:
        "https://lh3.googleusercontent.com/aida/AEtjO1VGumJS4gDc1gzBZdH2Af5pYUVVpNPBGV7UxAFhMX2tE0L6w4YiCc7DZ3Dwo86tN09up_n0zsCB2yR0p4g7csdtSrincNfAwxRTXmRkAyu52GOhUf23Io342wbUL7P00Z9o8s3Iqda0Bs8IojLuECkHUiMqjKehivuHSIpVhhzCPFCik8O-j_pGM8DUyNAqVBRS6ivpfFqBGALIOkMwaMfuOoPzhG7YOd-NgbWNBSrXUyaQBDah21G1Lg",
      isVerified: true,
    },
    {
      id: "it-2",
      name: "Artisan Fries",
      quantity: 1,
      optionsNote: "Sea salt, truffle mayo dip",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCeKaQdth2z4GIWHeJriEusis7HNtnp-C5P_ff8ndrWH9Kjtgk2BwJZY5rnk-y0vzUfBiKfsviPIzR30ySODNEWpaw62uRnrHsSfrkV9msl6ZUX1u8enWvvyg7qfz8P9uE8K-1MBfM2f3GO-wlViypnPKvvr0Qr5VK9cutupeS4ElM4SS8EdHJEdySowjHnS9QAz1eBpuGGm0LjrTP-heeJcNgEHdSSzBBlkRctSaatH6ydP5kYXnf-",
      isVerified: true,
    },
    {
      id: "it-3",
      name: "Cold Craft Kola",
      quantity: 2,
      optionsNote: "Chilled 330ml bottles",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC8tNQnio32JzHTWcQQk4_LTVbGbKk6o4DnzzSxKMndQasYpCW9b9LrVRRiwPlzKcPadJOqzYMcelp6JpgSo12snvEV564njMKHjfTgt4xLoXARPmjkwSkUwRY2Fld3Yt2iUvXrI8VRmea2abrZPTNkfwhT8BbJsk33aOlabpEVtbzCCsmwTHJZmtSvAqsHW1yAUFCsiU8i7zYoky-1kHK5x43KCr_TD8nG87uK0p-f7hZp0B1Aggo6",
      isVerified: true,
    },
  ],
};

const DEFAULT_ORDER_1027: DeliveryOrder = {
  id: "1027",
  orderNumber: "#1027",
  customerName: "Elena Vance",
  customerPhone: "+1 (555) 891-2345",
  prepStatus: "Ready in 2 mins",
  prepStatusType: "warning",
  totalPrice: 22.5,
  itemCount: 2,
  distance: "3.2 mi",
  eta: "~18 min ride",
  address: "1104 Pine Valley Rd",
  dropOffDistrict: "Westside Hill",
  dropOffInstruction: "Leave with front desk security officer.",
  estDropOffWindow: "7:40 PM – 7:50 PM",
  estTimeLeft: "~20m left",
  itemsSummary: "1x Burrata Pizza, 1x Citrus Soda",
  itemsNote: "Hot insulated bag required",
  itemImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCAs_3nHdspRQGYU7Hth4N1RR0RvwJPHCp41n6Fgx30TfsWLBM4vfVC267B8chRib4kEXEGz2JFEVIVo-UakHEujDuSIvvKgRYMoRrO3fb7B5k9cLvRipIo9M3bardtIqiaDg0JWjAL2n0UhnCPh4no2mCrsLrdsJxyD2CIY5DutfAUfa_Jeg-FGUVhda953rfN3kxEKZcc2T2IpbHI86nueUCcu9WksbWNcI7VDki0yFnoe50DaJxU",
  paymentType: "khqr",
  khqrNote: "Contactless Delivery",
  tipAmount: 2.5,
  deliveryStage: "accepted",
  itemsList: [
    {
      id: "it-1027-1",
      name: "Burrata Pizza",
      quantity: 1,
      optionsNote: "Woodfired sourdough, fresh basil, buffalo burrata",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCAs_3nHdspRQGYU7Hth4N1RR0RvwJPHCp41n6Fgx30TfsWLBM4vfVC267B8chRib4kEXEGz2JFEVIVo-UakHEujDuSIvvKgRYMoRrO3fb7B5k9cLvRipIo9M3bardtIqiaDg0JWjAL2n0UhnCPh4no2mCrsLrdsJxyD2CIY5DutfAUfa_Jeg-FGUVhda953rfN3kxEKZcc2T2IpbHI86nueUCcu9WksbWNcI7VDki0yFnoe50DaJxU",
      isVerified: true,
    },
    {
      id: "it-1027-2",
      name: "Citrus Soda",
      quantity: 1,
      optionsNote: "Handcrafted chilled 330ml bottle",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC8tNQnio32JzHTWcQQk4_LTVbGbKk6o4DnzzSxKMndQasYpCW9b9LrVRRiwPlzKcPadJOqzYMcelp6JpgSo12snvEV564njMKHjfTgt4xLoXARPmjkwSkUwRY2Fld3Yt2iUvXrI8VRmea2abrZPTNkfwhT8BbJsk33aOlabpEVtbzCCsmwTHJZmtSvAqsHW1yAUFCsiU8i7zYoky-1kHK5x43KCr_TD8nG87uK0p-f7hZp0B1Aggo6",
      isVerified: true,
    },
  ],
};

const DEFAULT_ORDER_1029: DeliveryOrder = {
  id: "1029",
  orderNumber: "#1029",
  customerName: "Marcus Brody",
  customerPhone: "+1 (555) 432-1098",
  prepStatus: "Ready for Pickup",
  prepStatusType: "ready",
  totalPrice: 48.0,
  itemCount: 4,
  distance: "0.9 mi",
  eta: "~6 min ride",
  address: "450 Grand Blvd, Ste 12",
  dropOffDistrict: "Financial District",
  dropOffInstruction: "Ring doorbell twice.",
  estDropOffWindow: "7:15 PM – 7:25 PM",
  estTimeLeft: "~10m left",
  itemsSummary: "Crispy Smoked Chicken Tenders Feast",
  itemsNote: "Includes 4x artisanal sauces & pickles",
  itemImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDAJucYyWUB2y07Q-WJYsFJJZbgU6TkfcXkUJ3odpVN-46JbdOZmtWrB_JVud38JcNCUQfTa6yR4ffYWxFL7TKCrm9pMaIPGPoVLRLIqYXzeWNEAh8IOpys7UBowhE1O0AprNijSucIhfQ8OqrAOpW0BpIte9GMmIRgrUlPUeSBzvTZl62tGvOc-hc1xBOGIlGHogEpd01AaMZRms_k9io1OpKqf0nzJYg_20f7X0oY00aY48NyMeiT",
  paymentType: "khqr",
  khqrNote: "Leave at Door Guard",
  deliveryStage: "accepted",
  itemsList: [
    {
      id: "it-1029-1",
      name: "Crispy Smoked Chicken Tenders (6pcs)",
      quantity: 1,
      optionsNote: "Wood-smoked chili honey glaze",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDAJucYyWUB2y07Q-WJYsFJJZbgU6TkfcXkUJ3odpVN-46JbdOZmtWrB_JVud38JcNCUQfTa6yR4ffYWxFL7TKCrm9pMaIPGPoVLRLIqYXzeWNEAh8IOpys7UBowhE1O0AprNijSucIhfQ8OqrAOpW0BpIte9GMmIRgrUlPUeSBzvTZl62tGvOc-hc1xBOGIlGHogEpd01AaMZRms_k9io1OpKqf0nzJYg_20f7X0oY00aY48NyMeiT",
      isVerified: true,
    },
    {
      id: "it-1029-2",
      name: "Artisanal Dipping Sauces (4 flavors)",
      quantity: 1,
      optionsNote: "Truffle mayo, smoked BBQ, honey mustard, garlic aioli",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCeKaQdth2z4GIWHeJriEusis7HNtnp-C5P_ff8ndrWH9Kjtgk2BwJZY5rnk-y0vzUfBiKfsviPIzR30ySODNEWpaw62uRnrHsSfrkV9msl6ZUX1u8enWvvyg7qfz8P9uE8K-1MBfM2f3GO-wlViypnPKvvr0Qr5VK9cutupeS4ElM4SS8EdHJEdySowjHnS9QAz1eBpuGGm0LjrTP-heeJcNgEHdSSzBBlkRctSaatH6ydP5kYXnf-",
      isVerified: true,
    },
    {
      id: "it-1029-3",
      name: "House Pickles Jar",
      quantity: 1,
      optionsNote: "Dill & habanero spiced",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDAJucYyWUB2y07Q-WJYsFJJZbgU6TkfcXkUJ3odpVN-46JbdOZmtWrB_JVud38JcNCUQfTa6yR4ffYWxFL7TKCrm9pMaIPGPoVLRLIqYXzeWNEAh8IOpys7UBowhE1O0AprNijSucIhfQ8OqrAOpW0BpIte9GMmIRgrUlPUeSBzvTZl62tGvOc-hc1xBOGIlGHogEpd01AaMZRms_k9io1OpKqf0nzJYg_20f7X0oY00aY48NyMeiT",
      isVerified: true,
    },
    {
      id: "it-1029-4",
      name: "Chilled Craft Soda",
      quantity: 1,
      optionsNote: "330ml glass bottle",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC8tNQnio32JzHTWcQQk4_LTVbGbKk6o4DnzzSxKMndQasYpCW9b9LrVRRiwPlzKcPadJOqzYMcelp6JpgSo12snvEV564njMKHjfTgt4xLoXARPmjkwSkUwRY2Fld3Yt2iUvXrI8VRmea2abrZPTNkfwhT8BbJsk33aOlabpEVtbzCCsmwTHJZmtSvAqsHW1yAUFCsiU8i7zYoky-1kHK5x43KCr_TD8nG87uK0p-f7hZp0B1Aggo6",
      isVerified: true,
    },
  ],
};

const INITIAL_AVAILABLE_ORDERS: DeliveryOrder[] = [
  DEFAULT_ORDER_1024,
  DEFAULT_ORDER_1027,
  DEFAULT_ORDER_1029,
];

const INITIAL_MY_DELIVERIES: DeliveryOrder[] = [
  DEFAULT_ORDER_1024,
  {
    id: "1021",
    orderNumber: "#1021",
    customerName: "Sarah Jenkins",
    customerPhone: "+1 (555) 902-1144",
    prepStatus: "Out for Delivery",
    prepStatusType: "urgent",
    totalPrice: 28.0,
    itemCount: 2,
    distance: "1.2 mi",
    eta: "~8 min left",
    address: "882 Broadway St, Apt 2A",
    dropOffDistrict: "Downtown Corridor",
    dropOffInstruction: "Call when downstairs.",
    itemsSummary: "1x Artisan Pepperoni Pizza, 1x Iced Tea",
    itemsNote: "Ring doorbell twice",
    itemImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAs_3nHdspRQGYU7Hth4N1RR0RvwJPHCp41n6Fgx30TfsWLBM4vfVC267B8chRib4kEXEGz2JFEVIVo-UakHEujDuSIvvKgRYMoRrO3fb7B5k9cLvRipIo9M3bardtIqiaDg0JWjAL2n0UhnCPh4no2mCrsLrdsJxyD2CIY5DutfAUfa_Jeg-FGUVhda953rfN3kxEKZcc2T2IpbHI86nueUCcu9WksbWNcI7VDki0yFnoe50DaJxU",
    paymentType: "cod",
    codAmount: 28.0,
    deliveryStage: "picked_up",
    itemsList: [
      {
        id: "it-1021-1",
        name: "Artisan Pepperoni Pizza",
        quantity: 1,
        optionsNote: "Cupping pepperoni, hot honey drizzle",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCAs_3nHdspRQGYU7Hth4N1RR0RvwJPHCp41n6Fgx30TfsWLBM4vfVC267B8chRib4kEXEGz2JFEVIVo-UakHEujDuSIvvKgRYMoRrO3fb7B5k9cLvRipIo9M3bardtIqiaDg0JWjAL2n0UhnCPh4no2mCrsLrdsJxyD2CIY5DutfAUfa_Jeg-FGUVhda953rfN3kxEKZcc2T2IpbHI86nueUCcu9WksbWNcI7VDki0yFnoe50DaJxU",
        isVerified: true,
      },
      {
        id: "it-1021-2",
        name: "Fresh Brewed Iced Tea",
        quantity: 1,
        optionsNote: "Lemon & mint sweet tea",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC8tNQnio32JzHTWcQQk4_LTVbGbKk6o4DnzzSxKMndQasYpCW9b9LrVRRiwPlzKcPadJOqzYMcelp6JpgSo12snvEV564njMKHjfTgt4xLoXARPmjkwSkUwRY2Fld3Yt2iUvXrI8VRmea2abrZPTNkfwhT8BbJsk33aOlabpEVtbzCCsmwTHJZmtSvAqsHW1yAUFCsiU8i7zYoky-1kHK5x43KCr_TD8nG87uK0p-f7hZp0B1Aggo6",
        isVerified: true,
      },
    ],
  },
];

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  isOnline: true,
  activeZone: "Zone 1 • Downtown Hearth",
  availableOrders: INITIAL_AVAILABLE_ORDERS,
  myDeliveries: INITIAL_MY_DELIVERIES,
  completedHistory: [],
  toastMessage: null,
  selectedFilter: "all",

  toggleShift: () => {
    const current = get().isOnline;
    const nextState = !current;
    set({
      isOnline: nextState,
      toastMessage: nextState
        ? "You are now Online and receiving deliveries."
        : "Shift paused. No new tickets will be assigned.",
    });
  },

  setOnline: (online) => set({ isOnline: online }),

  setSelectedFilter: (filter) => set({ selectedFilter: filter }),

  acceptOrder: (orderId) => {
    const orderToAccept = get().availableOrders.find((o) => o.id === orderId);
    if (!orderToAccept) return;

    set((state) => ({
      availableOrders: state.availableOrders.filter((o) => o.id !== orderId),
      myDeliveries: [
        ...state.myDeliveries.filter((o) => o.id !== orderId),
        { ...orderToAccept, prepStatus: "Assigned & In Progress", deliveryStage: "accepted" },
      ],
      toastMessage: `Assigned Order ${orderToAccept.orderNumber} to your route!`,
    }));
  },

  updateDeliveryStage: (orderId, stage) => {
    set((state) => ({
      myDeliveries: state.myDeliveries.map((o) =>
        o.id === orderId ? { ...o, deliveryStage: stage } : o
      ),
    }));
  },

  showToast: (msg) => set({ toastMessage: msg }),
  clearToast: () => set({ toastMessage: null }),

  resetAvailableOrders: () =>
    set({
      availableOrders: INITIAL_AVAILABLE_ORDERS,
      toastMessage: "Feed synced with Hearth kitchen dispatch.",
    }),

  getOrderById: (id) => {
    const { availableOrders, myDeliveries } = get();
    const found =
      myDeliveries.find((o) => o.id === id) ||
      availableOrders.find((o) => o.id === id);

    if (found) return found;
    if (id === "1027") return DEFAULT_ORDER_1027;
    if (id === "1029") return DEFAULT_ORDER_1029;
    return DEFAULT_ORDER_1024;
  },
}));
