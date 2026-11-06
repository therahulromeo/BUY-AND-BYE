import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_ADMINS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_EMPLOYEES,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_STOCK_LOGS,
  DASHBOARD_ANALYTICS,
} from './initialData.js';
import { isMongoConnected } from '../config/db.js';

import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Employee from '../models/Employee.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import StockLog from '../models/StockLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_FILE = path.resolve(__dirname, '../../data/store.json');

// In-memory fallback data store
let store = {
  admins: [...INITIAL_ADMINS],
  categories: [...INITIAL_CATEGORIES],
  products: [...INITIAL_PRODUCTS],
  employees: [...INITIAL_EMPLOYEES],
  customers: [...INITIAL_CUSTOMERS],
  orders: [...INITIAL_ORDERS],
  payments: [...INITIAL_PAYMENTS],
  stockLogs: [...INITIAL_STOCK_LOGS],
};

function persistLocalStore() {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('[DataStore] Error saving store file:', err.message);
  }
}

export function initStore() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, 'utf8');
      const loaded = JSON.parse(content);
      store = {
        admins: loaded.admins || [...INITIAL_ADMINS],
        categories: loaded.categories || [...INITIAL_CATEGORIES],
        products: loaded.products || [...INITIAL_PRODUCTS],
        employees: loaded.employees || [...INITIAL_EMPLOYEES],
        customers: loaded.customers || [...INITIAL_CUSTOMERS],
        orders: loaded.orders || [...INITIAL_ORDERS],
        payments: loaded.payments || [...INITIAL_PAYMENTS],
        stockLogs: loaded.stockLogs || [...INITIAL_STOCK_LOGS],
      };
    } else {
      persistLocalStore();
    }
  } catch (err) {
    console.warn('[DataStore] Could not load store.json, using defaults:', err.message);
  }
}

// ==========================================
// ADMINS
// ==========================================
export const adminStore = {
  async findByUsername(username) {
    if (!username) return null;
    const clean = username.trim();

    if (isMongoConnected()) {
      const doc = await Admin.findOne({ username: new RegExp(`^${clean}$`, 'i') }).lean();
      if (doc) return doc;
    }

    return store.admins.find((a) => a.username.toLowerCase() === clean.toLowerCase()) || null;
  },

  async findById(id) {
    if (isMongoConnected()) {
      const doc = await Admin.findOne({ admin_id: Number(id) }).lean();
      if (doc) return doc;
    }
    return store.admins.find((a) => Number(a.admin_id) === Number(id)) || null;
  },

  async update(id, data) {
    if (isMongoConnected()) {
      const doc = await Admin.findOneAndUpdate(
        { admin_id: Number(id) },
        { $set: data },
        { new: true }
      ).lean();
      if (doc) return doc;
    }

    const idx = store.admins.findIndex((a) => Number(a.admin_id) === Number(id));
    if (idx === -1) return null;
    store.admins[idx] = { ...store.admins[idx], ...data };
    persistLocalStore();
    return store.admins[idx];
  },

  async findByEmail(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    if (isMongoConnected()) {
      const doc = await Admin.findOne({ email: new RegExp(`^${clean}$`, 'i') }).lean();
      if (doc) return doc;
    }
    return store.admins.find((a) => (a.email || '').toLowerCase() === clean) || null;
  },

  async create(data) {
    let newId = 1;
    if (isMongoConnected()) {
      const last = await Admin.findOne().sort({ admin_id: -1 }).lean();
      if (last && last.admin_id) newId = last.admin_id + 1;

      const created = await Admin.create({
        admin_id: newId,
        username: data.username.trim(),
        password_tray: data.password || data.password_tray,
        name: data.name ? data.name.trim() : data.username.trim(),
        email: data.email ? data.email.trim() : `${data.username.trim()}@buyandbye.com`,
        role: data.role || 'Administrator',
        avatar:
          data.avatar ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      });
      return created.toObject();
    }

    newId =
      store.admins.length > 0
        ? Math.max(...store.admins.map((a) => Number(a.admin_id) || 0)) + 1
        : 1;

    const newAdmin = {
      admin_id: newId,
      username: data.username.trim(),
      password_tray: data.password || data.password_tray,
      name: data.name ? data.name.trim() : data.username.trim(),
      email: data.email ? data.email.trim() : `${data.username.trim()}@buyandbye.com`,
      role: data.role || 'Administrator',
      avatar:
        data.avatar ||
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    };

    store.admins.push(newAdmin);
    persistLocalStore();
    return newAdmin;
  },
};

