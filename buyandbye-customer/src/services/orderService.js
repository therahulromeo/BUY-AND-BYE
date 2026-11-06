import api from './api';

const LOCAL_ORDERS_KEY = 'buyandbye_orders';
const LAST_ORDER_KEY = 'buyandbye_last_order';

export function matchesUserProfile(order, profile) {
  if (!order || !profile) return false;

  const profEmail = (profile.email || '').trim().toLowerCase();
  const profPhone = (profile.phone || '').replace(/\D/g, '').slice(-10);
  const profName = (profile.name || '').trim().toLowerCase();

  const ordEmail = (order.customer?.email || '').trim().toLowerCase();
  const ordPhone = (order.customer?.phone || '').replace(/\D/g, '').slice(-10);
  const ordName = (order.customer?.name || '').trim().toLowerCase();

  // If email matches
  if (profEmail && ordEmail && profEmail === ordEmail) {
    return true;
  }
  // If phone matches (last 10 digits)
  if (
    profPhone &&
    ordPhone &&
    profPhone.length >= 8 &&
    ordPhone.length >= 8 &&
    (profPhone === ordPhone || ordPhone.includes(profPhone) || profPhone.includes(ordPhone))
  ) {
    return true;
  }
  // If customer ID matches
  if (
    profile.customer_id &&
    order.customer?.id &&
    Number(profile.customer_id) === Number(order.customer.id)
  ) {
    return true;
  }
  // Fallback: If both lack email and phone, compare name
  if (!profEmail && !profPhone && !ordEmail && !ordPhone && profName && ordName && profName === ordName) {
    return true;
  }

  return false;
}

