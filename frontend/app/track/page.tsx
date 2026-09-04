'use client';

import React, { useState } from 'react';
import { Order, OrderStatus, OrdersApiResponse } from '@/types';
import { Api } from '@/lib/api';

// Sample Mock Orders for Tracking (Fallback if backend offline)
const MOCK_TRACK_DATA: Record<string, Order> = {
  'ORD-1001': {
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
    status: 'on_the_way',
    items: [{ food_id: 1, food_name: 'Double Cheeseburger', quantity: 2, price: '4.50' }]
  },
  'ORD-1002': {
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
    status: 'ready_for_pickup',
    items: [{ food_id: 1, food_name: 'Double Cheeseburger', quantity: 1, price: '4.50' }]
  }
};

export default function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState('ORD-1001');
  const [order, setOrder] = useState<Order | null>(MOCK_TRACK_DATA['ORD-1001']);
  const [loading, setLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);

  const handleSearch = async (e?: React.FormEvent, force = false) => {
    if (e) e.preventDefault();
    const query = orderQuery.trim().toUpperCase();
    if (!query) return;

    setLoading(true);

    // Call Backend API with query param: /api/orders.php?order_number=ORD-1001
    const res = await Api.get<OrdersApiResponse>('/api/orders.php', { order_number: query }, {
      forceRefresh: force,
    });

    if (res.success && res.data?.orders && res.data.orders.length > 0) {
      setOrder(res.data.orders[0]);
      setIsCached(res.fromCache);
    } else {
      // Fallback to local mock data
      const mock = MOCK_TRACK_DATA[query];
      setOrder(mock || null);
      setIsCached(false);
    }
    setLoading(false);
  };

  const steps = order?.fulfillment_type === 'pickup'
    ? ['Order Placed', 'Accepted by Kitchen', 'Preparing Food', 'Ready for Pickup', 'Completed']
    : ['Order Placed', 'Accepted by Kitchen', 'Preparing Food', 'On the Way (Driver)', 'Delivered & Paid'];


  const getStepNumber = (status?: OrderStatus) => {
    switch (status) {
      case 'pending': return 1;
      case 'accepted': return 2;
      case 'preparing': return 3;
      case 'ready_for_pickup':
      case 'ready_for_delivery':
      case 'on_the_way': return 4;
      case 'completed': return 5;
      default: return 1;
    }
  };

  const currentStep = getStepNumber(order?.status);

  return (
    <div className="space-y-6 max-w-2xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold">Track Order - Status Progression Example</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Text example showing how customers track live status progression from kitchen to doorstep.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={orderQuery}
          onChange={(e) => setOrderQuery(e.target.value)}
          placeholder="Try ORD-1001 or ORD-1002"
          className="flex-1 p-2.5 bg-card border border-border rounded text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded text-sm hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button
          type="button"
          onClick={() => handleSearch(undefined, true)}
          disabled={loading}
          title="Force Refresh bypassing cache"
          className="px-3 py-2.5 bg-muted text-muted-foreground hover:text-foreground font-medium rounded text-sm border border-border"
        >
          🔄
        </button>
      </form>

      {/* Cache Indicator */}
      {isCached && (
        <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded flex items-center justify-between">
          <span>⚡ Retrieved from Client Cache (មិនទាញឡើងវិញពេលប្ដូរ page)</span>
          <span className="font-mono text-[11px]">Api.get(..., &#123; cache: true &#125;)</span>
        </div>
      )}

      {/* Order Status Display */}
      {order ? (
        <div className="border border-border rounded-lg p-5 bg-card space-y-5 text-sm">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <span className="font-bold text-lg text-primary mr-2">{order.order_number}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-muted border border-border">
                {order.fulfillment_type === 'delivery' ? 'Delivery' : 'In-Store Pickup'}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Current: {order.status}
            </span>
          </div>

          {/* Text Steps List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase text-muted-foreground">Progress Timeline:</div>
            <div className="space-y-2">
              {steps.map((stepText, idx) => {
                const stepNum = idx + 1;
                const isPassed = stepNum <= currentStep;
                const isCurrent = stepNum === currentStep;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                      isCurrent
                        ? 'border-primary bg-primary/10 font-bold text-primary'
                        : isPassed
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-border/40 bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    <span>
                      {isPassed ? '✓' : stepNum}. {stepText}
                    </span>
                    {isCurrent && <span className="text-[10px] uppercase font-bold text-primary">In Progress</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="pt-2 border-t border-border space-y-1.5 text-xs text-muted-foreground">
            <div><strong>Customer Name:</strong> {order.customer_name}</div>
            <div>
              {order.fulfillment_type === 'delivery' ? (
                <span><strong>Delivery Address:</strong> {order.delivery_address}</span>
              ) : (
                <span><strong>Pickup Time:</strong> {order.pickup_time || 'ASAP'}</span>
              )}
            </div>
            <div><strong>Payment Method:</strong> {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery (COD)' : 'Cash at Counter'}</div>
            <div className="pt-1 text-sm font-bold text-foreground">
              Total Payable in Cash: <span className="text-primary">${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-lg p-6 bg-card text-center text-sm text-muted-foreground">
          Order not found. Try searching for sample orders <strong>ORD-1001</strong> or <strong>ORD-1002</strong>.
        </div>
      )}
    </div>
  );
}