// ==========================================
// CATEGORIES
// ==========================================
export const categoryStore = {
  async getAll({ search = '', status = '' } = {}) {
    if (isMongoConnected()) {
      const query = {};
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ category_name: regex }, { description: regex }];
      }
      if (status) {
        query.status = status;
      }

      let categories = await Category.find(query).lean();
      const products = await Product.find({}, 'category_id parent_category_id base type type_id shirt_type').lean();

      return categories.map((cat) => {
        let count = 0;
        if (!cat.parent_category_id) {
          count = products.filter(
            (p) =>
              Number(p.category_id) === Number(cat.category_id) ||
              Number(p.parent_category_id) === Number(cat.category_id) ||
              (p.base && p.base.toUpperCase() === cat.category_name)
          ).length;
        } else {
          count = products.filter((p) => {
            const matchesParent =
              Number(p.category_id) === Number(cat.parent_category_id) ||
              Number(p.parent_category_id) === Number(cat.parent_category_id) ||
              (p.base && p.base.toUpperCase() === (cat.parent_name || '').toUpperCase());
            const matchesType =
              (cat.type_id && Number(p.type_id) === Number(cat.type_id)) ||
              (p.type && p.type.toUpperCase() === cat.category_name) ||
              (p.shirt_type && p.shirt_type.toUpperCase() === cat.category_name);
            return matchesParent && matchesType;
          }).length;
        }
        return {
          ...cat,
          product_count: count,
        };
      });
    }

    let list = [...store.categories];
    list = list.map((cat) => {
      let count = 0;
      if (!cat.parent_category_id) {
        count = store.products.filter(
          (p) =>
            Number(p.category_id) === Number(cat.category_id) ||
            Number(p.parent_category_id) === Number(cat.category_id) ||
            (p.base && p.base.toUpperCase() === cat.category_name)
        ).length;
      } else {
        count = store.products.filter((p) => {
          const matchesParent =
            Number(p.category_id) === Number(cat.parent_category_id) ||
            Number(p.parent_category_id) === Number(cat.parent_category_id) ||
            (p.base && p.base.toUpperCase() === (cat.parent_name || '').toUpperCase());
          const matchesType =
            (cat.type_id && Number(p.type_id) === Number(cat.type_id)) ||
            (p.type && p.type.toUpperCase() === cat.category_name) ||
            (p.shirt_type && p.shirt_type.toUpperCase() === cat.category_name);
          return matchesParent && matchesType;
        }).length;
      }
      return {
        ...cat,
        product_count: count,
      };
    });

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.category_name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    if (status) {
      list = list.filter((c) => c.status === status);
    }

    return list;
  },

  async findById(id) {
    if (isMongoConnected()) {
      const cat = await Category.findOne({ category_id: Number(id) }).lean();
      if (!cat) return null;
      const productCount = await Product.countDocuments({ category_id: Number(id) });
      return { ...cat, product_count: productCount };
    }

    const cat = store.categories.find((c) => Number(c.category_id) === Number(id));
    if (!cat) return null;
    const productCount = store.products.filter((p) => Number(p.category_id) === Number(id)).length;
    return { ...cat, product_count: productCount };
  },

  async create(data) {
    let newId = 1;

    if (isMongoConnected()) {
      const last = await Category.findOne().sort({ category_id: -1 }).lean();
      if (last && last.category_id) newId = last.category_id + 1;

      let parentName = null;
      if (data.parent_category_id) {
        const parent = await Category.findOne({ category_id: Number(data.parent_category_id) }).lean();
        if (parent) parentName = parent.category_name;
      }

      const created = await Category.create({
        category_id: newId,
        category_name: (data.category_name || '').trim().toUpperCase(),
        parent_category_id: data.parent_category_id ? Number(data.parent_category_id) : null,
        parent_name: parentName,
        description: data.description || '',
        status: data.status || 'active',
        product_count: 0,
        image:
          data.image ||
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80',
      });

      return created.toObject();
    }

    newId =
      store.categories.length > 0
        ? Math.max(...store.categories.map((c) => Number(c.category_id) || 0)) + 1
        : 1;

    let parentName = null;
    if (data.parent_category_id) {
      const parent = store.categories.find(
        (c) => Number(c.category_id) === Number(data.parent_category_id)
      );
      if (parent) parentName = parent.category_name;
    }

    const newCategory = {
      category_id: newId,
      category_name: (data.category_name || '').trim().toUpperCase(),
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

    store.categories.push(newCategory);
    persistLocalStore();
    return newCategory;
  },

  async update(id, data) {
    if (isMongoConnected()) {
      let parentName = undefined;
      if (data.parent_category_id !== undefined) {
        if (data.parent_category_id) {
          const parent = await Category.findOne({ category_id: Number(data.parent_category_id) }).lean();
          parentName = parent ? parent.category_name : null;
        } else {
          parentName = null;
        }
      }

      const updates = { ...data };
      if (data.category_name) updates.category_name = data.category_name.trim().toUpperCase();
      if (parentName !== undefined) updates.parent_name = parentName;

      const doc = await Category.findOneAndUpdate(
        { category_id: Number(id) },
        { $set: updates },
        { new: true }
      ).lean();
      return doc;
    }

    const idx = store.categories.findIndex((c) => Number(c.category_id) === Number(id));
    if (idx === -1) return null;

    let parentName = store.categories[idx].parent_name;
    if (data.parent_category_id !== undefined) {
      if (data.parent_category_id) {
        const parent = store.categories.find(
          (c) => Number(c.category_id) === Number(data.parent_category_id)
        );
        parentName = parent ? parent.category_name : null;
      } else {
        parentName = null;
      }
    }

    const updated = {
      ...store.categories[idx],
      ...data,
      category_name: data.category_name
        ? data.category_name.trim().toUpperCase()
        : store.categories[idx].category_name,
      parent_category_id:
        data.parent_category_id !== undefined
          ? data.parent_category_id
            ? Number(data.parent_category_id)
            : null
          : store.categories[idx].parent_category_id,
      parent_name: parentName,
    };

    store.categories[idx] = updated;
    persistLocalStore();
    return updated;
  },

  async delete(id) {
    if (isMongoConnected()) {
      const linkedCount = await Product.countDocuments({ category_id: Number(id) });
      if (linkedCount > 0) {
        throw new Error(
          `Cannot delete category with ${linkedCount} assigned products. Reassign or delete products first.`
        );
      }
      const res = await Category.deleteOne({ category_id: Number(id) });
      return res.deletedCount > 0;
    }

    const linkedProducts = store.products.filter((p) => Number(p.category_id) === Number(id));
    if (linkedProducts.length > 0) {
      throw new Error(
        `Cannot delete category with ${linkedProducts.length} assigned products. Reassign or delete products first.`
      );
    }

    const prevLen = store.categories.length;
    store.categories = store.categories.filter((c) => Number(c.category_id) !== Number(id));
    if (store.categories.length === prevLen) return false;

    persistLocalStore();
    return true;
  },
};

