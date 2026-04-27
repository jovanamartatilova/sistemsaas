import { create } from 'zustand';
import { mentorApi } from '../api/mentorApi';

export const useMentorStore = create((set, get) => ({
  // ─── STATE ─────────────────────────────────────────────────────────────────
  mentor: null,
  dashData: null,
  interns: [],
  stats: null,
  loading: true,
  error: null,
  lastFetchTime: null,
  
  // ─── CACHE TIMING (5 menit = 300000ms) ──────────────────────────────────────
  CACHE_DURATION: 5 * 60 * 1000,

  // ─── CHECK IF CACHE VALID ──────────────────────────────────────────────────
  isCacheValid: () => {
    const state = get();
    if (!state.lastFetchTime) return false;
    const elapsed = Date.now() - state.lastFetchTime;
    return elapsed < state.CACHE_DURATION;
  },

  // ─── FETCH DASHBOARD DATA ──────────────────────────────────────────────────
  fetchDashboard: async (forceRefresh = false) => {
    const state = get();
    
    // Jika cache masih valid dan tidak force refresh, pakai cache
    if (!forceRefresh && state.isCacheValid() && state.mentor && state.dashData) {
      console.log('[MentorStore] Using cached data');
      return;
    }

    try {
      set({ loading: true, error: null });
      
        const [profileRes, dashRes, internsRes, recapRes] = await Promise.all([
          mentorApi.getProfile(),
          mentorApi.getDashboard(),
          mentorApi.getInterns(''),
          mentorApi.getScoreRecap(''),
        ]);

        set({
          mentor: profileRes.data,
          dashData: dashRes.data,
          interns: internsRes.data,
          recapInterns: recapRes.data.recap || [],
          lastFetchTime: Date.now(),
          loading: false,
        });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      
      let errorMsg = 'Failed to load dashboard';
      if (error.response?.status === 403) {
        errorMsg = 'Unauthorized - You must be a mentor to access this page';
      } else if (error.response?.status === 401) {
        errorMsg = 'Session expired - Please login again';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }
      
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // ─── BACKGROUND FETCH (untuk window focus) ────────────────────────────────
  // Fetch tanpa set loading state (silent update di background)
  backgroundFetchDashboard: async () => {
    const state = get();
    
    // Jika cache masih valid, skip background fetch
    if (state.isCacheValid()) {
      console.log('[MentorStore] Cache still valid, skipping background fetch');
      return;
    }
    
    console.log('[MentorStore] Cache invalid, doing background fetch without loading state');
    
    try {
      const [profileRes, dashRes, internsRes, recapRes] = await Promise.all([
      mentorApi.getProfile(),
      mentorApi.getDashboard(),
      mentorApi.getInterns(''),
      mentorApi.getScoreRecap(''),
    ]);

    set({
      mentor: profileRes.data,
      dashData: dashRes.data,
      interns: internsRes.data,
      recapInterns: recapRes.data.recap || [],
      lastFetchTime: Date.now(),
      loading: false,
    });
      console.log('[MentorStore] Background fetch completed');
    } catch (error) {
      console.error('Background fetch error:', error);
      // Silently fail - jangan update error state
    }
  },

  // ─── FETCH INTERNS (with search) ──────────────────────────────────────────
  fetchInterns: async (search = '', forceRefresh = false) => {
    try {
      const res = await mentorApi.getInterns(search);
      set({ interns: res.data });
    } catch (error) {
      console.error('Error fetching interns:', error);
      throw error;
    }
  },

  // ─── CALCULATE STATS (untuk InternsMentor) ─────────────────────────────────
  calculateStats: (internsList) => {
    const total = internsList.length;
    const passed = internsList.filter(i => i.status === 'Passed').length;
    const inProgress = total - passed;
    
    return [
      { 
        value: total, 
        label: "Total Interns", 
        sub: "From 2 programs", 
        barColor: "#8b5cf6", 
        barWidth: "100%" 
      },
      { 
        value: passed, 
        label: "Passed", 
        sub: "Ready for certificate", 
        barColor: "#22c55e", 
        barWidth: (total > 0 ? Math.round((passed / total) * 100) : 0) + "%" 
      },
      { 
        value: inProgress, 
        label: "In Progress", 
        sub: "Still being assessed", 
        barColor: "#f59e0b", 
        barWidth: (total > 0 ? Math.round((inProgress / total) * 100) : 0) + "%" 
      },
    ];
  },

  // ─── CLEAR STATE (saat logout) ─────────────────────────────────────────────
  clearMentorData: () => {
    set({
      mentor: null,
      dashData: null,
      interns: [],
      stats: null,
      loading: false,
      error: null,
      lastFetchTime: null,
    });
  },

  // ─── INVALIDATE CACHE (force refresh) ──────────────────────────────────────
  invalidateCache: () => {
    set({ lastFetchTime: null });
  },

  recapInterns: [],
  // ─── FETCH RECAP INTERNS (for dashboard table) ────────────────────────────
fetchRecapInterns: async (search = '') => {
  try {
    const res = await mentorApi.getScoreRecap(search);
    set({ recapInterns: res.data.recap || [] });
  } catch (error) {
    console.error('Error fetching recap interns:', error);
    throw error;
  }
},
}));
