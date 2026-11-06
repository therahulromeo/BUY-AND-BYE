import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Settings,
  LogOut,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Topbar = ({
  collapsed,
  onOpenMobile,
  notifications = [],
  onClearNotifications,
}) => {
  const { admin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    navigate(`/products?search=${encodeURIComponent(globalSearch.trim())}`);
  };

  // Derive human-readable page title
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    const titles = {
      dashboard: 'Dashboard Overview',
      products: 'Product Catalog',
      categories: 'Categories',
      inventory: 'Inventory & Stock Control',
      orders: 'Order Management',
      customers: 'Customer Directory',
      payments: 'Transactions & Payments',
      reports: 'Reports & Business Analytics',
      settings: 'System & Store Settings',
    };
    return titles[path] || 'Admin Panel';
  };

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-topbar)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--spacing-6)',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
        <button
          type="button"
          onClick={onOpenMobile}
          className="btn-ghost btn-icon mobile-menu-btn"
          style={{ display: 'none', color: 'var(--color-text-primary)' }}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2
            style={{
              fontSize: 'var(--font-size-md)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Right: Global Search, Notification bell, Admin Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
        {/* Global Quick Search Form */}
        <form
          onSubmit={handleSearchSubmit}
          className="topbar-search-form"
          style={{ position: 'relative', width: '240px' }}
        >
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-subtle)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            className="form-input"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Quick search products..."
            style={{
              height: '34px',
              paddingLeft: '32px',
              fontSize: 'var(--font-size-xs)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-bg-subtle)',
            }}
          />
        </form>

        {/* Notifications Popover */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="btn-ghost btn-icon"
            style={{
              position: 'relative',
              color: notifDropdownOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-full)',
            }}
            aria-label="Notifications"
          >
            <Bell size={19} />
            {notifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--color-danger)',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                }}
              />
            )}
          </button>

          {notifDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border-default)',
                overflow: 'hidden',
                zIndex: 'var(--z-dropdown)',
              }}
            >
              <div
                style={{
                  padding: 'var(--spacing-3) var(--spacing-4)',
                  borderBottom: '1px solid var(--color-border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--color-bg-subtle)',
                }}
              >
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Notifications
                </span>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearNotifications}
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-primary)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 'var(--spacing-6)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                    No new notifications
                  </div>
                ) : (
                  notifications.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        if (item.link) navigate(item.link);
                      }}
                      style={{
                        padding: 'var(--spacing-3) var(--spacing-4)',
                        borderBottom: '1px solid var(--color-border-light)',
                        display: 'flex',
                        gap: 'var(--spacing-3)',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div
                        style={{
                          padding: '6px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor:
                            item.type === 'stock' ? 'var(--color-warning-bg)' : 'var(--color-info-bg)',
                          color:
                            item.type === 'stock' ? 'var(--color-warning-text)' : 'var(--color-info-text)',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {item.type === 'stock' ? <AlertTriangle size={15} /> : <ShoppingBag size={15} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {item.message}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
                          {item.time || 'Just now'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid transparent',
              backgroundColor: profileDropdownOpen ? 'var(--color-bg-subtle)' : 'transparent',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <img
              src={admin?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={admin?.name || 'Administrator'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid var(--color-border-default)',
              }}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }} className="admin-profile-name">
              <span
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                {admin?.name || 'Admin Vicky'}
              </span>
              <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                {admin?.role || 'Super Admin'}
              </span>
            </div>
          </button>

          {profileDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '240px',
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border-default)',
                padding: 'var(--spacing-2)',
                zIndex: 'var(--z-dropdown)',
              }}
            >
              <div
                style={{
                  padding: 'var(--spacing-3)',
                  borderBottom: '1px solid var(--color-border-light)',
                  marginBottom: 'var(--spacing-1)',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {admin?.name || 'Admin Vicky'}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  {admin?.email || 'vicky@buyandbye.com'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/settings');
                }}
                className="btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  fontSize: 'var(--font-size-xs)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Settings size={15} />
                <span>Account & Store Settings</span>
              </button>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border-light)', margin: '4px 0' }} />

              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  fontSize: 'var(--font-size-xs)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-danger)',
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
          .topbar-search-form {
            display: none !important;
          }
          .admin-profile-name {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Topbar;