// Helper to resolve Base and Type IDs
export function resolveCategoryAndType(data) {
  let base = (data.base || '').trim();
  let category_id = data.category_id !== undefined && data.category_id !== null ? Number(data.category_id) : null;
  let type = (data.type || data.shirt_type || '').trim();
  let type_id = data.type_id !== undefined && data.type_id !== null ? Number(data.type_id) : null;
  let category_name = data.category_name || '';

  // Determine base if empty
  if (!base) {
    if (category_id === 1 || category_name.toUpperCase().includes('SHIRT')) {
      base = 'Shirt';
    } else if (category_id === 2 || category_name.toUpperCase().includes('T-SHIRT')) {
      base = 'T-Shirts';
    } else if (category_id === 3 || category_name.toUpperCase().includes('PANT') || category_name.toUpperCase().includes('TROUSER')) {
      base = 'Pants';
    } else if (category_id === 4 || category_name.toUpperCase().includes('ACCESSOR')) {
      base = 'Accessories';
    } else {
      base = 'Shirt';
    }
  }

  // Base determines category_id (Shirt starts as Category-id = 1 in DB)
  const normBase = base.toLowerCase();
  if (normBase === 'shirt' || normBase === 'shirts') {
    category_id = 1;
    category_name = 'Shirt';
    base = 'Shirt';
  } else if (normBase.includes('t-shirt') || normBase.includes('t-shirts') || normBase === 'polo') {
    category_id = 2;
    category_name = 'T-Shirts';
    base = 'T-Shirts';
  } else if (normBase.includes('pant') || normBase.includes('trouser')) {
    category_id = 3;
    category_name = 'Pants';
    base = 'Pants';
  } else if (normBase.includes('accessor') || normBase.includes('accesor')) {
    category_id = 4;
    category_name = 'Accessories';
    base = 'Accessories';
  } else {
    category_id = category_id || 1;
    category_name = category_name || base;
  }

  const parent_category_id = category_id;
  const parent_name = category_name;

  // Resolve type_id starting from 1 for each category's sub-category
  if (base === 'Shirt') {
    if (type.toLowerCase().includes('formal') || type_id === 1) {
      type_id = 1;
      type = 'Formal Shirt';
    } else if (type.toLowerCase().includes('casual') || type_id === 2) {
      type_id = 2;
      type = 'Casual Shirt';
    } else {
      type_id = 3;
      type = type || 'Other';
    }
  } else if (base === 'T-Shirts') {
    if (type.toLowerCase().includes('round') || type_id === 1) {
      type_id = 1;
      type = 'Round Neck';
    } else if (type.toLowerCase().includes('polo') || type_id === 2) {
      type_id = 2;
      type = 'Polo';
    } else if (type.toLowerCase().includes('oversized') || type_id === 3) {
      type_id = 3;
      type = 'Oversized';
    } else {
      type_id = 4;
      type = type || 'Other';
    }
  } else if (base === 'Pants') {
    if (type.toLowerCase().includes('jeans') || type_id === 1) {
      type_id = 1;
      type = 'Jeans';
    } else if (type.toLowerCase().includes('cotton') || type.toLowerCase().includes('chino') || type_id === 2) {
      type_id = 2;
      type = 'Cotton';
    } else {
      type_id = 3;
      type = type || 'Other';
    }
  } else if (base === 'Accessories') {
    if (type.toLowerCase().includes('watch') || type_id === 1) {
      type_id = 1;
      type = 'Watches';
    } else if (type.toLowerCase().includes('shoe') || type_id === 2) {
      type_id = 2;
      type = 'Shoes';
    } else {
      type_id = 3;
      type = type || 'Other';
    }
  } else {
    type_id = type_id || 1;
    type = type || 'Other';
  }

  return {
    category_id,
    category_name,
    parent_category_id,
    parent_name,
    base,
    type,
    type_id,
  };
}

