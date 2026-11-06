import api from './api';
import { getStored, setStored, STORAGE_KEYS } from './storage';

export const paymentService = {
  async getAll({ search = '', status = '', gateway = '' } = {}) {
    try {
      const res = await api.get('/payments', { params: { search, status, gateway } });
      if (res && res.payments) {
        setStored(STORAGE_KEYS.PAYMENTS, res.payments);
        return res.payments;
      }
    } catch (err) {
      console.warn('[PaymentService] Backend offline, fetching locally:', err.message);
    }

    let payments = getStored(STORAGE_KEYS.PAYMENTS, []);

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      payments = payments.filter(
        (p) =>
          p.transaction_id.toLowerCase().includes(q) ||
          p.order_id.toLowerCase().includes(q) ||
          p.customer_name.toLowerCase().includes(q) ||
          p.reference_no.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all') {
      payments = payments.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    }

    if (gateway && gateway !== 'all') {
      payments = payments.filter((p) => p.gateway.toLowerCase() === gateway.toLowerCase());
    }

    return payments;
  },

  async getSummary() {
    try {
      const res = await api.get('/payments/summary');
      if (res && res.summary) return res.summary;
    } catch (err) {
      console.warn('[PaymentService] Fetch summary failed locally:', err.message);
    }

    const payments = getStored(STORAGE_KEYS.PAYMENTS, []);
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
