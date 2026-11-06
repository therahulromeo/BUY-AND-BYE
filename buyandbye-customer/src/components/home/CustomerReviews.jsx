import React from 'react';
import { TESTIMONIALS } from '../../data/catalogData';
import { Star, CheckCircle, Quote } from 'lucide-react';

export default function CustomerReviews() {
  return (
    <section id="reviews-section" style={{ padding: '4rem 0', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-light)' }}>
      <div className="container-wide">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          <span className="badge badge-yellow" style={{ marginBottom: '0.5rem' }}>
            VERIFIED BUYERS
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--dark-900)' }}>
            Loved by Over 10,000+ Men Across India
          </h2>
          <p style={{ color: 'var(--dark-500)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Read real feedback on our Egyptian cotton fabrics, comfort fits, and rapid fulfillment.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', color: 'var(--yellow-500)' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} fill="var(--yellow-500)" />
                    ))}
                  </div>
                  <Quote size={28} color="var(--primary-200)" />
                </div>

                <p style={{ fontSize: '0.95rem', color: 'var(--dark-700)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.5rem' }}>
                  "{t.comment}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--dark-900)' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--dark-400)' }}>{t.location}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                  <CheckCircle size={14} /> Verified Buyer
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
