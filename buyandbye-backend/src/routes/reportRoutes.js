import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';

const router = Router();

router.get('/analytics', reportController.getAnalytics);

export default router;
