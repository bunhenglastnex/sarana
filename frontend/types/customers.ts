export type CustomerTag = "VIP" | "Regular" | "New" | "High Spend";

export interface CustomerOrder {
  id: string;
  dateLabel: string;
  itemsSummary: string;
  totalPrice: number;
  channel: "delivery" | "pickup";
  paymentBadge: string;
  paymentIsPaid: boolean;
  proofImageUrl?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  tag: CustomerTag;
  totalOrders: number;
  totalSpend: number;
  preferredChannel: "delivery" | "pickup";
  paymentPreference: string;
  lastOrderDate: string;
  address?: string;
  notes?: string;
  orders: CustomerOrder[];
}
