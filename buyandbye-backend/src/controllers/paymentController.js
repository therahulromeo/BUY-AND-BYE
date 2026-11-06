import { paymentStore } from '../data/dataStore.js';

export const paymentController = {
  /**
   * Get all payments/transactions
   * GET /api/payments
   */
  async getAll(req, res, next) {
    try {
      const { search = '', status = '', gateway = '' } = req.query;
      const payments = await paymentStore.getAll({ search, status, gateway });
      return res.json({
        success: true,
        count: payments.length,
        payments,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get payment summary statistics
   * GET /api/payments/summary
   */
  async getSummary(req, res, next) {
    try {
      const summary = await paymentStore.getSummary();
      return res.json({
        success: true,
        summary,
      });
    } catch (error) {
      next(error);
    }
  },
};
