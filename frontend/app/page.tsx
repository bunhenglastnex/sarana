'use client';

import React, { useState, useEffect } from 'react';
import { Food, CartItem, FulfillmentType, FoodsApiResponse, CreateOrderApiResponse } from '@/types';
import { Api } from '@/lib/api';

// Fallback Mock Data if Backend PHP is not started yet
const SAMPLE_MENU: Food[] = [
  { id: 1, name: 'Double Cheeseburger', price: 4.50, description: 'Double beef patties, melted cheddar, lettuce, pickles', category_name: 'Burgers' },
  { id: 2, name: 'Crispy Chicken Burger', price: 3.80, description: 'Crispy fried chicken breast with spicy mayo', category_name: 'Burgers' },
  { id: 3, name: 'Spicy Chicken Wings (6pcs)', price: 4.20, description: 'Deep-fried wings tossed in spicy Korean glaze', category_name: 'Chicken' },
  { id: 4, name: 'French Fries', price: 2.00, description: 'Crispy golden salted potato fries', category_name: 'Sides' },
  { id: 5, name: 'Coca Cola', price: 1.00, description: 'Chilled can 330ml', category_name: 'Drinks' },
  { id: 6, name: 'Iced Lemon Tea', price: 1.50, description: 'Fresh brewed black tea with lemon juice', category_name: 'Drinks' },
];

