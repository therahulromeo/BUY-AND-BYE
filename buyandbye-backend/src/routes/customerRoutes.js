import { Router } from 'express';
import { customerController } from '../controllers/customerController.js';

const router = Router();

router.get('/', customerController.getAll);
router.post('/', customerController.create);
router.get('/:id', customerController.getById);

export default router;
