import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Ruler,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Share2,
} from 'lucide-react';
import ProductCard from './ProductCard';
import '../../styles/products.css';
import '../../styles/cart.css';

export default function ProductDetailPage({ product, onBack }) {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setCartOpen,
    setCheckoutOpen,
    setSizeGuideOpen,
    products,
  } = useStore();

  const { showToast } = useToast();

  // Scroll to top on mount or when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.product_id]);

  if (!product) {
    return (
      <div className="container-wide" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <button className="btn btn-primary" onClick={onBack} style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Return to Shop
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.product_id);

  // Filter sizes: only sizes with quantity > 0
  const activeSizes = (() => {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes.filter((s) => {
        if (product.size_stock && product.size_stock[s] !== undefined) {
          return Number(product.size_stock[s]) > 0;
        }
        return true;
      });
    }
    if (product.size) return [product.size];
    if (product.base === 'Accesorries' && product.type === 'Watches') return [];
    if (product.base === 'Pants' || product.category_name?.toLowerCase().includes('pant')) {
      return ['32', '34', '36', '38', '40', '42'];
    }
    if (product.base === 'Accesorries' && product.type === 'Shoes') {
      return ['8', '9', '10'];
    }
    return ['S', 'M', 'L', 'XL', 'XXL'];
  })();

  const [selectedSize, setSelectedSize] = useState(activeSizes[0] || 'L');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [pincode, setPincode] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (activeSizes.length > 0 && (!selectedSize || !activeSizes.includes(selectedSize))) {
      setSelectedSize(activeSizes[0]);
    }
  }, [product.product_id, activeSizes.join(',')]);

  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80'];

  const selectedSizeStock =
    product.size_stock && product.size_stock[selectedSize] !== undefined
      ? Number(product.size_stock[selectedSize])
      : Number(product.stock) || 50;

  const handleAddToCart = () => {
    const sizeToUse = activeSizes.length > 0 ? selectedSize : '';
    addToCart(product, quantity, sizeToUse);
    setCartOpen(true);
    showToast(`Added ${quantity}x ${product.product_name} (${sizeToUse ? `Size ${sizeToUse}` : 'Standard'}) to cart!`, 'success');
  };

  const handleBuyNow = () => {
    const sizeToUse = activeSizes.length > 0 ? selectedSize : '';
    addToCart(product, quantity, sizeToUse);
    setCheckoutOpen(true);
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.trim().length >= 6) {
      setPincodeChecked(true);
      showToast('Delivery available to your location in 2-3 business days!', 'success');
    } else {
      showToast('Please enter a valid 6-digit postal pincode', 'error');
    }
  };

  // Related products (from same category or general catalog)
  const relatedProducts = (products || [])
    .filter((p) => p.product_id !== product.product_id)
    .slice(0, 4);

  return (
    <div className="product-detail-page-wrapper" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Breadcrumbs & Navigation Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)', padding: '0.85rem 0' }}>
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            onClick={onBack}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
          >
            <ArrowLeft size={16} /> Back to Catalog
          </button>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--dark-500)' }}>
            <span style={{ cursor: 'pointer', color: 'var(--primary-600)', fontWeight: 600 }} onClick={onBack}>
              Home
            </span>
            <ChevronRight size={13} />
            <span style={{ cursor: 'pointer', color: 'var(--primary-600)', fontWeight: 600 }} onClick={onBack}>
              Men's Apparel
            </span>
            <ChevronRight size={13} />
            <span style={{ color: 'var(--dark-400)' }}>{product.base || product.category_name || 'Shirt'}</span>
            {product.type && (
              <>
                <ChevronRight size={13} />
                <span style={{ color: 'var(--dark-400)' }}>{product.type}</span>
              </>
            )}
            <ChevronRight size={13} />
            <span style={{ fontWeight: 700, color: 'var(--dark-900)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {product.product_name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-wide" style={{ paddingTop: '1.5rem' }}>
        {/* Main Product Showcase Grid */}
        <div className="pdp-showcase-grid">
          {/* Left Column: Image Gallery */}
          <div>
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#F1F5F9',
                aspectRatio: '4 / 4.8',
                marginBottom: '1rem',
                border: '1px solid var(--border-light)',
                position: 'relative',
              }}
            >
              <img
                src={images[activeImageIdx] || product.image}
                alt={product.product_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
              />

              {/* Overlays / Badges */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className="badge badge-blue">{product.category_name || 'Men'}</span>
                {product.is_bestseller && <span className="badge badge-yellow">★ Bestseller</span>}
                {discountPercent > 0 && <span className="badge" style={{ background: '#EF4444', color: '#FFFFFF' }}>{discountPercent}% OFF</span>}
              </div>

              <button
                className={`card-wishlist-btn ${isFavorited ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                style={{ position: 'absolute', top: '16px', right: '16px' }}
                title="Save to Wishlist"
              >
                <Heart size={20} fill={isFavorited ? '#EF4444' : 'none'} color={isFavorited ? '#EF4444' : '#1E293B'} />
              </button>
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: '72px',
                      height: '86px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: idx === activeImageIdx ? '2.5px solid var(--primary-500)' : '1px solid var(--border-light)',
                      opacity: idx === activeImageIdx ? 1 : 0.7,
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Value Guarantees Banner */}
            <div className="pdp-guarantees-grid">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--dark-800)' }}>
                <Truck size={18} color="var(--primary-600)" />
                <span>2-Day Express Delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--dark-800)' }}>
                <ShieldCheck size={18} color="#10B981" />
                <span>100% Genuine Quality</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--dark-800)' }}>
                <RotateCcw size={18} color="var(--yellow-600)" />
                <span>7-Day Return / Exchange</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--dark-800)' }}>
                <CheckCircle2 size={18} color="#2563EB" />
                <span>Cash on Delivery Available</span>
              </div>
            </div>
          </div>

          {/* Right Column: Purchasing & Product Details */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Meta Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#F1F5F9', color: 'var(--dark-600)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-family-mono)' }}>
                SKU: {product.sku || `BNB-${product.product_id}`}
              </span>
              {product.base && (
                <span className="badge badge-blue" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                  Base: {product.base}
                </span>
              )}
              {(product.type || product.shirt_type || product.sleeves) && (
                <span className="badge badge-yellow" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                  {product.type || product.shirt_type || product.sleeves}
                </span>
              )}
              {product.sleeve_type && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                  {product.sleeve_type}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1
              style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                color: 'var(--dark-950)',
                lineHeight: 1.25,
                marginBottom: '0.75rem',
              }}
            >
              {product.product_name}
            </h1>

            {/* Ratings & Reviews */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--yellow-500)' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={17} fill="var(--yellow-500)" />
                ))}
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--dark-900)' }}>
                {product.rating || '4.8'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--dark-400)' }}>
                ({product.reviews_count || 42} Verified Buyer Reviews)
              </span>
            </div>

            {/* Price Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '1rem',
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: '1px solid var(--border-light)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--dark-950)' }}>
                ₹{Math.round(product.price)}
              </span>
              {product.original_price && (
                <span style={{ textDecoration: 'line-through', color: 'var(--dark-400)', fontSize: '1.2rem', fontWeight: 600 }}>
                  ₹{Math.round(product.original_price)}
                </span>
              )}
              {discountPercent > 0 && (
                <span style={{ background: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '0.875rem', padding: '3px 10px', borderRadius: '6px' }}>
                  Save {discountPercent}%
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--dark-400)', marginLeft: 'auto' }}>
                Inclusive of all taxes
              </span>
            </div>

            {/* Size Selector: ONLY shows sizes with quantity > 0 */}
            {activeSizes.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-900)' }}>
                    Select Size: <strong style={{ color: 'var(--primary-600)' }}>{selectedSize}</strong>
                    {selectedSizeStock > 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                        ({selectedSizeStock} available)
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--primary-600)',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                    }}
                  >
                    <Ruler size={14} /> Size Chart
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {activeSizes.map((sz) => {
                    const isSelected = sz === selectedSize;
                    const stockNum = product.size_stock?.[sz];
                    return (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          padding: '0.65rem 1.25rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid var(--primary-500)' : '1.5px solid var(--border-light)',
                          background: isSelected ? 'var(--primary-50)' : '#FFFFFF',
                          color: isSelected ? 'var(--primary-700)' : 'var(--dark-800)',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{sz}</span>
                        {stockNum !== undefined && (
                          <span style={{ fontSize: '0.7rem', color: isSelected ? 'var(--primary-600)' : '#64748B' }}>
                            ({stockNum})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Stock Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-900)' }}>Quantity:</span>
                <div className="cart-item-stepper" style={{ margin: 0 }}>
                  <button
                    className="stepper-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="stepper-val">{quantity}</span>
                  <button
                    className="stepper-btn"
                    onClick={() => setQuantity(Math.min(selectedSizeStock || 99, quantity + 1))}
                    disabled={quantity >= selectedSizeStock}
                  >
                    +
                  </button>
                </div>
              </div>

              {selectedSizeStock > 0 ? (
                <span
                  style={{
                    fontSize: '0.825rem',
                    color: selectedSizeStock <= 5 ? '#D97706' : '#15803D',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  {selectedSizeStock <= 5
                    ? `Hurry, only ${selectedSizeStock} left in stock!`
                    : 'In Stock (Ships in 24 hours)'}
                </span>
              ) : (
                <span style={{ fontSize: '0.825rem', color: '#DC2626', fontWeight: 700 }}>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Buying Action CTAs */}
            <div className="pdp-actions-row">
              <button
                className="btn btn-primary btn-lg pdp-btn-cta"
                onClick={handleAddToCart}
                disabled={selectedSizeStock <= 0}
              >
                <ShoppingBag size={18} /> Add to Bag
              </button>
              <button
                className="btn btn-yellow btn-lg pdp-btn-cta"
                onClick={handleBuyNow}
                disabled={selectedSizeStock <= 0}
              >
                <Zap size={18} /> Buy Now
              </button>
              <button
                className={`btn btn-outline btn-icon pdp-wishlist-btn ${isFavorited ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                title="Save to Wishlist"
              >
                <Heart size={22} fill={isFavorited ? '#EF4444' : 'none'} color={isFavorited ? '#EF4444' : 'currentColor'} />
              </button>
            </div>

            {/* Delivery Pincode Checker */}
            <div style={{ marginBottom: '1.75rem', padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-800)', display: 'block', marginBottom: '0.5rem' }}>
                Check Estimated Delivery Date:
              </span>
              <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode (e.g. 560034)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.875rem',
                  }}
                />
                <button type="submit" className="btn btn-outline btn-sm" style={{ fontWeight: 700 }}>
                  Check
                </button>
              </form>
              {pincodeChecked && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={14} /> Available: Free delivery by tomorrow, 4:00 PM
                </div>
              )}
            </div>

            {/* Product Specifications & Details Tabs */}
            <div>
              <div style={{ display: 'flex', borderBottom: '2px solid var(--border-light)', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  onClick={() => setActiveTab('description')}
                  style={{
                    padding: '0.5rem 0.25rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'description' ? '2.5px solid var(--primary-600)' : 'none',
                    fontWeight: activeTab === 'description' ? 800 : 600,
                    color: activeTab === 'description' ? 'var(--primary-600)' : 'var(--dark-500)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Description & Fabric
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  style={{
                    padding: '0.5rem 0.25rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'specifications' ? '2.5px solid var(--primary-600)' : 'none',
                    fontWeight: activeTab === 'specifications' ? 800 : 600,
                    color: activeTab === 'specifications' ? 'var(--primary-600)' : 'var(--dark-500)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Specifications
                </button>
              </div>

              {activeTab === 'description' ? (
                <div style={{ fontSize: '0.9rem', color: 'var(--dark-600)', lineHeight: 1.7 }}>
                  <p style={{ marginBottom: '0.75rem' }}>
                    {product.descriptions ||
                      'Crafted with premium high-twist cotton yarn for exceptional breathability, superior shape retention, and effortless daily comfort.'}
                  </p>
                  <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0', listStyleType: 'disc' }}>
                    <li>100% Premium Pure Cotton fabric</li>
                    <li>Pre-washed for zero shrinkage and ultra-soft feel</li>
                    <li>Reinforced lock-stitching on seams for lasting durability</li>
                    <li>Designed for all-day modern comfort and sharp presentation</li>
                  </ul>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div style={{ padding: '8px 12px', background: '#F8FAFC', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--dark-400)', display: 'block', fontSize: '0.75rem' }}>Fit Type</span>
                    <strong style={{ color: 'var(--dark-800)' }}>{product.fit || 'Regular / Tailored Fit'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#F8FAFC', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--dark-400)', display: 'block', fontSize: '0.75rem' }}>Fabric Care</span>
                    <strong style={{ color: 'var(--dark-800)' }}>Machine wash cold with like colors</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#F8FAFC', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--dark-400)', display: 'block', fontSize: '0.75rem' }}>Collar Style</span>
                    <strong style={{ color: 'var(--dark-800)' }}>Spread Classic Collar</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#F8FAFC', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--dark-400)', display: 'block', fontSize: '0.75rem' }}>Country of Origin</span>
                    <strong style={{ color: 'var(--dark-800)' }}>India</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Menswear Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark-900)' }}>
                  You May Also Like
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--dark-500)', marginTop: '2px' }}>
                  Complete your wardrobe with these matching customer favorites
                </p>
              </div>
              <button onClick={onBack} className="btn btn-outline btn-sm" style={{ fontWeight: 700 }}>
                View All Collection
              </button>
            </div>

            <div className="products-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
