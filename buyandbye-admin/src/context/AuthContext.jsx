import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { initializeStorage } from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure mock databases are seeded on app load
    initializeStorage();

    const storedToken = localStorage.getItem('buyandbye_token');
    const storedAdmin = authService.getCurrentUser();

    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(storedAdmin);
    }
    setLoading(false);
  }, []);

  const login = async (username, password, rememberMe) => {
    const result = await authService.login(username, password, rememberMe);
    setAdmin(result.admin);
    setToken(result.token);
    return result;
  };

  const register = async (userData) => {
    const result = await authService.register(userData);
    setAdmin(result.admin);
    setToken(result.token);
    return result;
  };

  const sendAdminOtp = async (identifier) => {
    return await authService.sendAdminOtp(identifier);
  };

  const verifyAdminOtp = async (identifier, otp, rememberMe) => {
    const result = await authService.verifyAdminOtp(identifier, otp, rememberMe);
    setAdmin(result.admin);
    setToken(result.token);
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setAdmin(null);
    setToken(null);
  };

  const updateProfile = async (updates) => {
    const updated = await authService.updateProfile(updates);
    setAdmin(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        sendAdminOtp,
        verifyAdminOtp,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
