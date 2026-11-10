import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Truck, ShieldCheck, Mail, ArrowRight, Heart, ExternalLink, MapPin } from 'lucide-react';

export default function Footer() {
  const { setSelectedCategory, openOrderHistory, setSizeGuideOpen } = useStore();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    showToast('Subscribed! Check your inbox for your 10% welcome coupon.', 'success');
    setEmail('');
  };

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="contact-section" style={{ background: 'var(--dark-950)', color: '#FFFFFF', paddingTop: '4.5rem', borderTop: '3px solid var(--yellow-500)' }}>
      <div className="container-wide" style={{ paddingBottom: '3.5rem' }}>
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <a
              href="#"
              style={{
                display: 'inline-block',
                marginBottom: '1.25rem',
                background: 'transparent',
                padding: '0',
              }}
              title="BUY & BYE"
            >
              <img
                src="/logo.png"
                alt="BUY & BYE Mens Clothing"
                style={{ height: '64px', width: 'auto', objectFit: 'contain' }}
              />
            </a>

            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '340px', marginBottom: '1.25rem' }}>
              BUY & BYE is India's premier destination for elevated menswear. From boardroom-ready
              oxford formals to resort-ready linen casuals and tailored chinos.
            </p>

            {/* Store Address */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                color: '#E2E8F0',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '1.25rem',
                maxWidth: '340px',
              }}
            >
              <MapPin size={18} color="var(--yellow-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--yellow-400)',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '2px',
                  }}
                >
                  Store Location
                </span>
                <span style={{ color: '#F1F5F9', fontWeight: 500 }}>
                  Nehru street (Opposite to Girias ), M.M Saalai, Pondicherry.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1', fontSize: '0.85rem' }}>
              <Truck size={16} color="var(--yellow-400)" />
              <span>Free Doorstep Delivery on orders &gt; ₹499</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
              Shop Menswear
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: '#94A3B8' }}>
              <li>
                <button onClick={() => handleCategoryClick('formal-shirts')} style={{ color: '#CBD5E1', cursor: 'pointer' }}>
                  Formal Shirts
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('casual-shirts')} style={{ color: '#CBD5E1', cursor: 'pointer' }}>
                  Casual & Linen Shirts
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('trousers')} style={{ color: '#CBD5E1', cursor: 'pointer' }}>
                  Chinos & Trousers
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('t-shirts')} style={{ color: '#CBD5E1', cursor: 'pointer' }}>
                  Pique Polo T-Shirts
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('full-sleeve')} style={{ color: '#CBD5E1', cursor: 'pointer' }}>
                  Full Sleeve Classics
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Help & Admin */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
              Customer Care
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: '#94A3B8' }}>
              <li>
                <button onClick={() => openOrderHistory()} style={{ color: '#CBD5E1', cursor: 'pointer' }}>
                  Order History
                </button>
              </li>
              <li>
                <button onClick={() => setSizeGuideOpen(true)} style={{ color: '#CBD5E1', cursor: 'pointer' }}>
                  Menswear Size Guide
                </button>
              </li>
              <li>
                <span style={{ color: '#CBD5E1' }}>7-Day Returns & Exchanges</span>
              </li>
              <li>
                <span style={{ color: '#CBD5E1' }}>Support: care@buyandbye.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
              Join the VIP Circle
            </h4>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
              Subscribe for early access to limited seasonal drops and receive a 10% coupon code.
            </p>

            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                }}
              />
              <button type="submit" className="btn btn-yellow btn-sm" style={{ padding: '0 1rem' }}>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="footer-bottom-bar"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#64748B',
          }}
        >
          <div>
            © 2026 BUY & BYE — Mens Clothing. All Rights Reserved. Crafted with high distinction.
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>UPI</span>
            <span>•</span>
            <span>Visa</span>
            <span>•</span>
            <span>MasterCard</span>
            <span>•</span>
            <span>RuPay</span>
            <span>•</span>
            <span>NetBanking</span>
            <span>•</span>
            <span>Cash On Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
