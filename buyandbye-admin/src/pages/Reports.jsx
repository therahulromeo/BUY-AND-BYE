import { useState, useEffect } from 'react';
import {
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

import { reportService } from '../services/reportService';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';

const Reports = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState('30d');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const analytics = await reportService.getAnalytics(dateRange);
        setData(analytics);
      } catch (err) {
        toast.error('Failed to load reports data');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [dateRange]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const orders = await orderService.getAll();
      const exportRows = orders.map((o) => ({
        OrderID: o.order_id,
        Customer: o.customer?.name,
        Email: o.customer?.email,
        Date: o.date,
        Subtotal: o.subtotal,
        Tax: o.tax,
        TotalAmount: o.total_amount,
        PaymentMethod: o.payment_method,
        PaymentStatus: o.payment_status,
        OrderStatus: o.order_status,
      }));

      reportService.exportToCsv('BuyAndBye_Sales_Report', exportRows);
      toast.success('Sales report CSV successfully generated and downloaded', 'Export Complete');
    } catch (err) {
      toast.error('Failed to export CSV report');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !data) {
    return <LoadingSpinner text="Generating business reports & metrics..." />;
  }

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business intelligence, monthly revenue trends, product performance, and downloadable sales ledgers"
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
              icon={Download}
              onClick={handleExportCsv}
              loading={exporting}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Monthly Sales & Orders Combined Line & Bar Chart */}
      <div className="admin-card" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div className="admin-card-header">
          <div>
            <div className="admin-card-title">Commercial Trajectory: Sales Volume vs Order Quantity</div>
            <div className="admin-card-subtitle">Monthly breakdown of gross earnings and total completed customer orders</div>
          </div>
        </div>
        <div className="admin-card-body" style={{ height: '340px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.monthlyRevenue || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                formatter={(value, name) => [
                  name === 'Sales Volume (₹)' ? formatCurrency(value) : value,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="sales" name="Sales Volume (₹)" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={45} />
              <Line yAxisId="right" type="monotone" dataKey="orders" name="Order Count" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Weekly Day Distribution & Top SKUs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--spacing-6)',
        }}
        className="reports-two-col"
      >
        {/* Weekly Revenue by Day */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Day-of-Week Revenue Distribution</div>
              <div className="admin-card-subtitle">Peak purchasing days analysis</div>
            </div>
          </div>
          <div className="admin-card-body" style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.weeklySales || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Sales']} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing SKUs Table */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Top Revenue Generating SKUs</div>
              <div className="admin-card-subtitle">Leading merchandise by units fulfilled and total revenue</div>
            </div>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product / SKU</th>
                    <th>Units Sold</th>
                    <th style={{ textAlign: 'right' }}>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.topProducts || []).map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <code style={{ fontSize: '0.6875rem', color: 'var(--color-text-subtle)' }}>
                          {p.sku}
                        </code>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{p.unitsSold} units</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {formatCurrency(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .reports-two-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports;
