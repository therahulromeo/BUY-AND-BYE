import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import '../../styles/cart.css';

export default function WishlistDrawer() {
  const {
    wishlistOpen,
    setWishlistOpen,
    wishlist,
    toggleWishlist,
    addToCart,
    setCartOpen,
  } = useStore();

  if (!wishlistOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={() => setWishlistOpen(false)}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <Heart size={22} color="#EF4444" fill="#EF4444" />
            <span>Saved Wishlist ({wishlist.length})</span>
          </div>
          <button className="drawer-close-btn" onClick={() => setWishlistOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--dark-500)' }}>
              <Heart size={48} color="var(--dark-300)" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dark-900)' }}>
                Your Wishlist is Empty
              </h4>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Tap the heart on any shirt or chino to save it for later.
              </p>
            </div>
          ) : (
            wishlist.map((product) => (
              <div key={product.product_id} className="cart-item-card">
                <img src={product.image} alt={product.product_name} className="cart-item-img" />

                <div className="cart-item-details">
                  <div className="cart-item-title">{product.product_name}</div>
                  <div className="cart-item-meta">{product.category_name}</div>
                  <div className="cart-item-price" style={{ marginBottom: '0.75rem' }}>
                    ₹{Math.round(product.price)}
                  </div>

                  <button
                    className="btn btn-yellow btn-sm"
                    style={{ width: 'fit-content' }}
                    onClick={() => {
                      addToCart(product, 1, product.sizes?.[0] || 'L');
                      toggleWishlist(product);
                      setWishlistOpen(false);
                      setCartOpen(true);
                    }}
                  >
                    <ShoppingBag size={14} /> Move to Bag
                  </button>
                </div>

                <button
                  className="cart-item-remove"
                  onClick={() => toggleWishlist(product)}
                  title="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
