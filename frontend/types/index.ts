// frontend/types/index.ts
// Shared TypeScript interfaces for Restaurant Ordering System

export type FulfillmentType = 'delivery' | 'pickup';
export type PaymentMethod = 'cash_on_delivery' | 'cash_at_counter';
export type PaymentStatus = 'pending' | 'paid';
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'ready_for_delivery'
  | 'on_the_way'
  | 'completed'
  | 'cancelled';

export interface Category {
  id: number;
  name: string;
  icon: string; // Lucide icon name, e.g. 'sandwich', 'drumstick', etc.
}

export interface Food {
  id: number;
  category_id?: number | null;
  category_name?: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  is_available?: boolean | number;
}

export interface CartItem {
  food_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  food_id: number;
  food_name: string;
  price: number | string;
  quantity: number;
  subtotal?: number | string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  fulfillment_type: FulfillmentType;
  delivery_address?: string | null;
  delivery_fee: number | string;
  pickup_time?: string | null;
  food_amount: number | string;
  total_amount: number | string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  delivery_staff_id?: number | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  notes?: string | null;
  created_at?: string;
  items?: OrderItem[];
}

// API Payload & Response Types
export interface FoodsApiResponse {
  success: boolean;
  categories: Category[];
  foods: Food[];
  message?: string;
}

export interface OrdersApiResponse {
  success: boolean;
  orders: Order[];
  message?: string;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  fulfillment_type: FulfillmentType;
  delivery_address?: string;
  pickup_time?: string;
  notes?: string;
  items: { food_id: number; quantity: number }[];
}

export interface CreateOrderApiResponse {
  success: boolean;
  message: string;
  order_id?: number;
  order_number?: string;
}

export interface UpdateOrderStatusPayload {
  order_id: number;
  status: OrderStatus;
}

export interface DeliveryApiResponse {
  success: boolean;
  orders: Order[];
  cash_summary: {
    cash_in_hand: number | string;
    deliveries_completed: number | string;
  };
  message?: string;
}

