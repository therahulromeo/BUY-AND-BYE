import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  Folder,
} from 'lucide-react';

import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

import { categoryService } from '../services/categoryService';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';

const Categories = () => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const initialForm = {
    category_name: '',
    parent_category_id: '',
    description: '',
    image: '',
    status: 'active',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll({ search, status: statusFilter });
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      ...initialForm,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      category_name: cat.category_name,
      parent_category_id: cat.parent_category_id || '',
      description: cat.description || '',
      image: cat.image || '',
      status: cat.status || 'active',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.category_name.trim()) {
      errors.category_name = 'Category name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.category_id, formData);
        toast.success(`Category "${formData.category_name}" updated`);
      } else {
        await categoryService.create(formData);
        toast.success(`Category "${formData.category_name}" created`);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await categoryService.delete(deleteTarget.category_id);
      toast.success(`Category "${deleteTarget.category_name}" removed`);
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Potential parent categories (exclude the category itself when editing)
  const availableParents = categories.filter(
    (c) => !editingCategory || c.category_id !== editingCategory.category_id
  );

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCategories = categories.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Organize product taxonomy, departments, sub-categories, and collections"
        actions={
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Add Category
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-4)' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <div className="filter-group">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search category name or description..."
              style={{ width: '280px' }}
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
        </div>
      </div>

      {/* Categories Table */}
      <div className="admin-card">
        {loading ? (
          <LoadingSpinner text="Loading category hierarchy..." />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No categories found"
            description="Add department categories like MEN, SHIRTS, or TROUSERS to organize products."
            actionLabel="Add Category"
            actionIcon={Plus}
            onAction={handleOpenAdd}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Hierarchy / Parent</th>
                    <th>Description</th>
                    <th>Assigned Products</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((cat) => (
                    <tr key={cat.category_id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                          <img
                            src={cat.image}
                            alt={cat.category_name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: 'var(--radius-md)',
                              objectFit: 'cover',
                              border: '1px solid var(--color-border-light)',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {cat.category_name}
                            </div>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-subtle)' }}>
                              ID: #{cat.category_id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {cat.parent_name || cat.parent_category_id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Folder size={14} color="var(--color-text-subtle)" />
                              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>
                                {cat.parent_name || 'Parent'} (Parent ID: {cat.parent_category_id})
                              </span>
                            </div>
                            {cat.type_id && (
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  color: '#059669',
                                  fontWeight: 600,
                                }}
                              >
                                Type ID: #{cat.type_id}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 600,
                              color: 'var(--color-primary)',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            Root Category (ID: #{cat.category_id})
                          </span>
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            maxWidth: '240px',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {cat.description || '—'}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--color-bg-subtle)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {cat.product_count || 0} products
                        </span>
                      </td>
                      <td>
                        <Badge variant={cat.status === 'active' ? 'success' : 'neutral'}>
                          {cat.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {formatDate(cat.created_at)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="btn-icon"
                            onClick={() => handleOpenEdit(cat)}
                            title="Edit Category"
                          >
                            <Edit2 size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="btn-icon"
                            onClick={() => setDeleteTarget(cat)}
                            title="Delete Category"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <Trash2 size={15} />
                          </Button>
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
                totalItems={categories.length}
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

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              {editingCategory ? 'Update Category' : 'Save Category'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Category Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${formErrors.category_name ? 'is-invalid' : ''}`}
              value={formData.category_name}
              onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
              placeholder="e.g. CASUAL SHIRTS or FORMAL SHIRTS"
            />
            {formErrors.category_name && <span className="form-error">{formErrors.category_name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Parent Category</label>
            <select
              className="form-select"
              value={formData.parent_category_id}
              onChange={(e) => setFormData({ ...formData, parent_category_id: e.target.value })}
            >
              <option value="">None (Top-Level Category)</option>
              {availableParents.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
            <span className="form-hint">Nest this category under an existing department</span>
          </div>

          <div className="form-group">
            <label className="form-label">Category Image URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/images/category.jpg"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief overview of items contained in this category..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active (Visible in catalog)</option>
              <option value="inactive">Inactive (Hidden)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.category_name}"? Categories with products assigned cannot be deleted.`}
        confirmText="Delete Category"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Categories;
