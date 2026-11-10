import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Package,
  Heart,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home,
  LogOut,
  LogIn,
  Search,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import '../../styles/cart.css';
import { orderService } from '../../services/orderService';

export default function CustomerProfileModal() {
  const {
    customerProfile,
    saveCustomerProfile,
    clearCustomerProfile,
    profileModalOpen,
    setProfileModalOpen,
    orders,
    openOrderHistory,
    wishlist,
    setWishlistOpen,
  } = useStore();

  const { showToast } = useToast();

  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Email + OTP Authentication States
  const [loginEmail, setLoginEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // New user completion flow after OTP verified
  const [isNewUserSetup, setIsNewUserSetup] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  // Resend OTP countdown effect
  React.useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(() => ({
    name: customerProfile?.name || '',
    phone: customerProfile?.phone || '',
    email: customerProfile?.email || '',
    street: customerProfile?.street || '',
    apartment: customerProfile?.apartment || '',
    city: customerProfile?.city || 'Chennai',
    state: customerProfile?.state || 'Tamil Nadu',
    postal_code: customerProfile?.postal_code || '',
  }));

  // New profile creation form state
  const [newData, setNewData] = useState({
    name: '',
    phone: '',
    email: '',
    street: '',
    apartment: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postal_code: '',
  });

  if (!profileModalOpen) return null;

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const rawDigits = editData.phone.replace(/\D/g, '').slice(-10);
    if (!editData.name.trim() || !editData.street.trim() || !editData.city.trim() || !editData.postal_code.trim()) {
      showToast('Please fill in all mandatory fields', 'warning');
      return;
    }

    const updated = {
      ...customerProfile,
      name: editData.name.trim(),
      phone: rawDigits || customerProfile?.phone || '',
      email: editData.email.trim(),
      street: editData.street.trim(),
      apartment: editData.apartment ? editData.apartment.trim() : '',
      city: editData.city.trim(),
      state: editData.state.trim(),
      postal_code: editData.postal_code.trim(),
      updatedAt: new Date().toISOString(),
    };

    saveCustomerProfile(updated);
    setIsEditing(false);
    showToast('Customer profile & address updated successfully!', 'success');
  };

  // Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      showToast('Please enter a valid email address (e.g. name@example.com)', 'warning');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await orderService.sendEmailOtp(cleanEmail);
      if (res?.success && res.data?.success) {
        setOtpSent(true);
        if (res.data.devOtp) {
          setDevOtp(res.data.devOtp);
        }
        setResendTimer(60);
        showToast(`Verification code sent to ${cleanEmail}! Please check your email inbox.`, 'success');
      } else {
        showToast(res?.error || res?.data?.message || 'Failed to send OTP code. Please try again.', 'error');
      }
    } catch (err) {
      console.warn(err);
      showToast('Failed to connect to authentication server.', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP & Sign In / Complete
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otpCode.trim();
    if (!cleanOtp) {
      showToast('Please enter the 6-digit verification code sent to your email', 'warning');
      return;
    }

    setVerifyingOtp(true);
    try {
      const cleanEmail = loginEmail.trim().toLowerCase();
      const res = await orderService.verifyEmailOtp(cleanEmail, cleanOtp);
      if (res?.success && res.data?.success) {
        if (!res.data.isNewUser && res.data.customer) {
          // Existing customer profile found!
          await saveCustomerProfile(res.data.customer);
          showToast(`Welcome back, ${res.data.customer.name}! Signed in successfully.`, 'success');
          setOtpSent(false);
          setOtpCode('');
          setDevOtp('');
          setLoginEmail('');
          setIsNewUserSetup(false);
        } else {
          // Brand new user verified! Move to profile completion
          setVerifiedEmail(cleanEmail);
          setNewData((prev) => ({
            ...prev,
            email: cleanEmail,
          }));
          setIsNewUserSetup(true);
          showToast('Email verified successfully! Please enter your name to complete your profile.', 'success');
        }
      } else {
        showToast(res?.error || res?.data?.message || 'Invalid or expired OTP code. Please check your email.', 'error');
      }
    } catch (err) {
      console.warn(err);
      showToast('Error verifying OTP code. Please try again.', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Complete profile for new verified email customer
  const handleCompleteNewProfile = async (e) => {
    e.preventDefault();
    if (!newData.name.trim() || !newData.street.trim() || !newData.city.trim() || !newData.postal_code.trim()) {
      showToast('Please fill in all mandatory fields', 'warning');
      return;
    }

    const created = {
      name: newData.name.trim(),
      phone: newData.phone.replace(/\D/g, '').slice(-10) || '',
      email: verifiedEmail || loginEmail.trim().toLowerCase(),
      street: newData.street.trim(),
      apartment: newData.apartment ? newData.apartment.trim() : '',
      city: newData.city.trim(),
      state: newData.state.trim(),
      postal_code: newData.postal_code.trim(),
      country: 'India',
      whatsappUpdates: true,
      createdAt: new Date().toISOString(),
    };

    await saveCustomerProfile(created);
    showToast(`Welcome to BUY & BYE, ${created.name}! Your account profile is created.`, 'success');
    setIsNewUserSetup(false);
    setOtpSent(false);
    setOtpCode('');
    setDevOtp('');
    setLoginEmail('');
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtpCode('');
    setDevOtp('');
    setIsNewUserSetup(false);
  };

  const handleClearProfile = () => {
    if (window.confirm('Are you sure you want to sign out of your account? Your order history will be hidden until you sign in again.')) {
      clearCustomerProfile();
      setIsEditing(false);
      setOtpSent(false);
      setOtpCode('');
      setDevOtp('');
      setLoginEmail('');
      setIsNewUserSetup(false);
      showToast('Signed out of account successfully.', 'info');
    }
  };

  // Get customer initials for avatar
  const getInitials = (fullName) => {
    if (!fullName) return 'BB';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
      <div
        className="modal-card animate-scale-up"
        style={{ maxWidth: '580px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--dark-900)' }}>
                Customer Account Profile
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--dark-500)' }}>
                Stored Account Details &amp; Fast Checkout
              </div>
            </div>
          </div>

          <button
            className="drawer-close-btn"
            onClick={() => setProfileModalOpen(false)}
            title="Close Profile"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {customerProfile ? (
            /* ACTIVE PROFILE VIEW */
            <div>
              {/* Profile Top Hero Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  color: '#FFFFFF',
                  marginBottom: '1.25rem',
                  boxShadow: '0 8px 24px -4px rgba(10, 25, 47, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--yellow-400) 0%, var(--yellow-500) 100%)',
                      color: 'var(--dark-950)',
                      fontWeight: 900,
                      fontSize: '1.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(customerProfile.name)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#FFFFFF', lineHeight: 1.2 }}>
                      {customerProfile.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#A7F3D0',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          borderRadius: '12px',
                          padding: '2px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <ShieldCheck size={12} /> Verified Account
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#93C5FD' }}>
                        1-Click Checkout Enabled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Account Metrics */}
                <div
                  className="profile-form-grid-2"
                  style={{
                    gap: '0.75rem',
                    marginTop: '1.25rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <button
                    onClick={() => {
                      setProfileModalOpen(false);
                      openOrderHistory();
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#93C5FD', textTransform: 'uppercase', fontWeight: 700 }}>
                        Orders Placed
                      </div>
                      <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>
                        {orders?.length || 0}
                      </div>
                    </div>
                    <Package size={18} color="var(--yellow-400)" />
                  </button>

                  <button
                    onClick={() => {
                      setProfileModalOpen(false);
                      setWishlistOpen(true);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#93C5FD', textTransform: 'uppercase', fontWeight: 700 }}>
                        Saved Wishlist
                      </div>
                      <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>
                        {wishlist?.length || 0}
                      </div>
                    </div>
                    <Heart size={18} color="#F43F5E" />
                  </button>
                </div>
              </div>

              {/* Edit Mode Toggle or Details View */}
              {isEditing ? (
                /* INLINE EDIT PROFILE FORM */
                <form onSubmit={handleSaveEdit} className="animate-fade-in">
                  <div
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1.5px solid var(--border-light)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--dark-900)', marginBottom: '1rem' }}>
                      Edit Customer Information &amp; Address
                    </div>

                    <div className="profile-form-grid-2" style={{ marginBottom: '0.85rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={editData.name}
                          onChange={handleEditChange}
                          className="form-input"
                          style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Mobile (10 digits) *</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          maxLength="10"
                          value={editData.phone}
                          onChange={handleEditChange}
                          className="form-input"
                          style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={editData.email}
                        onChange={handleEditChange}
                        className="form-input"
                        style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Street Address / Flat No. *</label>
                      <input
                        type="text"
                        name="street"
                        required
                        value={editData.street}
                        onChange={handleEditChange}
                        className="form-input"
                        style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Apartment, Landmark (Optional)</label>
                      <input
                        type="text"
                        name="apartment"
                        value={editData.apartment}
                        onChange={handleEditChange}
                        className="form-input"
                        style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div className="profile-form-grid-3">
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>City *</label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={editData.city}
                          onChange={handleEditChange}
                          className="form-input"
                          style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>State *</label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={editData.state}
                          onChange={handleEditChange}
                          className="form-input"
                          style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>PIN Code *</label>
                        <input
                          type="text"
                          name="postal_code"
                          required
                          maxLength="6"
                          value={editData.postal_code}
                          onChange={handleEditChange}
                          className="form-input"
                          style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Save size={15} /> Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* READ-ONLY SAVED DETAILS */
                <div>
                  {/* Contact Information */}
                  <div
                    style={{
                      border: '1.5px solid var(--border-light)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      background: '#FFFFFF',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--dark-800)', textTransform: 'uppercase' }}>
                        Contact Information
                      </div>
                      <button
                        onClick={() => {
                          setEditData({
                            name: customerProfile.name,
                            phone: customerProfile.phone,
                            email: customerProfile.email,
                            street: customerProfile.street,
                            apartment: customerProfile.apartment || '',
                            city: customerProfile.city,
                            state: customerProfile.state,
                            postal_code: customerProfile.postal_code,
                          });
                          setIsEditing(true);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--primary-600)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={13} /> Edit Profile
                      </button>
                    </div>

                    <div className="profile-form-grid-2" style={{ gap: '1rem', fontSize: '0.875rem' }}>
                      <div>
                        <div style={{ color: 'var(--dark-500)', fontSize: '0.75rem', fontWeight: 600 }}>Mobile Number (SMS Tracking)</div>
                        <div style={{ fontWeight: 800, color: 'var(--primary-700)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Phone size={14} /> +91 {customerProfile.phone}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: 'var(--dark-500)', fontSize: '0.75rem', fontWeight: 600 }}>Email Address</div>
                        <div style={{ fontWeight: 700, color: 'var(--dark-800)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Mail size={14} /> {customerProfile.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Saved Default Delivery Address */}
                  <div
                    style={{
                      border: '1.5px solid var(--border-light)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      background: '#FFFFFF',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--dark-800)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Home size={16} color="var(--primary-600)" /> Saved Account Address
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        Default for Orders
                      </span>
                    </div>

                    <div style={{ fontSize: '0.875rem', color: 'var(--dark-800)', lineHeight: '1.5' }}>
                      <div style={{ fontWeight: 800, color: 'var(--dark-900)' }}>{customerProfile.name}</div>
                      <div>
                        {customerProfile.street}
                        {customerProfile.apartment ? `, ${customerProfile.apartment}` : ''}
                      </div>
                      <div>
                        {customerProfile.city}, {customerProfile.state} - {customerProfile.postal_code}
                      </div>
                      <div style={{ color: 'var(--dark-500)', fontSize: '0.75rem', marginTop: '4px' }}>
                        Country: India
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                    <button
                      onClick={handleClearProfile}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#EF4444',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Log out of your customer account"
                    >
                      <LogOut size={14} /> Log Out of Account
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setProfileModalOpen(false)}
                      style={{ fontWeight: 700 }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* NO PROFILE SAVED (EMAIL + OTP VERIFICATION & ONBOARDING) */
            isNewUserSetup ? (
              /* NEW USER PROFILE SETUP AFTER OTP VERIFICATION */
              <div className="animate-fade-in">
                <div
                  style={{
                    background: 'linear-gradient(135deg, #ECFDF5 0%, #EFF6FF 100%)',
                    border: '1.5px solid #A7F3D0',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    gap: '0.85rem',
                    alignItems: 'center',
                  }}
                >
                  <CheckCircle2 size={28} color="#059669" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#065F46' }}>
                      Email Verified: {verifiedEmail || loginEmail}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                      Welcome to BUY &amp; BYE! Please complete your name and delivery address to finish registration.
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCompleteNewProfile}>
                  <div
                    style={{
                      border: '1.5px solid var(--border-light)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      background: '#FFFFFF',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--dark-900)', marginBottom: '0.85rem' }}>
                      Delivery &amp; Account Details
                    </div>

                    <div className="profile-form-grid-2" style={{ marginBottom: '0.85rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={newData.name}
                          onChange={handleNewChange}
                          className="form-input"
                          style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                          Mobile Number (Optional)
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          maxLength="10"
                          placeholder="e.g. 98401 23456"
                          value={newData.phone}
                          onChange={handleNewChange}
                          className="form-input"
                          style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        Street Address / Flat No. *
                      </label>
                      <input
                        type="text"
                        name="street"
                        required
                        placeholder="12, Cathedral Road"
                        value={newData.street}
                        onChange={handleNewChange}
                        className="form-input"
                        style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>
                        Apartment, Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        name="apartment"
                        placeholder="Apartment 4B, Near Apollo Hospital"
                        value={newData.apartment}
                        onChange={handleNewChange}
                        className="form-input"
                        style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div className="profile-form-grid-3">
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={newData.city}
                          onChange={handleNewChange}
                          className="form-input"
                          style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={newData.state}
                          onChange={handleNewChange}
                          className="form-input"
                          style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          required
                          maxLength="6"
                          placeholder="600086"
                          value={newData.postal_code}
                          onChange={handleNewChange}
                          className="form-input"
                          style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleChangeEmail}
                    >
                      Back to Sign In
                    </button>
                    <button
                      type="submit"
                      className="btn btn-yellow btn-sm"
                      style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={16} /> Complete &amp; Save Profile
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* EMAIL & OTP SIGN IN */
              <div className="animate-fade-in">
                <div
                  style={{
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #FEFCE8 100%)',
                    border: '1.5px solid #BFDBFE',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    gap: '0.85rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#DBEAFE',
                      color: '#1D4ED8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1E3A8A', marginBottom: '2px' }}>
                      Sign In with Email OTP
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--dark-600)', lineHeight: '1.4' }}>
                      Enter your <strong>Email ID</strong> to receive a one-time verification code (OTP). No passwords needed! Existing accounts load their orders; new shoppers register instantly.
                    </div>
                  </div>
                </div>

                {!otpSent ? (
                  /* STEP 1: ENTER EMAIL */
                  <form onSubmit={handleSendOtp}>
                    <div
                      style={{
                        border: '1.5px solid var(--border-light)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        background: '#FFFFFF',
                        marginBottom: '1rem',
                      }}
                    >
                      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={16} color="var(--primary-600)" /> Email ID *
                        </label>
                        <input
                          type="email"
                          required
                          autoFocus
                          placeholder="e.g. rahul@example.com or your.name@gmail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="form-input"
                          style={{ padding: '0.75rem 0.95rem', fontSize: '0.95rem' }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={sendingOtp || !loginEmail.trim()}
                        className="btn btn-yellow"
                        style={{
                          width: '100%',
                          fontWeight: 800,
                          padding: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '0.95rem',
                        }}
                      >
                        {sendingOtp ? (
                          <>
                            <RefreshCw size={17} className="animate-spin" /> Sending Verification Code...
                          </>
                        ) : (
                          <>
                            <KeyRound size={17} /> Send Verification Code (OTP) <ArrowRight size={17} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* STEP 2: ENTER OTP */
                  <form onSubmit={handleVerifyOtp}>
                    <div
                      style={{
                        border: '1.5px solid var(--border-light)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        background: '#FFFFFF',
                        marginBottom: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--dark-500)' }}>
                            Verification code sent to:
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--dark-900)' }}>
                            {loginEmail}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleChangeEmail}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary-600)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Change Email
                        </button>
                      </div>

                      <div
                        style={{
                          background: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          borderRadius: '8px',
                          padding: '0.65rem 0.85rem',
                          marginBottom: '0.85rem',
                          fontSize: '0.825rem',
                          color: '#1E40AF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <Mail size={16} color="#2563EB" style={{ flexShrink: 0 }} />
                        <span>A 6-digit code has been sent to your email. Check your inbox or spam folder!</span>
                      </div>

                      {devOtp && (
                        <div
                          onClick={() => setOtpCode(devOtp)}
                          style={{
                            background: '#FEF3C7',
                            border: '1px dashed #F59E0B',
                            borderRadius: '8px',
                            padding: '0.65rem 0.85rem',
                            marginBottom: '1rem',
                            cursor: 'pointer',
                            fontSize: '0.825rem',
                            color: '#92400E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                          title="Click to auto-fill code"
                        >
                          <span>Demo OTP Code: <strong>{devOtp}</strong></span>
                          <span style={{ textDecoration: 'underline', fontWeight: 700, fontSize: '0.78rem' }}>Click to auto-fill</span>
                        </div>
                      )}

                      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <KeyRound size={16} color="var(--primary-600)" /> 6-Digit Email OTP *
                        </label>
                        <input
                          type="text"
                          required
                          autoFocus
                          maxLength="6"
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="form-input"
                          style={{
                            padding: '0.75rem 0.95rem',
                            fontSize: '1.3rem',
                            letterSpacing: '6px',
                            textAlign: 'center',
                            fontWeight: 800,
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={verifyingOtp || otpCode.length !== 6}
                        className="btn btn-yellow"
                        style={{
                          width: '100%',
                          fontWeight: 800,
                          padding: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '0.95rem',
                          marginBottom: '1rem',
                        }}
                      >
                        {verifyingOtp ? (
                          <>
                            <RefreshCw size={17} className="animate-spin" /> Verifying OTP...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} /> Verify OTP &amp; Sign In
                          </>
                        )}
                      </button>

                      <div style={{ textAlign: 'center', fontSize: '0.825rem', color: 'var(--dark-500)' }}>
                        Didn't receive the email code?{' '}
                        {resendTimer > 0 ? (
                          <span style={{ color: 'var(--dark-400)', fontWeight: 600 }}>
                            Resend in {resendTimer}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary-600)',
                              fontWeight: 800,
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            Resend Code
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
