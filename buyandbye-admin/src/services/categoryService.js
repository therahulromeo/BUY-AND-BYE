import api from './api';
import { getStored, setStored, STORAGE_KEYS } from './storage';

export const categoryService = {
  /**
   * Get all categories with optional search and status filter
   */
  async getAll({ search = '', status = '' } = {}) {
    try {
      const res = await api.get('/categories', { params: { search, status } });
      if (res && res.categories) {
        setStored(STORAGE_KEYS.CATEGORIES, res.categories);
        return res.categories;
      }
    } catch (err) {
      console.warn('[CategoryService] Backend offline, fetching locally:', err.message);
    }

    let categories = getStored(STORAGE_KEYS.CATEGORIES, []);
    const products = getStored(STORAGE_KEYS.PRODUCTS, []);

    categories = categories.map((cat) => {
      const count = products.filter((p) => Number(p.category_id) === Number(cat.category_id)).length;
      return { ...cat, product_count: count };
    });

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      categories = categories.filter(
        (c) =>
          c.category_name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    if (status) {
      categories = categories.filter((c) => c.status === status);
    }

    return categories;
  },

  /**
   * Get category by ID
   */
  async getById(id) {
    try {
      const res = await api.get(`/categories/${id}`);
      if (res && res.category) return res.category;
    } catch (err) {
      console.warn('[CategoryService] Fetch by ID failed locally:', err.message);
    }

    const categories = getStored(STORAGE_KEYS.CATEGORIES, []);
    const category = categories.find((c) => String(c.category_id) === String(id));
    if (!category) throw new Error('Category not found');
    return category;
  },

  /**
   * Create new category in MongoDB
   */
  async create(data) {
    try {
      const res = await api.post('/categories', data);
      if (res && res.category) {
        const categories = getStored(STORAGE_KEYS.CATEGORIES, []);
        categories.push(res.category);
        setStored(STORAGE_KEYS.CATEGORIES, categories);
        return res.category;
      }
    } catch (err) {
      if (!err.message?.includes('Unable to connect')) throw err;
      console.warn('[CategoryService] Backend offline, creating locally:', err.message);
    }

    const categories = getStored(STORAGE_KEYS.CATEGORIES, []);
    const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.category_id || 0)) + 1 : 1;

    let parentName = null;
    if (data.parent_category_id) {
      const parent = categories.find((c) => Number(c.category_id) === Number(data.parent_category_id));
      if (parent) parentName = parent.category_name;
    }

    const newCategory = {
      category_id: newId,
      category_name: data.category_name.trim().toUpperCase(),
      parent_category_id: data.parent_category_id ? Number(data.parent_category_id) : null,
      parent_name: parentName,
      description: data.description || '',
      status: data.status || 'active',
      product_count: 0,
      image:
        data.image ||
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    };

    categories.push(newCategory);
    setStored(STORAGE_KEYS.CATEGORIES, categories);
    return newCategory;
  },

  /**
   * Update category in MongoDB
   */
  async update(id, data) {
    try {
      const res = await api.put(`/categories/${id}`, data);
      if (res && res.category) {
        const categories = getStored(STORAGE_KEYS.CATEGORIES, []);
        const idx = categories.findIndex((c) => String(c.category_id) === String(id));
        if (idx !== -1) {
          categories[idx] = res.category;
          setStored(STORAGE_KEYS.CATEGORIES, categories);
        }
        return res.category;
      }
    } catch (err) {
      if (!err.message?.includes('Unable to connect')) throw err;
    }

    const categories = getStored(STORAGE_KEYS.CATEGORIES, []);
    const index = categories.findIndex((c) => String(c.category_id) === String(id));
    if (index === -1) throw new Error('Category not found');

    let parentName = null;
    if (data.parent_category_id) {
      const parent = categories.find((c) => Number(c.category_id) === Number(data.parent_category_id));
      if (parent) parentName = parent.category_name;
    }

    const updated = {
      ...categories[index],
      ...data,
      category_name: data.category_name?.trim().toUpperCase() || categories[index].category_name,
      parent_category_id: data.parent_category_id ? Number(data.parent_category_id) : null,
      parent_name: parentName,
    };

    categories[index] = updated;
    setStored(STORAGE_KEYS.CATEGORIES, categories);
    return updated;
  },

  /**
   * Delete category from MongoDB
   */
  async delete(id) {
    try {
      await api.delete(`/categories/${id}`);
      const categories = getStored(STORAGE_KEYS.CATEGORIES, []);
      setStored(
        STORAGE_KEYS.CATEGORIES,
        categories.filter((c) => String(c.category_id) !== String(id))
      );
      return true;
    } catch (err) {
      if (!err.message?.includes('Unable to connect')) throw err;
    }

    const categories = getStored(STORAGE_KEYS.CATEGORIES, []);
    const products = getStored(STORAGE_KEYS.PRODUCTS, []);
    const linked = products.filter((p) => Number(p.category_id) === Number(id));
    if (linked.length > 0) {
      throw new Error(`Cannot delete category with ${linked.length} assigned products.`);
    }

    const filtered = categories.filter((c) => String(c.category_id) !== String(id));
    setStored(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  },
};
