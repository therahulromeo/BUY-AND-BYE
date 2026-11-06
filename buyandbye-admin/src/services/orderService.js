import api from './api';
import { getStored, setStored, STORAGE_KEYS } from './storage';

export const orderService = {
  /**
   * Get all orders with optional search and filters from MongoDB
   */
  async getAll({
    search = '',
    status = '',
    paymentStatus = '',
    sortBy = 'date',
    sortOrder = 'desc',
  } = {}) {
    try {
      const res = await api.get('/orders', {
        params: { search, status, paymentStatus, sortBy, sortOrder },
      });
      if (res && res.orders) {
        setStored(STORAGE_KEYS.ORDERS, res.orders);
        return res.orders;
      }
    } catch (err) {
      console.warn('[OrderService] Backend offline, fetching orders locally:', err.message);
    }

    let orders = getStored(STORAGE_KEYS.ORDERS, []);

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      orders = orders.filter(
        (o) =>
          o.order_id.toLowerCase().includes(q) ||
          o.customer?.name?.toLowerCase().includes(q) ||
          o.customer?.email?.toLowerCase().includes(q) ||
          (o.tracking_number && o.tracking_number.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'all') {
      orders = orders.filter((o) => o.order_status?.toLowerCase() === status.toLowerCase());
    }

    if (paymentStatus && paymentStatus !== 'all') {
      orders = orders.filter((o) => o.payment_status?.toLowerCase() === paymentStatus.toLowerCase());
    }

    orders.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortBy === 'total') {
        return sortOrder === 'asc' ? a.total_amount - b.total_amount : b.total_amount - a.total_amount;
      }
      return 0;
    });

    return orders;
  },

  /**
   * Get single order by ID
   */
  async getById(id) {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res && res.order) return res.order;
    } catch (err) {
      console.warn('[OrderService] Fetch order failed locally:', err.message);
    }

    const orders = getStored(STORAGE_KEYS.ORDERS, []);
    const order = orders.find((o) => o.order_id === id);
    if (!order) throw new Error(`Order ${id} not found.`);
    return order;
  },

  /**
   * Update order status in MongoDB
   */
  async updateStatus(id, newStatus) {
    try {
      const res = await api.patch(`/orders/${id}/status`, { status: newStatus });
      if (res && res.order) {
        const orders = getStored(STORAGE_KEYS.ORDERS, []);
        const idx = orders.findIndex((o) => o.order_id === id);
        if (idx !== -1) {
          orders[idx] = res.order;
          setStored(STORAGE_KEYS.ORDERS, orders);
        }
        return res.order;
      }
    } catch (err) {
      if (!err.message?.includes('Unable to connect')) throw err;
    }

    const orders = getStored(STORAGE_KEYS.ORDERS, []);
    const index = orders.findIndex((o) => o.order_id === id);
    if (index === -1) throw new Error('Order not found');

    orders[index].order_status = newStatus;
    if (newStatus === 'Delivered') {
      orders[index].payment_status = 'Paid';
    }
    setStored(STORAGE_KEYS.ORDERS, orders);
    return orders[index];
  },

  /**
   * Get dashboard summary statistics from MongoDB
   */
  async getStats() {
    try {
      const res = await api.get('/orders/stats/summary');
      if (res && res.stats) return res.stats;
    } catch (err) {
      console.warn('[OrderService] Fetch stats failed, calculating locally:', err.message);
    }

    const orders = getStored(STORAGE_KEYS.ORDERS, []);
    const products = getStored(STORAGE_KEYS.PRODUCTS, []);
    const customers = getStored(STORAGE_KEYS.CUSTOMERS, []);

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
