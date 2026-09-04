export interface Food {
  id: number;
  name: string;
  price: number;
  description?: string;
  category_name?: string;
  image_url?: string;
  is_available?: boolean;
}

export interface CartItem {
  food_id: number;
  name: string;
  price: number;
  quantity: number;
  food?: Food;
}

export type FulfillmentType = 'delivery' | 'pickup';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'ready_for_delivery'
  | 'on_the_way'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  id?: number;
  food_id: number;
  food_name: string;
  quantity: number;
  price: string | number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  fulfillment_type: FulfillmentType;
  delivery_address?: string;
  delivery_fee: string | number;
  food_amount: string | number;
  total_amount: string | number;
  payment_method: 'cash_on_delivery' | 'cash_at_counter';
  payment_status: 'pending' | 'paid';
  status: OrderStatus;
  notes?: string;
  created_at?: string;
  items: OrderItem[];
}

export interface FoodsApiResponse {
  foods: Food[];
  categories?: any[];
}

export interface CreateOrderApiResponse {
  success?: boolean;
  message?: string;
  order_id?: number;
  order_number: string;
  total_amount?: number;
  status?: OrderStatus;
}

export interface OrdersApiResponse {
  orders: Order[];
}

export interface DeliveryApiResponse {
  orders: Order[];
  cash_in_hand?: string | number;
}
