import {
  INITIAL_ADMIN,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_PAYMENTS,
  INITIAL_STOCK_LOGS,
} from './mockData';

const STORAGE_KEYS = {
  ADMIN: 'buyandbye_admin',
  CATEGORIES: 'buyandbye_categories',
  PRODUCTS: 'buyandbye_products',
  ORDERS: 'buyandbye_orders',
  CUSTOMERS: 'buyandbye_customers',
  PAYMENTS: 'buyandbye_payments',
  STOCK_LOGS: 'buyandbye_stock_logs',
  SETTINGS: 'buyandbye_settings',
};

/**
 * Initialize mock database in localStorage if not already present
 */
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(INITIAL_ADMIN));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STOCK_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(INITIAL_STOCK_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    const defaultSettings = {
      storeName: 'BuyAndBye',
      supportEmail: 'support@buyandbye.com',
      phone: '+91 800 289 293',
      currency: 'INR',
      taxRate: 5.0,
      lowStockThreshold: 10,
      orderNotifications: true,
      lowStockAlerts: true,
      dailyReportDigest: false,
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }
};

export const getStored = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
};

export const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
};

export { STORAGE_KEYS };
