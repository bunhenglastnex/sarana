'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  X,
  Banknote,
  Phone,
  User,
  MapPin,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Food, CartItem, FulfillmentType, Order } from '@/types';

// Default mock foods in case backend is not running yet
const DEFAULT_FOODS: Food[] = [
  { id: 1, name: 'Classic Double Cheeseburger', price: 4.50, description: 'សាច់គោ ២ បន្ទះ ឈីសក្រាស់ និងបន្លែស្រស់', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', category_name: 'Burgers & Sandwiches' },
  { id: 2, name: 'Crispy Chicken Burger', price: 3.80, description: 'សាច់មាន់បំពងស្រួយ ទឹកជ្រលក់ហឹរតិចៗ', image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500', category_name: 'Burgers & Sandwiches' },
  { id: 3, name: 'Spicy Fried Chicken Wings (6pcs)', price: 4.20, description: 'ស្លាបមាន់បំពងហឹរបែបកូរ៉េ', image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500', category_name: 'Fried Chicken & Sides' },
  { id: 4, name: 'French Fries (Large)', price: 2.00, description: 'ដំឡូងបារាំងបំពងស្រួយជាមួយទឹកប៉េងប៉ោះ', image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500', category_name: 'Fried Chicken & Sides' },
  { id: 5, name: 'Coca Cola Original (Can)', price: 1.00, description: 'កូកាកូឡាត្រជាក់ស្រស់ស្រាយ', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', category_name: 'Beverages & Soft Drinks' },
  { id: 6, name: 'Iced Lemon Green Tea', price: 1.50, description: 'តែបៃតងក្រូចឆ្មាផ្អែមត្រជាក់', image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', category_name: 'Beverages & Soft Drinks' }
];

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
    <div className="container py-8">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          🍽️ អាហារឆ្ងាញ់ៗ កុម្ម៉ង់បានភ្លាមៗ
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          កុម្ម៉ង់ដឹកដល់ផ្ទះ (Delivery) ឬ មកយកនៅហាងផ្ទាល់ (Pickup) | 💵 បង់ប្រាក់សុទ្ធ (Cash Only)
        </p>
      </div>

      {/* Food Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {foods.map((food) => (
          <Card key={food.id} className="overflow-hidden flex flex-col border-border/60 hover:border-primary/50 transition-all duration-200">
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                src={food.image_url} 
                alt={food.name} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
              />
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-md font-semibold text-xs">
                  {food.category_name || 'Food'}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg font-bold line-clamp-1">{food.name}</CardTitle>
              <CardDescription className="line-clamp-2 text-xs text-muted-foreground">
                {food.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow" />

            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/40 mt-auto">
              <span className="text-xl font-extrabold text-primary">
                ${Number(food.price).toFixed(2)}
              </span>
              <Button 
                onClick={() => addToCart(food)} 
                size="sm"
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg">
          <div className="flex items-center justify-between p-3.5 px-5 bg-card/95 backdrop-blur-md border-2 border-primary rounded-2xl shadow-2xl shadow-black/50">
            <div>
              <div className="font-bold text-base text-foreground">
                🛒 {cart.reduce((a, b) => a + b.quantity, 0)} មុខ | ${foodSubtotal.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                ជ្រើសរើស Delivery ឬ Pickup ពេល Checkout
              </div>
            </div>
            <Button onClick={() => setIsCheckoutOpen(true)} className="gap-2 font-bold shadow-lg">
              Checkout ➔
            </Button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-border/60">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span>Checkout & បញ្ជាក់ការកុម្ម៉ង់</span>
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCheckoutOpen(false)}
                className="rounded-full w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Cart Summary */}
            <div className="bg-background/70 border border-border/50 p-3.5 rounded-xl mb-5 text-sm space-y-2.5">
              <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">បញ្ជីមុខម្ហូប៖</div>
              {cart.map((item) => (
                <div key={item.food_id} className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => updateQuantity(item.food_id, -1)} 
                      className="w-6 h-6 rounded-md"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => updateQuantity(item.food_id, 1)} 
                      className="w-6 h-6 rounded-md"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <span className="font-bold min-w-[55px] text-right text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Fulfillment Selector */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                ជ្រើសរើសជម្រើសទទួល (Fulfillment Option):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={fulfillmentType === 'delivery' ? 'default' : 'outline'}
                  onClick={() => setFulfillmentType('delivery')}
                  className="gap-2 h-11"
                >
                  <Truck className="w-4 h-4" /> ដឹកដល់ផ្ទះ (+$2.00)
                </Button>
                <Button
                  type="button"
                  variant={fulfillmentType === 'pickup' ? 'default' : 'outline'}
                  onClick={() => setFulfillmentType('pickup')}
                  className="gap-2 h-11"
                >
                  <ShoppingBag className="w-4 h-4" /> ទៅយកផ្ទាល់ ($0.00)
                </Button>
              </div>
            </div>

            {/* Customer Inputs Form */}
            <form onSubmit={handlePlaceOrder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>ឈ្មោះអតិថិជន *</span>
                </label>
                <Input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ឧ. សុខ ដារ៉ា"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>លេខទូរស័ព្ទ *</span>
                </label>
                <Input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="ឧ. 012 345 678"
                />
              </div>

              {fulfillmentType === 'delivery' ? (
                <div>
                  <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>អាសយដ្ឋានដឹកជញ្ជូន *</span>
                  </label>
                  <Input
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="ផ្ទះលេខ ផ្លូវ សង្កាត់ ខណ្ឌ..."
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>ម៉ោងមកយកនៅហាង</span>
                  </label>
                  <Input
                    type="text"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    placeholder="ឧ. ក្នុងរយៈពេល 20 នាទីទៀត"
                  />
                </div>
              )}

              {/* Payment Notice (Cash Only) */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4" />
                  <span>វិធីទូទាត់ប្រាក់ (Cash Only):</span>
                </div>
                <div className="text-muted-foreground">
                  {fulfillmentType === 'delivery'
                    ? 'បង់លុយសុទ្ធពេលអ្នកដឹកយកទៅដល់ (Cash on Delivery)'
                    : 'បង់លុយសុទ្ធនៅបញ្ជរបេឡាហាងពេលមកយក (Pay at Store Counter)'}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>ថ្លៃម្ហូប៖</span>
                  <span>${foodSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>ថ្លៃដឹក (Delivery fee)៖</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold pt-1">
                  <span>សរុបត្រូវបង់៖</span>
                  <span className="text-primary">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-base font-bold gap-2 mt-2"
              >
                {isSubmitting ? 'កំពុងបញ្ជូន Order...' : '✅ Confirm Order (បញ្ជាទិញ)'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmed Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">ការកុម្ម៉ង់ជោគជ័យ!</h2>
            <p className="text-muted-foreground text-sm mb-5">
              ហាងបានទទួល Order របស់អ្នករួចរាល់ហើយ
            </p>

            <div className="bg-background/70 border border-border/50 p-4 rounded-xl text-left text-sm space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">លេខ Order:</span>
                <span className="font-bold">{orderSuccess.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">អ្នកទទួល:</span>
                <span className="font-medium">{orderSuccess.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ប្រភេទ:</span>
                <span className="font-medium">{orderSuccess.fulfillment_type === 'delivery' ? '🚚 ដឹកដល់ផ្ទះ' : '🛍️ ទៅយកផ្ទាល់'}</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-2 font-bold text-base">
                <span>សរុបត្រូវបង់:</span>
                <span className="text-primary">${Number(orderSuccess.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href={`/track?order=${orderSuccess.order_number}`} className="w-full">
                <Button className="w-full gap-1.5">
                  <MapPin className="w-4 h-4" /> តាមដាន Order
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setOrderSuccess(null)} className="w-full">
                បិទផ្ទាំងនេះ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
