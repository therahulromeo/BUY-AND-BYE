import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { ToastProvider } from './context/ToastContext';
import { StoreProvider, useStore } from './context/StoreContext';
import AnnouncementBar from './components/layout/AnnouncementBar';
import Navbar from './components/layout/Navbar';
import HeroBanner from './components/home/HeroBanner';
import FilterSidebar from './components/shop/FilterSidebar';
import ProductGrid from './components/shop/ProductGrid';
import CustomerReviews from './components/home/CustomerReviews';
import Footer from './components/layout/Footer';

// Pages & Modals
import QuickCartDrawer from './components/layout/QuickCartDrawer';
import WishlistDrawer from './components/shop/WishlistDrawer';
import ProductQuickViewModal from './components/shop/ProductQuickViewModal';
import SizeGuideModal from './components/common/SizeGuideModal';
import CustomerDetailsPage from './components/checkout/CustomerDetailsPage';
import OrderSuccessModal from './components/checkout/OrderSuccessModal';
import OrderHistoryPage from './components/orders/OrderHistoryPage';
import CustomerProfileModal from './components/profile/CustomerProfileModal';
import ProductDetailPage from './components/shop/ProductDetailPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Customer Storefront Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '4rem 1.5rem', textAlign: 'center', background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#64748B', maxWidth: '440px', marginBottom: '1.5rem' }}>
            We encountered a temporary issue loading this view. You can safely return to the home catalog.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Return to Store
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import './styles/global.css';
import './styles/products.css';

function MainStore() {
  const {
    filteredProducts,
    searchQuery,
    checkoutOpen,
    setCheckoutOpen,
    orderHistoryPageOpen,
    setOrderHistoryPageOpen,
    selectedProduct,
    setSelectedProduct,
    selectedCategory,
    setSelectedCategory,
  } = useStore();

  const [placedOrder, setPlacedOrder] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // If customer is viewing the Order History Page
  if (orderHistoryPageOpen) {
    return (
      <div className="store-app-wrapper">
        <OrderHistoryPage onBack={() => setOrderHistoryPageOpen(false)} />
        <CustomerProfileModal />
      </div>
    );
  }

  // If customer is in checkout, display the dedicated Customer Details & Tracking page
  if (checkoutOpen) {
    return (
      <div className="store-app-wrapper">
        <CustomerDetailsPage
          onBack={() => setCheckoutOpen(false)}
          onOrderSuccess={(order) => {
            setCheckoutOpen(false);
            setPlacedOrder(order);
          }}
        />
        <CustomerProfileModal />
        <OrderSuccessModal order={placedOrder} onClose={() => setPlacedOrder(null)} />
      </div>
    );
  }

  // If customer is viewing a dedicated Product Details Page
  if (selectedProduct) {
    return (
      <div className="store-app-wrapper">
        <AnnouncementBar />
        <Navbar />
        <ProductDetailPage
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
        />
        <Footer />
        <QuickCartDrawer />
        <WishlistDrawer />
        <ProductQuickViewModal />
        <SizeGuideModal />
        <CustomerProfileModal />
        <CustomerProfileModal />
        <OrderSuccessModal order={placedOrder} onClose={() => setPlacedOrder(null)} />
      </div>
    );
  }

  return (
    <div className="store-app-wrapper">
      {/* Top Banner & Navbar */}
      <AnnouncementBar />
      <Navbar />

      {/* Hero Showcase */}
      <HeroBanner />

      {/* Main Catalog Section */}
      <main id="catalog-section" className="catalog-section">
        <div className="container-wide">
          <div className="catalog-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-blue">Handpicked Collection</span>
                {searchQuery && (
                  <span className="badge badge-yellow">Search: "{searchQuery}"</span>
                )}
              </div>
              <h2 className="catalog-title">Curated Men's Apparel</h2>
              <p className="catalog-subtitle">
                Showing {filteredProducts.length} premium shirts, trousers, and polo items
              </p>
            </div>
          </div>

          {/* Mobile Filter & Quick Category Chips Bar */}
          <div className="mobile-filter-strip">
            <button
              className="mobile-filter-open-btn"
              onClick={() => setMobileFilterOpen(true)}
              aria-label="Open Filter Options"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {selectedCategory && selectedCategory !== 'all' && (
                <span className="mobile-filter-badge">1</span>
              )}
            </button>

            <div className="mobile-filter-quick-pills">
              {[
                { id: 'all', label: 'All' },
                { id: 'shirt', label: 'Shirts' },
                { id: 't-shirts', label: 'T-Shirts' },
                { id: 'pants', label: 'Pants' },
                { id: 'accessories', label: 'Accessories' },
              ].map((cat) => {
                const isActive =
                  selectedCategory === cat.id ||
                  (cat.id === 'shirt' && (selectedCategory?.includes('shirt') || selectedCategory === 'formal-shirts' || selectedCategory === 'casual-shirts'));
                return (
                  <button
                    key={cat.id}
                    className={`quick-filter-chip ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="catalog-layout">
            <FilterSidebar />
            <ProductGrid />
          </div>
        </div>
      </main>

      {/* Verified Customer Reviews */}
      <CustomerReviews />

      {/* Brand Footer */}
      <Footer />

      {/* Interactive Drawers & Modals */}
      <QuickCartDrawer />
      <WishlistDrawer />
      <ProductQuickViewModal />
      <SizeGuideModal />
      <OrderSuccessModal order={placedOrder} onClose={() => setPlacedOrder(null)} />
      <CustomerProfileModal />

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="mobile-filter-modal-overlay" onClick={() => setMobileFilterOpen(false)}>
          <div className="mobile-filter-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-filter-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.05rem', color: 'var(--dark-900)' }}>
                <SlidersHorizontal size={17} color="var(--primary-600)" />
                <span>Filters &amp; Categories</span>
              </div>
              <button className="drawer-close-btn" onClick={() => setMobileFilterOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mobile-filter-body">
              <FilterSidebar isMobile onClose={() => setMobileFilterOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <StoreProvider>
          <MainStore />
        </StoreProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
