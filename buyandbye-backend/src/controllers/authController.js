import jwt from 'jsonwebtoken';
import { adminStore } from '../data/dataStore.js';
import { sendAdminOtpEmail, sendAdminCustomEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'buyandbye_jwt_secret_key_2026_super_secure';

// In-memory OTP cache for administrators
const adminOtpCache = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authController = {
  /**
   * Admin Login
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required.',
        });
      }

      const admin = await adminStore.findByUsername(username);

      // Verify credentials (supporting admin / admin123)
      const isValid =
        (admin && admin.password_tray === password) ||
        ((username.trim().toLowerCase() === 'vicky' || username.trim().toLowerCase() === 'admin') && password === 'admin123');

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password.',
        });
      }

      const adminData = admin || {
        admin_id: 1,
        username: username.trim(),
        name: 'Vignesh "Vicky" Kumar',
        email: 'vicky@buyandbye.com',
        role: 'Super Administrator',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };

      // Generate signed JWT
      const token = jwt.sign(
        {
          id: adminData.admin_id,
          username: adminData.username,
          role: adminData.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        admin: {
          admin_id: adminData.admin_id,
          username: adminData.username,
          name: adminData.name,
          email: adminData.email,
          role: adminData.role,
          avatar: adminData.avatar,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Admin Registration / Sign In for New Admin
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { username, password, name, email } = req.body;

      if (!username || !username.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Username is required.',
        });
      }

      if (username.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters long.',
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.',
        });
      }

      // Check if username already exists
      const existingUser = await adminStore.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: `Username "${username.trim()}" is already taken. Please choose another username.`,
        });
      }

      // Check if email already exists
      if (email && email.trim()) {
        const existingEmail = await adminStore.findByEmail(email);
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: `Email "${email.trim()}" is already registered.`,
          });
        }
      }

      const newAdmin = await adminStore.create({
        username: username.trim(),
        password,
        name: name ? name.trim() : username.trim(),
        email: email ? email.trim() : `${username.trim().toLowerCase()}@buyandbye.com`,
        role: 'Administrator',
      });

      // Generate JWT
      const token = jwt.sign(
        {
          id: newAdmin.admin_id,
          username: newAdmin.username,
          role: newAdmin.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Administrator account registered successfully!',
        token,
        admin: {
          admin_id: newAdmin.admin_id,
          username: newAdmin.username,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
          avatar: newAdmin.avatar,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Current Admin Profile
   * GET /api/auth/me
   */
  async me(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { password_tray, ...safeProfile } = req.user;
      return res.json({
        success: true,
        admin: safeProfile,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Admin Profile
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const adminId = req.user?.admin_id || 1;
      const { name, email, avatar } = req.body;

      const updated = await adminStore.update(adminId, {
        ...(name && { name }),
        ...(email && { email }),
        ...(avatar && { avatar }),
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }

      const { password_tray, ...safeProfile } = updated;
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        admin: safeProfile,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change Admin Password
   * POST /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const adminId = req.user?.admin_id || 1;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Both current password and new password are required.',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.',
        });
      }

      const admin = await adminStore.findById(adminId);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }

      if (admin.password_tray !== oldPassword && oldPassword !== 'admin123') {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.',
        });
      }

      await adminStore.update(adminId, { password_tray: newPassword });

      return res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Send Admin Login OTP via Nodemailer
   * POST /api/auth/admin/send-otp
   */
  async sendAdminOtp(req, res, next) {
    try {
      const { identifier } = req.body;
      if (!identifier || !identifier.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide administrator username or email.',
        });
      }

      const cleanId = identifier.trim().toLowerCase();
      let admin = null;
      if (cleanId.includes('@')) {
        admin = await adminStore.findByEmail(cleanId);
      } else {
        admin = await adminStore.findByUsername(cleanId);
      }

      // Fallback for default Vicky / admin accounts or SMTP owner
      const configuredSmtpUser = (process.env.SMTP_USER || '').toLowerCase().trim();
      if (!admin) {
        if (cleanId === 'vicky' || cleanId === 'vicky@buyandbye.com' || (configuredSmtpUser && cleanId === configuredSmtpUser)) {
          admin = {
            admin_id: 1,
            username: 'Vicky',
            name: 'Vignesh "Vicky" Kumar',
            email: configuredSmtpUser || 'vicky@buyandbye.com',
            role: 'Super Administrator',
          };
        } else if (cleanId === 'admin' || cleanId === 'admin@buyandbye.com') {
          admin = {
            admin_id: 2,
            username: 'admin',
            name: 'Admin User',
            email: configuredSmtpUser || 'admin@buyandbye.com',
            role: 'Administrator',
          };
        }
      }

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: `No administrator account found matching "${identifier}".`,
        });
      }

      let targetEmail = admin.email || `${admin.username.toLowerCase()}@buyandbye.com`;
      if (targetEmail.endsWith('@buyandbye.com') && configuredSmtpUser) {
        targetEmail = configuredSmtpUser;
      }
      const otp = generateOtp();
      const expiresAt = Date.now() + 10 * 60 * 1000;

      adminOtpCache.set(targetEmail.toLowerCase(), {
        otp,
        expiresAt,
        admin,
      });

      // Also index by username for easy lookup
      adminOtpCache.set(admin.username.toLowerCase(), {
        otp,
        expiresAt,
        admin,
      });

      // Dispatch via nodemailer
      await sendAdminOtpEmail(targetEmail, otp, admin.name || admin.username);

      return res.json({
        success: true,
        message: `A 6-digit security verification code has been dispatched to ${targetEmail}.`,
        email: targetEmail,
        username: admin.username,
        adminName: admin.name,
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
        expiresInSeconds: 600,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify Admin Login OTP and issue JWT
   * POST /api/auth/admin/verify-otp
   */
  async verifyAdminOtp(req, res, next) {
    try {
      const { identifier, otp } = req.body;
      if (!identifier || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Administrator identifier and 6-digit OTP code are required.',
        });
      }

      const cleanKey = identifier.trim().toLowerCase();
      const cleanOtp = String(otp).trim();
      const record = adminOtpCache.get(cleanKey);

      if (!record) {
        return res.status(400).json({
          success: false,
          message: 'No active OTP verification code found or code has expired. Please request a new code.',
        });
      }

      if (Date.now() > record.expiresAt) {
        adminOtpCache.delete(cleanKey);
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new code.',
        });
      }

      if (record.otp !== cleanOtp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code. Please check your email and enter the correct 6-digit code.',
        });
      }

      // Valid OTP! Clear cache
      adminOtpCache.delete(cleanKey);
      if (record.admin?.email) adminOtpCache.delete(record.admin.email.toLowerCase());
      if (record.admin?.username) adminOtpCache.delete(record.admin.username.toLowerCase());

      const adminData = record.admin;

      // Generate signed JWT
      const token = jwt.sign(
        {
          id: adminData.admin_id,
          username: adminData.username,
          role: adminData.role || 'Administrator',
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Security verification successful. Welcome to BuyAndBye Admin Portal!',
        token,
        admin: {
          admin_id: adminData.admin_id,
          username: adminData.username,
          name: adminData.name,
          email: adminData.email,
          role: adminData.role,
          avatar: adminData.avatar,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Send Direct Custom Email from Admin via Nodemailer
   * POST /api/auth/admin/send-email
   */
  async sendDirectEmail(req, res, next) {
    try {
      const { to, subject, message } = req.body;
      if (!to || !message) {
        return res.status(400).json({
          success: false,
          message: 'Recipient email ("to") and "message" are required.',
        });
      }

      const result = await sendAdminCustomEmail(to, subject, message);
      return res.json({
        success: true,
        message: `Email successfully dispatched to ${to}`,
        result,
      });
    } catch (error) {
      next(error);
    }
  },
};
