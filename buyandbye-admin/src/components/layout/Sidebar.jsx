import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingBag,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShoppingBasket,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Sidebar = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  pendingOrdersCount = 0,
  lowStockCount = 0,
}) => {
  const { admin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('You have been logged out successfully.', 'Logged Out');
      navigate('/login');
    } catch {
      toast.error('Failed to log out. Please try again.');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Categories', path: '/categories', icon: FolderTree },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeVariant: 'warning',
    },
    {
      label: 'Orders',
      path: '/orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeVariant: 'info',
    },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 'var(--z-sidebar)',
            backdropFilter: 'blur(2px)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          backgroundColor: '#0f172a', // Deep slate navy for premium contrast
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 'calc(var(--z-sidebar) + 1)',
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          borderRight: '1px solid #1e293b',
          overflow: 'hidden',
          transform: mobileOpen
            ? 'translateX(0)'
            : 'translateX(0)', // On desktop
        }}
        className={`sidebar-nav ${mobileOpen ? 'mobile-visible' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--topbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0' : '0 var(--spacing-4)',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => navigate('/dashboard')}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
              }}
            >
              <ShoppingBasket size={20} />
            </div>
            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    lineHeight: 1.1,
                  }}
                >
                  Buy<span style={{ color: '#60a5fa' }}>And</span>Bye
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#94a3b8',
                    fontWeight: 600,
                  }}
                >
                  Admin Portal
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="mobile-close-btn"
            onClick={onCloseMobile}
            style={{
              color: '#94a3b8',
              display: 'none',
              padding: '4px',
            }}
            aria-label="Close navigation drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: 'var(--spacing-3) var(--spacing-2)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (mobileOpen && onCloseMobile) onCloseMobile();
                }}
                title={collapsed ? item.label : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-3)',
                  padding: collapsed ? '0.625rem 0' : '0.625rem 0.875rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(37, 99, 235, 0.22)' : 'transparent',
                  borderLeft: isActive && !collapsed ? '3px solid var(--color-primary)' : '3px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 'var(--font-size-sm)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                })}
              >
                <Icon size={19} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {!collapsed && item.badge && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor:
                        item.badgeVariant === 'warning' ? '#d97706' : '#2563eb',
                      color: '#ffffff',
                      lineHeight: 1,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '12px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: item.badgeVariant === 'warning' ? '#f59e0b' : '#3b82f6',
                    }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer: User profile & Logout */}
        <div
          style={{
            borderTop: '1px solid #1e293b',
            padding: 'var(--spacing-3) var(--spacing-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-2)',
          }}
        >
          {/* Admin mini profile info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              padding: collapsed ? '4px 0' : '4px 8px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <img
              src={admin?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={admin?.name || 'Admin'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #3b82f6',
                flexShrink: 0,
              }}
            />
            {!collapsed && (
              <div style={{ overflow: 'hidden', lineHeight: 1.2 }}>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: '#f8fafc',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {admin?.name || 'Admin Vicky'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                  {admin?.username ? `@${admin.username}` : 'Administrator'}
                </div>
              </div>
            )}
          </div>

          {/* Quick Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              padding: collapsed ? '0.5rem 0' : '0.5rem 0.875rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-md)',
              color: '#ef4444',
              backgroundColor: 'transparent',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 500,
              transition: 'all var(--transition-fast)',
              cursor: 'pointer',
              border: 'none',
              width: '100%',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
          </button>

          {/* Collapse toggle (Desktop only) */}
          <button
            type="button"
            className="desktop-collapse-btn"
            onClick={onToggleCollapse}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: '#94a3b8',
              backgroundColor: '#1e293b',
              cursor: 'pointer',
              border: 'none',
              marginTop: '4px',
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Responsive Style Overrides */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-nav {
            transform: translateX(-100%) !important;
            width: 260px !important;
          }
          .sidebar-nav.mobile-visible {
            transform: translateX(0) !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
          .desktop-collapse-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
