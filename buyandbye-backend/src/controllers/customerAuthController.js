import { sendOtpEmail } from '../services/emailService.js';
import { isMongoConnected } from '../config/db.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';

// In-memory OTP storage: email -> { otp, expiresAt }
const otpStore = new Map();

export const customerAuthController = {
  /**
   * Send OTP to customer's email address
   * POST /api/auth/customer/send-otp
   */
  async sendOtp(req, res, next) {
    try {
      const { email } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address (e.g. name@example.com).',
        });
      }

      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store in memory for 10 minutes
      otpStore.set(cleanEmail, {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      // Send the email (or log to dev console)
      const emailResult = await sendOtpEmail(cleanEmail, otp);

      return res.json({
        success: true,
        message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
        email: cleanEmail,
        // Provided for convenient local testing / inspection
        devOtp: otp,
        expiresInSeconds: 600,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify OTP and log in / identify customer
   * POST /api/auth/customer/verify-otp
   */
  async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP verification code are required.',
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanOtp = otp.toString().trim();

      const record = otpStore.get(cleanEmail);

      if (!record) {
        return res.status(400).json({
          success: false,
          message: 'No verification code requested for this email. Please request a new code.',
        });
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(cleanEmail);
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new code.',
        });
      }

      if (record.otp !== cleanOtp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code. Please check your email and try again.',
        });
      }

      // OTP is valid! Consume it
      otpStore.delete(cleanEmail);

      // Check if customer exists in database
      let customer = null;
      let customerOrders = [];

      if (isMongoConnected()) {
        customer = await Customer.findOne({
          email: new RegExp(`^${cleanEmail}$`, 'i'),
        }).lean();

        if (customer) {
          customerOrders = await Order.find({
            $or: [
              { 'customer.id': Number(customer.customer_id) },
              { 'customer.email': new RegExp(`^${cleanEmail}$`, 'i') },
            ],
          })
            .sort({ date: -1 })
            .lean();
        }
      }

      if (customer) {
        return res.json({
          success: true,
          isNewUser: false,
          message: `Welcome back, ${customer.name}!`,
          customer: {
            ...customer,
            orders: customerOrders,
          },
        });
      }

      // Brand new user: email is verified, ready to complete profile
      return res.json({
        success: true,
        isNewUser: true,
        email: cleanEmail,
        message: 'Email verified successfully! Please enter your name to complete your profile.',
      });
    } catch (error) {
      next(error);
    }
  },
};
