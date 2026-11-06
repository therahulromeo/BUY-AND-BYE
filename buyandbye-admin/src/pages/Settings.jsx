import { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Store,
  Bell,
  Save,
  ShieldCheck,
} from 'lucide-react';

import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { getStored, setStored, STORAGE_KEYS } from '../services/storage';

const Settings = () => {
  const { admin, updateProfile } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'store' | 'notifications'

  // Admin Profile Form
  const [profileForm, setProfileForm] = useState({
    name: admin?.name || 'Vignesh "Vicky" Kumar',
    username: admin?.username || 'Vicky',
    email: admin?.email || 'vicky@buyandbye.com',
    avatar: admin?.avatar || '',
    role: admin?.role || 'Super Administrator',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Store Settings Form
  const [storeForm, setStoreForm] = useState({
    storeName: 'BuyAndBye',
    supportEmail: 'support@buyandbye.com',
    phone: '+91 800 289 293',
    currency: 'INR',
    taxRate: '5.0',
    lowStockThreshold: '10',
  });
  const [storeSaving, setStoreSaving] = useState(false);

  // Notifications Form
  const [notifPreferences, setNotifPreferences] = useState({
    orderNotifications: true,
    lowStockAlerts: true,
    dailyReportDigest: false,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // Load persisted store settings
  useEffect(() => {
    const savedSettings = getStored(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      setStoreForm({
        storeName: savedSettings.storeName || 'BuyAndBye',
        supportEmail: savedSettings.supportEmail || 'support@buyandbye.com',
        phone: savedSettings.phone || '+91 800 289 293',
        currency: savedSettings.currency || 'INR',
        taxRate: String(savedSettings.taxRate || '5.0'),
        lowStockThreshold: String(savedSettings.lowStockThreshold || '10'),
      });
      setNotifPreferences({
        orderNotifications: savedSettings.orderNotifications ?? true,
        lowStockAlerts: savedSettings.lowStockAlerts ?? true,
        dailyReportDigest: savedSettings.dailyReportDigest ?? false,
      });
    }
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile(profileForm);
      toast.success('Administrator profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setPasswordSaving(true);
    try {
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      toast.success('Your administrator password has been updated');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleStoreSubmit = (e) => {
    e.preventDefault();
    setStoreSaving(true);
    try {
      const current = getStored(STORAGE_KEYS.SETTINGS) || {};
      const updated = {
        ...current,
        ...storeForm,
        taxRate: parseFloat(storeForm.taxRate) || 5.0,
        lowStockThreshold: parseInt(storeForm.lowStockThreshold, 10) || 10,
      };
      setStored(STORAGE_KEYS.SETTINGS, updated);
      toast.success('Store configuration saved successfully');
    } catch (err) {
      toast.error('Failed to save store settings');
    } finally {
      setStoreSaving(false);
    }
  };

  const handleNotifSubmit = (e) => {
    e.preventDefault();
    setNotifSaving(true);
    try {
      const current = getStored(STORAGE_KEYS.SETTINGS) || {};
      const updated = { ...current, ...notifPreferences };
      setStored(STORAGE_KEYS.SETTINGS, updated);
      toast.success('Notification preferences updated');
    } catch (err) {
      toast.error('Failed to update notification settings');
    } finally {
      setNotifSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'password', label: 'Security & Password', icon: Lock },
    { id: 'store', label: 'Store Information', icon: Store },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
  ];

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage administrator credentials, security access, store configurations, and notification alerts"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: 'var(--spacing-6)',
        }}
        className="settings-layout"
      >
        {/* Navigation Sidebar */}
        <div className="admin-card" style={{ padding: 'var(--spacing-3)', height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-3)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 'var(--font-size-sm)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Tab Panels */}
        <div className="admin-card">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="admin-card-body">
              <h3 style={{ marginBottom: 'var(--spacing-1)' }}>Administrator Profile</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>
                Personal administrator information and display identity in BuyAndBye Admin
              </p>

              <form onSubmit={handleProfileSubmit}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
                  <img
                    src={profileForm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="Admin Avatar"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--color-primary)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Avatar Image URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Access Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.role}
                      disabled
                      style={{ backgroundColor: 'var(--color-bg-subtle)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-4)' }}>
                  <Button type="submit" variant="primary" icon={Save} loading={profileSaving}>
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="admin-card-body">
              <h3 style={{ marginBottom: 'var(--spacing-1)' }}>Change Password</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>
                Ensure your administrator account uses a robust, secure password
              </p>

              <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '480px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Current Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password (e.g. admin123)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    New Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Confirm New Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 'var(--spacing-4)' }}>
                  <Button type="submit" variant="primary" icon={ShieldCheck} loading={passwordSaving}>
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Store Information Tab */}
          {activeTab === 'store' && (
            <div className="admin-card-body">
              <h3 style={{ marginBottom: 'var(--spacing-1)' }}>Store & Catalog Configuration</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>
                General store credentials, customer support details, currency, and tax parameters
              </p>

              <form onSubmit={handleStoreSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">E-Commerce Brand Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={storeForm.storeName}
                      onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Support Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={storeForm.supportEmail}
                      onChange={(e) => setStoreForm({ ...storeForm, supportEmail: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Default Currency</label>
                    <select
                      className="form-select"
                      value={storeForm.currency}
                      onChange={(e) => setStoreForm({ ...storeForm, currency: e.target.value })}
                    >
                      <option value="INR">Indian Rupee (₹ INR)</option>
                      <option value="USD">US Dollar ($ USD)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Standard GST / Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="form-input"
                      value={storeForm.taxRate}
                      onChange={(e) => setStoreForm({ ...storeForm, taxRate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ maxWidth: '300px' }}>
                  <label className="form-label">Default Low-Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={storeForm.lowStockThreshold}
                    onChange={(e) => setStoreForm({ ...storeForm, lowStockThreshold: e.target.value })}
                  />
                  <span className="form-hint">Products falling below this quantity trigger dashboard warnings</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-4)' }}>
                  <Button type="submit" variant="primary" icon={Save} loading={storeSaving}>
                    Save Store Settings
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="admin-card-body">
              <h3 style={{ marginBottom: 'var(--spacing-1)' }}>Notification Preferences</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>
                Configure real-time in-app alerts and administrative digest reports
              </p>

              <form onSubmit={handleNotifSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--spacing-3)',
                      padding: 'var(--spacing-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-default)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={notifPreferences.orderNotifications}
                      onChange={(e) =>
                        setNotifPreferences({ ...notifPreferences, orderNotifications: e.target.checked })
                      }
                      style={{ marginTop: '3px', accentColor: 'var(--color-primary)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                        Instant Order Alerts
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        Receive topbar notifications immediately when a customer submits a new order
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--spacing-3)',
                      padding: 'var(--spacing-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-default)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={notifPreferences.lowStockAlerts}
                      onChange={(e) =>
                        setNotifPreferences({ ...notifPreferences, lowStockAlerts: e.target.checked })
                      }
                      style={{ marginTop: '3px', accentColor: 'var(--color-primary)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                        Low Inventory Warnings
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        Alert administrator when stock levels fall below safety thresholds
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--spacing-3)',
                      padding: 'var(--spacing-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-default)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={notifPreferences.dailyReportDigest}
                      onChange={(e) =>
                        setNotifPreferences({ ...notifPreferences, dailyReportDigest: e.target.checked })
                      }
                      style={{ marginTop: '3px', accentColor: 'var(--color-primary)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                        Daily Performance Digest
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        Compile daily summary of settled revenue, top products, and fulfillment velocity
                      </div>
                    </div>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-6)' }}>
                  <Button type="submit" variant="primary" icon={Save} loading={notifSaving}>
                    Save Preferences
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .settings-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
