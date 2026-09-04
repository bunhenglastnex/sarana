'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, Clock, UtensilsCrossed, Truck, ShoppingBag, Phone, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order, OrderStatus } from '@/types';

// Default mock orders for demo if backend isn't running
const DEFAULT_ORDERS: Order[] = [
  {
    id: 1,
    order_number: 'ORD-1001',
    customer_name: 'Dara Roth',
    customer_phone: '012 999 888',
    fulfillment_type: 'delivery',
    delivery_address: 'House #12, St 210, Toul Kork, Phnom Penh',
    delivery_fee: '2.00',
    food_amount: '9.00',
    total_amount: '11.00',
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    status: 'ready_for_delivery',
    items: [{ food_id: 1, food_name: 'Classic Double Cheeseburger', quantity: 2, price: '4.50' }]
  },
  {
    id: 2,
    order_number: 'ORD-1002',
    customer_name: 'Kanha Seng',
    customer_phone: '088 777 666',
    fulfillment_type: 'pickup',
    pickup_time: 'Within 20 mins',
    delivery_fee: '0.00',
    food_amount: '4.50',
    total_amount: '4.50',
    payment_method: 'cash_at_counter',
    payment_status: 'pending',
    status: 'preparing',
    items: [{ food_id: 1, food_name: 'Classic Double Cheeseburger', quantity: 1, price: '4.50' }]
  }
];

export default function KitchenAdminPage() {
  const [orders, setOrders] = useState<Order[]>(DEFAULT_ORDERS);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/orders.php');
      const data = await res.json();
      if (data.success && data.orders?.length > 0) {
        setOrders(data.orders);
      }
    } catch {
      // Keep mock orders if backend is offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await fetch('http://localhost:8000/api/order-status.php', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus })
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
            <span>🏪</span>
            <span>ផ្ទាំងផ្ទះបាយ និង Order (Kitchen Dashboard)</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            តាមដាន និងផ្លាស់ប្តូរស្ថានភាពកុម្ម៉ង់សម្រាប់ Pickup និង Delivery
          </p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'កំពុងទាញយក...' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card 
            key={order.id} 
            className={`overflow-hidden border-l-4 ${order.fulfillment_type === 'delivery' ? 'border-l-blue-500' : 'border-l-purple-500'}`}
          >
            <CardHeader className="p-5 pb-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-foreground">{order.order_number}</span>
                  <Badge variant={order.fulfillment_type === 'delivery' ? 'delivery' : 'pickup'}>
                    {order.fulfillment_type === 'delivery' ? (
                      <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Delivery</span>
                    ) : (
                      <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Pickup</span>
                    )}
                  </Badge>
                </div>
                <Badge variant="warning" className="uppercase text-xs font-bold">
                  Status: {order.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-background/60 border border-border/50 p-3.5 rounded-xl text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span><strong>ភ្ញៀវ:</strong> {order.customer_name} ({order.customer_phone})</span>
                </div>
                {order.fulfillment_type === 'delivery' ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span><strong>អាសយដ្ឋាន:</strong> {order.delivery_address}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span><strong>ម៉ោងមកយក:</strong> {order.pickup_time || 'ឆាប់ៗនេះ'}</span>
                  </div>
                )}
                <div>
                  <strong>💵 ការបង់ប្រាក់:</strong> {order.payment_method === 'cash_on_delivery' ? 'លុយសុទ្ធពេលដឹកដល់ (COD)' : 'លុយសុទ្ធនៅបញ្ជរ'}
                </div>
                <div>
                  <strong>💰 តម្លៃសរុប:</strong> <span className="text-primary font-bold text-base">${Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1.5">មុខម្ហូប៖</div>
                <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-0.5">
                  {order.items?.map((it, idx) => (
                    <li key={idx}>
                      {it.food_name} x <strong className="text-primary">{it.quantity}</strong> (${Number(it.price).toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons based on status */}
              <div className="flex flex-wrap gap-2.5 pt-2 border-t border-border/40">
                {order.status === 'pending' && (
                  <Button onClick={() => updateStatus(order.id, 'accepted')} className="gap-2">
                    <Check className="w-4 h-4" /> ទទួល Order (Accept)
                  </Button>
                )}

                {order.status === 'accepted' && (
                  <Button onClick={() => updateStatus(order.id, 'preparing')} className="gap-2">
                    <UtensilsCrossed className="w-4 h-4" /> ចាប់ផ្ដើមធ្វើម្ហូប (Preparing)
                  </Button>
                )}

                {order.status === 'preparing' && (
                  <>
                    {order.fulfillment_type === 'delivery' ? (
                      <Button onClick={() => updateStatus(order.id, 'ready_for_delivery')} variant="success" className="gap-2">
                        <Truck className="w-4 h-4" /> ម្ហូបរួចរាល់ ➔ ផ្ដល់ដំណឹងឱ្យ Delivery
                      </Button>
                    ) : (
                      <Button onClick={() => updateStatus(order.id, 'ready_for_pickup')} variant="success" className="gap-2">
                        <ShoppingBag className="w-4 h-4" /> ម្ហូបរួចរាល់ ➔ ផ្ដល់ដំណឹងឱ្យភ្ញៀវមកយក
                      </Button>
                    )}
                  </>
                )}

                {order.status === 'ready_for_pickup' && (
                  <Button onClick={() => updateStatus(order.id, 'completed')} className="gap-2">
                    <Check className="w-4 h-4" /> ប្រគល់ម្ហូប & ទទួលលុយសុទ្ធ (${Number(order.total_amount).toFixed(2)}) ➔ បញ្ចប់
                  </Button>
                )}

                {order.status === 'ready_for_delivery' && (
                  <div className="flex items-center gap-2 text-xs text-blue-400 font-medium bg-blue-500/10 p-2.5 rounded-lg w-full">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span>កំពុងរង់ចាំអ្នកដឹកជញ្ជូន (Delivery Staff) មកទទួលយកម្ហូប...</span>
                  </div>
                )}

                {order.status === 'on_the_way' && (
                  <div className="flex items-center gap-2 text-xs text-pink-400 font-medium bg-pink-500/10 p-2.5 rounded-lg w-full">
                    <Truck className="w-4 h-4 animate-bounce" />
                    <span>អ្នកដឹកកំពុងធ្វើដំណើរទៅផ្ទះភ្ញៀវ...</span>
                  </div>
                )}

                {order.status === 'completed' && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-lg w-full">
                    <Check className="w-4 h-4" />
                    <span>Order បញ្ចប់ដោយជោគជ័យ</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
