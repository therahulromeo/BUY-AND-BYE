import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBasket,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  UserPlus,
  LogIn,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';

const Login = () => {
  const { login, register, sendAdminOtp, verifyAdminOtp, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' (existing admin) or 'register' (new admin)
  const [mode, setMode] = useState('login');

  // Login Method: 'otp' (Nodemailer Email Verification) or 'password'
  const [loginMethod, setLoginMethod] = useState('otp');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Email OTP States (Nodemailer integration)
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Resend OTP countdown effect
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Load remembered username if available
  useEffect(() => {
    const remembered = localStorage.getItem('buyandbye_remember_user');
    if (remembered) {
      setUsername(remembered);
      setOtpIdentifier(remembered);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtpSent(false);
    setOtpCode('');
  };

  const handleChangeIdentifier = () => {
    setOtpSent(false);
    setOtpCode('');
    setDevOtp('');
  };

  const handleSendAdminOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const id = (otpIdentifier || username).trim();
    if (!id) {
      setErrorMessage('Please enter your administrator username or email address.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await sendAdminOtp(id);
      if (res?.success) {
        setOtpSent(true);
        setTargetEmail(res.email || id);
        if (res.devOtp) setDevOtp(res.devOtp);
        setResendTimer(60);
        toast.success(`Verification code dispatched to ${res.email || id}!`, 'Security OTP Sent');
      } else {
        setErrorMessage(res?.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect to authentication server.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAdminOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code sent to your email.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const id = (otpIdentifier || username).trim();
      await verifyAdminOtp(id, cleanOtp, rememberMe);
      toast.success('Administrator identity verified! Welcome to Dashboard.', 'Access Granted');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter your administrator username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your administrator password.');
      return;
    }

    setLoading(true);
    try {
      await login(username, password, rememberMe);
      toast.success('Welcome back to BuyAndBye Admin Portal', 'Authentication Successful');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        rememberMe,
      });
      toast.success('Administrator account created successfully!', 'Account Registered');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 75%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-4)',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Brand Banner */}
        <div
          style={{
            padding: 'var(--spacing-6) var(--spacing-6) var(--spacing-4)',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid var(--color-border-default)',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 16px -2px rgba(37, 99, 235, 0.35)',
              marginBottom: 'var(--spacing-2)',
            }}
          >
            <ShoppingBasket size={26} />
          </div>
          <h1
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Buy<span style={{ color: 'var(--color-primary)' }}>And</span>Bye Admin
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              marginTop: '4px',
              marginBottom: 'var(--spacing-4)',
            }}
          >
            {mode === 'login'
              ? 'Sign in to access your administrative dashboard'
              : 'Create a new administrator account for the portal'}
          </p>

          {/* Segmented Mode Selector */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: '#e2e8f0',
              borderRadius: 'var(--radius-lg)',
              padding: '4px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: mode === 'login' ? 600 : 500,
                backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                boxShadow: mode === 'login' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <LogIn size={15} />
              Existing Admin
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: mode === 'register' ? 600 : 500,
                backgroundColor: mode === 'register' ? '#ffffff' : 'transparent',
                color: mode === 'register' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                boxShadow: mode === 'register' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <UserPlus size={15} />
              New Admin
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div style={{ padding: 'var(--spacing-6)' }}>
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)',
                padding: 'var(--spacing-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger-border)',
                color: 'var(--color-danger-text)',
                fontSize: 'var(--font-size-xs)',
                marginBottom: 'var(--spacing-4)',
              }}
              role="alert"
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* EXISTING ADMIN LOGIN FORM */}
          {mode === 'login' && (
            <div>
              {/* Method Switcher: Email OTP vs Password */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: 'var(--spacing-4)',
                  padding: '4px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    setErrorMessage('');
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: loginMethod === 'otp' ? 700 : 500,
                    backgroundColor: loginMethod === 'otp' ? '#ffffff' : 'transparent',
                    color: loginMethod === 'otp' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    boxShadow: loginMethod === 'otp' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Mail size={13} />
                  Email OTP (Nodemailer)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setErrorMessage('');
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: loginMethod === 'password' ? 700 : 500,
                    backgroundColor: loginMethod === 'password' ? '#ffffff' : 'transparent',
                    color: loginMethod === 'password' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    boxShadow: loginMethod === 'password' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Lock size={13} />
                  Password Sign In
                </button>
              </div>

              {loginMethod === 'otp' ? (
                /* EMAIL OTP VIA NODEMAILER */
                <div>
                  {!otpSent ? (
                    <form onSubmit={handleSendAdminOtp}>
                      <div
                        style={{
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px 14px',
                          marginBottom: 'var(--spacing-4)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                        }}
                      >
                        <ShieldCheck size={20} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.75rem', color: '#1e3a8a', lineHeight: 1.45 }}>
                          <strong>Secure Nodemailer 2-Factor Sign In:</strong> Enter your registered administrator email address or username to receive a 6-digit verification code.
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="otpIdentifier">
                          Admin Email or Username <span className="required">*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Mail
                            size={16}
                            style={{
                              position: 'absolute',
                              left: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: 'var(--color-text-subtle)',
                            }}
                          />
                          <input
                            id="otpIdentifier"
                            type="text"
                            className="form-input"
                            style={{ paddingLeft: '36px' }}
                            value={otpIdentifier || username}
                            onChange={(e) => {
                              setOtpIdentifier(e.target.value);
                              setUsername(e.target.value);
                            }}
                            placeholder="e.g. vicky@buyandbye.com or Vicky"
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={sendingOtp}
                        style={{ width: '100%', marginTop: 'var(--spacing-3)' }}
                        icon={KeyRound}
                      >
                        Send Security OTP
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyAdminOtp}>
                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px 14px',
                          marginBottom: 'var(--spacing-4)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                            Security Code Sent To
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                            {targetEmail}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleChangeIdentifier}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Change
                        </button>
                      </div>

                      {devOtp && (
                        <div
                          onClick={() => setOtpCode(devOtp)}
                          style={{
                            background: '#fef3c7',
                            border: '1px dashed #f59e0b',
                            borderRadius: 'var(--radius-md)',
                            padding: '8px 12px',
                            marginBottom: 'var(--spacing-4)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            color: '#92400e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                          title="Click to auto-fill code"
                        >
                          <span>Demo Security OTP: <strong>{devOtp}</strong></span>
                          <span style={{ textDecoration: 'underline', fontWeight: 700 }}>Click to fill</span>
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label" htmlFor="otpCode">
                          6-Digit Email Verification Code <span className="required">*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <KeyRound
                            size={16}
                            style={{
                              position: 'absolute',
                              left: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: 'var(--color-text-subtle)',
                            }}
                          />
                          <input
                            id="otpCode"
                            type="text"
                            maxLength="6"
                            className="form-input"
                            style={{
                              paddingLeft: '36px',
                              letterSpacing: '4px',
                              textAlign: 'center',
                              fontWeight: 800,
                              fontSize: '1.15rem',
                            }}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={verifyingOtp}
                        disabled={otpCode.length !== 6}
                        style={{ width: '100%', marginTop: 'var(--spacing-3)' }}
                        icon={CheckCircle2}
                      >
                        Verify OTP &amp; Access Dashboard
                      </Button>

                      <div
                        style={{
                          textAlign: 'center',
                          marginTop: 'var(--spacing-3)',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        Didn't receive email code?{' '}
                        {resendTimer > 0 ? (
                          <span style={{ fontWeight: 600 }}>Resend in {resendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendAdminOtp}
                            disabled={sendingOtp}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-primary)',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'underline',
                            }}
                          >
                            Resend Code
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* PASSWORD SIGN IN */
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="username">
                      Username or Admin ID <span className="required">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--color-text-subtle)',
                        }}
                      />
                      <input
                        id="username"
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '36px' }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter admin username"
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="password">
                      Password <span className="required">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--color-text-subtle)',
                        }}
                      />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        style={{ paddingLeft: '36px', paddingRight: '36px' }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter administrator password"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-subtle)',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--spacing-5)',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span>Remember me</span>
                    </label>
                    <span style={{ color: 'var(--color-text-subtle)' }}>Secure Portal</span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    style={{ width: '100%' }}
                    icon={ArrowRight}
                  >
                    Log In to Dashboard
                  </Button>
                </form>
              )}

              <div
                style={{
                  textAlign: 'center',
                  marginTop: 'var(--spacing-4)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                }}
              >
                New administrator?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Create an account
                </button>
              </div>
            </div>
          )}

          {/* NEW ADMIN REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-subtle)',
                    }}
                  />
                  <input
                    id="fullName"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Henderson"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="regUsername">
                  Admin Username <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-subtle)',
                    }}
                  />
                  <input
                    id="regUsername"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a unique username"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Admin Email Address <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-subtle)',
                    }}
                  />
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@buyandbye.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="regPassword">
                  Password <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-subtle)',
                    }}
                  />
                  <input
                    id="regPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '36px', paddingRight: '36px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-subtle)',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-subtle)',
                    }}
                  />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '36px', paddingRight: '36px' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-subtle)',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
                icon={UserPlus}
              >
                Sign In as New Admin
              </Button>

              <div
                style={{
                  textAlign: 'center',
                  marginTop: 'var(--spacing-4)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                }}
              >
                Already have an admin account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Log In here
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 'var(--spacing-3) var(--spacing-6)',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid var(--color-border-default)',
            textAlign: 'center',
            fontSize: '0.6875rem',
            color: 'var(--color-text-subtle)',
          }}
        >
          BuyAndBye E-Commerce &bull; MongoDB Cloud Connected
        </div>
      </div>
    </div>
  );
};

export default Login;
