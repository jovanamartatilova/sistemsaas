import { create } from 'zustand';
import { authService } from '../api/authService';

const initialState = {
  company: (() => { try { return JSON.parse(localStorage.getItem('company')) || null; } catch { return null; } })(),
  user: (() => { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } })(),
  candidate_profile: (() => { try { return JSON.parse(localStorage.getItem('candidate_profile')) || null; } catch { return null; } })(),
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  loading: false,
  error: null,
};

export const useAuthStore = create((set) => ({
  ...initialState,

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
          console.warn('Silent logout error:', error);
      } finally {
          // Clear all auth-related localStorage keys
          const keysToRemove = [
            'auth_token',
            'hr_token',
            'company',
            'user',
            'candidate_profile',
            'candidate_user',
            'user_type',
            'is_new_user'
          ];
          
          keysToRemove.forEach(key => {
            localStorage.removeItem(key);
          });
          
          set({
              company: null,
              user: null,
              candidate_profile: null,
              token: null,
              isAuthenticated: false,
              loading: false,
              error: null,
          });
      }
  },

  // Logout tanpa call API (untuk auto-logout)
logoutSilent: () => {
  const keysToRemove = [
    'auth_token', 'hr_token', 'company', 'user',
    'candidate_profile', 'candidate_user', 'user_type', 'is_new_user'
  ];
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  set({
    company: null,
    user: null,
    candidate_profile: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  });
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

  // Set user data manually
  setUser: (userData) => {
    const currentUser = useAuthStore.getState().user;
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  // Hydrate store from localStorage (call on app boot)
  hydrateFromStorage: () => {
    try {
      const token = localStorage.getItem('auth_token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const company = JSON.parse(localStorage.getItem('company') || 'null');
      const candidate_profile = JSON.parse(localStorage.getItem('candidate_profile') || 'null');
      
      set({
        token: token || null,
        user: user || null,
        company: company || null,
        candidate_profile: candidate_profile || null,
        isAuthenticated: !!token,
      });
    } catch (error) {
      console.error('Failed to hydrate auth store:', error);
    }
  },

  // Get current role for routing decisions (never null fallback)
  getRoleForRouting: () => {
    const state = useAuthStore.getState();
    const role = state.user?.role || localStorage.getItem('user_type');
    // Return role as-is; if null/empty, it means user has no role
    return role || null;
  },

  // Set auth data after registration/login (comprehensive)
  setAuthData: (data) => {
    if (!data.token) throw new Error('Token required');
    
    localStorage.setItem('auth_token', data.token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    if (data.company) localStorage.setItem('company', JSON.stringify(data.company));
    if (data.candidate_profile) localStorage.setItem('candidate_profile', JSON.stringify(data.candidate_profile));
    if (data.role || data.user?.role) localStorage.setItem('user_type', data.role || data.user?.role);
    
    set({
      token: data.token,
      user: data.user || null,
      company: data.company || null,
      candidate_profile: data.candidate_profile || null,
      isAuthenticated: true,
    });
  },
}));