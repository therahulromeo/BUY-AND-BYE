import { categoryStore } from '../data/dataStore.js';

export const categoryController = {
  /**
   * Get all categories
   * GET /api/categories
   */
  async getAll(req, res, next) {
    try {
      const { search = '', status = '' } = req.query;
      const categories = await categoryStore.getAll({ search, status });
      return res.json({
        success: true,
        count: categories.length,
        categories,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get category by ID
   * GET /api/categories/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await categoryStore.findById(id);
      if (!category) {
        return res.status(404).json({ success: false, message: `Category with ID ${id} not found.` });
      }
      return res.json({ success: true, category });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create category
   * POST /api/categories
   */
  async create(req, res, next) {
    try {
      const { category_name, parent_category_id, description, status, image } = req.body;

      if (!category_name || !category_name.trim()) {
        return res.status(400).json({ success: false, message: 'category_name is required.' });
      }

      const created = await categoryStore.create({
        category_name,
        parent_category_id,
        description,
        status,
        image,
      });

      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category: created,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update category
   * PUT /api/categories/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await categoryStore.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: `Category with ID ${id} not found.` });
      }
      return res.json({
        success: true,
        message: 'Category updated successfully',
        category: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete category
   * DELETE /api/categories/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await categoryStore.delete(id);
      return res.json({
        success: true,
        message: `Category with ID ${id} deleted successfully.`,
      });
    } catch (error) {
      if (error.message.includes('Cannot delete category')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  },
};
