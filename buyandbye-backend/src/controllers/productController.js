import { productStore } from '../data/dataStore.js';

export const productController = {
  /**
   * Get all products
   * GET /api/products
   */
  async getAll(req, res, next) {
    try {
      const {
        search = '',
        categoryId = '',
        typeId = '',
        type = '',
        base = '',
        status = '',
        sortBy = 'product_id',
        sortOrder = 'desc',
      } = req.query;

      const products = await productStore.getAll({
        search,
        categoryId,
        typeId,
        type,
        base,
        status,
        sortBy,
        sortOrder,
      });

      return res.json({
        success: true,
        count: products.length,
        products,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productStore.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product with ID ${id} not found.` });
      }
      return res.json({ success: true, product });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create product
   * POST /api/products
   */
  async create(req, res, next) {
    try {
      const { product_name, price, category_id } = req.body;

      if (!product_name || !product_name.trim()) {
        return res.status(400).json({ success: false, message: 'product_name is required.' });
      }

      const created = await productStore.create({
        ...req.body,
        adjusted_by: req.user?.username || 'Admin',
      });

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: created,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update product
   * PUT /api/products/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await productStore.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: `Product with ID ${id} not found.` });
      }
      return res.json({
        success: true,
        message: 'Product updated successfully',
        product: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete product
   * DELETE /api/products/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await productStore.delete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: `Product with ID ${id} not found.` });
      }
      return res.json({
        success: true,
        message: `Product with ID ${id} deleted successfully.`,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Adjust product stock and generate audit trail log
   * POST /api/products/:id/adjust-stock
   */
  async adjustStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, type = 'ADD', reason = '' } = req.body;

      if (quantity === undefined || isNaN(Number(quantity))) {
        return res.status(400).json({ success: false, message: 'Valid quantity number is required.' });
      }

      const result = await productStore.adjustStock(id, {
        quantity,
        type,
        reason,
        user: req.user?.username || 'Admin',
      });

      if (!result) {
        return res.status(404).json({ success: false, message: `Product with ID ${id} not found.` });
      }

      return res.json({
        success: true,
        message: 'Stock adjusted successfully',
        product: result.product,
        newStock: result.newStock,
        log: result.logEntry,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get inventory stock adjustment logs
   * GET /api/products/stock/logs
   */
  async getStockLogs(req, res, next) {
    try {
      const logs = await productStore.getStockLogs();
      return res.json({
        success: true,
        count: logs.length,
        logs,
      });
    } catch (error) {
      next(error);
    }
  },
};
