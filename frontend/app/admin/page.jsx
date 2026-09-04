'use client';

import { useState, useEffect } from 'react';

// Default mock orders for demo if backend isn't running
const DEFAULT_ORDERS = [
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
    status: 'ready_for_delivery',
    items: [{ food_name: 'Classic Double Cheeseburger', quantity: 2, price: '4.50' }]
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
    status: 'preparing',
    items: [{ food_name: 'Classic Double Cheeseburger', quantity: 1, price: '4.50' }]
  }
];

export default function KitchenAdminPage() {
  const [orders, setOrders] = useState(DEFAULT_ORDERS);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/orders.php');
      const data = await res.json();
      if (data.success && data.orders?.length > 0) {
        setOrders(data.orders);
      }
    } catch {
      // Keep mock orders if offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, newStatus) => {
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
      // Local update if offline
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏪 ផ្ទាំងគ្រប់គ្រងផ្ទះបាយ និង Order (Kitchen Dashboard)
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            តាមដាន និងផ្លាស់ប្តូរស្ថានភាពកុម្ម៉ង់សម្រាប់ Pickup និង Delivery
          </p>
        </div>
        <button onClick={fetchOrders} className="btn btn-outline">
          🔄 {loading ? 'កំពុងទាញយក...' : 'Refresh'}
        </button>
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {orders.map((order) => (
          <div key={order.id} className="card" style={{ borderLeft: `6px solid ${order.fulfillment_type === 'delivery' ? '#3b82f6' : '#a855f7'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, marginRight: '10px' }}>
                  {order.order_number}
                </span>
                <span className={`badge ${order.fulfillment_type === 'delivery' ? 'badge-delivery' : 'badge-pickup'}`}>
                  {order.fulfillment_type === 'delivery' ? '🚚 Delivery (ដឹកដល់ផ្ទះ)' : '🛍️ Pickup (មកយកនៅហាង)'}
                </span>
              </div>
              <div>
                <span className="badge badge-status-preparing" style={{ fontSize: '0.85rem' }}>
                  Status: {order.status}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', background: '#0f172a', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.9rem' }}>
              <div><strong>👤 ភ្ញៀវ:</strong> {order.customer_name} ({order.customer_phone})</div>
              {order.fulfillment_type === 'delivery' ? (
                <div><strong>📍 អាសយដ្ឋាន:</strong> {order.delivery_address}</div>
              ) : (
                <div><strong>⏰ ម៉ោងមកយក:</strong> {order.pickup_time || 'ឆាប់ៗនេះ'}</div>
              )}
              <div><strong>💵 ការបង់ប្រាក់:</strong> {order.payment_method === 'cash_on_delivery' ? 'លុយសុទ្ធពេលដឹកដល់ (COD)' : 'លុយសុទ្ធនៅបញ្ជរ'}</div>
              <div><strong>💰 តម្លៃសរុប:</strong> <span style={{ color: 'var(--primary)', fontWeight: 700 }}>${Number(order.total_amount).toFixed(2)}</span></div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>មុខម្ហូប៖</div>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)' }}>
                {order.items?.map((it, idx) => (
                  <li key={idx}>
                    {it.food_name} x <strong>{it.quantity}</strong> (${Number(it.price).toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons based on status */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {order.status === 'pending' && (
                <button onClick={() => updateStatus(order.id, 'accepted')} className="btn btn-primary">
                  ✓ ទទួល Order (Accept)
                </button>
              )}

              {order.status === 'accepted' && (
                <button onClick={() => updateStatus(order.id, 'preparing')} className="btn btn-primary">
                  🍳 ចាប់ផ្ដើមធ្វើម្ហូប (Preparing)
                </button>
              )}

              {order.status === 'preparing' && (
                <>
                  {order.fulfillment_type === 'delivery' ? (
                    <button onClick={() => updateStatus(order.id, 'ready_for_delivery')} className="btn btn-success">
                      📦 ម្ហូបរួចរាល់ ➔ ផ្ដល់ដំណឹងឱ្យ Delivery
                    </button>
                  ) : (
                    <button onClick={() => updateStatus(order.id, 'ready_for_pickup')} className="btn btn-success">
                      🛍️ ម្ហូបរួចរាល់ ➔ ផ្ដល់ដំណឹងឱ្យភ្ញៀវមកយក
                    </button>
                  )}
                </>
              )}

              {order.status === 'ready_for_pickup' && (
                <button onClick={() => updateStatus(order.id, 'completed')} className="btn btn-primary">
                  ✅ ប្រគល់ម្ហូប & ទទួលលុយសុទ្ធ (${Number(order.total_amount).toFixed(2)}) ➔ បញ្ចប់
                </button>
              )}

              {order.status === 'ready_for_delivery' && (
                <div style={{ color: '#60a5fa', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                  ⏳ កំពុងរង់ចាំអ្នកដឹកជញ្ជូន (Delivery Staff) មកទទួលយកម្ហូប...
                </div>
              )}

              {order.status === 'on_the_way' && (
                <div style={{ color: '#ec4899', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                  🛵 អ្នកដឹកកំពុងធ្វើដំណើរទៅផ្ទះភ្ញៀវ...
                </div>
              )}

              {order.status === 'completed' && (
                <div style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  ✓ Order បញ្ចប់ដោយជោគជ័យ
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
