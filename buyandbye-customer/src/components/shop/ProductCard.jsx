import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Star, Heart, ShoppingBag, Eye, Zap } from 'lucide-react';

export default function ProductCard({ product }) {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
    setCartOpen,
    openProductDetailPage,
    setSelectedProduct,
  } = useStore();

  const isFavorited = isInWishlist(product.product_id);
  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleOpenProduct = (e) => {
    e?.stopPropagation();
    if (openProductDetailPage) {
      openProductDetailPage(product);
    } else if (setSelectedProduct) {
      setSelectedProduct(product);
    } else {
      setQuickViewProduct(product);
    }
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    const firstSize = (product.sizes && product.sizes.length > 0)
      ? product.sizes[0]
      : (product.size || 'L');
    addToCart(product, 1, firstSize);
    setCartOpen(true);
  };

  return (
    <div className="product-card" onClick={handleOpenProduct} style={{ cursor: 'pointer' }}>
      {/* Image & Action Overlays */}
      <div className="product-img-box" onClick={handleOpenProduct}>
        <img
          src={product.image}
          alt={product.product_name}
          className="product-img"
          loading="lazy"
        />

        {/* Badges */}
        <div className="badge-tag-wrap">
          {product.is_bestseller && (
            <span className="badge badge-yellow">★ Bestseller</span>
          )}
          {discountPercent > 0 && (
            <span className="badge badge-blue">{discountPercent}% OFF</span>
          )}
        </div>

        {/* Wishlist Heart */}
        <button
          className={`card-wishlist-btn ${isFavorited ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          title={isFavorited ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart size={18} fill={isFavorited ? '#EF4444' : 'none'} />
        </button>

        {/* Hover Quick Actions */}
        <div className="card-quick-actions">
          <button
            className="btn btn-yellow btn-sm"
            style={{ flex: 1, padding: '0.6rem 0.8rem' }}
            onClick={handleQuickAdd}
          >
            <ShoppingBag size={16} /> Quick Add
          </button>
          <button
            className="btn btn-outline btn-sm"
            style={{ width: '40px', padding: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            title="Quick View Details"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="product-content">
        <div className="product-meta-row">
          <span className="product-category-label">
            {product.base || product.category_name || 'Shirt'}
            {product.type ? ` ➔ ${product.type}` : ''}
          </span>
          <div className="product-rating-box">
            <Star size={13} fill="var(--yellow-500)" color="var(--yellow-500)" />
            <span>{product.rating || '4.8'}</span>
            <span style={{ color: 'var(--dark-400)', fontSize: '0.75rem' }}>
              ({product.reviews_count || 42})
            </span>
          </div>
        </div>

        <h3
          className="product-title"
          onClick={handleOpenProduct}
          title={product.product_name}
        >
          {product.product_name}
        </h3>

        <div className="product-fabric-tag">
          {product.shirt_type || product.sleeves ? `${product.shirt_type || product.sleeves} • ` : ''}
          {product.fabric || product.fit || '100% Breathable Cotton'}
        </div>

        {/* Pricing */}
        <div className="product-pricing-row">
          <span className="price-current">₹{Math.round(product.price)}</span>
          {product.original_price && (
            <span className="price-original">₹{Math.round(product.original_price)}</span>
          )}
          {discountPercent > 0 && (
            <span className="price-discount">{discountPercent}% OFF</span>
          )}
        </div>

        {/* Stock Alert */}
        {product.stock <= 10 && product.stock > 0 && (
          <div className="stock-warning-tag">
            <Zap size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Only {product.stock} left in stock!
          </div>
        )}
      </div>
    </div>
  );
}
