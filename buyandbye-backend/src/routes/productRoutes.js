import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Stock logs endpoint (must be before :id)
router.get('/stock/logs', productController.getStockLogs);

// Product CRUD endpoints
router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', optionalAuth, productController.create);
router.put('/:id', optionalAuth, productController.update);
router.delete('/:id', optionalAuth, productController.delete);

// Inventory stock adjustment
router.post('/:id/adjust-stock', optionalAuth, productController.adjustStock);

export default router;
