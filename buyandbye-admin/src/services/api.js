import axios from 'axios';

/**
 * Base Axios instance for BuyAndBye Admin REST API
 * Configured to connect with the Java Spring Boot backend
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: Attach JWT authentication token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('buyandbye_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Uniform error handling and token expiration detection
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server returned an error code
      if (error.response.status === 401) {
        // Unauthorized - session expired
        localStorage.removeItem('buyandbye_token');
        localStorage.removeItem('buyandbye_admin');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
      const message = error.response.data?.message || error.response.data?.error || 'A server error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Network error / backend not running
      return Promise.reject(new Error('Unable to connect to BuyAndBye server. Running in mock/offline mode.'));
    }
    return Promise.reject(error);
  }
);

export default api;
