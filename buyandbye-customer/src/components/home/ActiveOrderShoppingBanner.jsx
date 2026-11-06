import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Truck, Clock, ArrowRight, X, ShieldCheck } from 'lucide-react';
import '../../styles/tracking.css';

export default function ActiveOrderShoppingBanner() {
  const { lastPlacedOrder, trackOrderDirectly } = useStore();
  const [dismissed, setDismissed] = useState(false);

  // Only display if an order has been placed and user has not dismissed this session banner
  if (!lastPlacedOrder || dismissed) return null;

  // Calculate estimated delivery
  const orderDate = lastPlacedOrder.date ? new Date(lastPlacedOrder.date) : new Date();
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)',
        borderBottom: '2px solid #10B981',
        color: '#FFFFFF',
        padding: '0.65rem 1.25rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        zIndex: 40,
      }}
    >
      <div
        className="container-wide"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="live-pulse-dot" style={{ width: '9px', height: '9px' }}></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#34D399' }}>
              Live Order Tracking Active
            </span>
            <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: '#F1F5F9' }}>
              Order <strong>#{lastPlacedOrder.order_id}</strong> is being prepared for dispatch
            </span>
            <span
              style={{
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#FBBF24',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              Expected {formattedDelivery}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => trackOrderDirectly()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--yellow-500)',
              color: 'var(--dark-950)',
              border: 'none',
              padding: '5px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Truck size={14} />
            <span>Track your order</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
            title="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
