import { create } from 'zustand';
import { authService } from '../api/authService';

export const useAuthStore = create((set) => ({
  company: JSON.parse(localStorage.getItem('company')) || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  loading: false,
  error: null,

  // Register
  register: async (name, email, password, passwordConfirmation, role) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      });
      set({
        company: response.company,
        token: response.token,
        isAuthenticated: true,
        loading: false,
      });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Login
  login: async (name, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(name, password);
      console.log('LOGIN RESPONSE:', response);
      set({
        company: response.company,
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        loading: false,
      });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Silent logout error (already cleared locally):', error);
    } finally {
      set({
        company: null,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  },

  // Check auth status
  checkAuth: async () => {
    try {
      const result = await authService.checkAuth();
      if (result.authenticated) {
        set({
          company: result.company,
          isAuthenticated: true,
        });
      } else {
        set({
          company: null,
          token: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      set({
        company: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));