// ==========================================
// PRODUCTS
// ==========================================
export const productStore = {
  async getAll({
    search = '',
    categoryId = '',
    typeId = '',
    type = '',
    base = '',
    status = '',
    sortBy = 'product_id',
    sortOrder = 'desc',
  } = {}) {
    if (isMongoConnected()) {
      const query = {};
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ product_name: regex }, { sku: regex }, { descriptions: regex }, { base: regex }, { type: regex }];
      }

      if (categoryId) {
        const catId = Number(categoryId);
        const subCat = await Category.findOne({ category_id: catId }).lean();
        if (subCat && subCat.parent_category_id) {
          query.$or = [
            { category_id: catId },
            {
              parent_category_id: subCat.parent_category_id,
              $or: [{ type_id: subCat.type_id }, { type: new RegExp(subCat.category_name, 'i') }],
            },
          ];
        } else {
          query.$or = [{ category_id: catId }, { parent_category_id: catId }];
        }
      }

      if (typeId) {
        query.type_id = Number(typeId);
      }
      if (type) {
        query.type = new RegExp(type, 'i');
      }
      if (base) {
        query.base = new RegExp(base, 'i');
      }

      if (status) {
        if (status === 'out_of_stock') {
          query.stock = 0;
        } else if (status === 'low_stock') {
          query.stock = { $gt: 0, $lte: 10 };
        } else if (status === 'in_stock') {
          query.stock = { $gt: 10 };
        } else {
          query.status = status;
        }
      }

      const sortOption = {};
      sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

      return await Product.find(query).sort(sortOption).lean();
    }

    let list = [...store.products];

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.product_name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.descriptions && p.descriptions.toLowerCase().includes(q)) ||
          (p.base && p.base.toLowerCase().includes(q)) ||
          (p.type && p.type.toLowerCase().includes(q))
      );
    }

    if (categoryId) {
      const catId = Number(categoryId);
      const subCat = store.categories.find((c) => Number(c.category_id) === catId);
      if (subCat && subCat.parent_category_id) {
        list = list.filter(
          (p) =>
            Number(p.category_id) === catId ||
            (Number(p.parent_category_id) === Number(subCat.parent_category_id) &&
              (Number(p.type_id) === Number(subCat.type_id) ||
                (p.type && p.type.toUpperCase() === subCat.category_name)))
        );
      } else {
        list = list.filter(
          (p) => Number(p.category_id) === catId || Number(p.parent_category_id) === catId
        );
      }
    }

    if (typeId) {
      list = list.filter((p) => Number(p.type_id) === Number(typeId));
    }
    if (type) {
      const t = type.toLowerCase();
      list = list.filter((p) => p.type && p.type.toLowerCase().includes(t));
    }
    if (base) {
      const b = base.toLowerCase();
      list = list.filter((p) => p.base && p.base.toLowerCase().includes(b));
    }

    if (status) {
      if (status === 'low_stock') {
        list = list.filter((p) => p.stock > 0 && p.stock <= (p.min_stock || 10));
      } else if (status === 'out_of_stock') {
        list = list.filter((p) => Number(p.stock) === 0);
      } else if (status === 'in_stock') {
        list = list.filter((p) => p.stock > (p.min_stock || 10));
      } else {
        list = list.filter((p) => p.status === status);
      }
    }

    list.sort((a, b) => {
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

    return list;
  },

  async findById(id) {
    if (isMongoConnected()) {
      return await Product.findOne({ product_id: Number(id) }).lean();
    }
    return store.products.find((p) => Number(p.product_id) === Number(id)) || null;
  },

  async create(data) {
    const initialStock = parseInt(data.stock, 10) || 0;
    const resolved = resolveCategoryAndType(data);

    if (isMongoConnected()) {
      let newId = 1;
      const last = await Product.findOne().sort({ product_id: -1 }).lean();
      if (last && last.product_id) newId = last.product_id + 1;

      const newProduct = await Product.create({
        product_id: newId,
        product_name: (data.product_name || '').trim(),
        sku: data.sku?.trim() || `BNB-PRD-${String(newId).padStart(3, '0')}`,
        category_id: resolved.category_id,
        category_name: resolved.category_name,
        parent_category_id: resolved.parent_category_id,
        parent_name: resolved.parent_name,
        base: resolved.base,
        type: resolved.type,
        type_id: resolved.type_id,
        sleeve_type: data.sleeve_type || data.sleeves || 'Full Sleeve',
        size: data.size || '',
        sizes: data.sizes || (data.size ? [data.size] : []),
        size_stock: data.size_stock || {},
        descriptions: data.descriptions || '',
        price: parseFloat(data.price) || 0.0,
        cost_price: parseFloat(data.cost_price) || 0.0,
        stock: initialStock,
        min_stock: parseInt(data.min_stock, 10) || 5,
        status: initialStock === 0 ? 'out_of_stock' : data.status || 'active',
        shirt_type: resolved.type || data.shirt_type || data.sleeves || 'Full Sleeve',
        sleeves: data.sleeve_type || data.sleeves || 'Full Sleeve',
        image:
          data.image ||
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format&fit=crop&q=80',
      });

      if (initialStock > 0) {
        await StockLog.create({
          id: Date.now(),
          product_id: newId,
          product_name: newProduct.product_name,
          sku: newProduct.sku,
          type: 'ADD',
          quantity: initialStock,
          previous_stock: 0,
          new_stock: initialStock,
          reason: 'New Product Catalog Creation',
          adjusted_by: data.adjusted_by || 'Admin',
          timestamp: new Date().toISOString(),
        });
      }

      return newProduct.toObject();
    }

    const newId =
      store.products.length > 0
        ? Math.max(...store.products.map((p) => Number(p.product_id) || 0)) + 1
        : 1;

    const newProduct = {
      product_id: newId,
      product_name: (data.product_name || '').trim(),
      sku: data.sku?.trim() || `BNB-PRD-${String(newId).padStart(3, '0')}`,
      category_id: resolved.category_id,
      category_name: resolved.category_name,
      parent_category_id: resolved.parent_category_id,
      parent_name: resolved.parent_name,
      base: resolved.base,
      type: resolved.type,
      type_id: resolved.type_id,
      sleeve_type: data.sleeve_type || data.sleeves || 'Full Sleeve',
      size: data.size || '',
      sizes: data.sizes || (data.size ? [data.size] : []),
      size_stock: data.size_stock || {},
      descriptions: data.descriptions || '',
      price: parseFloat(data.price) || 0.0,
      cost_price: parseFloat(data.cost_price) || 0.0,
      stock: initialStock,
      min_stock: parseInt(data.min_stock, 10) || 5,
      status: initialStock === 0 ? 'out_of_stock' : data.status || 'active',
      shirt_type: resolved.type || data.shirt_type || data.sleeves || 'Full Sleeve',
      sleeves: data.sleeve_type || data.sleeves || 'Full Sleeve',
      image:
        data.image ||
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    };

    store.products.unshift(newProduct);

    if (initialStock > 0) {
      store.stockLogs.unshift({
        id: Date.now(),
        product_id: newId,
        product_name: newProduct.product_name,
        sku: newProduct.sku,
        type: 'ADD',
        quantity: initialStock,
        previous_stock: 0,
        new_stock: initialStock,
        reason: 'New Product Catalog Creation',
        adjusted_by: data.adjusted_by || 'Admin',
        timestamp: new Date().toISOString(),
      });
    }

    persistLocalStore();
    return newProduct;
  },

  async update(id, data) {
    if (isMongoConnected()) {
      const current = await Product.findOne({ product_id: Number(id) }).lean();
      if (!current) return null;

      const mergedData = { ...current, ...data };
      const resolved = resolveCategoryAndType(mergedData);

      const updatedStock =
        data.stock !== undefined ? parseInt(data.stock, 10) : current.stock;
      let finalStatus = data.status || current.status;
      if (updatedStock === 0) {
        finalStatus = 'out_of_stock';
      } else if (finalStatus === 'out_of_stock' && updatedStock > 0) {
        finalStatus = 'active';
      }

      const updates = {
        ...data,
        category_id: resolved.category_id,
        category_name: resolved.category_name,
        parent_category_id: resolved.parent_category_id,
        parent_name: resolved.parent_name,
        base: resolved.base,
        type: resolved.type,
        type_id: resolved.type_id,
        status: finalStatus,
        stock: isNaN(updatedStock) ? current.stock : updatedStock,
      };

      if (data.shirt_type || resolved.type) {
        updates.shirt_type = data.shirt_type || resolved.type;
        updates.sleeves = data.sleeve_type || data.sleeves || updates.shirt_type;
      }

      const doc = await Product.findOneAndUpdate(
        { product_id: Number(id) },
        { $set: updates },
        { new: true }
      ).lean();

      return doc;
    }

    const idx = store.products.findIndex((p) => Number(p.product_id) === Number(id));
    if (idx === -1) return null;

    const current = store.products[idx];
    const mergedData = { ...current, ...data };
    const resolved = resolveCategoryAndType(mergedData);

    const updatedStock =
      data.stock !== undefined ? parseInt(data.stock, 10) : current.stock;
    let finalStatus = data.status || current.status;
    if (updatedStock === 0) {
      finalStatus = 'out_of_stock';
    } else if (finalStatus === 'out_of_stock' && updatedStock > 0) {
      finalStatus = 'active';
    }

    const updated = {
      ...current,
      ...data,
      category_id: resolved.category_id,
      category_name: resolved.category_name,
      parent_category_id: resolved.parent_category_id,
      parent_name: resolved.parent_name,
      base: resolved.base,
      type: resolved.type,
      type_id: resolved.type_id,
      price: data.price !== undefined ? parseFloat(data.price) || 0 : current.price,
      cost_price:
        data.cost_price !== undefined ? parseFloat(data.cost_price) || 0 : current.cost_price,
      stock: isNaN(updatedStock) ? current.stock : updatedStock,
      min_stock:
        data.min_stock !== undefined ? parseInt(data.min_stock, 10) || 0 : current.min_stock,
      shirt_type: data.shirt_type || data.sleeves || resolved.type || current.shirt_type || 'Full Sleeve',
      sleeves: data.sleeve_type || data.sleeves || current.sleeves || 'Full Sleeve',
      status: finalStatus,
    };

    store.products[idx] = updated;
    persistLocalStore();
    return updated;
  },

  async delete(id) {
    if (isMongoConnected()) {
      const res = await Product.deleteOne({ product_id: Number(id) });
      return res.deletedCount > 0;
    }

    const prevLen = store.products.length;
    store.products = store.products.filter((p) => Number(p.product_id) !== Number(id));
    if (store.products.length === prevLen) return false;

    persistLocalStore();
    return true;
  },

  async adjustStock(id, { quantity, type = 'ADD', reason = '', user = 'Admin' }) {
    if (isMongoConnected()) {
      const product = await Product.findOne({ product_id: Number(id) });
      if (!product) return null;

      const qty = Math.abs(parseInt(quantity, 10) || 0);
      const prevStock = product.stock || 0;
      let newStock = prevStock;

      if (type === 'ADD') {
        newStock = prevStock + qty;
      } else if (type === 'SUBTRACT') {
        newStock = Math.max(0, prevStock - qty);
      } else if (type === 'SET') {
        newStock = qty;
      }

      product.stock = newStock;
      if (newStock === 0) {
        product.status = 'out_of_stock';
      } else if (product.status === 'out_of_stock' && newStock > 0) {
        product.status = 'active';
      }
      await product.save();

      const logDoc = await StockLog.create({
        id: Date.now(),
        product_id: product.product_id,
        product_name: product.product_name,
        sku: product.sku,
        type,
        quantity: qty,
        previous_stock: prevStock,
        new_stock: newStock,
        reason: reason || 'Manual stock adjustment',
        adjusted_by: user,
        timestamp: new Date().toISOString(),
      });

      return { product: product.toObject(), newStock, logEntry: logDoc.toObject() };
    }

    const product = store.products.find((p) => Number(p.product_id) === Number(id));
    if (!product) return null;

    const qty = Math.abs(parseInt(quantity, 10) || 0);
    const prevStock = product.stock || 0;
    let newStock = prevStock;

    if (type === 'ADD') {
      newStock = prevStock + qty;
    } else if (type === 'SUBTRACT') {
      newStock = Math.max(0, prevStock - qty);
    } else if (type === 'SET') {
      newStock = qty;
    }

    product.stock = newStock;
    if (newStock === 0) {
      product.status = 'out_of_stock';
    } else if (product.status === 'out_of_stock' && newStock > 0) {
      product.status = 'active';
    }

    const logEntry = {
      id: Date.now(),
      product_id: product.product_id,
      product_name: product.product_name,
      sku: product.sku,
      type,
      quantity: qty,
      previous_stock: prevStock,
      new_stock: newStock,
      reason: reason || 'Manual stock adjustment',
      adjusted_by: user,
      timestamp: new Date().toISOString(),
    };

    store.stockLogs.unshift(logEntry);
    persistLocalStore();

    return { product, newStock, logEntry };
  },

  async getStockLogs() {
    if (isMongoConnected()) {
      return await StockLog.find().sort({ createdAt: -1 }).lean();
    }
    return store.stockLogs;
  },
};

