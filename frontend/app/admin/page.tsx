'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, OrdersApiResponse } from '@/types';
import { Api } from '@/lib/api';

// Structured Mock Orders (Fallback if backend not yet running)
const INITIAL_ORDERS: Order[] = [
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
    items: [{ food_id: 1, food_name: 'Double Cheeseburger', quantity: 2, price: '4.50' }]
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
    items: [{ food_id: 1, food_name: 'Double Cheeseburger', quantity: 1, price: '4.50' }]
  },
  {
    id: 3,
    order_number: 'ORD-1003',
    customer_name: 'Sokha Mean',
    customer_phone: '097 555 111',
    fulfillment_type: 'delivery',
    delivery_address: 'St 315, Toul Kork',
    delivery_fee: '2.00',
    food_amount: '8.40',
    total_amount: '10.40',
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    status: 'pending',
    items: [{ food_id: 3, food_name: 'Spicy Chicken Wings (6pcs)', quantity: 2, price: '4.20' }]
  }
];

export default function KitchenAdminPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCached, setIsCached] = useState<boolean>(false);

  const loadOrders = async (force = false) => {
    setLoading(true);
    const res = await Api.get<OrdersApiResponse>('/api/orders.php', undefined, {
      forceRefresh: force,
    });

    if (res.success && res.data?.orders && res.data.orders.length > 0) {
      setOrders(res.data.orders);
      setIsCached(res.fromCache);
    } else {
      setIsCached(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId: number, nextStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: nextStatus } : ord))
    );

    // Call Backend API with PATCH (Automatically invalidates cache)
    await Api.patch('/api/order-status.php', {
      order_id: orderId,
      status: nextStatus,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold">Kitchen Admin - Order Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connected to <code className="text-primary font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Api.get('/api/orders.php')</code> and <code className="text-primary font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Api.patch('/api/order-status.php')</code>.
        </p>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Active Orders List ({orders.length})</h2>
            {isCached ? (
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                ⚡ From Cache (មិនទាញឡើងវិញពេលប្ដូរ page)
              </span>
            ) : (
              <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
                🌐 From Server
              </span>
            )}
          </div>
          <button
            onClick={() => loadOrders(true)}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted/60 border border-border"
          >
            {loading ? 'កំពុងទាញ...' : '🔄 Force Refresh'}
          </button>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-border rounded-lg p-4 bg-background space-y-3 text-sm"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border/50 pb-2">
                <div>
                  <span className="font-bold text-base text-primary mr-3">{order.order_number}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-medium bg-muted border border-border">
                    {order.fulfillment_type === 'delivery' ? 'Delivery (Doorstep)' : 'In-Store Pickup'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Status: {order.status}
                </span>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><strong>Customer:</strong> {order.customer_name} ({order.customer_phone})</div>
                <div>
                  {order.fulfillment_type === 'delivery' ? (
                    <span><strong>Address:</strong> {order.delivery_address}</span>
                  ) : (
                    <span><strong>Pickup Time:</strong> {order.pickup_time || 'ASAP'}</span>
                  )}
                </div>
                <div><strong>Payment:</strong> {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Cash at Counter'}</div>
                <div><strong>Total Payable:</strong> <span className="text-foreground font-bold">${Number(order.total_amount).toFixed(2)}</span></div>
              </div>

              {/* Items */}
              <div className="text-xs bg-muted/40 p-2.5 rounded border border-border/40 space-y-1">
                <div className="font-semibold text-muted-foreground">Ordered Items:</div>
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.food_name} x {item.quantity}</span>
                    <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Action Controls */}
              <div className="pt-2 flex gap-2 flex-wrap text-xs">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(order.id, 'accepted')}
                    className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded hover:opacity-90"
                  >
                    Accept Order
                  </button>
                )}

                {order.status === 'accepted' && (
                  <button
                    onClick={() => updateStatus(order.id, 'preparing')}
                    className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded hover:opacity-90"
                  >
                    Start Preparing Food
                  </button>
                )}

                {order.status === 'preparing' && (
                  <>
                    {order.fulfillment_type === 'delivery' ? (
                      <button
                        onClick={() => updateStatus(order.id, 'ready_for_delivery')}
                        className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded hover:bg-blue-500"
                      >
                        Ready ➔ Notify Delivery Staff
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(order.id, 'ready_for_pickup')}
                        className="px-3 py-1.5 bg-purple-600 text-white font-semibold rounded hover:bg-purple-500"
                      >
                        Ready ➔ Notify Customer for Pickup
                      </button>
                    )}
                  </>
                )}

                {order.status === 'ready_for_pickup' && (
                  <button
                    onClick={() => updateStatus(order.id, 'completed')}
                    className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-500"
                  >
                    Handover Food & Collect Cash (${Number(order.total_amount).toFixed(2)}) ➔ Complete
                  </button>
                )}

                {order.status === 'ready_for_delivery' && (
                  <span className="text-xs text-blue-400 py-1.5">
                    Waiting for delivery staff to pickup from kitchen...
                  </span>
                )}

                {order.status === 'on_the_way' && (
                  <span className="text-xs text-amber-400 py-1.5">
                    Delivery staff is on the way to customer...
                  </span>
                )}

                {order.status === 'completed' && (
                  <span className="text-xs text-emerald-400 font-bold py-1.5">
                    ✓ Order Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
