import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, Sparkles } from 'lucide-react';
import '../../styles/cart.css';

export default function QuickCartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    cart,
    cartCount,
    cartSubtotal,
    discountAmount,
    taxAmount,
    shippingFee,
    cartTotal,
    updateCartQty,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setCheckoutOpen,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');

  if (!cartOpen) return null;

  const freeShippingThreshold = 499;
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - cartSubtotal);
  const shipProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    applyCoupon(couponCode);
    setCouponCode('');
  };

  const handleProceedCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <ShoppingBag size={22} color="var(--primary-500)" />
            <span>Shopping Bag ({cartCount})</span>
          </div>
          <button className="drawer-close-btn" onClick={() => setCartOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="shipping-bar-box">
          <div className="shipping-text">
            {remainingForFreeShip > 0 ? (
              <span>Add <strong>₹{Math.round(remainingForFreeShip)}</strong> more for <strong>FREE Delivery</strong></span>
            ) : (
              <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} /> You unlocked FREE Express Shipping!
              </span>
            )}
            <span>{Math.round(shipProgress)}%</span>
          </div>
          <div className="shipping-progress-track">
            <div className="shipping-progress-fill" style={{ width: `${shipProgress}%` }}></div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--dark-500)' }}>
              <ShoppingBag size={48} color="var(--dark-300)" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dark-900)' }}>
                Your Bag is Empty
              </h4>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Discover premium menswear shirts and chinos to fill it up.
              </p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '1.5rem' }}
                onClick={() => setCartOpen(false)}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.itemKey} className="cart-item-card">
                <img src={item.image} alt={item.product_name} className="cart-item-img" />

                <div className="cart-item-details">
                  <div className="cart-item-title">{item.product_name}</div>
                  <div className="cart-item-meta">
                    Size: <strong>{item.selectedSize}</strong> | Color: <strong>{item.selectedColor}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="cart-item-price">₹{Math.round(item.price * item.quantity)}</div>

                    <div className="cart-item-stepper">
                      <button
                        className="stepper-btn"
                        onClick={() => updateCartQty(item.itemKey, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="stepper-val">{item.quantity}</span>
                      <button
                        className="stepper-btn"
                        onClick={() => updateCartQty(item.itemKey, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.itemKey)}
                  title="Remove Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            {/* Promo Code Input */}
            {appliedCoupon ? (
              <div
                style={{
                  background: 'var(--yellow-100)',
                  border: '1px solid var(--yellow-300)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#946900', fontWeight: 700 }}>
                  <Tag size={14} /> {appliedCoupon.label}
                </div>
                <button
                  onClick={removeCoupon}
                  style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="coupon-box">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. WELCOME10)"
                  className="coupon-input"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="submit" className="btn btn-outline-primary btn-sm">
                  Apply
                </button>
              </form>
            )}

            {/* Calculations Breakdown */}
            <div className="summary-row">
              <span>Items Subtotal</span>
              <span>₹{Math.round(cartSubtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="summary-row" style={{ color: '#059669', fontWeight: 700 }}>
                <span>Discount ({appliedCoupon?.code})</span>
                <span>-₹{Math.round(discountAmount)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Estimated GST (5%)</span>
              <span>₹{Math.round(taxAmount)}</span>
            </div>

            <div className="summary-row">
              <span>Standard Delivery</span>
              <span>{shippingFee === 0 ? <strong style={{ color: '#059669' }}>FREE</strong> : `₹${shippingFee}`}</span>
            </div>

            <div className="summary-row total-row">
              <span>Estimated Total</span>
              <span style={{ color: 'var(--primary-600)' }}>₹{Math.round(cartTotal)}</span>
            </div>

            <button
              className="btn btn-yellow btn-lg"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={handleProceedCheckout}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
