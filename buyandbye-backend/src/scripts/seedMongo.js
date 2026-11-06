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

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/buyandbye';
  console.log(`[SeedMongo] Connecting to MongoDB: ${uri.replace(/:([^:@]{3})[^:@]*@/, ':***@')}`);

  try {
    await mongoose.connect(uri, {
      dbName: 'buyandbye',
      serverSelectionTimeoutMS: 8000,
    });
    console.log('[SeedMongo] Connected to MongoDB database successfully.');

    // Clear existing data
    console.log('[SeedMongo] Clearing existing collections...');
    await Promise.all([
      Admin.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Employee.deleteMany({}),
      Customer.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({}),
      StockLog.deleteMany({}),
    ]);

    // Insert seeds
    console.log('[SeedMongo] Inserting initial seed documents...');
    await Admin.insertMany(INITIAL_ADMINS);
    await Category.insertMany(INITIAL_CATEGORIES);
    await Product.insertMany(INITIAL_PRODUCTS);
    await Employee.insertMany(INITIAL_EMPLOYEES);
    if (INITIAL_CUSTOMERS.length > 0) {
      await Customer.insertMany(INITIAL_CUSTOMERS);
    }
    await Order.insertMany(INITIAL_ORDERS);
    await Payment.insertMany(INITIAL_PAYMENTS);
    await StockLog.insertMany(INITIAL_STOCK_LOGS);

    console.log('='.repeat(50));
    console.log('🎉 MongoDB Seed Completed Successfully!');
    console.log(`- Admins:    ${INITIAL_ADMINS.length}`);
    console.log(`- Categories:${INITIAL_CATEGORIES.length}`);
    console.log(`- Products:  ${INITIAL_PRODUCTS.length}`);
    console.log(`- Employees: ${INITIAL_EMPLOYEES.length}`);
    console.log(`- Customers: ${INITIAL_CUSTOMERS.length}`);
    console.log(`- Orders:    ${INITIAL_ORDERS.length}`);
    console.log(`- Payments:  ${INITIAL_PAYMENTS.length}`);
    console.log(`- Stock Logs:${INITIAL_STOCK_LOGS.length}`);
    console.log('='.repeat(50));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[SeedMongo Error]', error.message);
    process.exit(1);
  }
}

seedDatabase();
