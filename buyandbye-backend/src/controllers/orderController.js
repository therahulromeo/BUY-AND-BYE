import { orderStore } from '../data/dataStore.js';
import { sendOrderStatusEmail } from '../services/emailService.js';

export const orderController = {
  /**
   * Get all orders
   * GET /api/orders
   */
  async getAll(req, res, next) {
    try {
      const {
        search = '',
        status = '',
        paymentStatus = '',
        sortBy = 'date',
        sortOrder = 'desc',
        email = '',
        phone = '',
        customerId = '',
      } = req.query;

      const orders = await orderStore.getAll({
        search,
        status,
        paymentStatus,
        sortBy,
        sortOrder,
        email,
        phone,
        customerId,
      });

      return res.json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get order by ID
   * GET /api/orders/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderStore.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: `Order with ID ${id} not found.` });
      }
      return res.json({ success: true, order });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new order
   * POST /api/orders
   */
  async create(req, res, next) {
    try {
      const { items, total_amount } = req.body;
      if (!items || !items.length) {
        return res.status(400).json({ success: false, message: 'Order items are required.' });
      }

      const newOrder = await orderStore.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: newOrder,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update order status
   * PATCH /api/orders/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Order status is required.' });
      }

      const updated = await orderStore.updateStatus(id, status);
      if (!updated) {
        return res.status(404).json({ success: false, message: `Order with ID ${id} not found.` });
      }

      // Notify customer via nodemailer email
      const customerEmail = updated.customer?.email;
      if (customerEmail && customerEmail.includes('@')) {
        try {
          await sendOrderStatusEmail(customerEmail, updated, status);
        } catch (emailErr) {
          console.warn(`[OrderController] Could not send status update email to ${customerEmail}:`, emailErr.message);
        }
      }

      return res.json({
        success: true,
        message: `Order ${id} status updated to ${status}`,
        order: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get dashboard order statistics summary
   * GET /api/orders/stats/summary
   */
  async getStats(req, res, next) {
    try {
      const stats = await orderStore.getStats();
      return res.json({
        success: true,
        stats,
      });
    } catch (error) {
      next(error);
    }
  },
};
