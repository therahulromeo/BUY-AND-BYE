import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Ruler } from 'lucide-react';
import '../../styles/cart.css';

export default function SizeGuideModal() {
  const { sizeGuideOpen, setSizeGuideOpen } = useStore();

  if (!sizeGuideOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setSizeGuideOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.2rem', color: 'var(--dark-900)' }}>
            <Ruler size={22} color="var(--primary-500)" />
            <span>BUY & BYE Size Chart</span>
          </div>
          <button className="drawer-close-btn" onClick={() => setSizeGuideOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '0.75rem' }}>
            Men's Shirts Size Specs (Inches)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginBottom: '2rem' }}>
            <thead>
              <tr style={{ background: 'var(--primary-50)', textAlign: 'left', borderBottom: '2px solid var(--primary-200)' }}>
                <th style={{ padding: '8px 12px' }}>Size</th>
                <th style={{ padding: '8px 12px' }}>Chest (in)</th>
                <th style={{ padding: '8px 12px' }}>Shoulder (in)</th>
                <th style={{ padding: '8px 12px' }}>Length (in)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>S (38)</td>
                <td style={{ padding: '8px 12px' }}>39"</td>
                <td style={{ padding: '8px 12px' }}>17.5"</td>
                <td style={{ padding: '8px 12px' }}>29"</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>M (40)</td>
                <td style={{ padding: '8px 12px' }}>41"</td>
                <td style={{ padding: '8px 12px' }}>18.2"</td>
                <td style={{ padding: '8px 12px' }}>29.5"</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--yellow-50)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--primary-700)' }}>L (42) — Standard</td>
                <td style={{ padding: '8px 12px' }}>43"</td>
                <td style={{ padding: '8px 12px' }}>19"</td>
                <td style={{ padding: '8px 12px' }}>30"</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>XL (44)</td>
                <td style={{ padding: '8px 12px' }}>45"</td>
                <td style={{ padding: '8px 12px' }}>19.8"</td>
                <td style={{ padding: '8px 12px' }}>30.5"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>XXL (46)</td>
                <td style={{ padding: '8px 12px' }}>47"</td>
                <td style={{ padding: '8px 12px' }}>20.5"</td>
                <td style={{ padding: '8px 12px' }}>31"</td>
              </tr>
            </tbody>
          </table>

          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '0.75rem' }}>
            Men's Trousers & Chinos (Inches)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--primary-50)', textAlign: 'left', borderBottom: '2px solid var(--primary-200)' }}>
                <th style={{ padding: '8px 12px' }}>Waist</th>
                <th style={{ padding: '8px 12px' }}>Hip (in)</th>
                <th style={{ padding: '8px 12px' }}>Thigh (in)</th>
                <th style={{ padding: '8px 12px' }}>Inseam (in)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>30</td>
                <td style={{ padding: '8px 12px' }}>38"</td>
                <td style={{ padding: '8px 12px' }}>23"</td>
                <td style={{ padding: '8px 12px' }}>31"</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>32</td>
                <td style={{ padding: '8px 12px' }}>40"</td>
                <td style={{ padding: '8px 12px' }}>24"</td>
                <td style={{ padding: '8px 12px' }}>31.5"</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>34</td>
                <td style={{ padding: '8px 12px' }}>42"</td>
                <td style={{ padding: '8px 12px' }}>25"</td>
                <td style={{ padding: '8px 12px' }}>32"</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>36</td>
                <td style={{ padding: '8px 12px' }}>44"</td>
                <td style={{ padding: '8px 12px' }}>26"</td>
                <td style={{ padding: '8px 12px' }}>32.5"</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '1.5rem', background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--dark-600)' }}>
            💡 <strong>Fit Tip:</strong> If you prefer a relaxed comfort silhouette, we recommend choosing one size up. All garments include pre-washed anti-shrinkage treatment.
          </div>
        </div>
      </div>
    </div>
  );
}
