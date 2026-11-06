import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  INITIAL_ADMINS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_EMPLOYEES,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_STOCK_LOGS,
} from '../data/initialData.js';

import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Employee from '../models/Employee.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import StockLog from '../models/StockLog.js';

dotenv.config();

let isConnectedState = false;

/**
 * Automatically seeds default documents into MongoDB collections if empty
 */
export async function seedInitialDataIfEmpty() {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.insertMany(INITIAL_ADMINS);
      console.log('[MongoDB Seed] Seeded default admins (Vicky)');
    }

    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany(INITIAL_CATEGORIES);
      console.log('[MongoDB Seed] Seeded default categories');
    }

    // User will add products manually - do not auto-seed dummy products

    const empCount = await Employee.countDocuments();
    if (empCount === 0) {
      await Employee.insertMany(INITIAL_EMPLOYEES);
      console.log('[MongoDB Seed] Seeded default employees');
    }

    // Customers will be registered dynamically when user creates an account
    const custCount = await Customer.countDocuments();
    if (custCount === 0 && INITIAL_CUSTOMERS.length > 0) {
      await Customer.insertMany(INITIAL_CUSTOMERS);
      console.log('[MongoDB Seed] Seeded default customers');
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(INITIAL_ORDERS);
      console.log('[MongoDB Seed] Seeded default orders');
    }

    const payCount = await Payment.countDocuments();
    if (payCount === 0) {
      await Payment.insertMany(INITIAL_PAYMENTS);
      console.log('[MongoDB Seed] Seeded default payments');
    }

    const logCount = await StockLog.countDocuments();
    if (logCount === 0) {
      await StockLog.insertMany(INITIAL_STOCK_LOGS);
      console.log('[MongoDB Seed] Seeded default stock logs');
    }
  } catch (err) {
    console.warn('[MongoDB Seed] Auto-seed warning:', err.message);
  }
}

/**
 * Initializes and connects to MongoDB database
 */
export async function initMongoDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/buyandbye';

  try {
    console.log(`[MongoDB] Connecting to MongoDB: ${uri.replace(/:([^:@]{3})[^:@]*@/, ':***@')} ...`);
    await mongoose.connect(uri, {
      dbName: 'buyandbye',
      serverSelectionTimeoutMS: 8000,
    });

    isConnectedState = true;
    console.log(`[MongoDB] Connected successfully to database: "${mongoose.connection.name}"`);

    // Auto-seed if database is fresh
    await seedInitialDataIfEmpty();

    return { success: true };
  } catch (error) {
    isConnectedState = false;
    console.warn(`[MongoDB] Notice: Could not connect to MongoDB server (${error.message}).`);
    console.warn(`[MongoDB] Running with auto-persistent local data store as fallback.`);
    console.warn(`[MongoDB] Tip: Start your local MongoDB server or set your MongoDB Atlas URI in .env (MONGODB_URI).`);
    return { success: false, error };
  }
}

export function isMongoConnected() {
  return isConnectedState && mongoose.connection.readyState === 1;
}

export default {
  initMongoDB,
  isMongoConnected,
  seedInitialDataIfEmpty,
};
