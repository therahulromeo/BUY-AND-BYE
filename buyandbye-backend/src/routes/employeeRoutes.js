import { Router } from 'express';
import { employeeController } from '../controllers/employeeController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', optionalAuth, employeeController.create);
router.put('/:id', optionalAuth, employeeController.update);
router.delete('/:id', optionalAuth, employeeController.delete);

export default router;
