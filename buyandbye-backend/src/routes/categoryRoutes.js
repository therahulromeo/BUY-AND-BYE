import { Router } from 'express';
import { categoryController } from '../controllers/categoryController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', optionalAuth, categoryController.create);
router.put('/:id', optionalAuth, categoryController.update);
router.delete('/:id', optionalAuth, categoryController.delete);

export default router;
