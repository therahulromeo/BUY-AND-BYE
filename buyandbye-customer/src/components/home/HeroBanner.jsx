import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Star, ShieldCheck, Truck, RotateCcw, CreditCard, Sparkles } from 'lucide-react';
import '../../styles/hero.css';

export default function HeroBanner() {
  const { setSelectedCategory } = useStore();

  const scrollToCatalog = (catId = 'all') => {
    setSelectedCategory(catId);
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="hero-section diwali-theme">
        {/* Festive Diwali Ambient Glows & Sparkles */}
        <div className="hero-glow-1 diwali-glow-amber"></div>
        <div className="hero-glow-2 diwali-glow-purple"></div>
        <div className="diwali-rangoli-bg"></div>

        {/* Decorative Festive Toran Lights along top */}
        <div className="diwali-toran-lights" aria-hidden="true">
          <span className="light light-gold"></span>
          <span className="light light-red"></span>
          <span className="light light-orange"></span>
          <span className="light light-gold"></span>
          <span className="light light-purple"></span>
          <span className="light light-yellow"></span>
          <span className="light light-gold"></span>
          <span className="light light-red"></span>
          <span className="light light-orange"></span>
          <span className="light light-gold"></span>
        </div>

        <div className="container-wide hero-grid diwali-hero-grid">
          {/* Left Column: Headlines & CTAs */}
          <div className="diwali-hero-left">
            <div className="diwali-badge-pill">
              <span className="diwali-diya-emoji" role="img" aria-label="diya">🪔</span>
              <span className="diwali-badge-text">DIWALI DHAMAKA SALE • PONDICHERRY EXCLUSIVE</span>
              <Sparkles size={16} className="diwali-sparkle-icon" />
            </div>

            <h1 className="hero-title diwali-trendy-title">
              <span className="title-lead">EVERTHING IS</span>
              <span className="price-500-pop">
                <span className="rupee-char">₹</span>500!
              </span>
            </h1>

            <p className="hero-subtitle diwali-subtitle">
              Grand Diwali Festive Offer! Grab any premium shirt, casual linen, stylish chinos,
              or comfort graphic tee — <strong style={{ color: '#FFE600' }}>every single item at flat ₹500!</strong> Light up your festive style without breaking the bank.
            </p>

            <div className="hero-actions">
              <button className="btn btn-yellow btn-lg diwali-cta-btn" onClick={() => scrollToCatalog('all')}>
                <span>Shop ₹500 Collection</span> <ArrowRight size={20} />
              </button>
              <button
                className="btn btn-outline diwali-secondary-btn"
                onClick={() => scrollToCatalog('formal-shirts')}
              >
                Formal Shirts @ ₹500
              </button>
              <button
                className="btn btn-outline diwali-secondary-btn"
                onClick={() => scrollToCatalog('casual-shirts')}
              >
                Casuals @ ₹500
              </button>
            </div>

            <div className="hero-stats diwali-stats">
              <div className="stat-item">
                <span className="stat-number stat-highlight">₹500</span>
                <span className="stat-label">Flat Any Item</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Pure Cotton & Linen</span>
              </div>
              <div className="stat-item">
                <span className="stat-number stat-highlight">🪔 Special</span>
                <span className="stat-label">Diwali Price Drop</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">Nehru St.</span>
                <span className="stat-label">Opposite to Girias</span>
              </div>
            </div>
          </div>

          {/* Grid column spacer to balance 2-column layout on desktop */}
          <div className="diwali-hero-spacer" aria-hidden="true"></div>
        </div>

        {/* Half Circle on Left followed by Square to right edge of banner with Fireworks & Character */}
        <div className="hero-fireworks-shape">
          {/* Fireworks Background */}
          <img
            src="/diwali-fireworks.jpg"
            alt="Diwali Fireworks Celebration"
            className="fireworks-bg-img"
          />

          {/* Character illustration leaning against ₹500 shopping bag */}
          <img
            src="/diwali-character.png"
            alt="Everything is ₹500 - BUY & BYE"
            className="fireworks-character-img"
          />
        </div>
      </section>

      {/* Value Props Strip */}
      <div className="value-props-strip">
        <div className="container-wide value-props-grid">
          <div className="prop-card">
            <div className="prop-icon-box">
              <Truck size={24} />
            </div>
            <div>
              <div className="prop-title">Free Express Shipping</div>
              <div className="prop-desc">Across all Indian states on orders above ₹499</div>
            </div>
          </div>

          <div className="prop-card">
            <div className="prop-icon-box">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="prop-title">100% Quality Fabric</div>
              <div className="prop-desc">Egyptian cotton, flax linen, and wrinkle-free finish</div>
            </div>
          </div>

          <div className="prop-card">
            <div className="prop-icon-box">
              <RotateCcw size={24} />
            </div>
            <div>
              <div className="prop-title">7-Day Doorstep Returns</div>
              <div className="prop-desc">Instant size exchanges or full refund guarantee</div>
            </div>
          </div>

          <div className="prop-card">
            <div className="prop-icon-box">
              <CreditCard size={24} />
            </div>
            <div>
              <div className="prop-title">Flexible Payments</div>
              <div className="prop-desc">UPI, Google Pay, PhonePe, Cards & Cash on Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
