export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "in_transit"
  | "delivered"
  | "picked_up"
  | "cancelled";

export type OrderChannel = "delivery" | "pickup" | "pos";

export type PaymentMethod = "cod" | "khqr" | "apple_pay" | "card" | "cash";

export interface OrderModifier {
  text: string;
  isAlert?: boolean;
  isPrimary?: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  basePrice?: number;
  imageUrl?: string;
  modifiers?: OrderModifier[];
  unitDescription?: string;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  customerTag?: string;
  channel: OrderChannel;
  channelLabel: string;
  placedTimeLabel: string;
  timeAgoLabel: string;
  status: OrderStatus;
  statusLabel: string;
  itemsSummary: string;
  totalItemsCount: number;
  items: OrderItem[];
  totalPrice: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: string;
  paymentBadgeLabel: string;
  paymentIsPaid: boolean;
  deliveryAddress?: string;
  deliveryAddressCity?: string;
  deliveryNote?: string;
  kitchenStation?: string;
  estimatedPrepMinutes?: number;
  lifecycleStep: number; // 1: Placed, 2: Accepted, 3: Preparing, 4: Ready, 5: Delivery, 6: Done
  proofImageUrl?: string;
  isCodVerifiedByDriver?: boolean;
  isAdminVerified?: boolean;
  cancelReason?: string;
}
