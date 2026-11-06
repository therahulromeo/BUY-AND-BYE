import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncCustomersFromOrders() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in environment');
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: 'buyandbye' });
  console.log('[Sync] Connected to MongoDB');

  const orders = await mongoose.connection.collection('orders').find().sort({ date: 1 }).toArray();
  console.log(`[Sync] Found ${orders.length} orders in database`);

  // Aggregate customers by unique email (or phone/name fallback)
  const customersMap = new Map();

  for (const o of orders) {
    const cust = o.customer || {};
    const email = (cust.email || '').trim().toLowerCase();
    const phone = (cust.phone || '').trim();
    const key = email || phone || (cust.name || 'Unknown');

    const total = Number(o.total_amount) || 0;
    const date = o.date || new Date().toISOString();
    const city = o.shipping_address?.city || 'Chennai';
    const state = o.shipping_address?.state || 'Tamil Nadu';

    if (!customersMap.has(key)) {
      customersMap.set(key, {
        name: cust.name || 'Customer',
        email: email,
        phone: phone,
        city: city,
        state: state,
        total_orders: 1,
        total_spent: total,
        registered_at: date,
        status: 'active',
        order_ids: [o.order_id],
      });
    } else {
      const c = customersMap.get(key);
      c.total_orders += 1;
      c.total_spent += total;
      c.order_ids.push(o.order_id);
      if (new Date(date) < new Date(c.registered_at)) {
        c.registered_at = date;
      }
      if (city && c.city === 'Chennai' && city !== 'Chennai') c.city = city;
      if (state && c.state === 'Tamil Nadu' && state !== 'Tamil Nadu') c.state = state;
    }
  }

  console.log(`[Sync] Extracted ${customersMap.size} unique customers from orders`);

  // Clear existing customers collection
  await mongoose.connection.collection('customers').deleteMany({});

  const customerDocs = [];
  let id = 1;

  for (const [key, data] of customersMap.entries()) {
    const custDoc = {
      customer_id: id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state,
      registered_at: data.registered_at,
      total_orders: data.total_orders,
      total_spent: Math.round(data.total_spent * 100) / 100,
      status: data.status,
      created_at: data.registered_at,
      updated_at: new Date().toISOString(),
    };
    customerDocs.push(custDoc);

    // Update each order with customer.id
    for (const ordId of data.order_ids) {
      await mongoose.connection.collection('orders').updateOne(
        { order_id: ordId },
        { $set: { 'customer.id': id } }
      );
    }

    id++;
  }

  const insertRes = await mongoose.connection.collection('customers').insertMany(customerDocs);
  console.log(`[Sync] Inserted ${insertRes.insertedCount} customers into MongoDB`);

  // Sync to store.json as well
  const storePath = path.resolve(__dirname, '../../data/store.json');
  if (fs.existsSync(storePath)) {
    try {
      const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      storeData.customers = customerDocs;
      storeData.orders = orders.map((o) => {
        const match = customerDocs.find(
          (c) => c.email && o.customer?.email && c.email.toLowerCase() === o.customer.email.toLowerCase()
        );
        return {
          ...o,
          customer: {
            ...o.customer,
            id: match ? match.customer_id : o.customer?.id,
          },
        };
      });
      fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2), 'utf8');
      console.log('[Sync] Updated store.json with synced customers and orders');
    } catch (e) {
      console.warn('[Sync] Warning saving store.json:', e.message);
    }
  }

  console.log('\n--- Synced Customers ---');
  customerDocs.forEach((c) => {
    console.log(
      `CID #${c.customer_id} | ${c.name.padEnd(20)} | ${c.email.padEnd(25)} | ${c.phone.padEnd(16)} | Orders: ${c.total_orders} | Spent: ₹${c.total_spent} | ${c.city}, ${c.state}`
    );
  });

  await mongoose.disconnect();
  console.log('[Sync] Done!');
}

syncCustomersFromOrders().catch((err) => {
  console.error('[Sync] Error:', err);
  process.exit(1);
});