// ==========================================
// ORDERS
// ==========================================
export const orderStore = {
  async getAll({
    search = '',
    status = '',
    paymentStatus = '',
    sortBy = 'date',
    sortOrder = 'desc',
    email = '',
    phone = '',
    customerId = '',
  } = {}) {
    if (isMongoConnected()) {
      const query = {};
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { order_id: regex },
          { 'customer.name': regex },
          { 'customer.email': regex },
          { tracking_number: regex },
        ];
      }

      if (status && status !== 'all') {
        query.order_status = new RegExp(`^${status}$`, 'i');
      }

      if (paymentStatus && paymentStatus !== 'all') {
        query.payment_status = new RegExp(`^${paymentStatus}$`, 'i');
      }

      // Filter by customer email, phone, or customerId if provided
      if (email || phone || customerId) {
        const userOr = [];
        if (email && email.trim()) {
          userOr.push({ 'customer.email': new RegExp(`^${email.trim()}$`, 'i') });
        }
        if (phone && phone.trim()) {
          const digits = phone.replace(/\D/g, '').slice(-10);
          if (digits) {
            userOr.push({ 'customer.phone': new RegExp(digits) });
          }
        }
        if (customerId) {
          userOr.push({ 'customer.id': Number(customerId) });
        }
        if (userOr.length > 0) {
          if (query.$or) {
            query.$and = [{ $or: query.$or }, { $or: userOr }];
            delete query.$or;
          } else {
            query.$or = userOr;
          }
        }
      }

      const sortOption = {};
      sortOption[sortBy === 'total' ? 'total_amount' : 'created_at'] =
        sortOrder === 'asc' ? 1 : -1;

      return await Order.find(query).sort(sortOption).lean();
    }

    let list = [...store.orders];

    if (email || phone || customerId) {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
      const cId = customerId ? Number(customerId) : null;

      list = list.filter((o) => {
        const oEmail = (o.customer?.email || '').trim().toLowerCase();
        const oPhone = (o.customer?.phone || '').replace(/\D/g, '').slice(-10);
        const oId = o.customer?.id ? Number(o.customer.id) : null;

        if (cleanEmail && oEmail && cleanEmail === oEmail) return true;
        if (cleanPhone && oPhone && cleanPhone.length >= 8 && oPhone.includes(cleanPhone)) return true;
        if (cId && oId && cId === oId) return true;
        return false;
      });
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.order_id.toLowerCase().includes(q) ||
          o.customer?.name?.toLowerCase().includes(q) ||
          o.customer?.email?.toLowerCase().includes(q) ||
          (o.tracking_number && o.tracking_number.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'all') {
      list = list.filter((o) => o.order_status?.toLowerCase() === status.toLowerCase());
    }

    if (paymentStatus && paymentStatus !== 'all') {
      list = list.filter((o) => o.payment_status?.toLowerCase() === paymentStatus.toLowerCase());
    }

    list.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortBy === 'total') {
        return sortOrder === 'asc'
          ? a.total_amount - b.total_amount
          : b.total_amount - a.total_amount;
      }
      return 0;
    });

    return list;
  },

  async findById(id) {
    if (isMongoConnected()) {
      return await Order.findOne({ order_id: new RegExp(`^${id}$`, 'i') }).lean();
    }
    return store.orders.find((o) => o.order_id.toLowerCase() === id.toLowerCase()) || null;
  },

  async create(data) {
    const newOrderId = `BNB-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderData = {
      order_id: newOrderId,
      customer: data.customer || {
        id: 1,
        name: 'Guest Customer',
        email: 'guest@buyandbye.com',
        phone: '+91 99999 00000',
      },
      date: new Date().toISOString(),
      items: data.items || [],
      subtotal: parseFloat(data.subtotal) || 0,
      tax: parseFloat(data.tax) || 0,
      shipping_fee: parseFloat(data.shipping_fee) || 0,
      total_amount: parseFloat(data.total_amount) || 0,
      payment_method: data.payment_method || 'Cash On Delivery',
      payment_status: data.payment_status || 'Pending',
      order_status: data.order_status || 'Pending',
      shipping_address: data.shipping_address || {},
      tracking_number: `IND-TRACK-${Date.now().toString().slice(-6)}`,
    };

    try {
      if (orderData.customer && (orderData.customer.email || orderData.customer.phone)) {
        await customerStore.recordOrder(
          orderData.customer,
          orderData.total_amount,
          orderData.shipping_address
        );
      }
    } catch (e) {
      console.warn('[DataStore] Could not record customer order stats:', e.message);
    }

    if (isMongoConnected()) {
      const doc = await Order.create(orderData);
      return doc.toObject();
    }

    store.orders.unshift(orderData);
    persistLocalStore();
    return orderData;
  },

  async updateStatus(id, newStatus) {
    if (isMongoConnected()) {
      const updateData = { order_status: newStatus };
      if (newStatus === 'Delivered') {
        updateData.payment_status = 'Paid';
      }
      return await Order.findOneAndUpdate(
        { order_id: new RegExp(`^${id}$`, 'i') },
        { $set: updateData },
        { new: true }
      ).lean();
    }

    const idx = store.orders.findIndex((o) => o.order_id.toLowerCase() === id.toLowerCase());
    if (idx === -1) return null;

    store.orders[idx].order_status = newStatus;
    if (newStatus === 'Delivered') {
      store.orders[idx].payment_status = 'Paid';
    }

    persistLocalStore();
    return store.orders[idx];
  },

  async getStats() {
    if (isMongoConnected()) {
      const orders = await Order.find().lean();
      const products = await Product.find().lean();
      const customerCount = await Customer.countDocuments();

      const totalSales = orders
        .filter((o) => o.payment_status === 'Paid')
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

      const pendingOrders = orders.filter(
        (o) => o.order_status === 'Pending' || o.order_status === 'Processing'
      ).length;

      const lowStockProducts = products.filter(
        (p) => p.stock > 0 && p.stock <= (p.min_stock || 10)
      ).length;

      const outOfStockProducts = products.filter((p) => Number(p.stock) === 0).length;

      return {
        totalSales,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: customerCount,
        pendingOrders,
        lowStockProducts,
        outOfStockProducts,
        averageOrderValue: orders.length > 0 ? totalSales / orders.length : 0,
      };
    }

    const orders = store.orders;
    const products = store.products;
    const customers = store.customers;

    const totalSales = orders
      .filter((o) => o.payment_status === 'Paid')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const pendingOrders = orders.filter(
      (o) => o.order_status === 'Pending' || o.order_status === 'Processing'
    ).length;

    const lowStockProducts = products.filter(
      (p) => p.stock > 0 && p.stock <= (p.min_stock || 10)
    ).length;

    const outOfStockProducts = products.filter((p) => Number(p.stock) === 0).length;

    return {
      totalSales,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      pendingOrders,
      lowStockProducts,
      outOfStockProducts,
      averageOrderValue: orders.length > 0 ? totalSales / orders.length : 0,
    };
  },
};

// ==========================================
// EMPLOYEES
// ==========================================
export const employeeStore = {
  async getAll() {
    if (isMongoConnected()) {
      return await Employee.find().lean();
    }
    return store.employees;
  },

  async findById(id) {
    if (isMongoConnected()) {
      return await Employee.findOne({ employee_id: Number(id) }).lean();
    }
    return store.employees.find((e) => Number(e.employee_id) === Number(id)) || null;
  },

  async create(data) {
    if (isMongoConnected()) {
      let newId = 1;
      const last = await Employee.findOne().sort({ employee_id: -1 }).lean();
      if (last && last.employee_id) newId = last.employee_id + 1;

      const doc = await Employee.create({
        employee_id: newId,
        employee_name: data.employee_name || '',
        employee_salary: parseFloat(data.employee_salary) || 0.0,
        employee_worktype: data.employee_worktype || 'Staff',
      });
      return doc.toObject();
    }

    const newId =
      store.employees.length > 0
        ? Math.max(...store.employees.map((e) => Number(e.employee_id) || 0)) + 1
        : 1;

    const newEmployee = {
      employee_id: newId,
      employee_name: data.employee_name || '',
      employee_salary: parseFloat(data.employee_salary) || 0.0,
      employee_worktype: data.employee_worktype || 'Staff',
      created_at: new Date().toISOString(),
    };

    store.employees.push(newEmployee);
    persistLocalStore();
    return newEmployee;
  },

  async update(id, data) {
    if (isMongoConnected()) {
      return await Employee.findOneAndUpdate(
        { employee_id: Number(id) },
        { $set: data },
        { new: true }
      ).lean();
    }

    const idx = store.employees.findIndex((e) => Number(e.employee_id) === Number(id));
    if (idx === -1) return null;

    const updated = {
      ...store.employees[idx],
      employee_name:
        data.employee_name !== undefined ? data.employee_name : store.employees[idx].employee_name,
      employee_salary:
        data.employee_salary !== undefined
          ? parseFloat(data.employee_salary)
          : store.employees[idx].employee_salary,
      employee_worktype:
        data.employee_worktype !== undefined
          ? data.employee_worktype
          : store.employees[idx].employee_worktype,
    };

    store.employees[idx] = updated;
    persistLocalStore();
    return updated;
  },

  async delete(id) {
    if (isMongoConnected()) {
      const res = await Employee.deleteOne({ employee_id: Number(id) });
      return res.deletedCount > 0;
    }

    const prevLen = store.employees.length;
    store.employees = store.employees.filter((e) => Number(e.employee_id) !== Number(id));
    if (store.employees.length === prevLen) return false;

    persistLocalStore();
    return true;
  },
};

// ==========================================
// CUSTOMERS
// ==========================================
export const customerStore = {
  async getAll({ search = '', status = '' } = {}) {
    if (isMongoConnected()) {
      const query = {};
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ name: regex }, { email: regex }, { phone: regex }, { city: regex }];
      }
      if (status) query.status = status;
      return await Customer.find(query).lean();
    }

    let list = [...store.customers];

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }

    if (status) {
      list = list.filter((c) => c.status === status);
    }

    return list;
  },

  async findById(id) {
    if (isMongoConnected()) {
      const customer = await Customer.findOne({ customer_id: Number(id) }).lean();
      if (!customer) return null;
      const orderQuery = {
        $or: [{ 'customer.id': Number(id) }],
      };
      if (customer.email) {
        orderQuery.$or.push({ 'customer.email': new RegExp(`^${customer.email.trim()}$`, 'i') });
      }
      const orders = await Order.find(orderQuery).sort({ date: -1 }).lean();
      return { ...customer, orders };
    }

    const customer = store.customers.find((c) => Number(c.customer_id) === Number(id));
    if (!customer) return null;

    const orders = store.orders.filter(
      (o) =>
        Number(o.customer?.id) === Number(id) ||
        (customer.email && (o.customer?.email || '').toLowerCase() === customer.email.toLowerCase())
    );
    return {
      ...customer,
      orders,
    };
  },

  async createOrUpdate(data) {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const rawPhone = (data.phone || '').trim();
    const cleanPhoneDigits = rawPhone.replace(/\D/g, '').slice(-10);
    const cleanName = (data.name || '').trim();
    const city = data.city || data.shipping_address?.city || 'Chennai';
    const state = data.state || data.shipping_address?.state || 'Tamil Nadu';

    if (isMongoConnected()) {
      let existing = null;
      if (cleanEmail) {
        existing = await Customer.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
      }
      if (!existing && cleanPhoneDigits) {
        existing = await Customer.findOne({ phone: new RegExp(cleanPhoneDigits) });
      }

      if (existing) {
        if (cleanName) existing.name = cleanName;
        if (rawPhone) existing.phone = rawPhone;
        if (cleanEmail && !existing.email) existing.email = cleanEmail;
        if (city) existing.city = city;
        if (state) existing.state = state;
        if (data.total_orders !== undefined) existing.total_orders = data.total_orders;
        if (data.total_spent !== undefined) existing.total_spent = data.total_spent;
        await existing.save();
        return existing.toObject();
      }

      const last = await Customer.findOne().sort({ customer_id: -1 }).lean();
      const newId = (last && last.customer_id ? last.customer_id : 0) + 1;

      const created = await Customer.create({
        customer_id: newId,
        name: cleanName || 'New Customer',
        email: cleanEmail || `customer_${newId}@buyandbye.com`,
        phone: rawPhone || '',
        city,
        state,
        registered_at: data.registered_at || new Date().toISOString(),
        total_orders: Number(data.total_orders) || 0,
        total_spent: Number(data.total_spent) || 0,
        status: data.status || 'active',
      });
      return created.toObject();
    }

    let existingIdx = -1;
    if (cleanEmail) {
      existingIdx = store.customers.findIndex(
        (c) => (c.email || '').trim().toLowerCase() === cleanEmail
      );
    }
    if (existingIdx === -1 && cleanPhoneDigits) {
      existingIdx = store.customers.findIndex((c) =>
        (c.phone || '').replace(/\D/g, '').slice(-10) === cleanPhoneDigits
      );
    }

    if (existingIdx !== -1) {
      store.customers[existingIdx] = {
        ...store.customers[existingIdx],
        name: cleanName || store.customers[existingIdx].name,
        phone: rawPhone || store.customers[existingIdx].phone,
        email: cleanEmail || store.customers[existingIdx].email,
        city: city || store.customers[existingIdx].city,
        state: state || store.customers[existingIdx].state,
        ...(data.total_orders !== undefined ? { total_orders: data.total_orders } : {}),
        ...(data.total_spent !== undefined ? { total_spent: data.total_spent } : {}),
      };
      persistLocalStore();
      return store.customers[existingIdx];
    }

    const newId =
      store.customers.length > 0
        ? Math.max(...store.customers.map((c) => Number(c.customer_id) || 0)) + 1
        : 1;

    const newCust = {
      customer_id: newId,
      name: cleanName || 'New Customer',
      email: cleanEmail || `customer_${newId}@buyandbye.com`,
      phone: rawPhone || '',
      city,
      state,
      registered_at: data.registered_at || new Date().toISOString(),
      total_orders: Number(data.total_orders) || 0,
      total_spent: Number(data.total_spent) || 0,
      status: data.status || 'active',
    };

    store.customers.push(newCust);
    persistLocalStore();
    return newCust;
  },

  async recordOrder(customerInfo, amount = 0, shippingAddress = {}) {
    const cleanEmail = (customerInfo.email || '').trim().toLowerCase();
    const rawPhone = (customerInfo.phone || '').trim();
    const cleanPhoneDigits = rawPhone.replace(/\D/g, '').slice(-10);
    const cleanName = (customerInfo.name || '').trim();
    const city = shippingAddress?.city || 'Chennai';
    const state = shippingAddress?.state || 'Tamil Nadu';

    if (isMongoConnected()) {
      let existing = null;
      if (cleanEmail) {
        existing = await Customer.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
      }
      if (!existing && cleanPhoneDigits) {
        existing = await Customer.findOne({ phone: new RegExp(cleanPhoneDigits) });
      }

      if (existing) {
        if (cleanName && (!existing.name || existing.name === 'Guest Customer')) {
          existing.name = cleanName;
        }
        if (rawPhone && !existing.phone) existing.phone = rawPhone;
        if (city && (!existing.city || existing.city === 'Chennai')) existing.city = city;
        if (state && (!existing.state || existing.state === 'Tamil Nadu')) existing.state = state;
        existing.total_orders = (existing.total_orders || 0) + 1;
        existing.total_spent = (existing.total_spent || 0) + Number(amount);
        await existing.save();
        return existing.toObject();
      }

      const last = await Customer.findOne().sort({ customer_id: -1 }).lean();
      const newId = (last && last.customer_id ? last.customer_id : 0) + 1;

      const created = await Customer.create({
        customer_id: newId,
        name: cleanName || 'Customer',
        email: cleanEmail || `customer_${newId}@buyandbye.com`,
        phone: rawPhone || '',
        city,
        state,
        registered_at: new Date().toISOString(),
        total_orders: 1,
        total_spent: Number(amount),
        status: 'active',
      });
      return created.toObject();
    }

    let existingIdx = -1;
    if (cleanEmail) {
      existingIdx = store.customers.findIndex(
        (c) => (c.email || '').trim().toLowerCase() === cleanEmail
      );
    }
    if (existingIdx === -1 && cleanPhoneDigits) {
      existingIdx = store.customers.findIndex((c) =>
        (c.phone || '').replace(/\D/g, '').slice(-10) === cleanPhoneDigits
      );
    }

    if (existingIdx !== -1) {
      const c = store.customers[existingIdx];
      c.name = cleanName && c.name === 'Guest Customer' ? cleanName : c.name || cleanName;
      if (rawPhone && !c.phone) c.phone = rawPhone;
      if (city) c.city = city;
      if (state) c.state = state;
      c.total_orders = (c.total_orders || 0) + 1;
      c.total_spent = (c.total_spent || 0) + Number(amount);
      persistLocalStore();
      return c;
    }

    const newId =
      store.customers.length > 0
        ? Math.max(...store.customers.map((c) => Number(c.customer_id) || 0)) + 1
        : 1;

    const newCust = {
      customer_id: newId,
      name: cleanName || 'Customer',
      email: cleanEmail || `customer_${newId}@buyandbye.com`,
      phone: rawPhone || '',
      city,
      state,
      registered_at: new Date().toISOString(),
      total_orders: 1,
      total_spent: Number(amount),
      status: 'active',
    };

    store.customers.push(newCust);
    persistLocalStore();
    return newCust;
  },
};

// ==========================================
// PAYMENTS
// ==========================================
export const paymentStore = {
  async getAll({ search = '', status = '', gateway = '' } = {}) {
    if (isMongoConnected()) {
      const query = {};
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { transaction_id: regex },
          { order_id: regex },
          { customer_name: regex },
          { reference_no: regex },
        ];
      }
      if (status && status !== 'all') {
        query.status = new RegExp(`^${status}$`, 'i');
      }
      if (gateway && gateway !== 'all') {
        query.gateway = new RegExp(`^${gateway}$`, 'i');
      }
      return await Payment.find(query).lean();
    }

    let list = [...store.payments];

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.transaction_id.toLowerCase().includes(q) ||
          p.order_id.toLowerCase().includes(q) ||
          p.customer_name.toLowerCase().includes(q) ||
          p.reference_no.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all') {
      list = list.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    }

    if (gateway && gateway !== 'all') {
      list = list.filter((p) => p.gateway.toLowerCase() === gateway.toLowerCase());
    }

    return list;
  },

  async getSummary() {
    let payments = [];
    if (isMongoConnected()) {
      payments = await Payment.find().lean();
    } else {
      payments = store.payments;
    }

    const successful = payments.filter((p) => p.status === 'Successful');
    const totalVolume = successful.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pendingAmount = payments
      .filter((p) => p.status === 'Pending')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const refundedAmount = payments
      .filter((p) => p.status === 'Refunded')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return {
      totalVolume,
      totalTransactions: payments.length,
      successfulCount: successful.length,
      pendingAmount,
      refundedAmount,
    };
  },
};

// ==========================================
// REPORTS / ANALYTICS
// ==========================================
export const reportStore = {
  async getAnalytics() {
    let orders = [];
    let products = [];

    if (isMongoConnected()) {
      orders = await Order.find().lean();
      products = await Product.find().lean();
    } else {
      orders = store.orders;
      products = store.products;
    }

    const productSalesMap = {};
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (!productSalesMap[item.product_id]) {
          productSalesMap[item.product_id] = {
            id: item.product_id,
            name: item.name,
            sku: item.sku,
            unitsSold: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.product_id].unitsSold += item.quantity || 1;
        productSalesMap[item.product_id].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      monthlyRevenue: DASHBOARD_ANALYTICS.monthlyRevenue,
      categoryShare: DASHBOARD_ANALYTICS.categoryShare,
      weeklySales: DASHBOARD_ANALYTICS.weeklySales,
      topProducts,
      totalCatalogProducts: products.length,
      totalRecordedOrders: orders.length,
    };
  },
};