export default function CustomerOrderPage() {
  const [foods, setFoods] = useState<Food[]>(SAMPLE_MENU);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([
    { food_id: 1, name: 'Double Cheeseburger', price: 4.50, quantity: 2 },
    { food_id: 5, name: 'Coca Cola', price: 1.00, quantity: 1 }
  ]);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [customerName, setCustomerName] = useState('Dara Roth');
  const [customerPhone, setCustomerPhone] = useState('012 999 888');
  const [address, setAddress] = useState('House #12, St 210, Toul Kork, Phnom Penh');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<CreateOrderApiResponse | null>(null);

  // Fetch foods with automatic cache (កុំឲ្យប្ដូរ page វាទាញម្ដងទៀត)
  const loadFoods = async (force = false) => {
    setLoadingFoods(true);
    const res = await Api.get<FoodsApiResponse>('/api/foods.php', undefined, {
      forceRefresh: force,
    });

    if (res.success && res.data?.foods && res.data.foods.length > 0) {
      setFoods(res.data.foods);
      setIsCached(res.fromCache);
    } else {
      // Keep sample menu if backend not running
      setIsCached(false);
    }
    setLoadingFoods(false);
  };

  useEffect(() => {
    loadFoods();
  }, []);


  const foodSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = fulfillmentType === 'delivery' ? 2.00 : 0.00;
  const grandTotal = foodSubtotal + deliveryFee;

  const handleAdd = (food: Food) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.food_id === food.id);
      if (exist) {
        return prev.map((item) =>
          item.food_id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { food_id: food.id, name: food.name, price: food.price, quantity: 1 }];
    });
  };

  const handleRemove = (foodId: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.food_id === foodId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };
  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setSubmittingOrder(true);

    const payload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      fulfillment_type: fulfillmentType,
      delivery_address: fulfillmentType === 'delivery' ? address : undefined,
      pickup_time: fulfillmentType === 'pickup' ? 'Within 20 mins' : undefined,
      items: cart.map((item) => ({
        food_id: item.food_id,
        quantity: item.quantity,
      })),
    };

    const res = await Api.post<CreateOrderApiResponse>('/api/orders.php', payload);
    if (res.success && res.data) {
      setOrderResult(res.data);
    } else {
      // Fallback display if backend is currently offline
      setOrderResult({
        success: true,
        message: 'Order simulated (Backend offline or not reachable)',
        order_number: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      });
    }
    setSubmittingOrder(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold">Customer Order - Menu & Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connected to Unified <code className="text-primary font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Api.get()</code> and <code className="text-primary font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Api.post()</code> with client caching.
        </p>
      </div>

      {/* 1. Menu List Section */}
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">1. Menu Items</h2>
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
            onClick={() => loadFoods(true)}
            disabled={loadingFoods}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted/60 border border-border"
          >
            {loadingFoods ? 'កំពុងទាញ...' : '🔄 Force Refresh'}
          </button>
        </div>

        <div className="divide-y divide-border">
          {foods.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-center text-sm">
              <div>
                <div className="font-semibold">
                  {item.name}{' '}
                  {item.category_name && (
                    <span className="text-xs text-muted-foreground">({item.category_name})</span>
                  )}
                </div>
                {item.description && (
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold">${Number(item.price).toFixed(2)}</span>
                <button
                  onClick={() => handleAdd(item)}
                  className="px-2.5 py-1 text-xs bg-primary text-primary-foreground font-semibold rounded hover:opacity-90"
                >
                  + Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Cart & Fulfillment Section */}
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">2. Cart & Order Options</h2>

        {/* Cart items */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Selected Items:</div>
          {cart.length === 0 ? (
            <div className="text-sm text-muted-foreground">Your cart is empty.</div>
          ) : (
            cart.map((item) => (
              <div key={item.food_id} className="flex justify-between items-center text-sm py-1 border-b border-border/40">
                <span>{item.name} (${item.price.toFixed(2)} x {item.quantity})</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => handleRemove(item.food_id)}
                    className="px-2 py-0.5 text-xs bg-muted border border-border rounded"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleAdd({ id: item.food_id, name: item.name, price: item.price })}
                    className="px-2 py-0.5 text-xs bg-muted border border-border rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Fulfillment Choice */}
        <div className="pt-2 space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Fulfillment Type:</div>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fulfillment"
                checked={fulfillmentType === 'delivery'}
                onChange={() => setFulfillmentType('delivery')}
              />
              <span>Delivery (+$2.00 fee, Pay Cash on Delivery)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fulfillment"
                checked={fulfillmentType === 'pickup'}
                onChange={() => setFulfillmentType('pickup')}
              />
              <span>In-Store Pickup ($0.00 fee, Pay Cash at Counter)</span>
            </label>
          </div>
        </div>

        {/* Customer Info */}
        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Customer Name:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 bg-background border border-border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Customer Phone:</label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full p-2 bg-background border border-border rounded text-sm"
            />
          </div>
          {fulfillmentType === 'delivery' && (
            <div className="md:col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">Delivery Address:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded text-sm"
              />
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="pt-4 border-t border-border space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Food Subtotal:</span>
            <span>${foodSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Fee:</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1 border-t border-border/60">
            <span>Total Payable:</span>
            <span className="text-primary">${grandTotal.toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted-foreground pt-1">
            Payment Method: {fulfillmentType === 'delivery' ? 'Cash on Delivery (COD)' : 'Cash at Counter'}
          </div>
        </div>

        <button
          onClick={handleSubmitOrder}
          disabled={cart.length === 0 || submittingOrder}
          className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
        >
          {submittingOrder ? 'Submitting Order via Api.post()...' : 'Submit Order (Api.post)'}
        </button>
      </div>

      {/* 3. Order Result Preview */}
      {orderResult && (
        <div className="border border-emerald-500/40 bg-emerald-500/10 rounded-lg p-5 text-sm space-y-2">
          <div className="font-bold text-emerald-400">Order Placed Successfully ({orderResult.message}):</div>
          <div><strong>Order Number:</strong> {orderResult.order_number || 'ORD-NEW'}</div>
          <div><strong>Customer:</strong> {customerName} ({customerPhone})</div>
          <div><strong>Type:</strong> {fulfillmentType === 'delivery' ? 'Delivery to ' + address : 'Pickup in-store'}</div>
          <div><strong>Total:</strong> ${grandTotal.toFixed(2)}</div>
          <div><strong>Payment Status:</strong> Pending (To be paid in cash upon {fulfillmentType === 'delivery' ? 'delivery' : 'pickup'})</div>
          <div><strong>Status:</strong> Pending ➔ Sent to Kitchen Admin API</div>
        </div>
      )}
    </div>
  );
}

