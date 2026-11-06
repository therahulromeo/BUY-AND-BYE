import api from './api';
import { getStored, setStored, STORAGE_KEYS } from './storage';

/**
 * Product Management Service
 * Communicates directly with Node.js, Express & MongoDB backend API
 * with local cache synchronization and offline fallback
 */
export const productService = {
  /**
   * Get all products with optional filters
   */
  async getAll({
    search = '',
    categoryId = '',
    status = '',
    sortBy = 'product_id',
    sortOrder = 'desc',
  } = {}) {
    try {
      const res = await api.get('/products', {
        params: { search, categoryId, status, sortBy, sortOrder },
      });
      if (res && res.products) {
        // Keep local storage in sync as a cache
        setStored(STORAGE_KEYS.PRODUCTS, res.products);
        return res.products;
      }
    } catch (err) {
      console.warn('[ProductService] Backend request failed, falling back to cached local data:', err.message);
    }

    // Fallback: Filter cached data locally
    let products = getStored(STORAGE_KEYS.PRODUCTS, []);

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.product_name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.descriptions && p.descriptions.toLowerCase().includes(q))
      );
    }

    if (categoryId) {
      const catId = Number(categoryId);
      products = products.filter((p) => Number(p.category_id) === catId);
    }

    if (status) {
      if (status === 'low_stock') {
        products = products.filter((p) => p.stock > 0 && p.stock <= (p.min_stock || 10));
      } else if (status === 'out_of_stock') {
        products = products.filter((p) => Number(p.stock) === 0);
      } else if (status === 'in_stock') {
        products = products.filter((p) => p.stock > (p.min_stock || 10));
      } else {
        products = products.filter((p) => p.status === status);
      }
    }

    products.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return products;
  },

  /**
   * Get product by ID
   */
  async getById(id) {
    try {
      const res = await api.get(`/products/${id}`);
      if (res && res.product) {
        return res.product;
      }
    } catch (err) {
      console.warn('[ProductService] Fetch by ID failed, trying local store:', err.message);
    }

    const products = getStored(STORAGE_KEYS.PRODUCTS, []);
    const product = products.find((p) => String(p.product_id) === String(id));
    if (!product) throw new Error(`Product with ID ${id} not found.`);
    return product;
  },

  /**
   * Create new product in MongoDB
   */
  async create(data) {
    try {
      const res = await api.post('/products', data);
      if (res && res.product) {
        // Sync local cache
        const products = getStored(STORAGE_KEYS.PRODUCTS, []);
        products.unshift(res.product);
        setStored(STORAGE_KEYS.PRODUCTS, products);
        return res.product;
      }
    } catch (err) {
      if (!err.message?.includes('Unable to connect')) {
        throw err;
      }
      console.warn('[ProductService] Backend offline, saving product locally:', err.message);
    }

    // Local fallback if backend is unreachable
    const products = getStored(STORAGE_KEYS.PRODUCTS, []);
    const categories = getStored(STORAGE_KEYS.CATEGORIES, []);
    const category = categories.find((c) => Number(c.category_id) === Number(data.category_id));

    const newId = products.length > 0 ? Math.max(...products.map((p) => p.product_id || 0)) + 1 : 1;
    const newSku = data.sku?.trim() || `BNB-PRD-${String(newId).padStart(3, '0')}`;

    const newProduct = {
      product_id: newId,
      product_name: data.product_name.trim(),
      sku: newSku,
      category_id: Number(data.category_id) || null,
      category_name: category ? category.category_name : 'General',
      base: data.base || '',
      type: data.type || '',
      sleeve_type: data.sleeve_type || data.sleeves || 'Full Sleeve',
      size: data.size || '',
      sizes: data.sizes || (data.size ? [data.size] : []),
      size_stock: data.size_stock || {},
      shirt_type: data.type || data.shirt_type || 'Full Sleeve',
      sleeves: data.sleeve_type || data.sleeves || 'Full Sleeve',
      descriptions: data.descriptions || '',
      price: parseFloat(data.price) || 0,
      cost_price: parseFloat(data.cost_price) || 0,
      stock: parseInt(data.stock, 10) || 0,
      min_stock: parseInt(data.min_stock, 10) || 5,
      status: (parseInt(data.stock, 10) || 0) === 0 ? 'out_of_stock' : (data.status || 'active'),
      image: data.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    };

    products.unshift(newProduct);
    setStored(STORAGE_KEYS.PRODUCTS, products);

    if (category) {
      category.product_count = (category.product_count || 0) + 1;
      setStored(STORAGE_KEYS.CATEGORIES, categories);
    }

    return newProduct;
  },

  /**
   * Update existing product in MongoDB
   */
  async update(id, data) {
    try {
      const res = await api.put(`/products/${id}`, data);
      if (res && res.product) {
        // Sync local cache
        const products = getStored(STORAGE_KEYS.PRODUCTS, []);
        const index = products.findIndex((p) => String(p.product_id) === String(id));
        if (index !== -1) {
          products[index] = res.product;
          setStored(STORAGE_KEYS.PRODUCTS, products);
        }
        return res.product;
      }
    } catch (err) {
      if (!err.message?.includes('Unable to connect')) {
        throw err;
      }
      console.warn('[ProductService] Backend offline, updating locally:', err.message);
    }

    const products = getStored(STORAGE_KEYS.PRODUCTS, []);
    const index = products.findIndex((p) => String(p.product_id) === String(id));
    if (index === -1) throw new Error('Product not found');

    const updated = {
      ...products[index],
      ...data,
      base: data.base !== undefined ? data.base : (products[index].base || ''),
      type: data.type !== undefined ? data.type : (products[index].type || ''),
      sleeve_type: data.sleeve_type || data.sleeves || products[index].sleeve_type || 'Full Sleeve',
      size: data.size !== undefined ? data.size : (products[index].size || ''),
      sizes: data.sizes || (data.size ? [data.size] : (products[index].sizes || [])),
      size_stock: data.size_stock !== undefined ? data.size_stock : (products[index].size_stock || {}),
      shirt_type: data.type || data.shirt_type || products[index].shirt_type || 'Full Sleeve',
      sleeves: data.sleeve_type || data.sleeves || products[index].sleeves || 'Full Sleeve',
    };
    products[index] = updated;
    setStored(STORAGE_KEYS.PRODUCTS, products);
    return updated;
  },

  /**
   * Delete product from MongoDB
   */
  async delete(id) {
    try {
      await api.delete(`/products/${id}`);
      const products = getStored(STORAGE_KEYS.PRODUCTS, []);
      setStored(
        STORAGE_KEYS.PRODUCTS,
        products.filter((p) => String(p.product_id) !== String(id))
      );
      return true;
    } catch (err) {
      if (!err.message?.includes('Unable to connect')) {
        throw err;
      }
      console.warn('[ProductService] Backend offline, deleting locally:', err.message);
    }

    const products = getStored(STORAGE_KEYS.PRODUCTS, []);
    const filtered = products.filter((p) => String(p.product_id) !== String(id));
    if (filtered.length === products.length) throw new Error('Product not found');
    setStored(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },

  /**
   * Adjust inventory stock level in MongoDB
   */
  async adjustStock(id, { quantity, type = 'ADD', reason = '', user = 'Admin' }) {
    try {
      const res = await api.post(`/products/${id}/adjust-stock`, {
        quantity,
        type,
        reason,
        user,
      });
      if (res && res.product) {
        return { product: res.product, newStock: res.newStock };
      }
    } catch (err) {
      if (!err.message?.includes('Unable to connect')) {
        throw err;
      }
    }

    // Local fallback
    const products = getStored(STORAGE_KEYS.PRODUCTS, []);
    const product = products.find((p) => String(p.product_id) === String(id));
    if (!product) throw new Error('Product not found');

    const qty = Math.abs(parseInt(quantity, 10) || 0);
    const prevStock = product.stock || 0;
    let newStock = prevStock;

    if (type === 'ADD') newStock = prevStock + qty;
    else if (type === 'SUBTRACT') newStock = Math.max(0, prevStock - qty);
    else if (type === 'SET') newStock = qty;

    product.stock = newStock;
    product.status = newStock === 0 ? 'out_of_stock' : 'active';
    setStored(STORAGE_KEYS.PRODUCTS, products);

    return { product, newStock };
  },

  /**
   * Get inventory stock logs
   */
  async getStockLogs() {
    try {
      const res = await api.get('/products/stock/logs');
      if (res && res.logs) {
        setStored(STORAGE_KEYS.STOCK_LOGS, res.logs);
        return res.logs;
      }
    } catch (err) {
      console.warn('[ProductService] Backend offline, fetching logs locally:', err.message);
    }
    return getStored(STORAGE_KEYS.STOCK_LOGS, []);
  },
};
