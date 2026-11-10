import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ShieldCheck,
  Phone,
  User,
  Mail,
  MapPin,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowRight,
  Truck,
  Sparkles,
  Edit2,
  Home,
  MapPinned,
} from 'lucide-react';
import '../../styles/customerDetails.css';

export default function CustomerDetailsPage({ onBack, onOrderSuccess }) {
  const {
    cart,
    cartSubtotal,
    discountAmount,
    taxAmount,
    shippingFee,
    cartTotal,
    appliedCoupon,
    clearCart,
    setLastPlacedOrder,
    setActiveTrackingOrder,
    customerProfile,
    saveCustomerProfile,
    setProfileModalOpen,
  } = useStore();

  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: Customer Details & Mobile, 2: Payment
  const [submitting, setSubmitting] = useState(false);

  // Address selection mode: 'existing' (default if profile exists) or 'alternate'
  const [addressMode, setAddressMode] = useState(() => {
    return customerProfile ? 'existing' : 'alternate';
  });

  // Form Fields (For alternate address or first-time customer)
  const [customerData, setCustomerData] = useState(() => ({
    name: customerProfile?.name || '',
    phone: customerProfile?.phone || '',
    email: customerProfile?.email || '',
    street: '',
    apartment: '',
    city: customerProfile?.city || 'Chennai',
    state: customerProfile?.state || 'Tamil Nadu',
    postal_code: '',
    whatsappUpdates: true,
    saveAsDefault: true,
  }));

  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe / QR)');

  // Active delivery customer data derived based on chosen radio
  const activeCustomer = useMemo(() => {
    if (addressMode === 'existing' && customerProfile) {
      return {
        name: customerProfile.name,
        phone: customerProfile.phone,
        email: customerProfile.email,
        street: customerProfile.street,
        apartment: customerProfile.apartment || '',
        city: customerProfile.city,
        state: customerProfile.state,
        postal_code: customerProfile.postal_code,
        country: customerProfile.country || 'India',
        whatsappUpdates: customerProfile.whatsappUpdates ?? true,
        isExisting: true,
      };
    }
    return {
      ...customerData,
      country: 'India',
      isExisting: false,
    };
  }, [addressMode, customerProfile, customerData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();

    // Case 1: Deliver to Existing Address saved on account
    if (addressMode === 'existing' && customerProfile) {
      if (!customerProfile.name || !customerProfile.phone || !customerProfile.street || !customerProfile.city || !customerProfile.postal_code) {
        showToast('Saved profile address is incomplete. Please select Alternate Address to provide complete details.', 'warning');
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(`Proceeding with saved account address for ${customerProfile.name}`, 'success');
      return;
    }

    // Case 2: Deliver to Alternate Address or First-Time Customer Form
    const rawDigits = customerData.phone.replace(/\D/g, '');
    if (rawDigits.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number for order tracking', 'warning');
      return;
    }

    if (!customerData.name.trim()) {
      showToast('Please enter customer full name', 'warning');
      return;
    }

    if (!customerData.email.trim() || !customerData.email.includes('@')) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }

    if (!customerData.street.trim() || !customerData.city.trim() || !customerData.postal_code.trim()) {
      showToast('Please complete all mandatory delivery address fields', 'warning');
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Delivery address & customer details registered!', 'success');
  };

  const handleFinalPlaceOrder = async () => {
    setSubmitting(true);
    try {
      const rawDigits = activeCustomer.phone.replace(/\D/g, '').slice(-10);
      const fullPhoneNumber = `+91 ${rawDigits}`;

      const payload = {
        customer: {
          name: activeCustomer.name.trim(),
          email: activeCustomer.email.trim(),
          phone: fullPhoneNumber,
        },
        items: cart,
        subtotal: cartSubtotal,
        discount: discountAmount,
        tax: taxAmount,
        shipping_fee: shippingFee,
        total_amount: cartTotal,
        payment_method: paymentMethod,
        shipping_address: {
          street: activeCustomer.apartment
            ? `${activeCustomer.street}, ${activeCustomer.apartment}`
            : activeCustomer.street,
          apartment: activeCustomer.apartment || '',
          city: activeCustomer.city,
          state: activeCustomer.state,
          postal_code: activeCustomer.postal_code,
          country: 'India',
        },
      };

      const result = await orderService.placeOrder(payload);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#0056D2', '#FFC800', '#10B981'],
        });
      } catch (err) {
        // ignore
      }

      // Automatically store/update customer profile
      // When a user orders for the first time, or checks saveAsDefault for alternate address
      if (!customerProfile || customerData.saveAsDefault) {
        const profileObj = {
          name: activeCustomer.name.trim(),
          phone: rawDigits,
          email: activeCustomer.email.trim(),
          street: activeCustomer.street.trim(),
          apartment: activeCustomer.apartment ? activeCustomer.apartment.trim() : '',
          city: activeCustomer.city.trim(),
          state: activeCustomer.state.trim(),
          postal_code: activeCustomer.postal_code.trim(),
          country: 'India',
          whatsappUpdates: !!activeCustomer.whatsappUpdates,
          createdAt: new Date().toISOString(),
        };
        saveCustomerProfile(profileObj);
      }

      showToast(`Order #${result.order_id} placed! Tracking SMS sent to ${fullPhoneNumber}`, 'success', 5000);
      setLastPlacedOrder(result.order);
      setActiveTrackingOrder(result.order);
      clearCart();

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
    <div className="checkout-page-container">
      {/* Top Navigation */}
      <header className="checkout-page-nav">
        <div className="container-wide checkout-page-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button className="checkout-back-link" onClick={onBack}>
              <ArrowLeft size={16} /> Back to Store
            </button>
            <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
              <img
                src="/logo.png"
                alt="BUY & BYE Mens Clothing"
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
            <Lock size={16} />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="checkout-main-content">
        <div className="container-wide">
          {/* Step Progress Bar */}
          <div className="step-tracker-bar">
            <div className={`step-tracker-item ${step === 1 ? 'active' : 'completed'}`}>
              <span className="step-badge">{step > 1 ? '✓' : '1'}</span>
              <span>1. Customer Details & Delivery Address</span>
            </div>

            <div style={{ width: '40px', height: '2px', background: step > 1 ? '#10B981' : 'var(--border-light)' }}></div>

            <div className={`step-tracker-item ${step === 2 ? 'active' : ''}`}>
              <span className="step-badge">2</span>
              <span>2. Review & Secure Payment</span>
            </div>
          </div>

          <div className="checkout-page-grid">
            {/* Left Column: Flow Steps */}
            <div>
              {step === 1 ? (
                <form onSubmit={handleProceedToPayment}>
                  {/* RETURNING CUSTOMER WITH SAVED PROFILE */}
                  {customerProfile ? (
                    <div className="customer-form-card">
                      <div className="card-heading-row">
                        <div className="card-title-text">
                          <MapPin size={22} color="var(--primary-500)" />
                          <span>Delivery Address Selection</span>
                        </div>
                        <span className="badge badge-blue">Saved Account Profile</span>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--dark-600)', marginBottom: '1.25rem' }}>
                        Welcome back, <strong>{customerProfile.name}</strong>! Choose whether to proceed with your saved account address or specify an alternate delivery address.
                      </p>

                      {/* 1. Deliver to Existing Address Radio Card */}
                      <div
                        className={`address-option-card ${addressMode === 'existing' ? 'selected' : ''}`}
                        onClick={() => setAddressMode('existing')}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <input
                            type="radio"
                            id="radio-existing-address"
                            name="addressSelectionRadio"
                            value="existing"
                            checked={addressMode === 'existing'}
                            onChange={() => setAddressMode('existing')}
                            style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                              <label htmlFor="radio-existing-address" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--dark-900)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Home size={16} color="var(--primary-600)" /> Deliver to Existing Address
                              </label>
                              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                                ✓ Saved on Account
                              </span>
                            </div>

                            <div className="saved-address-preview-box">
                              <div style={{ fontWeight: 800, color: 'var(--dark-900)', fontSize: '0.95rem', marginBottom: '2px' }}>
                                {customerProfile.name}
                              </div>
                              <div style={{ color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.825rem', marginBottom: '6px' }}>
                                📱 +91 {customerProfile.phone} • ✉️ {customerProfile.email}
                              </div>
                              <div style={{ color: 'var(--dark-700)', fontSize: '0.875rem', lineHeight: '1.45' }}>
                                {customerProfile.street}{customerProfile.apartment ? `, ${customerProfile.apartment}` : ''}, {customerProfile.city}, {customerProfile.state} - {customerProfile.postal_code}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Deliver to Alternate Address Radio Card */}
                      <div
                        className={`address-option-card ${addressMode === 'alternate' ? 'selected' : ''}`}
                        style={{ marginTop: '1rem' }}
                        onClick={() => setAddressMode('alternate')}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <input
                            type="radio"
                            id="radio-alternate-address"
                            name="addressSelectionRadio"
                            value="alternate"
                            checked={addressMode === 'alternate'}
                            onChange={() => setAddressMode('alternate')}
                            style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                              <label htmlFor="radio-alternate-address" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--dark-900)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <MapPinned size={16} color="var(--yellow-600)" /> Deliver to Alternate Address
                              </label>
                              <span className="badge badge-yellow" style={{ fontSize: '0.72rem' }}>
                                New Recipient / Location
                              </span>
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--dark-500)' }}>
                              Ship this order to a different home, office, hotel, or gift address.
                            </p>
                          </div>
                        </div>

                        {/* Alternate Address Form: Appears when Alternate Radio is selected */}
                        {addressMode === 'alternate' && (
                          <div
                            className="animate-fade-in"
                            style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="checkout-form-grid-2" style={{ marginBottom: '1rem' }}>
                              <div className="form-group">
                                <label className="form-label">Recipient Full Name *</label>
                                <input
                                  type="text"
                                  name="name"
                                  required
                                  placeholder="e.g. Anand Kumar"
                                  value={customerData.name}
                                  onChange={handleChange}
                                  className="form-input"
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Recipient Mobile Number (10 digits) *</label>
                                <div className="mobile-input-group">
                                  <div className="mobile-prefix-badge">
                                    <span>🇮🇳</span>
                                    <span>+91</span>
                                  </div>
                                  <input
                                    type="tel"
                                    name="phone"
                                    required
                                    maxLength="10"
                                    placeholder="10 digit number"
                                    value={customerData.phone}
                                    onChange={handleChange}
                                    className="mobile-raw-input"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                              <label className="form-label">Email Address (For Tax Invoice) *</label>
                              <input
                                type="email"
                                name="email"
                                required
                                placeholder="name@example.com"
                                value={customerData.email}
                                onChange={handleChange}
                                className="form-input"
                              />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                              <label className="form-label">Street Address / House No. *</label>
                              <input
                                type="text"
                                name="street"
                                required
                                placeholder="Flat / House No., Building, Street Name"
                                value={customerData.street}
                                onChange={handleChange}
                                className="form-input"
                              />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                              <label className="form-label">Apartment, Suite, Landmark (Optional)</label>
                              <input
                                type="text"
                                name="apartment"
                                placeholder="Near Landmark / Complex Name"
                                value={customerData.apartment}
                                onChange={handleChange}
                                className="form-input"
                              />
                            </div>

                            <div className="checkout-form-grid-3" style={{ marginBottom: '1rem' }}>
                              <div className="form-group">
                                <label className="form-label">City *</label>
                                <input
                                  type="text"
                                  name="city"
                                  required
                                  value={customerData.city}
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
                                  value={customerData.state}
                                  onChange={handleChange}
                                  className="form-input"
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Postal PIN Code *</label>
                                <input
                                  type="text"
                                  name="postal_code"
                                  required
                                  maxLength="6"
                                  placeholder="600086"
                                  value={customerData.postal_code}
                                  onChange={handleChange}
                                  className="form-input"
                                />
                              </div>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--dark-700)', cursor: 'pointer', background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '8px' }}>
                              <input
                                type="checkbox"
                                name="saveAsDefault"
                                checked={customerData.saveAsDefault}
                                onChange={handleChange}
                                style={{ accentColor: 'var(--primary-500)', width: '16px', height: '16px' }}
                              />
                              <span>Save this alternate address as my new default account address</span>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Proceed to Payment Action Button */}
                      <button
                        type="submit"
                        className="btn btn-yellow btn-lg"
                        style={{ width: '100%', marginTop: '1.5rem', fontSize: '1.05rem', fontWeight: 800 }}
                      >
                        {addressMode === 'existing'
                          ? 'Proceed with Existing Address'
                          : 'Save Details & Proceed to Checkout'}
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  ) : (
                    /* FIRST-TIME CUSTOMER CHECKOUT (CREATES PROFILE) */
                    <>
                      {/* Sign-in with Email quick banner */}
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #EFF6FF 0%, #FEFCE8 100%)',
                          border: '1.5px solid #BFDBFE',
                          borderRadius: '12px',
                          padding: '0.9rem 1.25rem',
                          marginBottom: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Mail size={22} color="var(--primary-600)" style={{ flexShrink: 0 }} />
                          <div style={{ fontSize: '0.85rem', color: 'var(--dark-800)' }}>
                            <strong>Already registered?</strong> Sign in with your <strong>Email ID &amp; OTP</strong> to load your saved address.
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            padding: 0,
                            flexShrink: 0,
                          }}
                          onClick={() => setProfileModalOpen(true)}
                          title="Sign In with Email OTP"
                          aria-label="Sign In with Email OTP"
                        >
                          <User size={18} />
                        </button>
                      </div>

                      <div className="new-profile-banner">
                        <Sparkles size={22} color="var(--yellow-600)" style={{ flexShrink: 0 }} />
                        <div>
                          <strong>New Shopper:</strong> Enter your details below. Your Email will be saved as your <strong>Account ID</strong> for 1-click checkout and private tracking on future orders!
                        </div>
                      </div>

                      {/* Customer Contact Details */}
                      <div className="customer-form-card">
                        <div className="card-heading-row">
                          <div className="card-title-text">
                            <User size={22} color="var(--primary-500)" />
                            <span>Customer Information</span>
                          </div>
                          <span className="badge badge-blue">Account Creation</span>
                        </div>

                        {/* Email Address as Primary Account ID */}
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                          <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={16} color="var(--primary-600)" /> Email Address (Account ID &amp; Order Invoices) *
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="e.g. rahul@example.com"
                            value={customerData.email}
                            onChange={handleChange}
                            className="form-input"
                            style={{ padding: '0.7rem 0.9rem', fontSize: '0.92rem' }}
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--dark-500)', marginTop: '4px' }}>
                            Used for sending your order confirmation, invoice, and sign-in verification OTP.
                          </span>
                        </div>

                        <div className="checkout-form-grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700 }}>Customer Full Name *</label>
                            <input
                              type="text"
                              name="name"
                              required
                              placeholder="e.g. Rahul Sharma"
                              value={customerData.name}
                              onChange={handleChange}
                              className="form-input"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700 }}>Mobile Number (For Courier SMS) *</label>
                            <div className="mobile-input-group">
                              <div className="mobile-prefix-badge">
                                <span>🇮🇳</span>
                                <span>+91</span>
                              </div>
                              <input
                                type="tel"
                                name="phone"
                                required
                                maxLength="10"
                                placeholder="98401 23456"
                                value={customerData.phone}
                                onChange={handleChange}
                                className="mobile-raw-input"
                              />
                            </div>
                          </div>
                        </div>

                        {/* WhatsApp Notification Checkbox */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--dark-700)', cursor: 'pointer', background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '8px' }}>
                          <input
                            type="checkbox"
                            name="whatsappUpdates"
                            checked={customerData.whatsappUpdates}
                            onChange={handleChange}
                            style={{ accentColor: 'var(--primary-500)', width: '16px', height: '16px' }}
                          />
                          <span>Send live shipment status and tracking waybill on WhatsApp</span>
                        </label>
                      </div>

                      {/* Delivery Address Card */}
                      <div className="customer-form-card">
                        <div className="card-heading-row">
                          <div className="card-title-text">
                            <MapPin size={22} color="var(--primary-500)" />
                            <span>Delivery Destination Address</span>
                          </div>
                          <span className="badge badge-yellow">Doorstep Courier</span>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Street Address / House No. *</label>
                          <input
                            type="text"
                            name="street"
                            required
                            placeholder="House No., Building, Street Name"
                            value={customerData.street}
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Apartment, Suite, Landmark (Optional)</label>
                          <input
                            type="text"
                            name="apartment"
                            placeholder="Apartment 4B, Near Apollo Hospital"
                            value={customerData.apartment}
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>

                        <div className="checkout-form-grid-3">
                          <div className="form-group">
                            <label className="form-label">City *</label>
                            <input
                              type="text"
                              name="city"
                              required
                              value={customerData.city}
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
                              value={customerData.state}
                              onChange={handleChange}
                              className="form-input"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Postal PIN Code *</label>
                            <input
                              type="text"
                              name="postal_code"
                              required
                              maxLength="6"
                              value={customerData.postal_code}
                              onChange={handleChange}
                              className="form-input"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="btn btn-yellow btn-lg"
                          style={{ width: '100%', marginTop: '1rem', fontSize: '1.05rem', fontWeight: 800 }}
                        >
                          Save Profile &amp; Proceed to Checkout <ArrowRight size={20} />
                        </button>
                      </div>
                    </>
                  )}
                </form>
              ) : (
                /* Step 2: Payment & Final Confirmation */
                <div>
                  {/* Verified Customer Summary Card */}
                  <div className="customer-form-card" style={{ background: '#F8FAFC', border: '1.5px solid var(--primary-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--primary-800)', fontSize: '1rem' }}>
                        <CheckCircle2 size={20} color="#10B981" />
                        <span>Registered Customer &amp; Delivery Destination</span>
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', cursor: 'pointer' }}
                      >
                        <Edit2 size={14} /> Change / Edit
                      </button>
                    </div>

                    <div className="checkout-form-grid-2" style={{ gap: '1rem', fontSize: '0.875rem' }}>
                      <div>
                        <div style={{ color: 'var(--dark-500)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          Customer &amp; Tracking Phone
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--dark-900)', fontSize: '0.95rem' }}>
                          {activeCustomer.name}
                        </div>
                        <div style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
                          📱 +91 {activeCustomer.phone}
                        </div>
                        <div style={{ color: 'var(--dark-600)', fontSize: '0.8rem' }}>
                          {activeCustomer.email}
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--dark-500)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            Destination Address
                          </span>
                          <span className={`badge ${activeCustomer.isExisting ? 'badge-success' : 'badge-yellow'}`} style={{ fontSize: '0.68rem' }}>
                            {activeCustomer.isExisting ? 'Account Address' : 'Alternate Address'}
                          </span>
                        </div>
                        <div style={{ color: 'var(--dark-800)', lineHeight: 1.4, marginTop: '2px' }}>
                          {activeCustomer.street}{activeCustomer.apartment && `, ${activeCustomer.apartment}`}, {activeCustomer.city}, {activeCustomer.state} - {activeCustomer.postal_code}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Selection Card */}
                  <div className="customer-form-card">
                    <div className="card-heading-row">
                      <div className="card-title-text">
                        <CreditCard size={22} color="var(--primary-500)" />
                        <span>Select Payment Method</span>
                      </div>
                      <span className="badge badge-success">Zero Transaction Fees</span>
                    </div>

                    {[
                      {
                        id: 'UPI (Google Pay / PhonePe / QR)',
                        title: 'UPI / QR Code (Instant)',
                        desc: 'Google Pay, PhonePe, Paytm, BHIM or any UPI App',
                        icon: QrCode,
                        badge: 'Recommended',
                      },
                      {
                        id: 'Credit or Debit Card',
                        title: 'Credit / Debit Card',
                        desc: 'Visa, Mastercard, RuPay & American Express',
                        icon: CreditCard,
                        badge: 'Secure',
                      },
                      {
                        id: 'Cash on Delivery',
                        title: 'Cash on Delivery (COD)',
                        desc: 'Pay via cash or UPI at your doorstep upon delivery',
                        icon: Banknote,
                        badge: 'Pay Later',
                      },
                    ].map((m) => {
                      const IconComp = m.icon;
                      const isSelected = paymentMethod === m.id;
                      return (
                        <div
                          key={m.id}
                          className={`payment-method-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod(m.id)}
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
                              <IconComp size={20} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--dark-900)' }}>
                                {m.title}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--dark-500)' }}>{m.desc}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge-yellow">{m.badge}</span>
                            <input
                              type="radio"
                              name="payment"
                              checked={isSelected}
                              onChange={() => setPaymentMethod(m.id)}
                              style={{ accentColor: 'var(--primary-500)', width: '18px', height: '18px' }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                      <button
                        className="btn btn-outline"
                        style={{ flex: 1 }}
                        onClick={() => setStep(1)}
                        disabled={submitting}
                      >
                        <ArrowLeft size={16} /> Back to Details
                      </button>
                      <button
                        className="btn btn-yellow btn-lg"
                        style={{ flex: 2, fontSize: '1.05rem', fontWeight: 800 }}
                        onClick={handleFinalPlaceOrder}
                        disabled={submitting}
                      >
                        {submitting
                          ? 'Confirming Order & Registering Tracking...'
                          : `Pay ₹${Math.round(cartTotal)} & Confirm Order`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Order Summary */}
            <div>
              <div className="checkout-order-summary-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-900)' }}>
                    Order Summary
                  </h3>
                  <span className="badge badge-blue">{cart.length} items</span>
                </div>

                <div className="summary-items-scroll">
                  {cart.map((item) => (
                    <div key={item.itemKey} className="summary-item-row">
                      <img src={item.image} alt="" className="summary-item-img" />
                      <div className="summary-item-info">
                        <div className="summary-item-name">{item.product_name}</div>
                        <div className="summary-item-spec">
                          Qty: <strong>{item.quantity}</strong> | Size: <strong>{item.selectedSize}</strong>
                        </div>
                        <div className="summary-item-price">
                          ₹{Math.round(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{Math.round(cartSubtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="summary-row" style={{ color: '#059669', fontWeight: 700 }}>
                      <span>Promo Voucher ({appliedCoupon?.code})</span>
                      <span>-₹{Math.round(discountAmount)}</span>
                    </div>
                  )}

                  <div className="summary-row">
                    <span>GST (5% Apparel Tax)</span>
                    <span>₹{Math.round(taxAmount)}</span>
                  </div>

                  <div className="summary-row">
                    <span>Express Delivery</span>
                    <span>{shippingFee === 0 ? <strong style={{ color: '#059669' }}>FREE</strong> : `₹${shippingFee}`}</span>
                  </div>

                  <div className="summary-row total-row">
                    <span>Grand Total</span>
                    <span style={{ color: 'var(--primary-600)', fontSize: '1.35rem' }}>
                      ₹{Math.round(cartTotal)}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', background: 'var(--bg-subtle)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem', color: 'var(--dark-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#10B981" />
                  <span>Real-time backend synchronization with Admin Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
