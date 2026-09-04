'use client';

import React, { useState, useEffect } from 'react';
import { Bike, CheckCircle2, Phone, MapPin, DollarSign, Package, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';

const DEFAULT_DELIVERY_ORDERS: Order[] = [
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
    notes: 'Please call before arriving',
    items: [{ food_id: 1, food_name: 'Classic Double Cheeseburger', quantity: 2, price: '4.50' }]
  }
];

export default function DeliveryStaffPage() {
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>(DEFAULT_DELIVERY_ORDERS);
  const [cashInHand, setCashInHand] = useState<number>(0.00);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDeliveryOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/delivery.php');
      const data = await res.json();
      if (data.success) {
        if (data.orders) setDeliveryOrders(data.orders);
        if (data.cash_summary) {
          setCashInHand(Number(data.cash_summary.cash_in_hand || 0));
          setCompletedCount(Number(data.cash_summary.deliveries_completed || 0));
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOrders();
    const interval = setInterval(fetchDeliveryOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (orderId: number, action: 'pickup_from_kitchen' | 'confirm_delivered', amount: number | string) => {
    try {
      await fetch('http://localhost:8000/api/delivery.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, action })
      });
      fetchDeliveryOrders();
    } catch {
      // Offline fallback state update
      if (action === 'pickup_from_kitchen') {
        setDeliveryOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'on_the_way' } : o))
        );
      } else if (action === 'confirm_delivered') {
        setDeliveryOrders((prev) => prev.filter((o) => o.id !== orderId));
        setCashInHand((prev) => prev + Number(amount));
        setCompletedCount((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      {/* Rider Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
          <Bike className="w-8 h-8 text-primary" />
          <span>ផ្ទាំងបុគ្គលិកដឹកជញ្ជូន (Delivery Staff)</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          ឆែកមើលការងារដឹកជញ្ជូន និងប្រមូលលុយសុទ្ធ (Cash on Delivery)
        </p>
      </div>

      {/* Cash In Hand Summary Card */}
      <Card className="mb-8 border-2 border-primary/40 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>លុយសុទ្ធកំពុងកាន់ក្នុងដៃ (Cash In Hand):</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-primary">
              ${cashInHand.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ដឹកបានជោគជ័យ: <strong className="text-foreground">{completedCount}</strong> Order (ត្រូវទូទាត់ជាមួយហាងចុងវេន)
            </div>
          </div>
          <Button onClick={fetchDeliveryOrders} variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </CardContent>
      </Card>

      {/* Active Delivery Orders */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <span>ការងារដែលត្រូវដឹក ({deliveryOrders.length})</span>
        </h2>
      </div>

      {deliveryOrders.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground border-dashed">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="font-semibold text-foreground">🎉 គ្មាន Order ត្រូវដឹកនៅឡើយទេ!</div>
          <p className="text-xs text-muted-foreground mt-1">
            នៅពេលហាងធ្វើម្ហូបរួចរាល់ Order នឹងលោតមកទីនេះដោយស្វ័យប្រវត្តិ។
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {deliveryOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-l-4 border-l-primary">
              <CardHeader className="p-5 pb-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black text-foreground">{order.order_number}</span>
                  <Badge variant="warning" className="text-xs font-semibold">
                    {order.status === 'ready_for_delivery' ? '📦 រង់ចាំទៅយកនៅហាង' : '🛵 កំពុងដឹកជញ្ជូន'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                {/* Delivery Details */}
                <div className="bg-background/60 border border-border/50 p-3.5 rounded-xl text-xs sm:text-sm space-y-1.5">
                  <div><strong>👤 អតិថិជន:</strong> {order.customer_name}</div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <strong>ទូរស័ព្ទ:</strong>{' '}
                    <a href={`tel:${order.customer_phone}`} className="text-primary font-bold hover:underline">
                      {order.customer_phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <strong>អាសយដ្ឋាន:</strong> {order.delivery_address}
                  </div>
                  {order.notes && (
                    <div className="text-amber-400 flex items-center gap-1.5 pt-1 border-t border-border/40">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{order.notes}</span>
                    </div>
                  )}
                </div>

                {/* Cash collection banner */}
                <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 text-foreground">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span>ត្រូវទារលុយសុទ្ធពីភ្ញៀវ៖</span>
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-primary">
                    ${Number(order.total_amount).toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons for Rider */}
                {order.status === 'ready_for_delivery' ? (
                  <Button
                    onClick={() => handleAction(order.id, 'pickup_from_kitchen', order.total_amount)}
                    className="w-full h-11 text-base font-bold gap-2"
                  >
                    <Package className="w-5 h-5" /> យកម្ហូបពីផ្ទះបាយ ➔ ចាប់ផ្ដើមចេញដឹក
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleAction(order.id, 'confirm_delivered', order.total_amount)}
                    variant="success"
                    className="w-full h-11 text-base font-bold gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> បានប្រគល់ម្ហូប & បានលុយសុទ្ធ (${Number(order.total_amount).toFixed(2)}) រួចរាល់
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
