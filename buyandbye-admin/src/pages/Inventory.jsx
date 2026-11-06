import { useState, useEffect } from 'react';
import {
  Boxes,
  Sliders,
  History,
} from 'lucide-react';

import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

import { productService } from '../services/productService';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate, getStockStatus } from '../utils/formatters';

const Inventory = () => {
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'logs'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Stock Adjustment Modal
  const [adjustmentTarget, setAdjustmentTarget] = useState(null);
  const [adjustType, setAdjustType] = useState('ADD'); // 'ADD' | 'SUBTRACT' | 'SET'
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Received Shipment from Vendor');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, logs] = await Promise.all([
        productService.getAll({ search, status: statusFilter, sortBy: 'stock', sortOrder: 'asc' }),
        productService.getStockLogs(),
      ]);
      setProducts(prods);
      setStockLogs(logs);
    } catch (err) {
      toast.error('Failed to load inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Compute Metrics
  const totalUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const totalValuation = products.reduce(
    (sum, p) => sum + (Number(p.stock) || 0) * (Number(p.cost_price) || Number(p.price) || 0),
    0
  );
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= (p.min_stock || 10)).length;
  const outOfStockCount = products.filter((p) => Number(p.stock) === 0).length;

  const handleOpenAdjust = (product) => {
    setAdjustmentTarget(product);
    setAdjustType('ADD');
    setAdjustQty('');
    setAdjustReason('Received Shipment from Vendor');
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustQty || parseInt(adjustQty, 10) <= 0) {
      toast.error('Please enter a valid positive quantity');
      return;
    }

    setAdjustSubmitting(true);
    try {
      await productService.adjustStock(adjustmentTarget.product_id, {
        quantity: parseInt(adjustQty, 10),
        type: adjustType,
        reason: adjustReason,
        user: 'Vicky (Admin)',
      });

      toast.success(
        `Stock for "${adjustmentTarget.product_name}" adjusted successfully`,
        'Inventory Updated'
      );
      setAdjustmentTarget(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = products.slice(startIndex, startIndex + pageSize);
  const paginatedLogs = stockLogs.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <PageHeader
        title="Inventory Management"
        subtitle="Track stock levels, replenish warehouse units, and review inventory audit logs"
        actions={
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <Button
              variant={activeTab === 'inventory' ? 'primary' : 'secondary'}
              size="sm"
              icon={Boxes}
              onClick={() => setActiveTab('inventory')}
            >
              Stock Levels
            </Button>
            <Button
              variant={activeTab === 'logs' ? 'primary' : 'secondary'}
              size="sm"
              icon={History}
              onClick={() => setActiveTab('logs')}
            >
              Audit Trail ({stockLogs.length})
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)',
        }}
      >
        <div className="admin-card" style={{ padding: 'var(--spacing-4)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Total Stock On Hand
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {totalUnits.toLocaleString()} units
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
            Across {products.length} catalog items
          </span>
        </div>

        <div className="admin-card" style={{ padding: 'var(--spacing-4)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Estimated Asset Value
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
            {formatCurrency(totalValuation)}
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
            Based on unit cost valuations
          </span>
        </div>

        <div className="admin-card" style={{ padding: 'var(--spacing-4)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-warning-text)', fontWeight: 600 }}>
            Low Stock Warnings
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-warning)', marginTop: '4px' }}>
            {lowStockCount} items
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
            Requires vendor reorder
          </span>
        </div>

        <div className="admin-card" style={{ padding: 'var(--spacing-4)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger-text)', fontWeight: 600 }}>
            Out of Stock (Zero Units)
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-danger)', marginTop: '4px' }}>
            {outOfStockCount} items
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
            Unavailable to customers
          </span>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Filter Bar */}
          <div className="admin-card" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-4)' }}>
            <div className="filter-bar" style={{ margin: 0 }}>
              <div className="filter-group">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Filter by product name or SKU..."
                  style={{ width: '280px' }}
                />
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: 'auto', minWidth: '150px' }}
                >
                  <option value="">All Stock Levels</option>
                  <option value="low_stock">Low Stock Alerts Only</option>
                  <option value="out_of_stock">Out of Stock Only</option>
                  <option value="in_stock">Healthy Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="admin-card">
            {loading ? (
              <LoadingSpinner text="Loading inventory records..." />
            ) : products.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="No inventory records matched"
                description="Try broadening your filter criteria."
              />
            ) : (
              <>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product & SKU</th>
                        <th>Category</th>
                        <th>Stock Level</th>
                        <th>Threshold</th>
                        <th>Status</th>
                        <th>Inventory Valuation</th>
                        <th style={{ textAlign: 'right' }}>Quick Adjust</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((p) => {
                        const stockInfo = getStockStatus(p.stock, p.min_stock);
                        const itemValuation = (Number(p.stock) || 0) * (Number(p.cost_price) || Number(p.price) || 0);

                        return (
                          <tr key={p.product_id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                                <img
                                  src={p.image}
                                  alt={p.product_name}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: 'var(--radius-sm)',
                                    objectFit: 'cover',
                                    border: '1px solid var(--color-border-light)',
                                  }}
                                />
                                <div>
                                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                    {p.product_name}
                                  </div>
                                  <code style={{ fontSize: '0.6875rem', color: 'var(--color-text-subtle)' }}>
                                    {p.sku}
                                  </code>
                                </div>
                              </div>
                            </td>
                            <td>{p.category_name}</td>
                            <td>
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: 'var(--font-size-md)',
                                  color:
                                    p.stock === 0
                                      ? 'var(--color-danger)'
                                      : p.stock <= (p.min_stock || 10)
                                      ? 'var(--color-warning)'
                                      : 'var(--color-text-primary)',
                                }}
                              >
                                {p.stock}
                              </span>{' '}
                              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                                units
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                min {p.min_stock || 5}
                              </span>
                            </td>
                            <td>
                              <Badge variant={stockInfo.variant}>{stockInfo.label}</Badge>
                            </td>
                            <td>
                              <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                {formatCurrency(itemValuation)}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={Sliders}
                                onClick={() => handleOpenAdjust(p)}
                              >
                                Adjust Stock
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: '0 var(--spacing-4)' }}>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={products.length}
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
        </>
      ) : (
        /* Stock Audit Logs Tab */
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Inventory Adjustment History</div>
              <div className="admin-card-subtitle">
                Immutable audit trail of warehouse receipts, stock removals, and inventory counts
              </div>
            </div>
          </div>
          {stockLogs.length === 0 ? (
            <EmptyState
              icon={History}
              title="No audit logs recorded yet"
              description="Any stock adjustments will automatically appear here with timestamp and rationale."
            />
          ) : (
            <>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Qty Changed</th>
                      <th>Previous &rarr; New</th>
                      <th>Reason / Note</th>
                      <th>Adjusted By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          {formatDate(log.timestamp, true)}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{log.product_name}</div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-subtle)' }}>
                            {log.sku}
                          </span>
                        </td>
                        <td>
                          <Badge
                            variant={
                              log.type === 'ADD'
                                ? 'success'
                                : log.type === 'SUBTRACT'
                                ? 'danger'
                                : 'info'
                            }
                          >
                            {log.type === 'ADD'
                              ? '+ Restock'
                              : log.type === 'SUBTRACT'
                              ? '- Deduction'
                              : 'Manual Set'}
                          </Badge>
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {log.type === 'ADD' ? `+${log.quantity}` : `-${log.quantity}`}
                        </td>
                        <td>
                          <span style={{ color: 'var(--color-text-muted)' }}>{log.previous_stock}</span>
                          {' '}&rarr;{' '}
                          <strong style={{ color: 'var(--color-text-primary)' }}>{log.new_stock}</strong>
                        </td>
                        <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                          {log.reason}
                        </td>
                        <td>
                          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>
                            {log.adjusted_by}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '0 var(--spacing-4)' }}>
                <Pagination
                  currentPage={currentPage}
                  totalItems={stockLogs.length}
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
      )}

      {/* Adjust Stock Modal */}
      {adjustmentTarget && (
        <Modal
          isOpen={!!adjustmentTarget}
          onClose={() => setAdjustmentTarget(null)}
          title={`Adjust Stock: ${adjustmentTarget.product_name}`}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setAdjustmentTarget(null)} disabled={adjustSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAdjustSubmit} loading={adjustSubmitting}>
                Apply Stock Adjustment
              </Button>
            </>
          }
        >
          <form onSubmit={handleAdjustSubmit}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3)',
                padding: 'var(--spacing-3)',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-4)',
              }}
            >
              <img
                src={adjustmentTarget.image}
                alt={adjustmentTarget.product_name}
                style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>{adjustmentTarget.product_name}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  SKU: {adjustmentTarget.sku} &bull; Current Available: <strong>{adjustmentTarget.stock} units</strong>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adjustment Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-2)' }}>
                <button
                  type="button"
                  onClick={() => setAdjustType('ADD')}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    border: adjustType === 'ADD' ? '2px solid var(--color-success)' : '1px solid var(--color-border-default)',
                    backgroundColor: adjustType === 'ADD' ? 'var(--color-success-bg)' : '#ffffff',
                    color: adjustType === 'ADD' ? 'var(--color-success-text)' : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    fontSize: 'var(--font-size-xs)',
                    cursor: 'pointer',
                  }}
                >
                  + Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('SUBTRACT')}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    border: adjustType === 'SUBTRACT' ? '2px solid var(--color-danger)' : '1px solid var(--color-border-default)',
                    backgroundColor: adjustType === 'SUBTRACT' ? 'var(--color-danger-bg)' : '#ffffff',
                    color: adjustType === 'SUBTRACT' ? 'var(--color-danger-text)' : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    fontSize: 'var(--font-size-xs)',
                    cursor: 'pointer',
                  }}
                >
                  - Deduct / Damage
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('SET')}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    border: adjustType === 'SET' ? '2px solid var(--color-primary)' : '1px solid var(--color-border-default)',
                    backgroundColor: adjustType === 'SET' ? 'var(--color-primary-light)' : '#ffffff',
                    color: adjustType === 'SET' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    fontSize: 'var(--font-size-xs)',
                    cursor: 'pointer',
                  }}
                >
                  Set Exact Count
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Quantity Units <span className="required">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="Enter units to adjust..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Adjustment</label>
              <select
                className="form-select"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              >
                <option value="Received Shipment from Vendor">Received Shipment from Vendor</option>
                <option value="Inventory Count Discrepancy Reconciliation">Inventory Count Discrepancy Reconciliation</option>
                <option value="Damaged or Defective Goods Written Off">Damaged or Defective Goods Written Off</option>
                <option value="Customer Return Restocked">Customer Return Restocked</option>
                <option value="Internal Quality Inspection Sample">Internal Quality Inspection Sample</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Inventory;
