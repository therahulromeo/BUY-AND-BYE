import { useState, useEffect } from 'react';
import {
  CreditCard,
  Clock,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

import { paymentService } from '../services/paymentService';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate, getPaymentStatusVariant } from '../utils/formatters';

const Payments = () => {
  const toast = useToast();

  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentsData, summaryData] = await Promise.all([
        paymentService.getAll({ search, status: statusFilter, gateway: gatewayFilter }),
        paymentService.getSummary(),
      ]);
      setPayments(paymentsData);
      setSummary(summaryData);
    } catch (err) {
      toast.error('Failed to load payments data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [search, statusFilter, gatewayFilter]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPayments = payments.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <PageHeader
        title="Payments & Transactions"
        subtitle="Track payment gateway settlements, checkout transactions, refunds, and payment methods"
      />

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)',
        }}
      >
        <div className="admin-card" style={{ padding: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Gross Settled Volume
            </span>
            <ShieldCheck size={18} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-success-text)', marginTop: '4px' }}>
            {formatCurrency(summary?.totalVolume || 0)}
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
            Successful settlements
          </span>
        </div>

        <div className="admin-card" style={{ padding: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Completed Transactions
            </span>
            <CreditCard size={18} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {summary?.successfulCount || 0} / {summary?.totalTransactions || 0}
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
            Captured payments
          </span>
        </div>

        <div className="admin-card" style={{ padding: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Pending Authorization
            </span>
            <Clock size={18} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-warning)', marginTop: '4px' }}>
            {formatCurrency(summary?.pendingAmount || 0)}
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
            COD / awaiting bank capture
          </span>
        </div>

        <div className="admin-card" style={{ padding: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Processed Refunds
            </span>
            <RotateCcw size={18} color="var(--color-info)" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {formatCurrency(summary?.refundedAmount || 0)}
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
            Cancelled orders returned
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-card" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-4)' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <div className="filter-group">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search reference, order ID, or customer..."
              style={{ width: '300px' }}
            />

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="all">All Payment Statuses</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>

            <select
              className="form-select"
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '140px' }}
            >
              <option value="all">All Gateways</option>
              <option value="Razorpay">Razorpay</option>
              <option value="Stripe">Stripe</option>
              <option value="COD Portal">COD Portal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="admin-card">
        {loading ? (
          <LoadingSpinner text="Loading payment transactions..." />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payment records found"
            description="No transactions matched your current search filters."
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Transaction Reference</th>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Payment Method</th>
                    <th>Gateway</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date & Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((p) => (
                    <tr key={p.transaction_id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {p.transaction_id}
                        </div>
                        <code style={{ fontSize: '0.6875rem', color: 'var(--color-text-subtle)' }}>
                          {p.reference_no}
                        </code>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>{p.order_id}</strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{p.customer_name}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 'var(--font-size-xs)' }}>{p.payment_method}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-bg-subtle)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {p.gateway}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {formatCurrency(p.amount)}
                        </span>
                      </td>
                      <td>
                        <Badge variant={getPaymentStatusVariant(p.status)}>{p.status}</Badge>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {formatDate(p.created_at, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '0 var(--spacing-4)' }}>
              <Pagination
                currentPage={currentPage}
                totalItems={payments.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Payments;
