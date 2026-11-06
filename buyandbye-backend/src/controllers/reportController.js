import { reportStore } from '../data/dataStore.js';

export const reportController = {
  /**
   * Get dashboard analytics & charts data
   * GET /api/reports/analytics
   */
  async getAnalytics(req, res, next) {
    try {
      const analytics = await reportStore.getAnalytics();
      return res.json({
        success: true,
        analytics,
      });
    } catch (error) {
      next(error);
    }
  },
};
