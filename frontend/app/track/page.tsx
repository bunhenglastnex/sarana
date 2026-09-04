'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Search, CheckCircle2, Clock, MapPin, Truck, ShoppingBag, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Order, OrderStatus, FulfillmentType } from '@/types';

function TrackContent() {
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const initialOrd = params.get('order');
      if (initialOrd) {
        setOrderNumber(initialOrd);
        fetchOrder(initialOrd);
      }
    }
  }, []);

  const fetchOrder = async (ordNum: string) => {
    if (!ordNum) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:8000/api/orders.php?order_number=${ordNum}`);
      const data = await res.json();
      if (data.success && data.orders?.length > 0) {
        setOrder(data.orders[0]);
      } else {
        setError('រកមិនឃើញ Order នេះទេ។ សូមពិនិត្យលេខ Order ឡើងវិញ។');
      }
    } catch {
      // Demo mock fallback
      setOrder({
        id: 1,
        order_number: ordNum || 'ORD-1001',
        customer_name: 'Dara Roth',
        customer_phone: '012 999 888',
        fulfillment_type: 'delivery',
        delivery_address: 'House #12, St 210, Toul Kork',
        delivery_fee: '2.00',
        food_amount: '9.00',
        status: 'on_the_way',
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        total_amount: '11.00',
        items: [{ food_id: 1, food_name: 'Classic Double Cheeseburger', quantity: 2, price: '4.50' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus, fulfillmentType: FulfillmentType) => {
    if (fulfillmentType === 'pickup') {
      switch (status) {
        case 'pending': return 0;
        case 'accepted': return 1;
        case 'preparing': return 2;
        case 'ready_for_pickup': return 3;
        case 'completed': return 4;
        default: return 0;
      }
    } else {
      switch (status) {
        case 'pending': return 0;
        case 'accepted': return 1;
        case 'preparing': return 2;
        case 'ready_for_delivery': return 2;
        case 'on_the_way': return 3;
        case 'completed': return 4;
        default: return 0;
      }
    }
  };

  const deliverySteps = ['Order Placed', 'Accepted', 'Preparing', 'On the Way', 'Delivered'];
  const pickupSteps = ['Order Placed', 'Accepted', 'Preparing', 'Ready', 'Completed'];

  const currentStep = order ? getStepIndex(order.status, order.fulfillment_type) : 0;
  const steps = order?.fulfillment_type === 'pickup' ? pickupSteps : deliverySteps;

  return (
    <div className="container py-8 max-w-xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 flex items-center justify-center gap-2">
          <MapPin className="w-7 h-7 text-primary" />
          <span>តាមដានស្ថានភាព Order</span>
        </h1>
        <p className="text-muted-foreground text-sm">បញ្ចូលលេខ Order របស់អ្នកដើម្បីមើលស្ថានភាពផ្ទាល់</p>
      </div>

      {/* Search Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchOrder(orderNumber);
        }}
        className="flex gap-2.5 mb-6"
      >
        <Input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="ឧ. ORD-1001"
          className="h-11 bg-card text-base"
        />
        <Button type="submit" className="h-11 px-6 gap-2 font-bold">
          <Search className="w-4 h-4" />
          <span>{loading ? '...' : 'ស្វែងរក'}</span>
        </Button>
      </form>

      {error && <div className="text-sm text-destructive text-center mb-6 font-medium">{error}</div>}

      {/* Order Status Result */}
      {order && (
        <Card className="overflow-hidden shadow-xl border-border/70">
          <CardHeader className="p-6 pb-4 border-b border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-black text-foreground">{order.order_number}</span>
              <Badge variant={order.fulfillment_type === 'delivery' ? 'delivery' : 'pickup'}>
                {order.fulfillment_type === 'delivery' ? (
                  <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> ដឹកដល់ផ្ទះ</span>
                ) : (
                  <span className="flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> មកយកផ្ទាល់</span>
                )}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Graphical Step Progress */}
            <div className="py-2">
              <div className="flex justify-between relative">
                {steps.map((stepLabel, idx) => {
                  const isPassed = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={idx} className="text-center flex-1 relative z-10">
                      <div
                        className={`w-9 h-9 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isPassed 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                            : 'bg-muted text-muted-foreground'
                        } ${isCurrent ? 'ring-4 ring-primary/40 scale-110' : ''}`}
                      >
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <div
                        className={`text-[11px] leading-tight transition-colors ${
                          isPassed ? 'text-foreground font-semibold' : 'text-muted-foreground'
                        }`}
                      >
                        {stepLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details Box */}
            <div className="bg-background/60 border border-border/50 p-4 rounded-xl text-sm space-y-2">
              <div><strong>👤 អតិថិជន:</strong> {order.customer_name}</div>
              {order.fulfillment_type === 'delivery' ? (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span><strong>អាសយដ្ឋានដឹក:</strong> {order.delivery_address}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span><strong>ម៉ោងមកយក:</strong> {order.pickup_time || 'ឆាប់ៗនេះ'}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 pt-1 border-t border-border/40">
                <Banknote className="w-4 h-4 text-muted-foreground" />
                <span><strong>វិធីទូទាត់:</strong> {order.payment_method === 'cash_on_delivery' ? 'លុយសុទ្ធពេលដឹកដល់ (COD)' : 'លុយសុទ្ធនៅបញ្ជរ'}</span>
              </div>
              <div className="flex items-center justify-between pt-2 font-bold text-base">
                <span>សរុបត្រូវបង់:</span>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-xl font-extrabold">${Number(order.total_amount).toFixed(2)}</span>
                  {order.payment_status === 'paid' ? (
                    <Badge variant="success">បានបង់ប្រាក់រួច ✅</Badge>
                  ) : (
                    <Badge variant="warning">រង់ចាំបង់លុយសុទ្ធ ⏳</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container py-12 text-center text-muted-foreground">កំពុងទាញយក...</div>}>
      <TrackContent />
    </Suspense>
  );
}
