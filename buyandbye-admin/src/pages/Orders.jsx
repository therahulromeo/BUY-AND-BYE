import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Eye,
  Printer,
} from 'lucide-react';

import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import {
  formatCurrency,
  formatDate,
  getOrderStatusVariant,
  getPaymentStatusVariant,
} from '../utils/formatters';

const Orders = () => {
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAll({
        search,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        sortBy: 'date',
        sortOrder: 'desc',
      });
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    setCurrentPage(1);
  }, [search, statusFilter, paymentStatusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    setUpdatingOrderId(orderId);
    try {
      const updated = await orderService.updateStatus(orderId, newStatus);
      toast.success(`Order ${orderId} status updated to ${newStatus} & email dispatched via Nodemailer!`);
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder(updated);
      }
      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, order_status: newStatus } : o))
      );
      loadOrders();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
      setUpdatingOrderId(null);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const statusTabs = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = orders.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Review, manage fulfillment, track shipping, and update customer order statuses"
      />

      {/* Filter and Tab Bar */}
      <div className="admin-card" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', overflowX: 'auto', marginBottom: 'var(--spacing-4)' }}>
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: statusFilter === tab.value ? 600 : 500,
                backgroundColor: statusFilter === tab.value ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                color: statusFilter === tab.value ? '#ffffff' : 'var(--color-text-secondary)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="filter-bar" style={{ margin: 0 }}>
          <div className="filter-group">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by Order ID, customer, tracking..."
              style={{ width: '300px' }}
            />
            <select
              className="form-select"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Payment Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        {loading ? (
          <LoadingSpinner text="Retrieving orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            description="No customer orders matched the applied filters."
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th style={{ minWidth: '175px' }}>Action</th>
                    <th>Order Status</th>
                    <th>Customer Details</th>
                    <th>Date & Time</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td>
                        <strong
                          style={{
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            fontSize: 'var(--font-size-sm)',
                          }}
                          onClick={() => setSelectedOrder(order)}
                          title="Click to view details & invoice"
                        >
                          {order.order_id}
                        </strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                          <select
                            className="form-select"
                            value={order.order_status}
                            onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                            disabled={updatingOrderId === order.order_id}
                            title="Update Order Status directly"
                            style={{
                              width: 'auto',
                              minWidth: '125px',
                              padding: '5px 8px',
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 600,
                              borderRadius: 'var(--radius-md)',
                              borderColor: 'var(--color-border-default)',
                              cursor: 'pointer',
                              backgroundColor: 'var(--color-bg-surface, #ffffff)',
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            title="View Full Order Details & Invoice"
                            onClick={() => setSelectedOrder(order)}
                            style={{ padding: '4px 6px' }}
                          />
                        </div>
                      </td>
                      <td>
                        <Badge variant={getOrderStatusVariant(order.order_status)}>
                          {order.order_status}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {order.customer?.name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                          {order.customer?.email} &bull; {order.customer?.phone}
                        </div>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        {formatDate(order.date, true)}
                      </td>
                      <td>
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>
                          {order.items?.reduce((acc, item) => acc + item.quantity, 0)} items
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {formatCurrency(order.total_amount)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <Badge variant={getPaymentStatusVariant(order.payment_status)}>
                            {order.payment_status}
                          </Badge>
                          <span style={{ fontSize: '0.625rem', color: 'var(--color-text-subtle)' }}>
                            {order.payment_method}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '0 var(--spacing-4)' }}>
              <Pagination
                currentPage={currentPage}
                totalItems={orders.length}
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details — ${selectedOrder.order_id}`}
          size="lg"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button variant="ghost" size="sm" icon={Printer} onClick={handlePrintInvoice}>
                Print Invoice
              </Button>
              <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            {/* Top Bar inside modal: Status update trigger */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--spacing-3) var(--spacing-4)',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                flexWrap: 'wrap',
                gap: 'var(--spacing-3)',
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Placed on: {formatDate(selectedOrder.date, true)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginTop: '4px' }}>
                  <Badge variant={getOrderStatusVariant(selectedOrder.order_status)}>
                    {selectedOrder.order_status}
                  </Badge>
                  <Badge variant={getPaymentStatusVariant(selectedOrder.payment_status)}>
                    {selectedOrder.payment_status}
                  </Badge>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Update Status:</span>
                <select
                  className="form-select"
                  value={selectedOrder.order_status}
                  onChange={(e) => handleStatusChange(selectedOrder.order_id, e.target.value)}
                  disabled={updatingStatus}
                  style={{ width: 'auto', fontSize: 'var(--font-size-xs)', padding: '4px 8px' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-4)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <div
                style={{
                  padding: 'var(--spacing-3)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                  Customer Information
                </div>
                <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {selectedOrder.customer?.name}
                </div>
                <div style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Email: {selectedOrder.customer?.email}
                </div>
                <div style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Phone: {selectedOrder.customer?.phone}
                </div>
              </div>

              <div
                style={{
                  padding: 'var(--spacing-3)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                  Shipping & Tracking
                </div>
                <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {selectedOrder.shipping_address?.street}, {selectedOrder.shipping_address?.city},{' '}
                  {selectedOrder.shipping_address?.state} — {selectedOrder.shipping_address?.postal_code}
                </div>
                {selectedOrder.tracking_number && (
                  <div style={{ marginTop: '6px', color: 'var(--color-primary)', fontWeight: 600 }}>
                    Tracking: {selectedOrder.tracking_number}
                  </div>
                )}
              </div>
            </div>

            {/* Ordered Items Table */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>
                Order Items ({selectedOrder.items?.length})
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                            />
                            <span style={{ fontWeight: 500 }}>{item.name}</span>
                          </div>
                        </td>
                        <td>
                          <code>{item.sku}</code>
                        </td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Calculations Summary */}
            <div
              style={{
                alignSelf: 'flex-end',
                width: '260px',
                fontSize: 'var(--font-size-xs)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                paddingTop: 'var(--spacing-2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Tax (5% GST):</span>
                <span>{formatCurrency(selectedOrder.tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Shipping:</span>
                <span>{selectedOrder.shipping_fee > 0 ? formatCurrency(selectedOrder.shipping_fee) : 'Free'}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                  borderTop: '1px solid var(--color-border-default)',
                  paddingTop: '6px',
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
