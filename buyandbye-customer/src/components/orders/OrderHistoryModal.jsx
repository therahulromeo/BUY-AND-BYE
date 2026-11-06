import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  MapPin,
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
  User,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import '../../styles/cart.css';
import '../../styles/tracking.css';

export default function OrderHistoryModal() {
  const {
    orderHistoryOpen,
    setOrderHistoryOpen,
    orders,
    viewOrderTracking,
    trackOrderDirectly,
    setSelectedCategory,
    customerProfile,
    setProfileModalOpen,
  } = useStore();
  const [copiedId, setCopiedId] = useState(null);

  if (!orderHistoryOpen) return null;

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) {
      return (
        <span
          style={{
            background: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <CheckCircle2 size={13} /> Delivered
        </span>
      );
    }
    if (s.includes('shipped') || s.includes('transit')) {
      return (
        <span
          style={{
            background: '#EFF6FF',
            color: '#2563EB',
            border: '1px solid #BFDBFE',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Truck size={13} /> In Transit
        </span>
      );
    }
    return (
      <span
        style={{
          background: '#FEF3C7',
          color: '#B45309',
          border: '1px solid #FDE68A',
          fontSize: '0.75rem',
          fontWeight: 800,
          padding: '3px 10px',
          borderRadius: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <Clock size={13} /> Processing
      </span>
    );
  };

  return (
    <div className="modal-overlay" onClick={() => setOrderHistoryOpen(false)}>
      <div
        className="modal-card"
        style={{ maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--primary-100)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--dark-900)' }}>
                  Order History
                </h3>
                {orders.length > 0 && (
                  <span className="badge badge-blue">{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</span>
                )}
                {customerProfile && (
                  <span
                    style={{
                      background: '#ECFDF5',
                      color: '#059669',
                      border: '1px solid #A7F3D0',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <ShieldCheck size={11} /> {customerProfile.name}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--dark-500)' }}>
                {customerProfile
                  ? `Showing purchases for ${customerProfile.name} (${customerProfile.email})`
                  : 'Please sign in with Email to view your orders'}
              </div>
            </div>
          </div>

          <button className="drawer-close-btn" onClick={() => setOrderHistoryOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {!customerProfile ? (
            /* Not Logged In State */
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <User size={32} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '0.5rem' }}>
                Sign In to View Your Orders
              </h4>
              <p style={{ color: 'var(--dark-500)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.75rem', lineHeight: 1.5 }}>
                Order history is private to your account. Sign in with your <strong>Email ID</strong> to receive a one-time OTP verification code.
              </p>
              <button
                className="btn btn-yellow btn-lg"
                onClick={() => {
                  setOrderHistoryOpen(false);
                  setProfileModalOpen(true);
                }}
                style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <User size={16} /> Sign In with Email OTP
              </button>
            </div>
          ) : orders.length === 0 ? (
            /* Empty State */
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--bg-subtle)',
                  color: 'var(--dark-400)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <Package size={32} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '0.5rem' }}>
                No Orders Placed Yet for {customerProfile.name}
              </h4>
              <p style={{ color: 'var(--dark-500)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.75rem', lineHeight: 1.5 }}>
                You haven't placed any orders with this account yet. Placed orders and live dispatch tracking will appear here.
              </p>
              <button
                className="btn btn-yellow btn-lg"
                onClick={() => {
                  setOrderHistoryOpen(false);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start Shopping <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            /* Order List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map((ord) => {
                const dateObj = ord.date ? new Date(ord.date) : new Date();
                const formattedDate = dateObj.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={ord.order_id}
                    style={{
                      border: '1.5px solid var(--border-light)',
                      borderRadius: '14px',
                      background: '#FFFFFF',
                      padding: '1.25rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    {/* Order Top Summary Bar */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        paddingBottom: '0.85rem',
                        borderBottom: '1px solid var(--border-light)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--dark-900)' }}>
                            {ord.order_id}
                          </span>
                          <button
                            onClick={() => handleCopy(ord.order_id)}
                            className="tracking-copy-badge"
                            title="Copy Order ID"
                          >
                            {copiedId === ord.order_id ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                            <span>{copiedId === ord.order_id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--dark-500)', marginTop: '2px' }}>
                          Placed on {formattedDate} at {formattedTime}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {getStatusBadge(ord.order_status)}
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--dark-400)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                            Total Paid
                          </span>
                          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--primary-600)' }}>
                            ₹{Math.round(ord.total_amount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Logistics & Address Info */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.3fr 1fr',
                        gap: '1rem',
                        padding: '0.75rem 0',
                        fontSize: '0.825rem',
                        color: 'var(--dark-600)',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--dark-400)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                          Delivery Destination
                        </span>
                        <div style={{ fontWeight: 700, color: 'var(--dark-800)', marginTop: '2px' }}>
                          {ord.customer?.name} • {ord.customer?.phone}
                        </div>
                        <div style={{ color: 'var(--dark-600)', lineHeight: 1.3, marginTop: '2px' }}>
                          {ord.shipping_address?.street}, {ord.shipping_address?.city}, {ord.shipping_address?.state} - {ord.shipping_address?.postal_code}
                        </div>
                      </div>

                      <div>
                        <span style={{ color: 'var(--dark-400)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                          Tracking & Payment
                        </span>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--primary-700)', marginTop: '2px', fontWeight: 700 }}>
                          Tracking ID: {ord.tracking_number || 'TRK-992384'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--dark-500)', marginTop: '2px' }}>
                          Payment: {ord.payment_method} ({ord.payment_status || 'Paid'})
                        </div>
                      </div>
                    </div>

                    {/* Server Contact Info if In Transit */}
                    {(ord.order_status?.toLowerCase().includes('transit') || ord.order_status?.toLowerCase().includes('shipped')) && (
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #EFF6FF 0%, #FEFCE8 100%)',
                          border: '1.5px solid #93C5FD',
                          borderRadius: '10px',
                          padding: '0.75rem 1rem',
                          marginBottom: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={16} color="#1D4ED8" />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B' }}>
                              Server Contact: Mobile Number : 9360250516.
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                              Order is in transit! Contact this number for live order updates.
                            </div>
                          </div>
                        </div>
                        <a
                          href="tel:9360250516"
                          className="btn btn-sm btn-yellow"
                          style={{ fontWeight: 800, textDecoration: 'none', padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          Call 9360250516
                        </a>
                      </div>
                    )}

                    {/* Items Thumbnails List */}
                    <div
                      style={{
                        background: 'var(--bg-subtle)',
                        borderRadius: '10px',
                        padding: '0.75rem',
                        marginTop: '0.25rem',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--dark-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Purchased Items ({ord.items?.length || 0})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {ord.items?.map((it, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.825rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img
                                src={it.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&auto=format&fit=crop&q=80'}
                                alt=""
                                style={{ width: '32px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                              <div>
                                <span style={{ fontWeight: 700, color: 'var(--dark-900)' }}>{it.name}</span>
                                <span style={{ color: 'var(--dark-500)', marginLeft: '6px', fontSize: '0.75rem' }}>
                                  (Size: {it.size || 'L'}, Qty: {it.quantity})
                                </span>
                              </div>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--dark-800)' }}>
                              ₹{Math.round(it.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      {/* 1-Click Track this order (Starts live tracking immediately!) */}
                      <button
                        className="btn btn-sm btn-yellow"
                        onClick={() => {
                          setOrderHistoryOpen(false);
                          if (trackOrderDirectly) {
                            trackOrderDirectly(ord);
                          } else if (viewOrderTracking) {
                            viewOrderTracking(ord);
                          }
                        }}
                        style={{ fontWeight: 800 }}
                      >
                        <Truck size={14} /> Track this order
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
