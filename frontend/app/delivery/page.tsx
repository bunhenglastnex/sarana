'use client';

import React, { useState, useEffect } from 'react';
import { Order, DeliveryApiResponse } from '@/types';
import { Api } from '@/lib/api';

// Sample Mock Delivery Orders (Fallback if backend offline)
const INITIAL_DELIVERY_TASKS: Order[] = [
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
    notes: 'Please ring the doorbell upon arrival',
    items: [{ food_id: 1, food_name: 'Double Cheeseburger', quantity: 2, price: '4.50' }]
  },
  {
    id: 4,
    order_number: 'ORD-1004',
    customer_name: 'Vannak Lim',
    customer_phone: '015 222 333',
    fulfillment_type: 'delivery',
    delivery_address: 'Condo De Castle, St 315, BKK1',
    delivery_fee: '2.00',
    food_amount: '14.00',
    total_amount: '16.00',
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    status: 'on_the_way',
    notes: 'Leave with lobby reception',
    items: [
      { food_id: 2, food_name: 'Crispy Chicken Burger', quantity: 2, price: '3.80' },
      { food_id: 3, food_name: 'Spicy Chicken Wings', quantity: 1, price: '4.20' },
      { food_id: 4, food_name: 'French Fries', quantity: 1, price: '2.00' }
    ]
  }
];

export default function DeliveryStaffPage() {
  const [tasks, setTasks] = useState<Order[]>(INITIAL_DELIVERY_TASKS);
  const [cashInHand, setCashInHand] = useState(25.00);
  const [completedCount, setCompletedCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);

  const loadDeliveries = async (force = false) => {
    setLoading(true);
    const res = await Api.get<DeliveryApiResponse>('/api/delivery.php', undefined, {
      forceRefresh: force,
    });

    if (res.success && res.data?.orders && res.data.orders.length > 0) {
      setTasks(res.data.orders);
      if (res.data.cash_summary) {
        setCashInHand(Number(res.data.cash_summary.cash_in_hand || 0));
        setCompletedCount(Number(res.data.cash_summary.deliveries_completed || 0));
      }
      setIsCached(res.fromCache);
    } else {
      setIsCached(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handlePickup = async (orderId: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === orderId ? { ...t, status: 'on_the_way' } : t))
    );

    await Api.post('/api/delivery.php', {
      action: 'pickup_from_kitchen',
      order_id: orderId,
    });
  };

  const handleConfirmDelivered = async (orderId: number, amount: number | string) => {
    setTasks((prev) => prev.filter((t) => t.id !== orderId));
    setCashInHand((prev) => prev + Number(amount));
    setCompletedCount((prev) => prev + 1);

    await Api.post('/api/delivery.php', {
      action: 'confirm_delivered',
      order_id: orderId,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold">Delivery Staff - Dispatch & Cash Collection</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connected to <code className="text-primary font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Api.get('/api/delivery.php')</code> and <code className="text-primary font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Api.post('/api/delivery.php')</code>.
        </p>
      </div>

      {/* Cash in Hand Card */}
      <div className="border border-border rounded-lg p-5 bg-card space-y-1">
        <div className="text-xs text-muted-foreground uppercase font-semibold">Total Cash in Hand (To Remit to Restaurant):</div>
        <div className="text-3xl font-bold text-primary">${cashInHand.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">
          Completed deliveries today: <strong className="text-foreground">{completedCount}</strong> orders.
        </div>
      </div>

      {/* Tasks List */}
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Assigned Deliveries ({tasks.length})</h2>
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
            onClick={() => loadDeliveries(true)}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted/60 border border-border"
          >
            {loading ? 'កំពុងទាញ...' : '🔄 Force Refresh'}
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No active delivery tasks assigned right now.
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border border-border rounded-lg p-4 bg-background space-y-3 text-sm"
              >
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="font-bold text-base text-primary">{task.order_number}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-medium bg-muted border border-border">
                    {task.status === 'ready_for_delivery' ? 'Ready at Kitchen' : 'On the Way to Customer'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div><strong>Customer:</strong> {task.customer_name} (<a href={`tel:${task.customer_phone}`} className="text-primary">{task.customer_phone}</a>)</div>
                  <div><strong>Address:</strong> {task.delivery_address}</div>
                  {task.notes && <div className="text-amber-400"><strong>Note:</strong> {task.notes}</div>}
                  <div className="pt-1 text-foreground font-semibold">
                    Amount to Collect in Cash: <span className="text-primary font-bold">${Number(task.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="text-xs bg-muted/40 p-2 rounded border border-border/40 space-y-0.5">
                  <span className="font-semibold text-muted-foreground">Package Content: </span>
                  <span>{task.items?.map((it) => `${it.food_name} x${it.quantity}`).join(', ')}</span>
                </div>

                {/* Actions */}
                <div className="pt-1">
                  {task.status === 'ready_for_delivery' ? (
                    <button
                      onClick={() => handlePickup(task.id)}
                      className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded hover:opacity-90 text-xs"
                    >
                      Pickup from Kitchen ➔ Start Delivery
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConfirmDelivered(task.id, task.total_amount)}
                      className="w-full py-2 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-500 text-xs"
                    >
                      ✓ Confirm Delivered & Cash Collected (${Number(task.total_amount).toFixed(2)})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
