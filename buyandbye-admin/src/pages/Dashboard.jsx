import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { reportService } from '../services/reportService';
import { formatCurrency, formatDate, getOrderStatusVariant } from '../utils/formatters';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('30d');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, lowStockItems, analyticsData] = await Promise.all([
        orderService.getStats(),
        orderService.getAll({ sortBy: 'date', sortOrder: 'desc' }),
        productService.getAll({ status: 'low_stock' }),
        reportService.getAnalytics(dateRange),
      ]);

      setStats(statsData);
      setRecentOrders(ordersData.slice(0, 5));
      setLowStockList(lowStockItems.slice(0, 4));
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  if (loading && !analytics) {
    return <LoadingSpinner text="Loading dashboard metrics & charts..." />;
  }

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalSales),
      change: '+14.8%',
      isPositive: true,
      icon: DollarSign,
      color: '#2563eb',
      bgColor: '#eff6ff',
      description: 'from last month',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingBag,
      color: '#0284c7',
      bgColor: '#f0f9ff',
      description: 'all-time received',
    },
    {
      title: 'Active Products',
      value: stats.totalProducts.toLocaleString(),
      change: '+3 new',
      isPositive: true,
      icon: Package,
      color: '#10b981',
      bgColor: '#ecfdf5',
      description: 'catalog inventory',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      change: '+12.5%',
      isPositive: true,
      icon: Users,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      description: 'registered buyers',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      change: 'Fulfillment queue',
      isPositive: false,
      icon: Clock,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      description: 'needs action',
    },
    {
      title: 'Low-Stock Alerts',
      value: stats.lowStockProducts.toString(),
      change: 'Below safety limit',
      isPositive: false,
      icon: AlertTriangle,
      color: '#ef4444',
      bgColor: '#fef2f2',
      description: 'reorder required',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Admin Overview"
        subtitle="Real-time commercial performance, inventory health, and recent order transactions"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <select
              className="form-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ width: 'auto', height: '36px', fontSize: 'var(--font-size-xs)' }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">This Quarter</option>
              <option value="12m">Past 12 Months</option>
            </select>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchDashboardData}
              title="Refresh dashboard data"
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)',
        }}
      >
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="admin-card"
              style={{
                padding: 'var(--spacing-4)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {card.title}
                  </span>
                  <div
                    style={{
                      fontSize: '1.45rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      marginTop: '4px',
                    }}
                  >
                    {card.value}
                  </div>
                </div>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: card.bgColor,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: 'var(--spacing-3)',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                <span
                  style={{
                    color: card.isPositive ? 'var(--color-success-text)' : 'var(--color-warning-text)',
                    fontWeight: 600,
                    backgroundColor: card.isPositive ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  {card.isPositive && <TrendingUp size={12} />}
                  {card.change}
                </span>
                <span style={{ color: 'var(--color-text-subtle)' }}>{card.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Sales Revenue Area Chart & Category Distribution */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--spacing-6)',
          marginBottom: 'var(--spacing-6)',
        }}
        className="dashboard-charts-grid"
      >
        {/* Sales Trend Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Sales & Revenue Velocity</div>
              <div className="admin-card-subtitle">Monthly sales volume and completed order progression</div>
            </div>
            <Badge variant="info">Verified Transactions</Badge>
          </div>
          <div className="admin-card-body" style={{ height: '300px', paddingBottom: 'var(--spacing-2)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Category Revenue Share</div>
              <div className="admin-card-subtitle">Department sales contribution</div>
            </div>
          </div>
          <div className="admin-card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryShare || []}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(analytics?.categoryShare || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span style={{ fontSize: '11px', color: '#334155' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Low-Stock Alerts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--spacing-6)',
        }}
        className="dashboard-details-grid"
      >
        {/* Recent Orders Table */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Recent Orders</div>
              <div className="admin-card-subtitle">Latest fulfillment orders processed on BuyAndBye</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronRight}
              onClick={() => navigate('/orders')}
            >
              View All Orders
            </Button>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.order_id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/orders')}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        {order.order_id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {order.customer?.name}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          {order.items?.length} items
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td>
                        <Badge variant={getOrderStatusVariant(order.order_status)}>
                          {order.order_status}
                        </Badge>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {formatDate(order.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts & Best-Selling Products */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {/* Low Stock Alert Box */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title" style={{ color: 'var(--color-warning-text)' }}>
                <AlertTriangle size={18} color="var(--color-warning)" />
                <span>Low Inventory Watch</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/inventory')}
              >
                Manage
              </Button>
            </div>
            <div className="admin-card-body" style={{ padding: 'var(--spacing-3)' }}>
              {lowStockList.length === 0 ? (
                <div style={{ padding: 'var(--spacing-4)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                  All inventory items are currently above threshold!
                </div>
              ) : (
                lowStockList.map((product) => (
                  <div
                    key={product.product_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--spacing-2) 0',
                      borderBottom: '1px solid var(--color-border-light)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                      <img
                        src={product.image}
                        alt={product.product_name}
                        style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {product.product_name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-subtle)' }}>
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 700,
                          color: product.stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)',
                        }}
                      >
                        {product.stock} left
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Selling Products Preview */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title">Best Sellers</div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
                Analytics
              </Button>
            </div>
            <div className="admin-card-body" style={{ padding: 'var(--spacing-3)' }}>
              {(analytics?.topProducts || []).slice(0, 3).map((prod, idx) => (
                <div
                  key={prod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-2) 0',
                    borderBottom: idx < 2 ? '1px solid var(--color-border-light)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>{prod.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                      {prod.unitsSold} units ordered
                    </div>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {formatCurrency(prod.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .dashboard-charts-grid,
          .dashboard-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
