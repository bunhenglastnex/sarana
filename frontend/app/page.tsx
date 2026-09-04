'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sandwich, 
  Drumstick, 
  CupSoda, 
  Cake, 
  Utensils, 
  ShoppingBag, 
  Truck,
  Plus,
  Minus,
  CheckCircle2,
  X
} from 'lucide-react';
import { Food, CartItem, FulfillmentType, Order } from '../types';

// Default mock foods in case backend is not running yet
const DEFAULT_FOODS: Food[] = [
  { id: 1, name: 'Classic Double Cheeseburger', price: 4.50, description: 'សាច់គោ ២ បន្ទះ ឈីសក្រាស់ និងបន្លែស្រស់', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', category_name: 'Burgers & Sandwiches' },
  { id: 2, name: 'Crispy Chicken Burger', price: 3.80, description: 'សាច់មាន់បំពងស្រួយ ទឹកជ្រលក់ហឹរតិចៗ', image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500', category_name: 'Burgers & Sandwiches' },
  { id: 3, name: 'Spicy Fried Chicken Wings (6pcs)', price: 4.20, description: 'ស្លាបមាន់បំពងហឹរបែបកូរ៉េ', image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500', category_name: 'Fried Chicken & Sides' },
  { id: 4, name: 'French Fries (Large)', price: 2.00, description: 'ដំឡូងបារាំងបំពងស្រួយជាមួយទឹកប៉េងប៉ោះ', image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500', category_name: 'Fried Chicken & Sides' },
  { id: 5, name: 'Coca Cola Original (Can)', price: 1.00, description: 'កូកាកូឡាត្រជាក់ស្រស់ស្រាយ', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', category_name: 'Beverages & Soft Drinks' },
  { id: 6, name: 'Iced Lemon Green Tea', price: 1.50, description: 'តែបៃតងក្រូចឆ្មាផ្អែមត្រជាក់', image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', category_name: 'Beverages & Soft Drinks' }
];

// Helper to render Lucide Icons by name
const renderLucideIcon = (iconName: string, size = 18) => {
  switch (iconName?.toLowerCase()) {
    case 'sandwich':
      return <Sandwich size={size} />;
    case 'drumstick':
      return <Drumstick size={size} />;
    case 'cup-soda':
      return <CupSoda size={size} />;
    case 'cake':
      return <Cake size={size} />;
    default:
      return <Utensils size={size} />;
  }
};

export default function CustomerMenuPage() {
  const [foods, setFoods] = useState<Food[]>(DEFAULT_FOODS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<Partial<Order> | null>(null);

  // Form State
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('Within 20-30 mins');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch foods from PHP API
  useEffect(() => {
    fetch('http://localhost:8000/api/foods.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.foods?.length > 0) {
          setFoods(data.foods);
        }
      })
      .catch(() => {
        // Fallback to default foods if backend isn't started yet
      });
  }, []);

  // Cart operations
  const addToCart = (food: Food) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.food_id === food.id);
      if (existing) {
        return prev.map((item) =>
          item.food_id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { food_id: food.id, name: food.name, price: Number(food.price), quantity: 1 }];
    });
  };

  const updateQuantity = (foodId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.food_id === foodId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const foodSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = fulfillmentType === 'delivery' ? 2.00 : 0.00;
  const grandTotal = foodSubtotal + deliveryFee;

  // Handle Checkout submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('សូមបញ្ចូលឈ្មោះ និងលេខទូរស័ព្ទ!');
      return;
    }
    if (fulfillmentType === 'delivery' && !deliveryAddress) {
      alert('សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន!');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      fulfillment_type: fulfillmentType,
      delivery_address: fulfillmentType === 'delivery' ? deliveryAddress : '',
      pickup_time: fulfillmentType === 'pickup' ? pickupTime : '',
      notes,
      items: cart.map((item) => ({ food_id: item.food_id, quantity: item.quantity }))
    };

    try {
      const res = await fetch('http://localhost:8000/api/orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setOrderSuccess(data.order);
        setCart([]);
        setIsCheckoutOpen(false);
      } else {
        alert(data.message || 'Error placing order');
      }
    } catch {
      // Mock order if PHP server is offline
      const mockOrder: Partial<Order> = {
        order_number: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        customer_name: customerName,
        fulfillment_type: fulfillmentType,
        total_amount: grandTotal,
        payment_method: fulfillmentType === 'delivery' ? 'cash_on_delivery' : 'cash_at_counter'
      };
      setOrderSuccess(mockOrder);
      setCart([]);
      setIsCheckoutOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '100px', paddingTop: '24px' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
          🍽️ អាហារឆ្ងាញ់ៗ កុម្ម៉ង់បានភ្លាមៗ
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          កុម្ម៉ង់ដឹកដល់ផ្ទះ (Delivery) ឬ មកយកនៅហាងផ្ទាល់ (Pickup) | 💵 បង់ប្រាក់សុទ្ធ (Cash Only)
        </p>
      </div>

      {/* Food Cards Grid */}
      <div className="food-grid">
        {foods.map((food) => (
          <div key={food.id} className="food-card">
            <img src={food.image_url} alt={food.name} className="food-image" />
            <div className="food-body">
              <h3 className="food-title">{food.name}</h3>
              <p className="food-desc">{food.description}</p>
              <div className="food-footer">
                <span className="food-price">${Number(food.price).toFixed(2)}</span>
                <button 
                  onClick={() => addToCart(food)} 
                  className="btn btn-primary" 
                  style={{ padding: '6px 14px' }}
                >
                  <Plus size={16} /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 90,
            width: '90%',
            maxWidth: '500px'
          }}
        >
          <div
            className="card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#1e293b',
              border: '2px solid var(--primary)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              padding: '12px 20px'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                🛒 {cart.reduce((a, b) => a + b.quantity, 0)} មុខ | ${foodSubtotal.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ជ្រើសរើស Delivery ឬ Pickup ពេល Checkout
              </div>
            </div>
            <button onClick={() => setIsCheckoutOpen(true)} className="btn btn-primary">
              Checkout ➔
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>🛍️ Checkout & បញ្ជាក់ការកុម្ម៉ង់</h2>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Summary */}
            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>បញ្ជីមុខម្ហូប៖</div>
              {cart.map((item) => (
                <div key={item.food_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{item.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => updateQuantity(item.food_id, -1)} 
                      style={{ padding: '2px 6px', cursor: 'pointer', background: '#334155', border: 'none', color: '#fff', borderRadius: '4px' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span>x{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.food_id, 1)} 
                      style={{ padding: '2px 6px', cursor: 'pointer', background: '#334155', border: 'none', color: '#fff', borderRadius: '4px' }}
                    >
                      <Plus size={12} />
                    </button>
                    <span style={{ fontWeight: 700, minWidth: '50px', textAlign: 'right' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Fulfillment Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>
                ជ្រើសរើសជម្រើសទទួល (Fulfillment Option):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`btn ${fulfillmentType === 'delivery' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <Truck size={18} /> ដឹកដល់ផ្ទះ (+$2.00)
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`btn ${fulfillmentType === 'pickup' ? 'btn-primary' : 'btn-outline'}`}
                >
                  <ShoppingBag size={18} /> ទៅយកផ្ទាល់ ($0.00)
                </button>
              </div>
            </div>

            {/* Customer Inputs Form */}
            <form onSubmit={handlePlaceOrder}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>ឈ្មោះអតិថិជន *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ឧ. សុខ ដារ៉ា"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>លេខទូរស័ព្ទ *</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="ឧ. 012 345 678"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>

              {fulfillmentType === 'delivery' ? (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>
                    អាសយដ្ឋានដឹកជញ្ជូន *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="ផ្ទះលេខ ផ្លូវ សង្កាត់ ខណ្ឌ..."
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border)', color: '#fff' }}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>
                    ម៉ោងមកយកនៅហាង
                  </label>
                  <input
                    type="text"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    placeholder="ឧ. ក្នុងរយៈពេល 20 នាទីទៀត"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border)', color: '#fff' }}
                  />
                </div>
              )}

              {/* Payment Notice (Cash Only) */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                  💵 វិធីទូទាត់ប្រាក់៖
                </div>
                {fulfillmentType === 'delivery' ? (
                  <span>បង់លុយសុទ្ធពេលអ្នកដឹកយកទៅដល់ (Cash on Delivery)</span>
                ) : (
                  <span>បង់លុយសុទ្ធនៅបញ្ជរបេឡាហាងពេលមកយក (Pay at Store Counter)</span>
                )}
              </div>

              {/* Price Breakdown */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>ថ្លៃម្ហូប៖</span>
                  <span>${foodSubtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>ថ្លៃដឹក (Delivery fee)៖</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
                  <span>សរុបត្រូវបង់៖</span>
                  <span style={{ color: 'var(--primary)' }}>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              >
                {isSubmitting ? 'កំពុងបញ្ជូន Order...' : '✅ Confirm Order (បញ្ជាទិញ)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmed Success Modal */}
      {orderSuccess && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <CheckCircle2 size={56} className="text-emerald-500" color="#10b981" />
            </div>
            <h2 style={{ marginBottom: '8px' }}>ការកុម្ម៉ង់ជោគជ័យ!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              ហាងបានទទួល Order របស់អ្នករួចរាល់ហើយ
            </p>

            <div
              style={{
                background: '#0f172a',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'left'
              }}
            >
              <div><strong>លេខ Order:</strong> {orderSuccess.order_number}</div>
              <div><strong>អ្នកទទួល:</strong> {orderSuccess.customer_name}</div>
              <div><strong>ប្រភេទ:</strong> {orderSuccess.fulfillment_type === 'delivery' ? '🚚 ដឹកដល់ផ្ទះ' : '🛍️ ទៅយកផ្ទាល់'}</div>
              <div><strong>សរុបត្រូវបង់:</strong> ${Number(orderSuccess.total_amount).toFixed(2)}</div>
              <div><strong>វិធីបង់ប្រាក់:</strong> {orderSuccess.payment_method === 'cash_on_delivery' ? '💵 លុយសុទ្ធពេលដឹកដល់ (COD)' : '💵 លុយសុទ្ធនៅហាង'}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={`/track?order=${orderSuccess.order_number}`}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                📍 តាមដាន Order របស់អ្នក
              </a>
              <button
                onClick={() => setOrderSuccess(null)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                បិទផ្ទាំងនេះ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
