import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { customerAuthController } from '../controllers/customerAuthController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Customer Email OTP Authentication
router.post('/customer/send-otp', customerAuthController.sendOtp);
router.post('/customer/verify-otp', customerAuthController.verifyOtp);

// Admin Auth
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/signup', authController.register);
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);

// Admin Email OTP Authentication & Nodemailer Dispatch
router.post('/admin/send-otp', authController.sendAdminOtp);
router.post('/admin/verify-otp', authController.verifyAdminOtp);
router.post('/admin/send-email', authenticate, authController.sendDirectEmail);

export default router;
