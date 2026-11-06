import { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  RefreshCw,
} from 'lucide-react';

import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

import { customerService } from '../services/customerService';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const Customers = () => {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerService.getAll({ search, status: statusFilter });
      setCustomers(data);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleViewCustomer = async (cust) => {
    try {
      const detailed = await customerService.getById(cust.customer_id);
      setSelectedCustomer(detailed);
    } catch {
      setSelectedCustomer(cust);
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCustomers = customers.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="View registered customers, buyer activity, lifetime value, and order history"
      />

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-4)' }}>
        <div className="filter-bar" style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="filter-group">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by customer name, email, city..."
              style={{ width: '300px' }}
            />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '140px' }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadCustomers}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="admin-card">
        {loading ? (
          <LoadingSpinner text="Loading customer accounts..." />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="No customer accounts found. Whenever a user creates their account, they will automatically be updated here."
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Location</th>
                    <th>Total Orders</th>
                    <th>Lifetime Spent</th>
                    <th>Registered</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.map((cust) => (
                    <tr key={cust.customer_id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-primary-light)',
                              color: 'var(--color-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 'var(--font-size-xs)',
                              flexShrink: 0,
                            }}
                          >
                            {(cust.name || 'CU').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                                cursor: 'pointer',
                                textDecoration: 'none',
                              }}
                              onClick={() => handleViewCustomer(cust)}
                              title="Click to view full customer profile"
                            >
                              {cust.name}
                            </div>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-subtle)' }}>
                              CID: #{cust.customer_id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)' }}>
                          {cust.email || '-'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                          {cust.phone || '-'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                          {[cust.city, cust.state].filter(Boolean).join(', ') || '-'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{cust.total_orders || 0} orders</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          {formatCurrency(cust.total_spent || 0)}
                        </span>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {formatDate(cust.registered_at || cust.created_at)}
                      </td>
                      <td>
                        <Badge variant={cust.status === 'active' ? 'success' : 'neutral'}>
                          {cust.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '0 var(--spacing-4)' }}>
              <Pagination
                currentPage={currentPage}
                totalItems={customers.length}
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

      {/* Customer Profile & Purchase History Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer: ${selectedCustomer.name}`}
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelectedCustomer(null)}>
              Close
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3)',
                padding: 'var(--spacing-3)',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 700,
                }}
              >
                {selectedCustomer.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <h4 style={{ margin: 0 }}>{selectedCustomer.name}</h4>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {selectedCustomer.email} &bull; {selectedCustomer.phone}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-subtle)' }}>
                  {selectedCustomer.city}, {selectedCustomer.state}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-3)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <div style={{ padding: 'var(--spacing-3)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Total Purchases</span>
                <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                  {formatCurrency(selectedCustomer.total_spent)}
                </div>
              </div>
              <div style={{ padding: 'var(--spacing-3)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Registered Since</span>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginTop: '2px' }}>
                  {formatDate(selectedCustomer.registered_at)}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>
                Recent Order History ({(selectedCustomer.orders || []).length})
              </div>
              {(selectedCustomer.orders || []).length === 0 ? (
                <div style={{ padding: 'var(--spacing-4)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                  No previous orders recorded for this profile.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedCustomer.orders || []).map((o) => (
                        <tr key={o.order_id}>
                          <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{o.order_id}</td>
                          <td style={{ fontSize: 'var(--font-size-xs)' }}>{formatDate(o.date)}</td>
                          <td style={{ fontWeight: 600 }}>{formatCurrency(o.total_amount)}</td>
                          <td>
                            <Badge variant={o.order_status === 'Delivered' ? 'success' : 'info'}>
                              {o.order_status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Customers;
