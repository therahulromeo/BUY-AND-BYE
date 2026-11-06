import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';

const router = Router();

router.get('/summary', paymentController.getSummary);
router.get('/', paymentController.getAll);

export default router;