export const orderService = {
  /**
   * Get the most recently placed order for the customer
   */
  getLastOrder() {
    try {
      const saved = localStorage.getItem(LAST_ORDER_KEY);
      if (saved) return JSON.parse(saved);
      const orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
      return orders.length > 0 ? orders[0] : null;
    } catch {
      return null;
    }
  },

  /**
   * Set the most recently placed order
   */
  setLastOrder(order) {
    try {
      if (order) {
        localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      } else {
        localStorage.removeItem(LAST_ORDER_KEY);
      }
    } catch (e) {
      console.warn('[OrderService] setLastOrder error:', e);
    }
  },

  /**
   * Get all locally stored orders
   */
  getLocalOrders() {
    try {
      const orders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
      return Array.isArray(orders) ? orders : [];
    } catch {
      return [];
    }
  },

  /**
   * Get orders belonging STRICTLY to the current logged in customer
   */
  async getUserOrders(userProfile) {
    if (!userProfile) return [];

    let backendOrders = [];
    try {
      const params = new URLSearchParams();
      if (userProfile.email) params.append('email', userProfile.email);
      if (userProfile.phone) params.append('phone', userProfile.phone);
      if (userProfile.customer_id) params.append('customerId', userProfile.customer_id);

      const qs = params.toString();
      const res = await api.get(`/orders${qs ? `?${qs}` : ''}`);
      if (res.success && res.data?.orders) {
        backendOrders = res.data.orders.filter((o) => matchesUserProfile(o, userProfile));
      }
    } catch (e) {
      console.warn('[OrderService] Could not fetch user orders from backend:', e);
    }

    try {
      const localOrders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
      const userLocalOrders = localOrders.filter((o) => matchesUserProfile(o, userProfile));

      const map = new Map();
      userLocalOrders.forEach((o) => {
        if (o?.order_id) map.set(o.order_id, o);
      });
      backendOrders.forEach((o) => {
        if (o?.order_id) map.set(o.order_id, o);
      });

      return Array.from(map.values()).sort(
        (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
      );
    } catch {
      return backendOrders;
    }
  },

  /**
   * Send OTP to customer email for Sign in / Login
   */
  async sendEmailOtp(email) {
    return api.post('/auth/customer/send-otp', { email });
  },

  /**
   * Verify OTP received on customer email
   */
  async verifyEmailOtp(email, otp) {
    return api.post('/auth/customer/verify-otp', { email, otp });
  },

  /**
   * Lookup past customer profile by mobile number or email for instant account login
   */
  async findAccountByQuery(query) {
    const cleanQuery = (query || '').trim().toLowerCase();
    if (!cleanQuery) return null;
    const digitsOnly = cleanQuery.replace(/\D/g, '').slice(-10);

    // 1. Check local storage orders
    try {
      const localOrders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
      for (const ord of localOrders) {
        const oEmail = (ord.customer?.email || '').trim().toLowerCase();
        const oPhone = (ord.customer?.phone || '').replace(/\D/g, '').slice(-10);
        if (
          (cleanQuery.includes('@') && oEmail === cleanQuery) ||
          (digitsOnly.length >= 8 && oPhone === digitsOnly)
        ) {
          return {
            name: ord.customer?.name || '',
            phone: oPhone || digitsOnly,
            email: ord.customer?.email || cleanQuery,
            street: ord.shipping_address?.street || '',
            apartment: ord.shipping_address?.apartment || '',
            city: ord.shipping_address?.city || 'Chennai',
            state: ord.shipping_address?.state || 'Tamil Nadu',
            postal_code: ord.shipping_address?.postal_code || '',
            country: 'India',
            whatsappUpdates: true,
            createdAt: ord.date || new Date().toISOString(),
          };
        }
      }
    } catch (e) {
      console.warn(e);
    }

    // 2. Check backend orders
    try {
      const qs = cleanQuery.includes('@')
        ? `email=${encodeURIComponent(cleanQuery)}`
        : `phone=${encodeURIComponent(digitsOnly)}`;
      const res = await api.get(`/orders?${qs}`);
      if (res.success && res.data?.orders?.length > 0) {
        const ord = res.data.orders[0];
        const oPhone = (ord.customer?.phone || '').replace(/\D/g, '').slice(-10);
        return {
          name: ord.customer?.name || '',
          phone: oPhone || digitsOnly,
          email: ord.customer?.email || cleanQuery,
          street: ord.shipping_address?.street || '',
          apartment: ord.shipping_address?.apartment || '',
          city: ord.shipping_address?.city || 'Chennai',
          state: ord.shipping_address?.state || 'Tamil Nadu',
          postal_code: ord.shipping_address?.postal_code || '',
          country: 'India',
          whatsappUpdates: true,
          createdAt: ord.date || new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn(e);
    }

    return null;
  },

  /**
   * Fallback for backwards compatibility
   */
  async getAllOrders() {
    return this.getLocalOrders();
  },

  /**
   * Place a new customer order
   * Sends POST /api/orders to backend
   * Syncs to both backend database & shared local storage
   */
  async placeOrder(orderPayload) {
    const trackingCode = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `BNB-ORD-${randomSuffix}`;

    const formattedPayload = {
      order_id: generatedId,
      customer: {
        name: orderPayload.customer.name,
        email: orderPayload.customer.email,
        phone: orderPayload.customer.phone,
      },
      date: new Date().toISOString(),
      items: orderPayload.items.map((it) => ({
        product_id: it.product_id,
        name: it.product_name,
        sku: it.sku || `BNB-PRD-${it.product_id}`,
        price: it.price,
        quantity: it.quantity,
        size: it.selectedSize || 'L',
        color: it.selectedColor || 'Standard',
        image: it.image,
      })),
      subtotal: parseFloat(orderPayload.subtotal.toFixed(2)),
      tax: parseFloat(orderPayload.tax.toFixed(2)),
      shipping_fee: parseFloat(orderPayload.shipping_fee.toFixed(2)),
      discount: parseFloat((orderPayload.discount || 0).toFixed(2)),
      total_amount: parseFloat(orderPayload.total_amount.toFixed(2)),
      payment_method: orderPayload.payment_method,
      payment_status: orderPayload.payment_method === 'Cash on Delivery' ? 'Pending' : 'Paid',
      order_status: 'Processing',
      shipping_address: {
        street: orderPayload.shipping_address.street,
        apartment: orderPayload.shipping_address.apartment || '',
        city: orderPayload.shipping_address.city,
        state: orderPayload.shipping_address.state,
        postal_code: orderPayload.shipping_address.postal_code,
        country: 'India',
      },
      tracking_number: trackingCode,
    };

    let backendOrder = null;

    try {
      const res = await api.post('/orders', formattedPayload);
      if (res.success && (res.data?.order || res.data)) {
        backendOrder = res.data.order || res.data;
      }
    } catch (e) {
      console.warn('[OrderService] Could not reach backend server, saving locally:', e);
    }

    const finalOrder = backendOrder || formattedPayload;

    // Sync to localStorage under 'buyandbye_orders' for seamless admin dashboard preview
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
      existing.unshift(finalOrder);
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(existing));
      // Save as latest placed order for instant 0-friction tracking
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(finalOrder));
    } catch (e) {
      console.warn('[OrderService] LocalStorage sync warning:', e);
    }

    return {
      success: true,
      order: finalOrder,
      order_id: finalOrder.order_id,
      tracking_number: finalOrder.tracking_number,
    };
  },

  /**
   * Track order by Order ID, Customer Mobile Number, or Customer Email
   */
  async trackOrder(query) {
    const cleanQuery = (query || '').trim().toLowerCase();
    if (!cleanQuery) return null;

    const digitsOnly = cleanQuery.replace(/\D/g, '');

    const matchesOrder = (o) => {
      if (!o) return false;
      const orderIdMatch = o.order_id?.toLowerCase() === cleanQuery;
      const emailMatch = o.customer?.email?.toLowerCase() === cleanQuery;
      const trackingMatch = o.tracking_number?.toLowerCase() === cleanQuery;
      
      const custPhone = (o.customer?.phone || '').replace(/\D/g, '');
      const phoneMatch = digitsOnly.length >= 8 && custPhone.includes(digitsOnly);

      return orderIdMatch || emailMatch || trackingMatch || phoneMatch;
    };

    // Check backend first
    try {
      const res = await api.get(`/orders`);
      if (res.success && res.data?.orders) {
        const found = res.data.orders.find(matchesOrder);
        if (found) return found;
      }
    } catch (e) {
      console.warn('[OrderService] Backend track error, checking local:', e);
    }

    // Check localStorage
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
      const found = existing.find(matchesOrder);
      if (found) return found;
    } catch (e) {
      console.error(e);
    }

    return null;
  },
};
