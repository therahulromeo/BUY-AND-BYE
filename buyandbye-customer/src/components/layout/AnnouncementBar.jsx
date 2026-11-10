import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div
      style={{
        background: 'var(--dark-950)',
        color: '#FFFFFF',
        fontSize: '0.8rem',
        fontWeight: 600,
        padding: '0.45rem 1rem',
        borderBottom: '2px solid var(--yellow-500)',
      }}
    >
      <div
        className="container-wide"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {/* Left Side: Exclusive Promo Announcement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              background: 'var(--yellow-500)',
              color: 'var(--dark-950)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
          >
            Exclusive
          </span>
          <span style={{ color: '#E2E8F0', fontSize: '0.8rem' }}>
            Use code <strong style={{ color: 'var(--yellow-400)' }}>WELCOME10</strong> for 10% OFF | Free Shipping &gt; ₹499
          </span>
        </div>

        {/* Right Side: Trust & Quality Indicators */}
        <div className="announcement-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#CBD5E1', fontSize: '0.78rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={13} color="var(--yellow-400)" /> 100% Premium Cotton &amp; Linen
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={13} color="var(--yellow-400)" /> Verified Secure Shopping
          </span>
        </div>
      </div>
    </div>
  );
}
