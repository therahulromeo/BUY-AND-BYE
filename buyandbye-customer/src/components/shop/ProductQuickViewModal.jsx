import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Star, Heart, ShoppingBag, Zap, ShieldCheck, Truck, RotateCcw, Ruler } from 'lucide-react';
import '../../styles/cart.css';

export default function ProductQuickViewModal() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setCartOpen,
    setCheckoutOpen,
    setSizeGuideOpen,
  } = useStore();

  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const activeSizes = (product.sizes || (product.size ? [product.size] : [])).filter((s) => {
    if (product.size_stock && product.size_stock[s] !== undefined) {
      return Number(product.size_stock[s]) > 0;
    }
    return true;
  });
  const sizes = activeSizes;
  const colors = product.colors || ['Standard Navy', 'White'];
  const currentColor = selectedColor || colors[0];
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, currentColor);
    setQuickViewProduct(null);
    setCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, currentColor);
    setQuickViewProduct(null);
    setCheckoutOpen(true);
  };

  return (
    <div className="modal-overlay" onClick={() => setQuickViewProduct(null)}>
      <div className="modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="badge badge-blue">
            {product.base || product.category_name || 'Shirt'}
            {product.type ? ` ➔ ${product.type}` : ''}
          </span>
          <button className="drawer-close-btn" onClick={() => setQuickViewProduct(null)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body quickview-grid">
          {/* Left: Gallery */}
          <div>
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#F1F5F9',
                aspectRatio: '4 / 4.8',
                marginBottom: '1rem',
                border: '1px solid var(--border-light)',
              }}
            >
              <img
                src={images[activeImageIdx] || product.image}
                alt={product.product_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: '64px',
                      height: '76px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: idx === activeImageIdx ? '2px solid var(--primary-500)' : '1px solid var(--border-light)',
                    }}
                  >
                    <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details & Buying Controls */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--dark-500)', fontWeight: 600 }}>SKU: {product.sku}</span>
              {(product.shirt_type || product.sleeves) && (
                <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px' }}>
                  {product.shirt_type || product.sleeves}
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-900)', lineHeight: 1.25, marginBottom: '0.5rem' }}>
              {product.product_name}
            </h2>

            {/* Ratings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', color: 'var(--yellow-500)' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill="var(--yellow-500)" />
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-800)' }}>
                {product.rating || '4.8'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--dark-400)' }}>
                ({product.reviews_count || 42} Customer Reviews)
              </span>
            </div>

            {/* Price Row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--dark-950)' }}>
                ₹{Math.round(product.price)}
              </span>
              {product.original_price && (
                <span style={{ textDecoration: 'line-through', color: 'var(--dark-400)', fontSize: '1.1rem' }}>
                  ₹{Math.round(product.original_price)}
                </span>
              )}
              <span className="badge badge-success">Inclusive of all taxes</span>
            </div>

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--dark-900)' }}>
                    Select Size: <strong>{selectedSize || sizes[0]}</strong>
                    {product.size_stock && product.size_stock[selectedSize || sizes[0]] !== undefined && (
                      <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                        ({product.size_stock[selectedSize || sizes[0]]} in stock)
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)', cursor: 'pointer' }}
                  >
                    <Ruler size={13} /> Size Guide
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: s === (selectedSize || sizes[0]) ? '2px solid var(--primary-500)' : '1.5px solid var(--border-light)',
                        background: s === (selectedSize || sizes[0]) ? 'var(--primary-50)' : '#FFFFFF',
                        color: s === (selectedSize || sizes[0]) ? 'var(--primary-600)' : 'var(--dark-800)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--dark-900)' }}>Quantity:</span>
              <div className="cart-item-stepper" style={{ margin: 0 }}>
                <button className="stepper-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </button>
                <span className="stepper-val">{quantity}</span>
                <button className="stepper-btn" onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                ✓ In Stock (Ready to dispatch)
              </span>
            </div>

            {/* CTAs: Add to Cart & Buy Now */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={handleAddToCart}
              >
                <ShoppingBag size={18} /> Add to Bag
              </button>
              <button
                className="btn btn-yellow btn-lg"
                style={{ flex: 1 }}
                onClick={handleBuyNow}
              >
                <Zap size={18} /> Buy Now
              </button>
              <button
                className={`btn btn-outline btn-icon ${isFavorited ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                style={{ width: '48px', height: '48px', color: isFavorited ? '#EF4444' : 'inherit' }}
                title="Save to Wishlist"
              >
                <Heart size={20} fill={isFavorited ? '#EF4444' : 'none'} />
              </button>
            </div>

            {/* Descriptions & Fabric Info */}
            <div style={{ fontSize: '0.9rem', color: 'var(--dark-600)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {product.descriptions || 'Crafted with premium cotton yarn for everyday breathability and effortless modern fits.'}
            </div>

            {/* Assurance Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--dark-700)' }}>
                <Truck size={16} color="var(--primary-500)" />
                <span>2-Day Delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--dark-700)' }}>
                <ShieldCheck size={16} color="#10B981" />
                <span>100% Genuine</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--dark-700)' }}>
                <RotateCcw size={16} color="var(--yellow-600)" />
                <span>7-Day Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
