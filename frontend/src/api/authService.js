import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service methods
export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('company', JSON.stringify(response.data.company));
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (name, password) => {
    try {
      const response = await api.post('/login', { name, password });
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('company', JSON.stringify(response.data.company));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('company');
        localStorage.removeItem('user');
        localStorage.removeItem('candidate_user');
        return;
      }

      await api.post('/logout');
    } catch (error) {
      // If 401, session already expired - that's ok, just clear locally
      if (error.response?.status === 401) {
        console.log('Session already expired on server');
      } else {
        console.error('Logout error:', error.message);
      }
    } finally {
      // Always clear localStorage regardless of endpoint success/failure
      localStorage.removeItem('auth_token');
      localStorage.removeItem('company');
      localStorage.removeItem('user');
      localStorage.removeItem('candidate_user');
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if token still valid
  checkAuth: async () => {
    try {
      const response = await api.get('/profile');
      return { authenticated: true, company: response.data.company };
    } catch (error) {
      return { authenticated: false, company: null };
    }
  },
};

export default api;