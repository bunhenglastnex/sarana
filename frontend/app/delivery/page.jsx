'use client';

import { useState, useEffect } from 'react';

const DEFAULT_DELIVERY_ORDERS = [
  {
    id: 1,
    order_number: 'ORD-1001',
    customer_name: 'Dara Roth',
    customer_phone: '012 999 888',
    delivery_address: 'House #12, St 210, Toul Kork, Phnom Penh',
    total_amount: '11.00',
    status: 'ready_for_delivery',
    notes: 'Please call before arriving',
    items: [{ food_name: 'Classic Double Cheeseburger', quantity: 2, price: '4.50' }]
  }
];

export default function DeliveryStaffPage() {
  const [deliveryOrders, setDeliveryOrders] = useState(DEFAULT_DELIVERY_ORDERS);
  const [cashInHand, setCashInHand] = useState(0.00);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(false);

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
      // Offline mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOrders();
    const interval = setInterval(fetchDeliveryOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (orderId, action, amount) => {
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
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px', maxWidth: '700px' }}>
      {/* Rider Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛵 ផ្ទាំងបុគ្គលិកដឹកជញ្ជូន (Delivery Staff)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ឆែកមើលការងារដឹកជញ្ជូន និងប្រមូលលុយសុទ្ធ (Cash on Delivery)
        </p>
      </div>

      {/* Cash In Hand Summary Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '2px solid var(--primary)',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>💵 លុយសុទ្ធកំពុងកាន់ក្នុងដៃ (Cash In Hand):</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${cashInHand.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              ដឹកបានជោគជ័យ: {completedCount} Order (ត្រូវទូទាត់ជាមួយហាងចុងវេន)
            </div>
          </div>
          <button onClick={fetchDeliveryOrders} className="btn btn-outline" style={{ padding: '6px 12px' }}>
            🔄 {loading ? '...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Active Delivery Orders */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>
        📦 ការងារដែលត្រូវដឹក ({deliveryOrders.length})
      </h2>

      {deliveryOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div>🎉 គ្មាន Order ត្រូវដឹកនៅឡើយទេ!</div>
          <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
            នៅពេលហាងធ្វើម្ហូបរួចរាល់ Order នឹងលោតមកទីនេះដោយស្វ័យប្រវត្តិ។
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {deliveryOrders.map((order) => (
            <div key={order.id} className="card" style={{ borderLeft: '6px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{order.order_number}</span>
                <span className="badge badge-status-ontheway">
                  {order.status === 'ready_for_delivery' ? '📦 រង់ចាំទៅយកនៅហាង' : '🛵 កំពុងដឹកជញ្ជូន'}
                </span>
              </div>

              {/* Delivery Details */}
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.9rem' }}>
                <div><strong>👤 អតិថិជន:</strong> {order.customer_name}</div>
                <div><strong>📞 ទូរស័ព្ទ:</strong> <a href={`tel:${order.customer_phone}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{order.customer_phone}</a></div>
                <div><strong>📍 អាសយដ្ឋាន:</strong> {order.delivery_address}</div>
                {order.notes && <div style={{ color: '#f59e0b' }}><strong>📝 កំណត់សម្គាល់:</strong> {order.notes}</div>}
              </div>

              {/* Cash collection banner */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>💵 ត្រូវទារលុយសុទ្ធពីភ្ញៀវ៖</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ${Number(order.total_amount).toFixed(2)}
                </span>
              </div>

              {/* Action Buttons for Rider */}
              {order.status === 'ready_for_delivery' ? (
                <button
                  onClick={() => handleAction(order.id, 'pickup_from_kitchen', order.total_amount)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  📦 យកម្ហូបពីផ្ទះបាយ ➔ ចាប់ផ្ដើមចេញដឹក
                </button>
              ) : (
                <button
                  onClick={() => handleAction(order.id, 'confirm_delivered', order.total_amount)}
                  className="btn btn-success"
                  style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                >
                  ✅ បានប្រគល់ម្ហូប & បានលុយសុទ្ធ (${Number(order.total_amount).toFixed(2)}) រួចរាល់
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
