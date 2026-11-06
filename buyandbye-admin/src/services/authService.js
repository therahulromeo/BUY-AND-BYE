import api from './api';
import { getStored, setStored, STORAGE_KEYS } from './storage';

/**
 * Authentication Service for BuyAndBye Admin
 * Connects with Node.js & Express REST API with offline fallback
 */
export const authService = {
  /**
   * Log in existing administrator
   * @param {string} username
   * @param {string} password
   * @param {boolean} rememberMe
   * @returns {Promise<{ admin: object, token: string }>}
   */
  async login(username, password, rememberMe = false) {
    const trimmedUser = (username || '').trim();

    try {
      // Primary: authenticate against Node.js Express & MongoDB backend
      const res = await api.post('/auth/login', {
        username: trimmedUser,
        password,
      });

      if (res && res.token) {
        localStorage.setItem('buyandbye_token', res.token);
        localStorage.setItem('buyandbye_admin_profile', JSON.stringify(res.admin));
        if (rememberMe) {
          localStorage.setItem('buyandbye_remember_user', trimmedUser);
        } else {
          localStorage.removeItem('buyandbye_remember_user');
        }
        return { admin: res.admin, token: res.token };
      }
    } catch (apiError) {
      // Propagate server errors (wrong credentials, validation errors)
      if (apiError.message && !apiError.message.includes('Unable to connect')) {
        throw apiError;
      }
      console.warn('[AuthService] Backend offline, evaluating local credentials fallback');
    }

    // Fallback offline validation
    const admin = getStored(STORAGE_KEYS.ADMIN);
    const isVicky =
      (trimmedUser.toLowerCase() === 'vicky' || trimmedUser.toLowerCase() === 'admin') &&
      (password === 'admin123' || password === 'admin');

    if (!isVicky && password !== admin?.password_tray) {
      throw new Error('Invalid username or password. Please verify your credentials.');
    }

    const token = `fake-jwt-token-${Date.now()}-${Math.random().toString(36).substr(2)}`;
    const adminData = {
      admin_id: admin?.admin_id || 1,
      username: trimmedUser,
      name: admin?.name || 'Vignesh "Vicky" Kumar',
      email: admin?.email || 'vicky@buyandbye.com',
      role: 'Super Administrator',
      avatar:
        admin?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    localStorage.setItem('buyandbye_token', token);
    localStorage.setItem('buyandbye_admin_profile', JSON.stringify(adminData));
    if (rememberMe) {
      localStorage.setItem('buyandbye_remember_user', trimmedUser);
    } else {
      localStorage.removeItem('buyandbye_remember_user');
    }

    return { admin: adminData, token };
  },

  /**
   * Register a new administrator
   * @param {{ name: string, username: string, email: string, password: string, rememberMe?: boolean }} data
   * @returns {Promise<{ admin: object, token: string }>}
   */
  async register({ name, username, email, password, rememberMe = false }) {
    const trimmedUser = (username || '').trim();

    try {
      const res = await api.post('/auth/register', {
        name,
        username: trimmedUser,
        email,
        password,
      });

      if (res && res.token) {
        localStorage.setItem('buyandbye_token', res.token);
        localStorage.setItem('buyandbye_admin_profile', JSON.stringify(res.admin));
        if (rememberMe) {
          localStorage.setItem('buyandbye_remember_user', trimmedUser);
        } else {
          localStorage.removeItem('buyandbye_remember_user');
        }
        return { admin: res.admin, token: res.token };
      }
    } catch (apiError) {
      if (apiError.message && !apiError.message.includes('Unable to connect')) {
        throw apiError;
      }
      console.warn('[AuthService] Backend offline, falling back to local registration');
    }

    // Fallback offline registration
    const token = `fake-jwt-token-${Date.now()}-${Math.random().toString(36).substr(2)}`;
    const adminData = {
      admin_id: Date.now(),
      username: trimmedUser,
      name: name || trimmedUser,
      email: email || `${trimmedUser.toLowerCase()}@buyandbye.com`,
      role: 'Administrator',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    };

    setStored(STORAGE_KEYS.ADMIN, { ...adminData, password_tray: password });
    localStorage.setItem('buyandbye_token', token);
    localStorage.setItem('buyandbye_admin_profile', JSON.stringify(adminData));
    if (rememberMe) {
      localStorage.setItem('buyandbye_remember_user', trimmedUser);
    } else {
      localStorage.removeItem('buyandbye_remember_user');
    }

    return { admin: adminData, token };
  },

  /**
   * Log out administrator
   */
  async logout() {
    localStorage.removeItem('buyandbye_token');
    localStorage.removeItem('buyandbye_admin_profile');
  },

  /**
   * Get current authenticated administrator profile
   */
  getCurrentUser() {
    const raw = localStorage.getItem('buyandbye_admin_profile');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Send Administrator 6-digit OTP via Nodemailer
   * @param {string} identifier (username or email)
   */
  async sendAdminOtp(identifier) {
    const trimmed = (identifier || '').trim();
    try {
      const res = await api.post('/auth/admin/send-otp', { identifier: trimmed });
      return res;
    } catch (err) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw err;
    }
  },

  /**
   * Verify Administrator OTP and authenticate
   * @param {string} identifier
   * @param {string} otp
   * @param {boolean} rememberMe
   */
  async verifyAdminOtp(identifier, otp, rememberMe = false) {
    const trimmedId = (identifier || '').trim();
    const cleanOtp = (otp || '').trim();
    try {
      const res = await api.post('/auth/admin/verify-otp', {
        identifier: trimmedId,
        otp: cleanOtp,
      });

      if (res && res.token) {
        localStorage.setItem('buyandbye_token', res.token);
        localStorage.setItem('buyandbye_admin_profile', JSON.stringify(res.admin));
        if (rememberMe) {
          localStorage.setItem('buyandbye_remember_user', trimmedId);
        } else {
          localStorage.removeItem('buyandbye_remember_user');
        }
        return { admin: res.admin, token: res.token };
      }
      throw new Error(res?.message || 'Verification failed');
    } catch (err) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw err;
    }
  },

  /**
   * Check if administrator has an active session
   */
  isAuthenticated() {
    return !!localStorage.getItem('buyandbye_token');
  },

  /**
   * Update administrator profile details
   */
  async updateProfile(updates) {
    try {
      const res = await api.put('/auth/profile', updates);
      if (res && res.admin) {
        localStorage.setItem('buyandbye_admin_profile', JSON.stringify(res.admin));
        return res.admin;
      }
    } catch {
      // Fallback
    }

    const current = getStored(STORAGE_KEYS.ADMIN);
    const updated = { ...current, ...updates };
    setStored(STORAGE_KEYS.ADMIN, updated);
    localStorage.setItem('buyandbye_admin_profile', JSON.stringify(updated));
    return updated;
  },

  /**
   * Change administrator password
   */
  async changePassword(oldPassword, newPassword) {
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      return true;
    } catch (err) {
      if (!err.message.includes('Unable to connect')) {
        throw err;
      }
    }

    const current = getStored(STORAGE_KEYS.ADMIN);
    if (oldPassword !== current?.password_tray && oldPassword !== 'admin123') {
      throw new Error('Current password does not match.');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }
    current.password_tray = newPassword;
    setStored(STORAGE_KEYS.ADMIN, current);
    return true;
  },
};
