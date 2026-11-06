import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { INITIAL_CATEGORIES } from '../data/initialData.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { resolveCategoryAndType } from '../data/dataStore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_JSON_PATH = path.resolve(__dirname, '../../data/store.json');

async function migrate() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/buyandbye';
  console.log(`[Migration] Connecting to MongoDB: ${uri.replace(/:([^:@]{3})[^:@]*@/, ':***@')} ...`);

  let mongoConnected = false;
  try {
    await mongoose.connect(uri, {
      dbName: 'buyandbye',
      serverSelectionTimeoutMS: 8000,
    });
    mongoConnected = true;
    console.log('[Migration] Connected to MongoDB.');

    // 1. Reset categories collection with new hierarchical structure
    console.log('[Migration] Updating Category collection...');
    await Category.deleteMany({});
    await Category.insertMany(INITIAL_CATEGORIES);
    console.log(`[Migration] Seeded ${INITIAL_CATEGORIES.length} categories.`);

    // 2. Update existing products in MongoDB
    const products = await Product.find({}).lean();
    console.log(`[Migration] Found ${products.length} existing products in MongoDB.`);
    for (const prod of products) {
      const resolved = resolveCategoryAndType(prod);
      await Product.updateOne(
        { product_id: prod.product_id },
        {
          $set: {
            category_id: resolved.category_id,
            category_name: resolved.category_name,
            parent_category_id: resolved.parent_category_id,
            parent_name: resolved.parent_name,
            base: resolved.base,
            type: resolved.type,
            type_id: resolved.type_id,
          },
        }
      );
      console.log(`[Migration] Updated product #${prod.product_id} "${prod.product_name}": Category=${resolved.category_name}(ID:${resolved.category_id}), Type=${resolved.type}(Type-ID:${resolved.type_id}), Parent-ID=${resolved.parent_category_id}`);
    }
  } catch (err) {
    console.warn('[Migration] MongoDB operation notice:', err.message);
  }

  // 3. Update store.json
  try {
    if (fs.existsSync(STORE_JSON_PATH)) {
      const storeData = JSON.parse(fs.readFileSync(STORE_JSON_PATH, 'utf8'));
      storeData.categories = INITIAL_CATEGORIES;
      if (Array.isArray(storeData.products)) {
        storeData.products = storeData.products.map((p) => {
          const resolved = resolveCategoryAndType(p);
          return {
            ...p,
            category_id: resolved.category_id,
            category_name: resolved.category_name,
            parent_category_id: resolved.parent_category_id,
            parent_name: resolved.parent_name,
            base: resolved.base,
            type: resolved.type,
            type_id: resolved.type_id,
          };
        });
      }
      fs.writeFileSync(STORE_JSON_PATH, JSON.stringify(storeData, null, 2), 'utf8');
      console.log('[Migration] Synchronized store.json successfully.');
    }
  } catch (err) {
    console.warn('[Migration] store.json update notice:', err.message);
  }

  if (mongoConnected) {
    await mongoose.disconnect();
  }
  console.log('[Migration] Finished successfully!');
  process.exit(0);
}

migrate();
