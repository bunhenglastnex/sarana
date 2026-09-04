'use client';

import React, { useState } from 'react';
import { Food, CartItem, FulfillmentType } from '@/types';

// Sample Mock Data (No Fetch API)
const SAMPLE_MENU: Food[] = [
  { id: 1, name: 'Double Cheeseburger', price: 4.50, description: 'Double beef patties, melted cheddar, lettuce, pickles', category_name: 'Burgers' },
  { id: 2, name: 'Crispy Chicken Burger', price: 3.80, description: 'Crispy fried chicken breast with spicy mayo', category_name: 'Burgers' },
  { id: 3, name: 'Spicy Chicken Wings (6pcs)', price: 4.20, description: 'Deep-fried wings tossed in spicy Korean glaze', category_name: 'Chicken' },
  { id: 4, name: 'French Fries', price: 2.00, description: 'Crispy golden salted potato fries', category_name: 'Sides' },
  { id: 5, name: 'Coca Cola', price: 1.00, description: 'Chilled can 330ml', category_name: 'Drinks' },
  { id: 6, name: 'Iced Lemon Tea', price: 1.50, description: 'Fresh brewed black tea with lemon juice', category_name: 'Drinks' },
];

export default function CustomerOrderPage() {
  const [cart, setCart] = useState<CartItem[]>([
    { food_id: 1, name: 'Double Cheeseburger', price: 4.50, quantity: 2 },
    { food_id: 5, name: 'Coca Cola', price: 1.00, quantity: 1 }
  ]);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [customerName, setCustomerName] = useState('Dara Roth');
  const [customerPhone, setCustomerPhone] = useState('012 999 888');
  const [address, setAddress] = useState('House #12, St 210, Toul Kork, Phnom Penh');
  const [orderCreated, setOrderCreated] = useState(false);

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

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold">Customer Order - Menu & Checkout Example</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Example text-based workflow for online ordering with Cash on Delivery (COD) or In-Store Pickup.
        </p>
      </div>

      {/* 1. Menu List Section */}
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">1. Menu Items</h2>
        <div className="divide-y divide-border">
          {SAMPLE_MENU.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-center text-sm">
              <div>
                <div className="font-semibold">{item.name} <span className="text-xs text-muted-foreground">({item.category_name})</span></div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold">${item.price.toFixed(2)}</span>
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
          onClick={() => setOrderCreated(true)}
          disabled={cart.length === 0}
          className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
        >
          Submit Order Example
        </button>
      </div>

      {/* 3. Order Result Preview */}
      {orderCreated && (
        <div className="border border-emerald-500/40 bg-emerald-500/10 rounded-lg p-5 text-sm space-y-2">
          <div className="font-bold text-emerald-400">Order Placed Successfully (Example Result):</div>
          <div><strong>Order Number:</strong> ORD-1003</div>
          <div><strong>Customer:</strong> {customerName} ({customerPhone})</div>
          <div><strong>Type:</strong> {fulfillmentType === 'delivery' ? 'Delivery to ' + address : 'Pickup in-store'}</div>
          <div><strong>Total:</strong> ${grandTotal.toFixed(2)}</div>
          <div><strong>Payment Status:</strong> Pending (To be paid in cash upon {fulfillmentType === 'delivery' ? 'delivery' : 'pickup'})</div>
          <div><strong>Status:</strong> Pending ➔ Kitchen will accept order</div>
        </div>
      )}
    </div>
  );
}
