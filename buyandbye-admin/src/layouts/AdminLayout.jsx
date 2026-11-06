import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminLayout = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('buyandbye_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Fetch real summary stats to populate badges and notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchBadges = async () => {
      try {
        const stats = await orderService.getStats();
        setPendingOrdersCount(stats.pendingOrders || 0);
        setLowStockCount((stats.lowStockProducts || 0) + (stats.outOfStockProducts || 0));

        // Create realistic notifications
        const lowStockItems = await productService.getAll({ status: 'low_stock' });
        const outOfStockItems = await productService.getAll({ status: 'out_of_stock' });
        const pendingOrders = await orderService.getAll({ status: 'Pending' });

        const notifs = [];
        if (outOfStockItems.length > 0) {
          notifs.push({
            type: 'stock',
            title: 'Critical: Stock Depleted',
            message: `${outOfStockItems[0].product_name} is completely out of stock.`,
            time: '10m ago',
            link: '/inventory',
          });
        }
        if (lowStockItems.length > 0) {
          notifs.push({
            type: 'stock',
            title: 'Low Inventory Warning',
            message: `${lowStockItems[0].product_name} has only ${lowStockItems[0].stock} units left.`,
            time: '45m ago',
            link: '/inventory',
          });
        }
        if (pendingOrders.length > 0) {
          notifs.push({
            type: 'order',
            title: 'New Customer Order',
            message: `Order #${pendingOrders[0].order_id} requires fulfillment.`,
            time: '1h ago',
            link: '/orders',
          });
        }
        setNotifications(notifs);
      } catch (err) {
        console.error('Failed to load layout metrics:', err);
      }
    };

    fetchBadges();
  }, [isAuthenticated, location.pathname]);

  const toggleSidebarCollapse = () => {
    const nextState = !sidebarCollapsed;
    setSidebarCollapsed(nextState);
    localStorage.setItem('buyandbye_sidebar_collapsed', String(nextState));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Initializing BuyAndBye Admin..." />
      </div>
    );
  }

  // Redirect to /login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <div
        className={`admin-main ${
          sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'
        }`}
      >
        <Topbar
          collapsed={sidebarCollapsed}
          onOpenMobile={() => setMobileOpen(true)}
          notifications={notifications}
          onClearNotifications={handleClearNotifications}
        />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
