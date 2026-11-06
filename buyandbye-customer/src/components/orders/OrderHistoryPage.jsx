import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  ShoppingBag,
  MapPin,
  Copy,
  Check,
  Phone,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import '../../styles/customerDetails.css';
import '../../styles/tracking.css';

export default function OrderHistoryPage({ onBack }) {
  const { orders, addToCart, setCartOpen, customerProfile, setProfileModalOpen } = useStore();
  const { showToast } = useToast();
  const [copiedId, setCopiedId] = useState(null);
  // State for toggling tracking per order (hidden by default)
  const [expandedTrackers, setExpandedTrackers] = useState({});

  const toggleTracker = (orderId) => {
    setExpandedTrackers((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReorder = (order) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        addToCart(
          {
            product_id: item.product_id,
            product_name: item.name,
            price: item.price,
            image: item.image,
          },
          item.quantity || 1,
          item.size || 'L',
          item.color || 'Standard'
        );
      });
      showToast(`Re-added ${order.items.length} items to your shopping bag!`, 'success');
      setCartOpen(true);
    }
  };

  const getTimelineProgress = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return { pct: '100%', activeStep: 4 };
    if (s.includes('shipped') || s.includes('transit')) return { pct: '66%', activeStep: 3 };
    if (s.includes('processing') || s.includes('confirmed')) return { pct: '38%', activeStep: 2 };
    return { pct: '15%', activeStep: 1 };
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) {
      return (
        <span
          style={{
            background: '#ECFDF5',
            color: '#059669',
            border: '1.5px solid #A7F3D0',
            fontSize: '0.8rem',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <CheckCircle2 size={14} /> Delivered
        </span>
      );
    }
    if (s.includes('shipped') || s.includes('transit')) {
      return (
        <span
          style={{
            background: '#EFF6FF',
            color: '#2563EB',
            border: '1.5px solid #BFDBFE',
            fontSize: '0.8rem',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Truck size={14} /> In Transit
        </span>
      );
    }
    return (
      <span
        style={{
          background: '#FEF3C7',
          color: '#B45309',
          border: '1.5px solid #FDE68A',
          fontSize: '0.8rem',
          fontWeight: 800,
          padding: '4px 12px',
          borderRadius: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <Clock size={14} /> Processing & Quality Pack
      </span>
    );
  };

  return (
    <div className="checkout-page-container" style={{ background: '#F8FAFC' }}>
      {/* Top Header Navigation */}
      <header className="checkout-page-nav" style={{ position: 'sticky', top: 0, zIndex: 30 }}>
        <div className="container-wide checkout-page-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button className="checkout-back-link" onClick={onBack}>
              <ArrowLeft size={16} /> Back to Store
            </button>
            <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
              <img
                src="/logo.png"
                alt="BUY & BYE Mens Clothing"
                style={{ height: '46px', width: 'auto', objectFit: 'contain' }}
              />
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              style={{
                background: 'var(--primary-50)',
                color: 'var(--primary-800)',
                border: '1px solid var(--primary-200)',
                fontSize: '0.825rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '20px',
              }}
            >
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} for {customerProfile?.name ? customerProfile.name.split(' ')[0] : 'Account'}
            </span>

            <button
              className="btn btn-sm btn-yellow"
              onClick={onBack}
              style={{ fontWeight: 800 }}
            >
              <ShoppingBag size={14} /> Shop Collection
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main style={{ padding: '2.5rem 0 4.5rem' }}>
        <div className="container-wide" style={{ maxWidth: '960px' }}>
          {/* Page Title Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">Customer Orders</span>
              <span className="badge badge-yellow">Order History</span>
              {customerProfile && (
                <span
                  style={{
                    background: '#ECFDF5',
                    color: '#059669',
                    border: '1px solid #A7F3D0',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ShieldCheck size={13} /> Logged in: {customerProfile.name} ({customerProfile.email})
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--dark-900)', letterSpacing: '-0.02em' }}>
              Order History
            </h1>
            <p style={{ color: 'var(--dark-500)', fontSize: '0.975rem', marginTop: '4px' }}>
              {customerProfile
                ? `Showing only your personal orders placed under ${customerProfile.name}. Click "Track Order" to view real-time delivery status.`
                : 'Sign in to access your private order history, delivery status, and real-time order tracking.'}
            </p>
          </div>

          {/* Condition 1: If User is Not Logged In */}
          {!customerProfile ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid var(--border-light)',
                padding: '3.5rem 2rem',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <User size={36} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '0.5rem' }}>
                Please Log In to View Your Orders
              </h2>
              <p style={{ color: 'var(--dark-500)', fontSize: '0.95rem', maxWidth: '460px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                Order history is strictly private to each logged-in customer. Please sign in with your registered <strong>Email ID</strong> to receive a one-time OTP verification code.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-yellow btn-lg"
                  onClick={() => setProfileModalOpen(true)}
                  style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <User size={18} /> Sign In with Email OTP
                </button>
                <button className="btn btn-outline btn-lg" onClick={onBack}>
                  Browse Store Collection
                </button>
              </div>
            </div>
          ) : orders.length === 0 ? (
            /* Condition 2: If User is Logged In But Has Placed No Orders Yet */
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid var(--border-light)',
                padding: '4rem 2rem',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'var(--bg-subtle)',
                  color: 'var(--dark-400)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <Package size={36} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '0.5rem' }}>
                No Orders Placed Yet for {customerProfile.name}
              </h2>
              <p style={{ color: 'var(--dark-500)', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                You haven't placed any orders with this account yet. Once you place an order, its details, delivery milestones, and real-time courier tracking will appear right here.
              </p>
              <button className="btn btn-yellow btn-lg" onClick={onBack} style={{ fontWeight: 800 }}>
                Explore Menswear Catalog <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            /* Condition 3: Orders List of Current Logged-in User */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {orders.map((ord, orderIndex) => {
                const dateObj = ord.date ? new Date(ord.date) : new Date();
                const formattedDate = dateObj.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                // Estimated delivery in 3 days
                const deliveryDate = new Date(dateObj);
                deliveryDate.setDate(deliveryDate.getDate() + 3);
                const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });

                const timelineInfo = getTimelineProgress(ord.order_status);
                const isTrackerVisible = !!expandedTrackers[ord.order_id];

                return (
                  <div
                    key={ord.order_id || orderIndex}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1.5px solid var(--border-light)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* 1. ORDER SUMMARY HEADER */}
                    <div
                      style={{
                        padding: '1.25rem 1.5rem',
                        background: '#F8FAFC',
                        borderBottom: '1.5px solid var(--border-light)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--dark-900)' }}>
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
                        <div style={{ fontSize: '0.8rem', color: 'var(--dark-500)', marginTop: '2px' }}>
                          Placed on {formattedDate} at {formattedTime}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        {getStatusBadge(ord.order_status)}

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--dark-400)', textTransform: 'uppercase', fontWeight: 700 }}>
                            Total Amount
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary-600)' }}>
                            ₹{Math.round(ord.total_amount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. ORDER ITEMS PREVIEW */}
                    <div style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--dark-700)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                        Purchased Items ({ord.items?.length || 0})
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        {ord.items?.map((it, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              background: 'var(--bg-subtle)',
                              padding: '10px 12px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-light)',
                            }}
                          >
                            <img
                              src={it.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=120&auto=format&fit=crop&q=80'}
                              alt=""
                              style={{ width: '42px', height: '50px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--dark-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {it.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--dark-500)', marginTop: '2px' }}>
                                Size: <strong>{it.size || 'L'}</strong> | Qty: <strong>{it.quantity}</strong>
                              </div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--dark-900)' }}>
                              ₹{Math.round(it.price * it.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Card Action Row with "Track Order" button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--dark-500)' }}>
                          Payment Method: <strong>{ord.payment_method}</strong> ({ord.payment_status || 'Paid'})
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleReorder(ord)}
                          >
                            <RotateCcw size={15} /> Reorder
                          </button>

                          {/* "Track Order" button: On click, reveals the order tracker below! */}
                          <button
                            className={`btn btn-sm ${isTrackerVisible ? 'btn-primary' : 'btn-yellow'}`}
                            onClick={() => toggleTracker(ord.order_id)}
                            style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Truck size={15} />
                            <span>{isTrackerVisible ? 'Hide Tracking' : 'Track Order'}</span>
                            {isTrackerVisible ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 3. ORDER TRACKER (Hidden by default; shown on click of "Track Order") */}
                    {isTrackerVisible && (
                      <div
                        className="animate-fade-in"
                        style={{
                          padding: '1.5rem',
                          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                          borderTop: '1.5px solid var(--border-light)',
                        }}
                      >
                        {/* Tracking Section Banner */}
                        <div
                          style={{
                            background: 'linear-gradient(135deg, #F0FDF4 0%, #EFF6FF 100%)',
                            border: '1.5px solid #BBF7D0',
                            borderRadius: '14px',
                            padding: '1.15rem 1.25rem',
                            marginBottom: '1.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
                                <span className="live-pulse-dot"></span>
                                <span>Live Order Tracking & Dispatch Status</span>
                              </div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--dark-950)', marginTop: '2px' }}>
                                {ord.order_status === 'Processing'
                                  ? 'Quality Inspection & Eco-Packaging in Progress'
                                  : ord.order_status}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--dark-600)', marginTop: '4px' }}>
                                Tracking ID:{' '}
                                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-700)' }}>
                                  {ord.tracking_number || 'TRK-992384'}
                                </span>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark-500)', textTransform: 'uppercase' }}>
                                Expected Doorstep Delivery
                              </div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
                                {formattedDelivery}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--dark-500)' }}>
                                Delivery to {ord.shipping_address?.city || 'Customer'}
                              </div>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid rgba(0, 86, 210, 0.12)', paddingTop: '0.5rem', marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--primary-800)' }}>
                            <Phone size={14} />
                            <span>
                              Real-time SMS & WhatsApp dispatch tracking active for <strong>{ord.customer?.phone}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Visual 4-Step Tracking Timeline */}
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
                                {formattedTime}
                              </span>
                            </div>

                            {/* Step 2: Quality Pack */}
                            <div className={`timeline-step ${timelineInfo.activeStep >= 2 ? (timelineInfo.activeStep === 2 ? 'current' : 'completed') : ''}`}>
                              <div className="timeline-dot">
                                <Clock size={18} />
                              </div>
                              <span className="timeline-label">Quality Pack</span>
                              <span style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 700, marginTop: '2px' }}>
                                In Progress
                              </span>
                            </div>

                            {/* Step 3: In Transit */}
                            <div className={`timeline-step ${timelineInfo.activeStep >= 3 ? (timelineInfo.activeStep === 3 ? 'current' : 'completed') : ''}`}>
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
                              padding: '1rem 1.25rem',
                              marginBottom: '1.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '12px',
                              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '50%',
                                  background: '#DBEAFE',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#1D4ED8',
                                  flexShrink: 0,
                                }}
                              >
                                <Phone size={20} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <span>Server Contact Details :</span>
                                  <span style={{ color: '#0056D2', background: '#DBEAFE', padding: '2px 8px', borderRadius: '6px', fontFamily: 'inherit' }}>
                                    Mobile Number : 9360250516.
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '4px' }}>
                                  Your package is in transit! Please contact the number for order update, live dispatch coordinates, or delivery assistance.
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
                                padding: '8px 16px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                              }}
                            >
                              <Phone size={14} /> Call Server
                            </a>
                          </div>
                        )}

                        {/* Destination Address & Fulfillment Queue Sync */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                          <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '0.4rem' }}>
                              <MapPin size={16} color="var(--primary-500)" />
                              <span>Destination Address</span>
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--dark-800)' }}>
                              {ord.customer?.name} ({ord.customer?.phone})
                            </div>
                            <div style={{ color: 'var(--dark-600)', marginTop: '2px', lineHeight: 1.4 }}>
                              {ord.shipping_address?.street}, {ord.shipping_address?.city}, {ord.shipping_address?.state} - {ord.shipping_address?.postal_code}
                            </div>
                          </div>

                          <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--primary-200)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--primary-800)', marginBottom: '0.4rem' }}>
                              <ShieldCheck size={16} color="var(--primary-600)" />
                              <span>Admin Fulfillment Queue</span>
                            </div>
                            <div style={{ color: 'var(--primary-900)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                              Synced with Admin Dashboard. Real-time updates reflect automatically as warehouse fulfillment moves forward.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
