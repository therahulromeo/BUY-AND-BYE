import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { orderService } from '../../services/orderService';
import {
  X,
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  ExternalLink,
  ChevronRight,
  Phone,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import '../../styles/cart.css';
import '../../styles/tracking.css';

export default function OrderTrackingModal() {
  const { trackingOpen, setTrackingOpen, activeTrackingOrder, lastPlacedOrder } = useStore();
  const [query, setQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-load current active order without asking customer for Order ID
  useEffect(() => {
    if (trackingOpen) {
      const target = activeTrackingOrder || lastPlacedOrder || orderService.getLastOrder();
      if (target) {
        setTrackedOrder(target);
        setShowSearch(false);
        setNotFound(false);
      } else {
        setShowSearch(true);
      }
    }
  }, [trackingOpen, activeTrackingOrder, lastPlacedOrder]);

  if (!trackingOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const order = await orderService.trackOrder(query);
      if (order) {
        setTrackedOrder(order);
        setShowSearch(false);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (trackedOrder?.order_id) {
      navigator.clipboard.writeText(trackedOrder.order_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTimelineProgress = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return { pct: '100%', activeStep: 4 };
    if (s.includes('shipped') || s.includes('transit')) return { pct: '66%', activeStep: 3 };
    if (s.includes('processing') || s.includes('confirmed')) return { pct: '38%', activeStep: 2 };
    return { pct: '15%', activeStep: 1 };
  };

  const timelineInfo = trackedOrder ? getTimelineProgress(trackedOrder.order_status) : null;

  // Estimated delivery calculation (3 days from order date)
  const orderDate = trackedOrder?.date ? new Date(trackedOrder.date) : new Date();
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="modal-overlay" onClick={() => setTrackingOpen(false)}>
      <div
        className="modal-card"
        style={{ maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--primary-100)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--dark-900)' }}>
                Track your order
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--dark-500)' }}>
                Live dispatch & doorstep courier updates
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {trackedOrder && (
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setShowSearch(!showSearch)}
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                {showSearch ? 'View Active Order' : 'Track Another Order'}
              </button>
            )}
            <button className="drawer-close-btn" onClick={() => setTrackingOpen(false)}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Optional Search / Lookup Form (shown only if customer wants to look up a different order or no order exists) */}
          {showSearch && (
            <div
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-800)', marginBottom: '0.5rem' }}>
                Lookup by Order ID or Mobile Number:
              </div>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Enter 10-digit mobile or Order ID (e.g. BNB-ORD-1082)"
                    className="form-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Search
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--dark-400)',
                    }}
                  />
                </div>
                <button type="submit" className="btn btn-yellow" disabled={loading}>
                  {loading ? 'Searching...' : 'Track'}
                </button>
              </form>

              {notFound && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#DC2626', fontWeight: 600 }}>
                  No order found matching "{query}". Please verify the 10-digit phone or order ID.
                </div>
              )}
            </div>
          )}

          {/* ACTIVE TRACKING VIEW (Default - No Order ID requested!) */}
          {trackedOrder ? (
            <div className="animate-fade-in">
              {/* Active Order Banner */}
              <div className="order-tracking-info-banner">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
                      <span className="live-pulse-dot"></span>
                      <span>Live Order Tracking</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary-900)' }}>
                        {trackedOrder.order_id}
                      </span>
                      <button
                        onClick={handleCopyId}
                        className="tracking-copy-badge"
                        title="Copy Order ID"
                      >
                        {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dark-600)', marginTop: '2px' }}>
                      Tracking ID:{' '}
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-700)' }}>
                        {trackedOrder.tracking_number || 'TRK-992384'}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark-500)', textTransform: 'uppercase' }}>
                      Estimated Arrival
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
                      {formattedDelivery}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-800)', marginTop: '2px' }}>
                      Total: ₹{Math.round(trackedOrder.total_amount)}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(0, 86, 210, 0.12)', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--primary-800)' }}>
                  <Phone size={14} />
                  <span>
                    Tracking updates enabled for <strong>{trackedOrder.customer?.phone}</strong>
                  </span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="tracking-timeline">
                <div className="timeline-progress-line" style={{ width: timelineInfo.pct }}></div>

                <div className={`timeline-step ${timelineInfo.activeStep >= 1 ? 'completed' : ''}`}>
                  <div className="timeline-dot">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="timeline-label">Order Placed</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--dark-500)', marginTop: '2px' }}>
                    {formattedTime}
                  </span>
                </div>

                <div className={`timeline-step ${timelineInfo.activeStep >= 2 ? (timelineInfo.activeStep === 2 ? 'current' : 'completed') : ''}`}>
                  <div className="timeline-dot">
                    <Clock size={18} />
                  </div>
                  <span className="timeline-label">Quality Pack</span>
                  <span style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 700, marginTop: '2px' }}>
                    In Progress
                  </span>
                </div>

                <div className={`timeline-step ${timelineInfo.activeStep >= 3 ? (timelineInfo.activeStep === 3 ? 'current' : 'completed') : ''}`}>
                  <div className="timeline-dot">
                    <Truck size={18} />
                  </div>
                  <span className="timeline-label">In Transit</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--dark-500)', marginTop: '2px' }}>
                    On The Way
                  </span>
                </div>

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

              {/* Server Contact Info Card when tracker reaches In Transit */}
              {timelineInfo.activeStep >= 3 && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #FEFCE8 100%)',
                    border: '1.5px solid #93C5FD',
                    borderRadius: '12px',
                    padding: '0.9rem 1.15rem',
                    marginBottom: '1rem',
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
                        Your package is in transit! Please contact the number for order update or live arrival status.
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

              {/* Order Items */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--dark-900)', textTransform: 'uppercase' }}>
                  Items in Shipment ({trackedOrder.items?.length || 0})
                </h4>
                <span className="badge badge-blue">
                  Payment: {trackedOrder.payment_method}
                </span>
              </div>

              <div style={{ maxHeight: '170px', overflowY: 'auto', marginBottom: '1.25rem', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '0.75rem', background: '#FFFFFF' }}>
                {trackedOrder.items?.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: idx === trackedOrder.items.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={it.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&auto=format&fit=crop&q=80'}
                        alt=""
                        style={{ width: '36px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--dark-900)' }}>{it.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--dark-500)' }}>
                          Size: {it.size || 'L'} | Qty: {it.quantity}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700 }}>₹{Math.round(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Address Details */}
              <div style={{ fontSize: '0.85rem', color: 'var(--dark-700)', background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={18} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--dark-900)' }}>Destination:</strong> {trackedOrder.customer?.name} ({trackedOrder.customer?.phone})
                  <div style={{ color: 'var(--dark-600)', marginTop: '2px' }}>
                    {trackedOrder.shipping_address?.street}, {trackedOrder.shipping_address?.city}, {trackedOrder.shipping_address?.state} - {trackedOrder.shipping_address?.postal_code}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* If no active order exists (first time visitor before any purchase) */
            !showSearch && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-subtle)', color: 'var(--dark-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Package size={28} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '0.5rem' }}>
                  No Active Orders Placed Yet
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--dark-500)', maxWidth: '380px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                  Once you place an order, live tracking begins immediately right here with no order ID required.
                </p>
                <button
                  className="btn btn-yellow"
                  onClick={() => setShowSearch(true)}
                >
                  <Search size={16} /> Search Existing Order by Mobile
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
