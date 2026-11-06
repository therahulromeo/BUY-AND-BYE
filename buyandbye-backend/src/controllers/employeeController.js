import { employeeStore } from '../data/dataStore.js';

export const employeeController = {
  /**
   * Get all employees
   * GET /api/employees
   */
  async getAll(req, res, next) {
    try {
      const employees = await employeeStore.getAll();
      return res.json({
        success: true,
        count: employees.length,
        employees,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get employee by ID
   * GET /api/employees/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await employeeStore.findById(id);
      if (!employee) {
        return res.status(404).json({ success: false, message: `Employee with ID ${id} not found.` });
      }
      return res.json({ success: true, employee });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create employee
   * POST /api/employees
   */
  async create(req, res, next) {
    try {
      const { employee_name, employee_salary, employee_worktype } = req.body;
      if (!employee_name || !employee_salary) {
        return res.status(400).json({
          success: false,
          message: 'employee_name and employee_salary are required.',
        });
      }

      const created = await employeeStore.create({
        employee_name,
        employee_salary,
        employee_worktype,
      });

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        employee: created,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update employee
   * PUT /api/employees/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await employeeStore.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: `Employee with ID ${id} not found.` });
      }
      return res.json({
        success: true,
        message: 'Employee updated successfully',
        employee: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete employee
   * DELETE /api/employees/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await employeeStore.delete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: `Employee with ID ${id} not found.` });
      }
      return res.json({
        success: true,
        message: `Employee with ID ${id} deleted successfully.`,
      });
    } catch (error) {
      next(error);
    }
  },
};
