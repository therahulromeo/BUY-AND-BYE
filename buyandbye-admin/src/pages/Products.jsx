import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Package,
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
import ImageUpload from '../components/common/ImageUpload';

import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate, getStockStatus } from '../utils/formatters';

export const BASE_CATEGORIES = [
  { id: 1, name: 'Shirt', key: 'Shirt' },
  { id: 2, name: 'T-Shirts', key: 'T-Shirts' },
  { id: 3, name: 'Pants', key: 'Pants' },
  { id: 4, name: 'Accessories', key: 'Accessories' },
];

export const SUB_CATEGORIES_BY_BASE = {
  Shirt: [
    { type_id: 1, name: 'Formal Shirt' },
    { type_id: 2, name: 'Casual Shirt' },
    { type_id: 3, name: 'Other' },
  ],
  'T-Shirts': [
    { type_id: 1, name: 'Round Neck' },
    { type_id: 2, name: 'Polo' },
    { type_id: 3, name: 'Oversized' },
    { type_id: 4, name: 'Other' },
  ],
  Pants: [
    { type_id: 1, name: 'Jeans' },
    { type_id: 2, name: 'Cotton' },
    { type_id: 3, name: 'Other' },
  ],
  Accessories: [
    { type_id: 1, name: 'Watches' },
    { type_id: 2, name: 'Shoes' },
    { type_id: 3, name: 'Other' },
  ],
};

const getCategoryIdForBase = (base) => {
  if (!base) return 1;
  const b = base.toLowerCase();
  if (b.includes('shirt') && !b.includes('t-shirt')) return 1;
  if (b.includes('t-shirt') || b.includes('polo')) return 2;
  if (b.includes('pant') || b.includes('trouser')) return 3;
  if (b.includes('accesor') || b.includes('accessor')) return 4;
  return 1;
};

const getBaseForCategoryId = (id) => {
  const num = Number(id);
  if (num === 1) return 'Shirt';
  if (num === 2) return 'T-Shirts';
  if (num === 3) return 'Pants';
  if (num === 4) return 'Accessories';
  return 'Shirt';
};

const getTypeOptionsList = (base) => {
  const norm =
    base === 'Shirt'
      ? 'Shirt'
      : base === 'T-Shirts' || base === 'T-Shirt'
      ? 'T-Shirts'
      : base === 'Pants' || base === 'Pant'
      ? 'Pants'
      : base === 'Accesorries' || base === 'Accessories'
      ? 'Accessories'
      : 'Shirt';
  return SUB_CATEGORIES_BY_BASE[norm] || [];
};

const getTypeOptions = (base) => {
  return getTypeOptionsList(base).map((s) => s.name);
};

const getTypeIdForType = (base, type) => {
  const list = getTypeOptionsList(base);
  const found = list.find((item) => item.name.toLowerCase() === (type || '').toLowerCase());
  return found ? found.type_id : 1;
};

