import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  CheckCircle2,
  Truck,
  ShoppingBag,
  ArrowRight,
  Clock,
  Package,
  MapPin,
  Copy,
  Check,
  FileText,
  Phone,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import '../../styles/cart.css';
import '../../styles/checkout.css';
import '../../styles/tracking.css';

export default function OrderSuccessModal({ order, onClose }) {
  const { trackOrderDirectly, openOrderHistory } = useStore();
  const [activeTab, setActiveTab] = useState('tracking'); // 'tracking' starts by default!
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopyId = () => {
    if (order?.order_id) {
      navigator.clipboard.writeText(order.order_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper date calculations
  const orderDate = new Date(order.date || Date.now());
  const formattedOrderTime = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedOrderDate = orderDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Estimated delivery in 3 days
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const getTimelineProgress = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return { pct: '100%', activeStep: 4 };
    if (s.includes('shipped') || s.includes('transit')) return { pct: '66%', activeStep: 3 };
    if (s.includes('processing') || s.includes('confirmed')) return { pct: '38%', activeStep: 2 };
    return { pct: '15%', activeStep: 1 };
  };

  const timelineInfo = getTimelineProgress(order.order_status);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="success-card" style={{ padding: 'clamp(1rem, 3.5vw, 1.75rem)' }}>
          {/* Success Checkmark & Celebration Header */}
          <div className="success-icon-wrap" style={{ width: '64px', height: '64px', marginBottom: '1rem' }}>
            <CheckCircle2 size={38} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--dark-900)', marginBottom: '0.25rem' }}>
            Thank You for Your Order!
          </h2>
          <p style={{ color: 'var(--dark-500)', fontSize: '0.925rem', marginBottom: '1rem' }}>
            Order placed successfully! We're preparing your apparel with premium care.
          </p>

          {/* Order ID Badge with 1-Click Copy */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <div className="order-code-badge" style={{ margin: 0, fontSize: '1rem', padding: '0.35rem 1rem' }}>
              ORDER ID: {order.order_id}
            </div>
            <button
              onClick={handleCopyId}
              className="tracking-copy-badge"
              title="Copy Order ID"
            >
              {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Option Selector: Track your order (Active by Default) vs Order Details & Receipt */}
          <div className="order-tracking-nav-tabs">
            <button
              className={`tracking-tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracking')}
            >
              <span className="live-pulse-dot"></span>
              <Truck size={18} />
              <span>Track your order</span>
              <span
                style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid #A7F3D0',
                }}
              >
                Live Tracking Started
              </span>
            </button>

            <button
              className={`tracking-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <FileText size={17} />
              <span>Order Details</span>
            </button>
          </div>

          {/* TAB 1: TRACK YOUR ORDER (Starts right away without asking for Order ID) */}
          {activeTab === 'tracking' && (
            <div className="animate-fade-in" style={{ textAlign: 'left' }}>
              {/* Live Tracking Information Card */}
              <div className="order-tracking-info-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
                      <span className="live-pulse-dot"></span>
                      <span>Real-Time Courier Tracking Active</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--dark-950)', marginTop: '2px' }}>
                      {order.order_status === 'Processing' ? 'Quality Packing & Preparing Dispatch' : order.order_status}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dark-600)', marginTop: '4px' }}>
                      Tracking ID:{' '}
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-700)' }}>
                        {order.tracking_number}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark-500)', textTransform: 'uppercase' }}>
                      Estimated Doorstep Delivery
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
                      {formattedDelivery}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--dark-500)' }}>
                      Free Doorstep Express
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(0, 86, 210, 0.12)', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--primary-800)' }}>
                  <Phone size={14} />
                  <span>
                    Live SMS & WhatsApp dispatch tracking alerts confirmed to <strong>{order.customer?.phone}</strong>
                  </span>
                </div>
              </div>

              {/* Live Tracking Timeline */}
              <div style={{ padding: '0 0.5rem', marginBottom: '1.5rem' }}>
                <div className="tracking-timeline">
                  <div className="timeline-progress-line" style={{ width: timelineInfo.pct }}></div>

                  {/* Step 1: Placed */}
                  <div className={`timeline-step ${timelineInfo.activeStep >= 1 ? 'completed' : ''}`}>
                    <div className="timeline-dot">
                      <CheckCircle2 size={18} />
                    </div>
                    <span className="timeline-label">Order Placed</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--dark-500)', marginTop: '2px' }}>
                      {formattedOrderTime}
                    </span>
                  </div>

                  {/* Step 2: Quality Pack */}
                  <div className={`timeline-step ${timelineInfo.activeStep >= 2 ? 'current' : ''}`}>
                    <div className="timeline-dot">
                      <Clock size={18} />
                    </div>
                    <span className="timeline-label">Quality Pack</span>
                    <span style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 700, marginTop: '2px' }}>
                      In Progress
                    </span>
                  </div>

                  {/* Step 3: Courier In Transit */}
                  <div className={`timeline-step ${timelineInfo.activeStep >= 3 ? 'completed' : ''}`}>
                    <div className="timeline-dot">
                      <Truck size={18} />
                    </div>
                    <span className="timeline-label">In Transit</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--dark-500)', marginTop: '2px' }}>
                      On The Way
                    </span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className={`timeline-step ${timelineInfo.activeStep >= 4 ? 'completed' : ''}`}>
                    <div className="timeline-dot">
                      <MapPin size={18} />
                    </div>
                    <span className="timeline-label">Delivered</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--dark-500)', marginTop: '2px' }}>
                      {formattedDelivery}
                    </span>
                  </div>
                </div>
              </div>

              {/* Server Contact Info Card when tracker reaches In Transit */}
              {timelineInfo.activeStep >= 3 && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #FEFCE8 100%)',
                    border: '1.5px solid #93C5FD',
                    borderRadius: '12px',
                    padding: '0.9rem 1.15rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: '#DBEAFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1D4ED8',
                        flexShrink: 0,
                      }}
                    >
                      <Phone size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span>Server Contact:</span>
                        <span style={{ color: '#0056D2', background: '#DBEAFE', padding: '2px 8px', borderRadius: '6px' }}>
                          Mobile Number : 9360250516.
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                        Your package is in transit! Please contact the number for order update or delivery coordination.
                      </div>
                    </div>
                  </div>
                  <a
                    href="tel:9360250516"
                    className="btn btn-sm btn-yellow"
                    style={{
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                    }}
                  >
                    <Phone size={13} /> Call Server
                  </a>
                </div>
              )}

              {/* Delivery Address & Items Grid */}
              <div className="order-dest-queue-grid" style={{ marginBottom: '1.5rem' }}>
                {/* Destination Details */}
                <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '0.5rem' }}>
                    <MapPin size={16} color="var(--primary-500)" />
                    <span>Shipping Destination</span>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--dark-800)' }}>{order.customer?.name}</div>
                  <div style={{ color: 'var(--dark-600)', marginTop: '2px', lineHeight: 1.4 }}>
                    {order.shipping_address?.street}, {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.postal_code}
                  </div>
                  <div style={{ color: 'var(--dark-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Contact: {order.customer?.phone}
                  </div>
                </div>

                {/* Live Sync Confirmation */}
                <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-200)', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--primary-800)', marginBottom: '0.5rem' }}>
                    <ShieldCheck size={16} color="var(--primary-600)" />
                    <span>Live Admin Sync</span>
                  </div>
                  <p style={{ color: 'var(--primary-900)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                    Your order is registered in the database and is now live on the <strong>Admin Management Dashboard</strong> queue.
                  </p>
                  <div style={{ marginTop: '0.5rem', color: '#059669', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Tracking Waybill Generated
                  </div>
                </div>
              </div>

              {/* Order Items Preview */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--dark-900)', textTransform: 'uppercase' }}>
                    Shipment Items ({order.items?.length || 0})
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                    Total: ₹{Math.round(order.total_amount)}
                  </span>
                </div>

                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '0.75rem', background: '#FFFFFF' }}>
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&auto=format&fit=crop&q=80'}
                          alt=""
                          style={{ width: '36px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--dark-900)' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--dark-500)' }}>
                            Size: {item.size || 'L'} | Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--dark-900)' }}>
                        ₹{Math.round(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER DETAILS & RECEIPT */}
          {activeTab === 'details' && (
            <div className="animate-fade-in" style={{ textAlign: 'left' }}>
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div className="order-dest-queue-grid" style={{ marginBottom: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--dark-400)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Customer & Contact
                    </span>
                    <div style={{ fontWeight: 700, color: 'var(--dark-900)' }}>{order.customer?.name}</div>
                    <div style={{ color: 'var(--dark-600)', fontSize: '0.8rem' }}>{order.customer?.phone}</div>
                    <div style={{ color: 'var(--dark-500)', fontSize: '0.8rem' }}>{order.customer?.email}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--dark-400)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Payment Information
                    </span>
                    <div style={{ fontWeight: 700, color: 'var(--dark-900)' }}>{order.payment_method}</div>
                    <div style={{ color: '#059669', fontWeight: 700, fontSize: '0.8rem', marginTop: '2px' }}>
                      Status: {order.payment_status}
                    </div>
                    <div style={{ color: 'var(--dark-500)', fontSize: '0.75rem' }}>
                      Placed: {formattedOrderDate} at {formattedOrderTime}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--dark-400)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Shipping Address
                  </span>
                  <div style={{ color: 'var(--dark-800)', fontSize: '0.85rem' }}>
                    {order.shipping_address?.street}, {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.postal_code}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--dark-600)' }}>
                    <span>Subtotal</span>
                    <span>₹{Math.round(order.subtotal || order.total_amount)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                      <span>Discount Voucher</span>
                      <span>-₹{Math.round(order.discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--dark-600)' }}>
                    <span>GST (5% Apparel Tax)</span>
                    <span>₹{Math.round(order.tax || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--dark-600)' }}>
                    <span>Express Courier Delivery</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.05rem', color: 'var(--dark-900)' }}>
                    <span>Total Paid / Payable</span>
                    <span style={{ color: 'var(--primary-600)' }}>₹{Math.round(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button
              className="btn btn-yellow"
              style={{ flex: 1, fontWeight: 800 }}
              onClick={() => {
                onClose();
                openOrderHistory();
              }}
            >
              <Clock size={16} /> View Order History
            </button>

            <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>
              Continue Shopping <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
