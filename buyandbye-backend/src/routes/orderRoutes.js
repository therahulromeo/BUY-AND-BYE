import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Stats endpoint
router.get('/stats/summary', orderController.getStats);

// Order CRUD endpoints
router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.post('/', orderController.create);
router.patch('/:id/status', optionalAuth, orderController.updateStatus);
router.put('/:id/status', optionalAuth, orderController.updateStatus);

export default router;
