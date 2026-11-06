import api from './api';
import { getStored, setStored, STORAGE_KEYS } from './storage';

export const customerService = {
  async getAll({ search = '', status = '' } = {}) {
    try {
      const res = await api.get('/customers', { params: { search, status } });
      if (res && res.customers) {
        setStored(STORAGE_KEYS.CUSTOMERS, res.customers);
        return res.customers;
      }
    } catch (err) {
      console.warn('[CustomerService] Backend offline, fetching locally:', err.message);
    }

    let customers = getStored(STORAGE_KEYS.CUSTOMERS, []);

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }

    if (status) {
      customers = customers.filter((c) => c.status === status);
    }

    return customers;
  },

  async getById(id) {
    try {
      const res = await api.get(`/customers/${id}`);
      if (res && res.customer) return res.customer;
    } catch (err) {
      console.warn('[CustomerService] Fetch customer failed locally:', err.message);
    }

    const customers = getStored(STORAGE_KEYS.CUSTOMERS, []);
    const orders = getStored(STORAGE_KEYS.ORDERS, []);
    const customer = customers.find((c) => Number(c.customer_id) === Number(id));
    if (!customer) throw new Error('Customer not found');

    const customerOrders = orders.filter((o) => o.customer?.id === Number(id));
    return {
      ...customer,
      orders: customerOrders,
    };
  },

  async create(customerData) {
    try {
      const res = await api.post('/customers', customerData);
      if (res && res.customer) {
        const current = getStored(STORAGE_KEYS.CUSTOMERS, []);
        const exists = current.some((c) => Number(c.customer_id) === Number(res.customer.customer_id));
        if (!exists) {
          setStored(STORAGE_KEYS.CUSTOMERS, [res.customer, ...current]);
        }
        return res.customer;
      }
    } catch (err) {
      console.warn('[CustomerService] Create customer API failed, saving locally:', err.message);
    }

    const current = getStored(STORAGE_KEYS.CUSTOMERS, []);
    const newId = current.length > 0 ? Math.max(...current.map((c) => Number(c.customer_id) || 0)) + 1 : 1;
    const newCustomer = {
      customer_id: newId,
      ...customerData,
      registered_at: customerData.registered_at || new Date().toISOString(),
      total_orders: customerData.total_orders || 0,
      total_spent: customerData.total_spent || 0,
      status: customerData.status || 'active',
    };
    setStored(STORAGE_KEYS.CUSTOMERS, [newCustomer, ...current]);
    return newCustomer;
  },
};
