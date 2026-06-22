import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth_token');
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
        sessionStorage.setItem('auth_token', response.data.token);
        sessionStorage.setItem('company', JSON.stringify(response.data.company));
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
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
        sessionStorage.setItem('auth_token', response.data.token);
        sessionStorage.setItem('company', JSON.stringify(response.data.company));
	if (response.data.user) sessionStorage.setItem('user', JSON.stringify(response.data.user));
	if (response.data.user?.role) sessionStorage.setItem('user_type', response.data.user.role);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('hr_token');
        sessionStorage.removeItem('company');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('candidate_user');
        sessionStorage.removeItem('candidate_profile');
        sessionStorage.removeItem('user_type');
        sessionStorage.removeItem('is_new_user');
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
      // Always clear sessionStorage regardless of endpoint success/failure
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('hr_token');
      sessionStorage.removeItem('company');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('candidate_user');
      sessionStorage.removeItem('candidate_profile');
      sessionStorage.removeItem('user_type');
      sessionStorage.removeItem('is_new_user');
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
