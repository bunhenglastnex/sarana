'use client';

import { useState, useEffect, Suspense } from 'react';

function TrackContent() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Read URL search params manually for compatibility
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

  const fetchOrder = async (ordNum) => {
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
        order_number: ordNum || 'ORD-1001',
        customer_name: 'Dara Roth',
        fulfillment_type: 'delivery',
        delivery_address: 'House #12, St 210, Toul Kork',
        status: 'on_the_way',
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        total_amount: '11.00',
        items: [{ food_name: 'Classic Double Cheeseburger', quantity: 2 }]
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status, fulfillmentType) => {
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

  const deliverySteps = ['Order Placed', 'Accepted', 'Preparing Food', 'On the Way (Driver)', 'Delivered'];
  const pickupSteps = ['Order Placed', 'Accepted', 'Preparing Food', 'Ready for Pickup', 'Completed'];

  const currentStep = order ? getStepIndex(order.status, order.fulfillment_type) : 0;
  const steps = order?.fulfillment_type === 'pickup' ? pickupSteps : deliverySteps;

  return (
    <div className="container" style={{ paddingTop: '30px', paddingBottom: '60px', maxWidth: '650px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📍 តាមដានស្ថានភាព Order</h1>
        <p style={{ color: 'var(--text-muted)' }}>បញ្ចូលលេខ Order របស់អ្នកដើម្បីមើលស្ថានភាពផ្ទាល់</p>
      </div>

      {/* Search Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchOrder(orderNumber);
        }}
        style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}
      >
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="ឧ. ORD-1001"
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#1e293b',
            border: '1px solid var(--border)',
            color: '#fff',
            fontSize: '1rem'
          }}
        />
        <button type="submit" className="btn btn-primary">
          {loading ? 'កំពុងឆែក...' : 'ស្វែងរក'}
        </button>
      </form>

      {error && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '16px' }}>{error}</div>}

      {/* Order Status Result */}
      {order && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>{order.order_number}</span>
            <span className={`badge ${order.fulfillment_type === 'delivery' ? 'badge-delivery' : 'badge-pickup'}`}>
              {order.fulfillment_type === 'delivery' ? '🚚 ដឹកដល់ផ្ទះ' : '🛍️ មកយកផ្ទាល់'}
            </span>
          </div>

          {/* Graphical Step Progress */}
          <div style={{ margin: '24px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {steps.map((stepLabel, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={idx} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        margin: '0 auto 8px auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        backgroundColor: isPassed ? '#10b981' : '#334155',
                        color: isPassed ? '#fff' : '#94a3b8',
                        border: isCurrent ? '3px solid #f59e0b' : 'none'
                      }}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: isPassed ? '#f8fafc' : '#64748b',
                        fontWeight: isCurrent ? 700 : 400
                      }}
                    >
                      {stepLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Box */}
          <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', fontSize: '0.9rem' }}>
            <div><strong>👤 អតិថិជន:</strong> {order.customer_name}</div>
            {order.fulfillment_type === 'delivery' ? (
              <div><strong>📍 អាសយដ្ឋានដឹក:</strong> {order.delivery_address}</div>
            ) : (
              <div><strong>⏰ ម៉ោងមកយក:</strong> {order.pickup_time || 'ឆាប់ៗនេះ'}</div>
            )}
            <div style={{ marginTop: '6px' }}>
              <strong>💵 វិធីទូទាត់:</strong> {order.payment_method === 'cash_on_delivery' ? 'លុយសុទ្ធពេលដឹកដល់ (COD)' : 'លុយសុទ្ធនៅបញ្ជរ'}
            </div>
            <div style={{ marginTop: '6px', fontSize: '1.1rem' }}>
              <strong>សរុបត្រូវបង់:</strong>{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 800 }}>${Number(order.total_amount).toFixed(2)}</span>
              {order.payment_status === 'paid' ? (
                <span style={{ color: '#10b981', marginLeft: '8px', fontSize: '0.85rem' }}>(បានបង់ប្រាក់រួច ✅)</span>
              ) : (
                <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '0.85rem' }}>(មិនទាន់បង់ប្រាក់ - រង់ចាំបង់លុយសុទ្ធ ⏳)</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>កំពុងទាញយក...</div>}>
      <TrackContent />
    </Suspense>
  );
}