const getSizeOptions = (base, type, categoryId) => {
  if ((base === 'Accesorries' || base === 'Accessories') && type === 'Shoes') {
    return ['8', '9', '10'];
  }
  if (base === 'Pants' || base === 'Pant' || String(categoryId) === '3' || String(categoryId).toLowerCase().includes('pant')) {
    return ['32', '34', '36', '38', '40', '42'];
  }
  if (
    base === 'Shirt' ||
    base === 'T-Shirts' ||
    base === 'T-Shirt' ||
    String(categoryId).toLowerCase().includes('shirt') ||
    String(categoryId) === '1' ||
    String(categoryId) === '2'
  ) {
    return ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  }
  return [];
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('product_id');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewProductModal, setViewProductModal] = useState(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const shirtCategory = categories.find(
    (c) => c.category_name?.toLowerCase() === 'shirts' || c.category_name?.toLowerCase() === 'shirt'
  );
  const shirtCategoryId = shirtCategory ? shirtCategory.category_id : 1;

  // Form state
  const initialForm = {
    product_name: '',
    sku: '',
    category_id: 1,
    parent_category_id: 1,
    base: 'Shirt',
    type: 'Formal Shirt',
    type_id: 1,
    sleeve_type: 'Full Sleeve',
    size: 'S',
    size_stock: {},
    shirt_type: 'Formal Shirt',
    price: '',
    cost_price: '',
    stock: '',
    min_stock: '5',
    descriptions: '',
    status: 'active',
    image: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [selectedSizeKey, setSelectedSizeKey] = useState('');

  const currentSizeOptions = getSizeOptions(formData.base, formData.type, formData.category_id);

  // Sync selectedSizeKey with available size options
  useEffect(() => {
    if (currentSizeOptions.length > 0) {
      if (!selectedSizeKey || !currentSizeOptions.includes(selectedSizeKey)) {
        setSelectedSizeKey(currentSizeOptions[0]);
      }
    } else {
      setSelectedSizeKey('');
    }
  }, [formData.base, formData.type, formData.category_id]);

  // Sync search param from URL if present
  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null && urlQuery !== search) {
      setSearch(urlQuery);
    }
  }, [searchParams]);

  // Load products & categories
  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        productService.getAll({
          search,
          categoryId: selectedCategory,
          status: selectedStatus,
          sortBy,
          sortOrder,
        }),
        categoryService.getAll(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      toast.error('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [search, selectedCategory, selectedStatus, sortBy, sortOrder]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const defaultCatId = 1;
    const defaultBase = getBaseForCategoryId(defaultCatId);
    const typeOpts = getTypeOptionsList(defaultBase);
    const defaultType = typeOpts.length > 0 ? typeOpts[0].name : '';
    const defaultTypeId = typeOpts.length > 0 ? typeOpts[0].type_id : 1;
    const defaultSizes = getSizeOptions(defaultBase, defaultType, defaultCatId);
    const defaultSize = defaultSizes.length > 0 ? defaultSizes[0] : '';
    const defaultSizeStock = {};
    defaultSizes.forEach((sz) => {
      defaultSizeStock[sz] = '';
    });

    setFormData({
      ...initialForm,
      category_id: defaultCatId,
      parent_category_id: defaultCatId,
      base: defaultBase,
      type: defaultType,
      type_id: defaultTypeId,
      sleeve_type: 'Full Sleeve',
      size: defaultSize,
      size_stock: defaultSizeStock,
      shirt_type: defaultType,
      stock: '',
      image: '',
    });
    setSelectedSizeKey(defaultSize);
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    let base = product.base || '';
    let category_id = product.category_id || 1;

    if (!base) {
      if (
        product.category_name?.toUpperCase().includes('T-SHIRT') ||
        product.product_name?.toUpperCase().includes('T-SHIRT') ||
        product.product_name?.toUpperCase().includes('POLO')
      ) {
        base = 'T-Shirts';
      } else if (
        ['Formal Shirt', 'Casual Shirt', 'Full Sleeve', 'Half Sleeve'].includes(product.type) ||
        product.category_name?.toUpperCase().includes('SHIRT')
      ) {
        base = 'Shirt';
      } else if (
        ['Jeans', 'Cotton'].includes(product.type) ||
        product.category_name?.toUpperCase().includes('TROUSER') ||
        product.category_name?.toUpperCase().includes('PANT')
      ) {
        base = 'Pants';
      } else if (['Wathes', 'Watches', 'Shoes'].includes(product.type)) {
        base = 'Accessories';
      } else {
        base = getBaseForCategoryId(category_id);
      }
    }

    category_id = getCategoryIdForBase(base);
    let type = product.type || product.shirt_type || product.sleeves || '';
    if (!type) {
      const opts = getTypeOptionsList(base);
      type = opts.length > 0 ? opts[0].name : '';
    }
    const type_id = product.type_id || getTypeIdForType(base, type);

    let sleeve_type = product.sleeve_type || product.sleeves || 'Full Sleeve';
    if (!['Full Sleeve', 'Half Sleeve'].includes(sleeve_type)) {
      sleeve_type = 'Full Sleeve';
    }

    const availableSizes = getSizeOptions(base, type, category_id);
    let initialSizeStock = {};
    if (product.size_stock && typeof product.size_stock === 'object' && Object.keys(product.size_stock).length > 0) {
      initialSizeStock = { ...product.size_stock };
    } else if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      const perSizeStock = Math.floor((Number(product.stock) || 0) / product.sizes.length);
      product.sizes.forEach((s) => {
        initialSizeStock[s] = perSizeStock;
      });
    } else if (product.size) {
      initialSizeStock[product.size] = Number(product.stock) || 0;
    }

    let size = product.size || (product.sizes && product.sizes[0]) || '';
    if (availableSizes.length > 0 && !availableSizes.includes(size)) {
      size = availableSizes[0];
    }
    const defaultSelected =
      availableSizes.find((sz) => Number(initialSizeStock[sz]) > 0) || size || (availableSizes[0] || '');
    setSelectedSizeKey(defaultSelected);

    setFormData({
      product_name: product.product_name,
      sku: product.sku || '',
      category_id: category_id,
      parent_category_id: category_id,
      base: base,
      type: type,
      type_id: type_id,
      sleeve_type: sleeve_type,
      size: size,
      size_stock: initialSizeStock,
      shirt_type: type,
      price: product.price,
      cost_price: product.cost_price || '',
      stock: product.stock,
      min_stock: product.min_stock || '5',
      descriptions: product.descriptions || '',
      status: product.status || 'active',
      image: product.image || '',
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Handle Category field change
  const handleCategoryChange = (catVal) => {
    const catId = Number(catVal) || 1;
    const resolvedBase = getBaseForCategoryId(catId);
    const typeOpts = getTypeOptionsList(resolvedBase);
    const defaultType = typeOpts.length > 0 ? typeOpts[0].name : '';
    const defaultTypeId = typeOpts.length > 0 ? typeOpts[0].type_id : 1;
    const newSizes = getSizeOptions(resolvedBase, defaultType, catId);
    const newSize = newSizes.length > 0 ? newSizes[0] : '';
    setSelectedSizeKey(newSize);

    const newSizeStock = {};
    newSizes.forEach((sz) => {
      newSizeStock[sz] = '';
    });

    setFormData((prev) => ({
      ...prev,
      category_id: catId,
      parent_category_id: catId,
      base: resolvedBase,
      type: defaultType,
      type_id: defaultTypeId,
      size: newSize,
      size_stock: newSizeStock,
      shirt_type: defaultType,
      stock: '',
    }));

    if (formErrors.category_id) {
      setFormErrors((prev) => ({ ...prev, category_id: undefined }));
    }
    if (formErrors.base) {
      setFormErrors((prev) => ({ ...prev, base: undefined }));
    }
    if (formErrors.type) {
      setFormErrors((prev) => ({ ...prev, type: undefined }));
    }
    if (formErrors.stock) {
      setFormErrors((prev) => ({ ...prev, stock: undefined }));
    }
  };

  // Handle Base field change
  const handleBaseChange = (baseVal) => {
    const resolvedId = getCategoryIdForBase(baseVal);
    const opts = getTypeOptionsList(baseVal);
    const defaultType = opts.length > 0 ? opts[0].name : '';
    const defaultTypeId = opts.length > 0 ? opts[0].type_id : 1;
    const newSizes = getSizeOptions(baseVal, defaultType, resolvedId);
    const defaultSize = newSizes.length > 0 ? newSizes[0] : '';
    setSelectedSizeKey(defaultSize);

    const newSizeStock = {};
    newSizes.forEach((sz) => {
      newSizeStock[sz] = formData.size_stock?.[sz] ?? '';
    });

    setFormData((prev) => ({
      ...prev,
      category_id: resolvedId,
      parent_category_id: resolvedId,
      base: baseVal,
      type: defaultType,
      type_id: defaultTypeId,
      size: defaultSize,
      size_stock: newSizeStock,
      shirt_type: defaultType,
    }));
    if (formErrors.base) {
      setFormErrors((prev) => ({ ...prev, base: undefined }));
    }
    if (formErrors.category_id) {
      setFormErrors((prev) => ({ ...prev, category_id: undefined }));
    }
    if (formErrors.size) {
      setFormErrors((prev) => ({ ...prev, size: undefined }));
    }
    if (formErrors.stock) {
      setFormErrors((prev) => ({ ...prev, stock: undefined }));
    }
  };

  // Handle Type field change
  const handleTypeChange = (newType) => {
    const resolvedTypeId = getTypeIdForType(formData.base, newType);
    const newSizes = getSizeOptions(formData.base, newType, formData.category_id);
    const defaultSize = newSizes.length > 0 ? newSizes[0] : '';
    const activeSize = newSizes.includes(selectedSizeKey) ? selectedSizeKey : defaultSize;
    setSelectedSizeKey(activeSize);

    const newSizeStock = {};
    newSizes.forEach((sz) => {
      newSizeStock[sz] = formData.size_stock?.[sz] ?? '';
    });

    setFormData((prev) => ({
      ...prev,
      type: newType,
      type_id: resolvedTypeId,
      size: activeSize,
      size_stock: newSizeStock,
      shirt_type: newType,
    }));
    if (formErrors.type) {
      setFormErrors((prev) => ({ ...prev, type: undefined }));
    }
    if (formErrors.size) {
      setFormErrors((prev) => ({ ...prev, size: undefined }));
    }
    if (formErrors.stock) {
      setFormErrors((prev) => ({ ...prev, stock: undefined }));
    }
  };

  // Handle Size-specific Quantity change
  const handleSizeStockChange = (sizeKey, val) => {
    const numVal = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    const updatedSizeStock = {
      ...(formData.size_stock || {}),
      [sizeKey]: numVal,
    };

    const newTotalStock = currentSizeOptions.reduce((sum, sz) => {
      const q = parseInt(updatedSizeStock[sz], 10);
      return sum + (!isNaN(q) && q > 0 ? q : 0);
    }, 0);

    setFormData((prev) => ({
      ...prev,
      size_stock: updatedSizeStock,
      stock: newTotalStock,
    }));

    if (formErrors.stock) {
      setFormErrors((prev) => ({ ...prev, stock: undefined }));
    }
    if (formErrors.size) {
      setFormErrors((prev) => ({ ...prev, size: undefined }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.product_name.trim()) errors.product_name = 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Valid price is required';
    if (!formData.category_id) errors.category_id = 'Please select a category';
    const resolvedBase = formData.base || getBaseForCategoryId(formData.category_id);
    if (!formData.type) errors.type = 'Please select a sub-category / type';
    const isShirt =
      resolvedBase === 'Shirt' ||
      Number(formData.category_id) === Number(shirtCategoryId) ||
      String(formData.category_id).toLowerCase() === 'shirt';
    if (isShirt && !formData.sleeve_type) errors.sleeve_type = 'Please select a sleeve type';

    if (currentSizeOptions.length > 0) {
      const activeSizesList = currentSizeOptions.filter((sz) => {
        const q = parseInt(formData.size_stock?.[sz], 10);
        return !isNaN(q) && q > 0;
      });
      if (activeSizesList.length === 0) {
        errors.stock = 'Please enter a quantity greater than 0 for at least one size';
      }
    } else {
      if (formData.stock === '' || isNaN(formData.stock) || Number(formData.stock) < 0) {
        errors.stock = 'Stock must be 0 or greater';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormSubmitting(true);
    try {
      const resolvedBase = formData.base || getBaseForCategoryId(formData.category_id);
      const isShirt =
        resolvedBase === 'Shirt' ||
        Number(formData.category_id) === Number(shirtCategoryId) ||
        String(formData.category_id).toLowerCase() === 'shirt';

      // Auto-generate SKU
      const basePrefix =
        resolvedBase === 'T-Shirts' || resolvedBase === 'T-Shirt'
          ? 'TSH'
          : resolvedBase
          ? resolvedBase.substring(0, 3).toUpperCase()
          : 'PRD';
      const autoSku = formData.sku?.trim() || `BNB-${basePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Calculate sizes that have quantity > 0 (Quantity 0 will NOT be displayed)
      let finalSizes = [];
      let finalSize = '';
      let finalStock = 0;
      let finalSizeStock = {};

      if (currentSizeOptions.length > 0) {
        finalSizes = currentSizeOptions.filter((sz) => {
          const q = parseInt(formData.size_stock?.[sz], 10);
          return !isNaN(q) && q > 0;
        });
        finalSize = finalSizes[0] || '';
        finalStock = finalSizes.reduce(
          (sum, sz) => sum + (parseInt(formData.size_stock[sz], 10) || 0),
          0
        );
        finalSizes.forEach((sz) => {
          finalSizeStock[sz] = parseInt(formData.size_stock[sz], 10) || 0;
        });
      } else {
        finalSizes = [];
        finalSize = '';
        finalStock = parseInt(formData.stock, 10) || 0;
        finalSizeStock = {};
      }

      const resolvedCatId = Number(formData.category_id) || getCategoryIdForBase(resolvedBase);
      const resolvedTypeId = getTypeIdForType(resolvedBase, formData.type);

      const payload = {
        ...formData,
        sku: autoSku,
        category_id: resolvedCatId,
        category_name: resolvedBase || 'Shirt',
        parent_category_id: resolvedCatId,
        parent_name: resolvedBase || 'Shirt',
        base: resolvedBase,
        type: formData.type,
        type_id: resolvedTypeId,
        size: finalSize,
        sizes: finalSizes,
        size_stock: finalSizeStock,
        stock: finalStock,
        shirt_type: formData.type || formData.shirt_type || 'Formal Shirt',
        sleeves: isShirt ? (formData.sleeve_type || 'Full Sleeve') : (formData.type || 'Standard'),
        sleeve_type: isShirt ? (formData.sleeve_type || 'Full Sleeve') : '',
      };
      if (editingProduct) {
        await productService.update(editingProduct.product_id, payload);
        toast.success(`Product "${formData.product_name}" updated successfully`);
      } else {
        await productService.create(payload);
        toast.success(`Product "${formData.product_name}" added to catalog`);
      }
      setFormModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete product confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteProductTarget) return;
    setDeleteLoading(true);
    try {
      await productService.delete(deleteProductTarget.product_id);
      toast.success(`Deleted product "${deleteProductTarget.product_name}"`);
      setDeleteProductTarget(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Paginated slice
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = products.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage product catalog, inventory status, prices, and SKUs"
        actions={
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Add Product
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: 'var(--spacing-4)', padding: 'var(--spacing-4)' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <div className="filter-group">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setSearchParams(val ? { search: val } : {});
              }}
              placeholder="Search by name, SKU, or keyword..."
              style={{ width: '280px' }}
            />

            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: 'auto', minWidth: '220px' }}
            >
              <option value="">All Categories & Types</option>
              {(() => {
                const parents = categories.filter((c) => !c.parent_category_id);
                if (parents.length === 0) {
                  return categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ));
                }
                return parents.map((parent) => {
                  const children = categories.filter(
                    (c) => Number(c.parent_category_id) === Number(parent.category_id)
                  );
                  return (
                    <optgroup key={parent.category_id} label={`${parent.category_name} (ID: ${parent.category_id})`}>
                      <option value={parent.category_id}>All {parent.category_name}</option>
                      {children.map((child) => (
                        <option key={child.category_id} value={child.category_id}>
                          {parent.category_name} ➔ {child.category_name} {child.type_id ? `(Type ID: ${child.type_id})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  );
                });
              })()}
            </select>

            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ width: 'auto', minWidth: '140px' }}
            >
              <option value="">All Stock Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (≤ threshold)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          <div className="filter-group">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Sort:</span>
            <select
              className="form-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
              style={{ width: 'auto' }}
            >
              <option value="product_id-desc">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="product_name-asc">Product Name (A-Z)</option>
              <option value="stock-asc">Stock: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card">
        {loading ? (
          <LoadingSpinner text="Retrieving product catalog..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products matched your criteria"
            description="Adjust your search filters or add a new product to your BuyAndBye store."
            actionLabel="Add New Product"
            actionIcon={Plus}
            onAction={handleOpenAddModal}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((p) => {
                    const stockInfo = getStockStatus(p.stock, p.min_stock);
                    return (
                      <tr key={p.product_id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                            <img
                              src={p.image}
                              alt={p.product_name}
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: 'var(--radius-md)',
                                objectFit: 'cover',
                                border: '1px solid var(--color-border-light)',
                                backgroundColor: 'var(--color-bg-subtle)',
                              }}
                            />
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: 'var(--color-text-primary)',
                                  cursor: 'pointer',
                                }}
                                onClick={() => setViewProductModal(p)}
                              >
                                {p.product_name}
                              </div>
                              <div
                                style={{
                                  fontSize: 'var(--font-size-xs)',
                                  color: 'var(--color-text-muted)',
                                  maxWidth: '260px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {p.descriptions || 'No description provided'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code
                            style={{
                              fontFamily: 'var(--font-family-mono)',
                              fontSize: '0.75rem',
                              backgroundColor: 'var(--color-bg-subtle)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            {p.sku || `BNB-PRD-${p.product_id}`}
                          </code>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: 'var(--font-size-xs)',
                                  fontWeight: 600,
                                  color: 'var(--color-text-primary)',
                                }}
                              >
                                {p.base || p.category_name || 'Shirt'}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                  color: 'var(--color-primary, #2563eb)',
                                  fontWeight: 600,
                                }}
                              >
                                ID: {p.category_id || p.parent_category_id || 1}
                              </span>
                            </div>

                            {p.type && (
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--color-text-secondary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <span style={{ color: 'var(--color-text-muted)' }}>{p.base || 'Shirt'}</span>
                                <span style={{ color: 'var(--color-text-subtle)' }}>➔</span>
                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{p.type}</span>
                                <span
                                  style={{
                                    fontSize: '0.625rem',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                    color: '#059669',
                                    fontWeight: 600,
                                  }}
                                >
                                  Type ID: {p.type_id || 1}
                                </span>
                              </div>
                            )}

                            {(p.sleeves || p.size || (p.sizes && p.sizes.length > 0)) && (
                              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                {[
                                  p.sleeves,
                                  (() => {
                                    const validSizes = (p.sizes || (p.size ? [p.size] : [])).filter((s) => {
                                      if (p.size_stock && p.size_stock[s] !== undefined) {
                                        return Number(p.size_stock[s]) > 0;
                                      }
                                      return true;
                                    });
                                    if (validSizes.length === 0) return '';
                                    if (p.size_stock && Object.keys(p.size_stock).length > 0) {
                                      return `Sizes: ${validSizes.map((s) => `${s} (${p.size_stock[s]})`).join(', ')}`;
                                    }
                                    return `Sizes: ${validSizes.join(', ')}`;
                                  })(),
                                ].filter(Boolean).join(' • ')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {formatCurrency(p.price)}
                          </span>
                          {p.cost_price && (
                            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-subtle)' }}>
                              Cost: {formatCurrency(p.cost_price)}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 'var(--font-size-sm)',
                                color:
                                  p.stock === 0
                                    ? 'var(--color-danger)'
                                    : p.stock <= (p.min_stock || 10)
                                    ? 'var(--color-warning)'
                                    : 'var(--color-text-primary)',
                              }}
                            >
                              {p.stock}
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                              units
                            </span>
                          </div>
                        </td>
                        <td>
                          <Badge variant={stockInfo.variant}>{stockInfo.label}</Badge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="btn-icon"
                              onClick={() => setViewProductModal(p)}
                              title="View details"
                            >
                              <Eye size={15} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="btn-icon"
                              onClick={() => handleOpenEditModal(p)}
                              title="Edit product"
                            >
                              <Edit2 size={15} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="btn-icon"
                              onClick={() => setDeleteProductTarget(p)}
                              title="Delete product"
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
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
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormModalOpen(false)} disabled={formSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFormSubmit} loading={formSubmitting}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">
              Product Title / Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${formErrors.product_name ? 'is-invalid' : ''}`}
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="e.g. Oxford Classic White Formal Shirt"
            />
            {formErrors.product_name && <span className="form-error">{formErrors.product_name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Category <span className="required">*</span>
              </label>
              <select
                className={`form-select ${formErrors.category_id ? 'is-invalid' : ''}`}
                value={formData.category_id}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {BASE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {formErrors.category_id && <span className="form-error">{formErrors.category_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Sub-Category / Type <span className="required">*</span>
              </label>
              <select
                className={`form-select ${formErrors.type ? 'is-invalid' : ''}`}
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                {getTypeOptionsList(formData.base).map((opt) => (
                  <option key={opt.name} value={opt.name}>
                    {opt.name}
                  </option>
                ))}
                {formData.type === 'Wathes' && (
                  <option value="Wathes" style={{ display: 'none' }}>Wathes</option>
                )}
              </select>
              {formErrors.type && <span className="form-error">{formErrors.type}</span>}
            </div>

            {(formData.base === 'Shirt' ||
              Number(formData.category_id) === Number(shirtCategoryId) ||
              String(formData.category_id).toLowerCase() === 'shirt') && (
              <div className="form-group">
                <label className="form-label">
                  Sleeve Type <span className="required">*</span>
                </label>
                <select
                  className={`form-select ${formErrors.sleeve_type ? 'is-invalid' : ''}`}
                  value={formData.sleeve_type || 'Full Sleeve'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      sleeve_type: val,
                      sleeves: val,
                    });
                    if (formErrors.sleeve_type) {
                      setFormErrors((prev) => ({ ...prev, sleeve_type: undefined }));
                    }
                  }}
                >
                  <option value="Full Sleeve">Full Sleeve</option>
                  <option value="Half Sleeve">Half Sleeve</option>
                </select>
                {formErrors.sleeve_type && <span className="form-error">{formErrors.sleeve_type}</span>}
              </div>
            )}
          </div>

          {/* Size-wise Quantities Manager */}
          {currentSizeOptions.length > 0 ? (
            <div
              style={{
                marginBottom: 'var(--spacing-4)',
                padding: '12px 14px',
                background: 'var(--color-bg-subtle, #f8fafc)',
                borderRadius: 'var(--radius-md, 8px)',
                border: formErrors.stock ? '1px solid #ef4444' : '1px solid var(--color-border, #e2e8f0)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary, #475569)' }}>
                  All Sizes & Quantities ({formData.base || 'Product'}) <span className="required">*</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)' }}>
                  (Quantities with 0 will not be displayed on the product)
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                  gap: '8px',
                }}
              >
                {currentSizeOptions.map((sz) => {
                  const qtyVal = formData.size_stock?.[sz];
                  const numQty = parseInt(qtyVal, 10) || 0;
                  const isActive = numQty > 0;
                  return (
                    <div
                      key={sz}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: isActive ? '1px solid #86efac' : '1px solid var(--color-border, #cbd5e1)',
                        backgroundColor: isActive ? '#f0fdf4' : '#ffffff',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.825rem' }}>Size {sz}</span>
                        {isActive ? (
                          <span
                            style={{
                              fontSize: '0.625rem',
                              fontWeight: 700,
                              color: '#15803d',
                              background: '#dcfce7',
                              padding: '1px 4px',
                              borderRadius: '3px',
                            }}
                          >
                            Active
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.625rem',
                              color: '#94a3b8',
                              background: '#e2e8f0',
                              padding: '1px 4px',
                              borderRadius: '3px',
                            }}
                          >
                            Hidden (0)
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={qtyVal ?? ''}
                        onChange={(e) => handleSizeStockChange(sz, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '4px 6px',
                          fontSize: '0.825rem',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          textAlign: 'center',
                          fontWeight: 600,
                          background: '#ffffff',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: '10px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {(() => {
                  const activeList = currentSizeOptions.filter((sz) => {
                    const q = parseInt(formData.size_stock?.[sz], 10);
                    return !isNaN(q) && q > 0;
                  });
                  return activeList.length > 0 ? (
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>
                      ✓ Displayed sizes for product: <strong>{activeList.join(', ')}</strong>
                    </span>
                  ) : (
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>
                      ⚠️ Enter quantity &gt; 0 for at least one size to display on product
                    </span>
                  );
                })()}
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Total Stock: {formData.stock || 0}
                </span>
              </div>
              {formErrors.stock && (
                <div style={{ marginTop: '6px' }}>
                  <span className="form-error">{formErrors.stock}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">
                Quantity / Stock <span className="required">*</span>
              </label>
              <input
                type="number"
                min="0"
                className={`form-input ${formErrors.stock ? 'is-invalid' : ''}`}
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="e.g. 25"
              />
              {formErrors.stock && <span className="form-error">{formErrors.stock}</span>}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Selling Price (₹) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`form-input ${formErrors.price ? 'is-invalid' : ''}`}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 799.00"
              />
              {formErrors.price && <span className="form-error">{formErrors.price}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                placeholder="e.g. 450.00"
              />
              <span className="form-hint">Used for margin calculations</span>
            </div>

            <div className="form-group">
              <label className="form-label">Low Stock Threshold</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                placeholder="e.g. 5"
              />
              <span className="form-hint">Alert threshold</span>
            </div>
          </div>

          <ImageUpload
            label="Product Photo"
            hint="Select an image directly from your device (PNG, JPG, WEBP, GIF)"
            value={formData.image}
            onChange={(img) => setFormData({ ...formData, image: img })}
            error={formErrors.image}
          />

          <div className="form-group">
            <label className="form-label">Descriptions & Specifications</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.descriptions}
              onChange={(e) => setFormData({ ...formData, descriptions: e.target.value })}
              placeholder="e.g. Full Sleeve | Regular-Fit | 100% Breathable Cotton"
            />
          </div>
        </form>
      </Modal>

      {/* Product Details Modal */}
      {viewProductModal && (
        <Modal
          isOpen={!!viewProductModal}
          onClose={() => setViewProductModal(null)}
          title="Product Details"
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setViewProductModal(null)}>
              Close
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'flex-start' }}>
              <img
                src={viewProductModal.image}
                alt={viewProductModal.product_name}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: 'var(--radius-lg)',
                  objectFit: 'cover',
                  border: '1px solid var(--color-border-default)',
                  flexShrink: 0,
                }}
              />
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '4px' }}>
                  {viewProductModal.product_name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: '8px' }}>
                  <code style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>
                    {viewProductModal.sku}
                  </code>
                  <span>&bull;</span>
                  <Badge variant={getStockStatus(viewProductModal.stock, viewProductModal.min_stock).variant}>
                    {getStockStatus(viewProductModal.stock, viewProductModal.min_stock).label}
                  </Badge>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {formatCurrency(viewProductModal.price)}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-3)',
                padding: 'var(--spacing-3)',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Category / Base:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {viewProductModal.category_name || 'Men'}{viewProductModal.base ? ` • ${viewProductModal.base}` : ''}
                </div>
              </div>
              {(() => {
                const viewSizes = (viewProductModal.sizes || (viewProductModal.size ? [viewProductModal.size] : [])).filter((s) => {
                  if (viewProductModal.size_stock && viewProductModal.size_stock[s] !== undefined) {
                    return Number(viewProductModal.size_stock[s]) > 0;
                  }
                  return true;
                });
                if (viewSizes.length === 0) return null;
                return (
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Sizes in Stock:</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {viewSizes.map((sz) => {
                        const qty = viewProductModal.size_stock?.[sz];
                        return (
                          <span
                            key={sz}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#eff6ff',
                              color: '#2563eb',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              border: '1px solid #bfdbfe',
                            }}
                          >
                            {sz} {qty !== undefined ? `(${qty} units)` : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Type:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {viewProductModal.type || viewProductModal.shirt_type || 'Standard'}
                </div>
              </div>
              {(viewProductModal.base === 'Shirt' || viewProductModal.sleeve_type || viewProductModal.sleeves) && (
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Sleeve Type:</span>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {viewProductModal.sleeve_type || viewProductModal.sleeves || 'Full Sleeve'}
                  </div>
                </div>
              )}
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Current Stock:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {viewProductModal.stock} units
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Cost Price:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {viewProductModal.cost_price ? formatCurrency(viewProductModal.cost_price) : 'N/A'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Margin:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-success-text)' }}>
                  {viewProductModal.cost_price
                    ? `${Math.round(((viewProductModal.price - viewProductModal.cost_price) / viewProductModal.price) * 100)}%`
                    : 'N/A'}
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Description & Fabric Specifications:
              </span>
              <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '4px', lineHeight: 1.5 }}>
                {viewProductModal.descriptions || 'No specifications provided.'}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteProductTarget}
        onClose={() => setDeleteProductTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deleteProductTarget?.product_name}" (SKU: ${deleteProductTarget?.sku})? This product will be removed from customer view.`}
        confirmText="Delete Product"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Products;
