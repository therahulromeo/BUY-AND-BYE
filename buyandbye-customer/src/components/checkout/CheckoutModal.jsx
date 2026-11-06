import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, CreditCard, QrCode, Banknote, ArrowRight, CheckCircle2 } from 'lucide-react';
import '../../styles/cart.css';
import '../../styles/checkout.css';

export default function CheckoutModal({ onOrderSuccess }) {
  const {
    checkoutOpen,
    setCheckoutOpen,
    cart,
    cartSubtotal,
    discountAmount,
    taxAmount,
    shippingFee,
    cartTotal,
    appliedCoupon,
    clearCart,
  } = useStore();

  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: Shipping & Customer, 2: Payment
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: 'Rahul Sharma',
    email: 'rahul.s@gmail.com',
    phone: '+91 98401 23456',
    street: '12, Cathedral Road',
    apartment: 'Apartment 4B, Emerald Heights',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postal_code: '600086',
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe)');

  if (!checkoutOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.street || !formData.city || !formData.postal_code) {
      showToast('Please fill in all mandatory address fields', 'warning');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const payload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        items: cart,
        subtotal: cartSubtotal,
        discount: discountAmount,
        tax: taxAmount,
        shipping_fee: shippingFee,
        total_amount: cartTotal,
        payment_method: paymentMethod,
        shipping_address: {
          street: formData.apartment ? `${formData.street}, ${formData.apartment}` : formData.street,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: 'India',
        },
      };

      const result = await orderService.placeOrder(payload);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0056D2', '#FFC800', '#10B981'],
        });
      } catch (err) {
        // ignore if confetti fails
      }

      showToast(`Order #${result.order_id} placed successfully!`, 'success', 5000);
      clearCart();
      setCheckoutOpen(false);

      if (onOrderSuccess) {
        onOrderSuccess(result.order);
      }
    } catch (err) {
      showToast(err.message || 'Error processing order', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setCheckoutOpen(false)}>
      <div className="modal-card checkout-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem', color: 'var(--dark-900)' }}>
            <ShieldCheck size={24} color="#10B981" />
            <span>Secure Checkout</span>
          </div>
          <button className="drawer-close-btn" onClick={() => setCheckoutOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Step Indicator */}
          <div className="checkout-steps">
            <div className={`checkout-step-pill ${step === 1 ? 'active' : ''}`}>
              <span className="step-num">1</span>
              <span>Delivery Details</span>
            </div>
            <div className={`checkout-step-pill ${step === 2 ? 'active' : ''}`}>
              <span className="step-num">2</span>
              <span>Payment Option</span>
            </div>
          </div>

          <div className="checkout-grid">
            {/* Left Column: Form Steps */}
            <div>
              {step === 1 ? (
                <form onSubmit={handleNextStep}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '1rem' }}>
                    1. Contact Information
                  </h4>

                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g. rahul@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="+91 98401 23456"
                      />
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dark-900)', margin: '1.5rem 0 1rem' }}>
                    2. Shipping Address
                  </h4>

                  <div className="form-group">
                    <label className="form-label">Street Address *</label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="House / Flat / Road"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Apartment, Suite, Landmark (Optional)</label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Near Apollo Hospital"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PIN Code *</label>
                      <input
                        type="text"
                        name="postal_code"
                        required
                        value={formData.postal_code}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-yellow btn-lg" style={{ width: '100%', marginTop: '1.5rem' }}>
                    Continue to Payment <ArrowRight size={18} />
                  </button>
                </form>
              ) : (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '1rem' }}>
                    Select Payment Method
                  </h4>

                  {[
                    {
                      id: 'UPI (Google Pay / PhonePe)',
                      title: 'UPI / QR Code',
                      desc: 'Google Pay, PhonePe, Paytm, BHIM (Zero fees)',
                      icon: QrCode,
                      badge: 'Fastest',
                    },
                    {
                      id: 'Credit / Debit Card',
                      title: 'Credit or Debit Card',
                      desc: 'Visa, Mastercard, RuPay & American Express',
                      icon: CreditCard,
                      badge: 'Secure',
                    },
                    {
                      id: 'Cash on Delivery',
                      title: 'Cash On Delivery (COD)',
                      desc: 'Pay cash or UPI at your doorstep upon arrival',
                      icon: Banknote,
                      badge: 'Convenient',
                    },
                  ].map((method) => {
                    const MethodIcon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        className={`payment-method-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              background: isSelected ? 'var(--primary-100)' : 'var(--bg-subtle)',
                              color: isSelected ? 'var(--primary-600)' : 'var(--dark-700)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <MethodIcon size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark-900)' }}>
                              {method.title}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--dark-500)' }}>{method.desc}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge badge-yellow">{method.badge}</span>
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={isSelected}
                            onChange={() => setPaymentMethod(method.id)}
                            style={{ accentColor: 'var(--primary-500)', width: '18px', height: '18px' }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => setStep(1)}
                      style={{ flex: 1 }}
                      disabled={submitting}
                    >
                      Back to Address
                    </button>
                    <button
                      className="btn btn-yellow btn-lg"
                      style={{ flex: 2 }}
                      onClick={handlePlaceOrder}
                      disabled={submitting}
                    >
                      {submitting ? 'Placing Order...' : `Pay ₹${Math.round(cartTotal)} & Confirm`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div>
              <div className="checkout-summary-box">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '1rem' }}>
                  Order Summary ({cart.length} items)
                </h4>

                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                  {cart.map((item) => (
                    <div
                      key={item.itemKey}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={item.image}
                          alt=""
                          style={{ width: '32px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--dark-900)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.product_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--dark-500)' }}>
                            Qty: {item.quantity} | Size: {item.selectedSize}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700 }}>₹{Math.round(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{Math.round(cartSubtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="summary-row" style={{ color: '#059669', fontWeight: 700 }}>
                    <span>Promo Discount ({appliedCoupon?.code})</span>
                    <span>-₹{Math.round(discountAmount)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>GST Tax (5%)</span>
                  <span>₹{Math.round(taxAmount)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <strong style={{ color: '#059669' }}>FREE</strong> : `₹${shippingFee}`}</span>
                </div>

                <div className="summary-row total-row">
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--primary-600)' }}>₹{Math.round(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
