export type KdsOrderChannel = "delivery" | "pickup";

export type KdsOrderStatus = "pending" | "accepted" | "preparing" | "ready";

export interface KdsOrderItem {
  name: string;
  price: number;
  quantity: number;
  modifiers?: {
    text: string;
    isPrimary?: boolean;
    isAlert?: boolean;
  }[];
}

export interface KdsTicket {
  id: string; // e.g. "#1084"
  channel: KdsOrderChannel;
  status: KdsOrderStatus;
  timerLabel?: string; // e.g. "2m 15s" or "14m / 18m"
  isUrgent?: boolean;
  customerName: string;
  locationOrNote?: string;
  paymentBadge: string;
  paymentIsPaid?: boolean;
  proofImageUrl?: string;
  items: KdsOrderItem[];
  totalPrice: number;
  assignStation?: string;
  prepProgress?: number; // percentage 0-100
  shelfOrBag?: string;
  readyTimeAgo?: string;
  readySubtype?: "pickup" | "delivery";
}
