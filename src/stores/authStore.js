import { create } from 'zustand';
import { authService } from '../api/authService';

export const useAuthStore = create((set) => ({
  company: JSON.parse(localStorage.getItem('company')) || null,
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

  // Logout
  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
      set({
        company: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
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