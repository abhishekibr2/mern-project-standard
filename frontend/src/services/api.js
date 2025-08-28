import axios from 'axios';
import useAuthStore from '../hooks/useAuthStore';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshAuthToken } = useAuthStore.getState();
        const newToken = await refreshAuthToken();
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  // Set auth token for future requests
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  },

  // Clear auth token
  clearAuthToken: () => {
    delete api.defaults.headers.common.Authorization;
  },

  // Login
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  // Register
  register: (userData) => {
    return api.post('/auth/signup', userData);
  },

  // Logout
  logout: () => {
    return api.post('/auth/logout');
  },

  // Refresh token
  refreshToken: (refreshToken) => {
    return api.post('/auth/refresh-token', { refreshToken });
  },

  // Forgot password
  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: (token, password) => {
    return api.post(`/auth/reset-password/${token}`, { password });
  },

  // Get current user profile
  getProfile: () => {
    return api.get('/users/me');
  },

  // Update user profile
  updateProfile: (profileData) => {
    return api.patch('/users/update-me', profileData);
  },

  // Delete user account
  deleteAccount: () => {
    return api.delete('/users/delete-me');
  },
};

// User API methods
export const userAPI = {
  // Get all users (admin only)
  getUsers: (params = {}) => {
    return api.get('/users', { params });
  },

  // Get user by ID
  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },

  // Create user (admin only)
  createUser: (userData) => {
    return api.post('/users', userData);
  },

  // Update user by ID (admin only)
  updateUser: (id, userData) => {
    return api.patch(`/users/${id}`, userData);
  },

  // Delete user by ID (admin only)
  deleteUser: (id) => {
    return api.delete(`/users/${id}`);
  },

  // Get user statistics
  getUserStats: () => {
    return api.get('/users/stats');
  },
};

// Health check API
export const healthAPI = {
  // Basic health check
  checkHealth: () => {
    return api.get('/health');
  },

  // Detailed health check
  checkDetailedHealth: () => {
    return api.get('/health/detailed');
  },

  // Readiness probe
  checkReadiness: () => {
    return api.get('/health/ready');
  },

  // Liveness probe
  checkLiveness: () => {
    return api.get('/health/live');
  },

  // Get metrics
  getMetrics: () => {
    return api.get('/health/metrics');
  },
};

// Generic API methods
export const genericAPI = {
  // GET request
  get: (url, config = {}) => {
    return api.get(url, config);
  },

  // POST request
  post: (url, data = {}, config = {}) => {
    return api.post(url, data, config);
  },

  // PUT request
  put: (url, data = {}, config = {}) => {
    return api.put(url, data, config);
  },

  // PATCH request
  patch: (url, data = {}, config = {}) => {
    return api.patch(url, data, config);
  },

  // DELETE request
  delete: (url, config = {}) => {
    return api.delete(url, config);
  },
};

export default api;
