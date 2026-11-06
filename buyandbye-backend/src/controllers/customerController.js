import { customerStore } from '../data/dataStore.js';

export const customerController = {
  /**
   * Get all customers
   * GET /api/customers
   */
  async getAll(req, res, next) {
    try {
      const { search = '', status = '' } = req.query;
      const customers = await customerStore.getAll({ search, status });
      return res.json({
        success: true,
        count: customers.length,
        customers,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create or update customer account
   * POST /api/customers
   */
  async create(req, res, next) {
    try {
      const { name, email, phone, city, state, street, apartment, postal_code } = req.body;

      if (!name || (!email && !phone)) {
        return res.status(400).json({
          success: false,
          message: 'Name and either email or phone are required.',
        });
      }

      const customer = await customerStore.createOrUpdate({
        name,
        email,
        phone,
        city: city || 'Chennai',
        state: state || 'Tamil Nadu',
        street,
        apartment,
        postal_code,
        status: 'active',
        registered_at: new Date().toISOString(),
      });

      return res.status(201).json({
        success: true,
        message: 'Customer account registered successfully.',
        customer,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get customer by ID with their order history
   * GET /api/customers/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await customerStore.findById(id);
      if (!customer) {
        return res.status(404).json({ success: false, message: `Customer with ID ${id} not found.` });
      }
      return res.json({ success: true, customer });
    } catch (error) {
      next(error);
    }
  },
};
