import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, Heart, ShoppingBag, Package, Menu, SlidersHorizontal, User } from 'lucide-react';
import '../../styles/navbar.css';

export default function Navbar() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    cartCount,
    cartSubtotal,
    setCartOpen,
    wishlist,
    setWishlistOpen,
    openOrderHistory,
    orders,
    customerProfile,
    setProfileModalOpen,
    setSortBy,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleHomeClick = (e) => {
    e?.preventDefault();
    setSelectedCategory('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrendingClick = (e) => {
    e?.preventDefault();
    if (setSortBy) setSortBy('popularity');
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactClick = (e) => {
    e?.preventDefault();
    const el = document.getElementById('contact-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReviewsClick = (e) => {
    e?.preventDefault();
    const el = document.getElementById('reviews-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'home', label: 'Home', action: handleHomeClick },
    { id: 'trending', label: 'Trending', action: handleTrendingClick },
    { id: 'contact', label: 'Contact us', action: handleContactClick },
    { id: 'reviews', label: 'Reviews', action: handleReviewsClick },
  ];

  return (
    <header className="navbar-wrapper">
      <div className="container-wide navbar-inner">
        {/* Brand Logo */}
        <a
          href="#"
          className="brand-logo-link"
          onClick={(e) => {
            e.preventDefault();
            setSelectedCategory('all');
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="BUY & BYE — Mens Clothing"
        >
          <img
            src="/logo.png"
            alt="BUY & BYE Mens Clothing"
            className="brand-logo-img"
            onError={(e) => {
              // Fallback if image fails
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{ display: 'none', fontWeight: 900, fontSize: '1.4rem', color: 'var(--primary-500)' }}>
            BUY <span style={{ color: 'var(--yellow-500)' }}>&</span> BYE
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className="nav-link"
              onClick={item.action}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Search Input */}
        <div className="navbar-search-container">
          <Search size={18} className="navbar-search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search shirts, chinos, linen, polo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="navbar-search-clear" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="nav-actions">
          {/* Mobile Search Toggle Button */}
          <button
            className="action-btn mobile-search-toggle"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            title="Search Products"
            aria-label="Toggle Search"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Wishlist Button */}
          <button
            className="action-btn"
            onClick={() => setWishlistOpen(true)}
            title="Your Saved Wishlist"
            id="nav-wishlist-btn"
          >
            <Heart size={20} />
            {wishlist.length > 0 && <span className="action-badge">{wishlist.length}</span>}
          </button>

          {/* Order History Button - Right beside Wishlist */}
          <button
            className="order-history-nav-btn"
            onClick={openOrderHistory}
            title="View Your Order History & Live Tracking"
            id="nav-order-history-btn"
          >
            <Package size={17} className="order-history-nav-icon" />
            <span className="order-history-nav-text">Order History</span>
            {orders && orders.length > 0 && (
              <span className="order-history-nav-badge">{orders.length}</span>
            )}
          </button>

          {/* Cart Button with Count & Subtotal (View Shopping Bag) */}
          <button
            className="cart-btn-pill"
            onClick={() => setCartOpen(true)}
            title="View Shopping Bag"
            id="nav-cart-btn"
          >
            <ShoppingBag size={18} />
            <span className="cart-count-bubble">{cartCount}</span>
            <span className="cart-price-text">₹{Math.round(cartSubtotal)}</span>
          </button>

          {/* Customer Profile / Sign In Button */}
          {customerProfile ? (
            <button
              className="action-btn profile-nav-btn"
              onClick={() => setProfileModalOpen(true)}
              title={`Logged in as ${customerProfile.name} (${customerProfile.email})`}
              id="nav-profile-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                border: '1.5px solid #BFDBFE',
                background: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <User size={16} />
              <span className="profile-name-text" style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {customerProfile.name.split(' ')[0]}
              </span>
              <span className="profile-active-indicator" title="Active Account" />
            </button>
          ) : (
            <button
              className="action-btn profile-nav-btn"
              onClick={() => setProfileModalOpen(true)}
              title="Sign In with Email OTP"
              aria-label="Sign In with Email OTP"
              id="nav-profile-btn"
            >
              <User size={20} />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="action-btn mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {mobileSearchOpen && (
        <div className="mobile-search-dropdown">
          <div className="mobile-search-inner">
            <Search size={18} className="mobile-search-icon-pos" />
            <input
              type="text"
              className="mobile-search-input"
              placeholder="Search shirts, chinos, linen, polo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button className="mobile-search-clear-pos" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '1rem 1.5rem',
            background: '#FFFFFF',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              style={{
                textAlign: 'left',
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 600,
                background: 'transparent',
                color: 'var(--dark-800)',
                cursor: 'pointer',
              }}
              onClick={() => {
                setMobileMenuOpen(false);
                item.action();
              }}
            >
              {item.label}
            </button>
          ))}
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              className="btn btn-outline"
              style={{
                width: '100%',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 700,
                backgroundColor: customerProfile ? 'transparent' : 'var(--primary-600)',
                color: customerProfile ? 'var(--dark-800)' : '#FFFFFF',
                borderColor: customerProfile ? 'var(--border-light)' : 'var(--primary-600)',
              }}
              onClick={() => {
                setProfileModalOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              <User size={16} />
              {customerProfile ? `My Account (${customerProfile.name.split(' ')[0]})` : 'Sign In with Email OTP'}
            </button>
            <button
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                openOrderHistory();
                setMobileMenuOpen(false);
              }}
            >
              Order History
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
