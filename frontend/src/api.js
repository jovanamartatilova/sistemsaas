const TOKEN_KEY = 'auth_token';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get test token in development if no token exists
const getTestToken = async () => {
  try {
    const res = await fetch(`${BASE_URL}/dev/test-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      return data.token;
    }
  } catch (err) {
    console.warn('Could not get test token:', err);
  }
  return null;
};

export const api = async (endpoint, options = {}) => {
  // Try hr_token first (for HR pages), then fall back to auth_token
  let token = localStorage.getItem('hr_token') || localStorage.getItem(TOKEN_KEY);
  
  // Try to get test token if in development and no token exists
  if (!token && import.meta.env.DEV) {
    token = await getTestToken();
  }
  
  const url = `${BASE_URL}${endpoint}`;
  const tokenPreview = token ? token.substring(0, 20) + '...' : 'MISSING';
  const localStorage_keys = Object.keys(localStorage);
  console.log(`[API] ${options.method || 'GET'} ${url}`, { 
    token: tokenPreview,
    localStorage_has_hr_token: !!localStorage.getItem('hr_token'),
    localStorage_has_auth_token: !!localStorage.getItem(TOKEN_KEY),
    all_storage_keys: localStorage_keys
  });
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  
  console.log(`[API] Response status: ${res.status} ${res.statusText}`);
  
  if (!res.ok) {
    let errData;
    try {
      errData = await res.json();
    } catch {
      errData = { message: res.statusText, status: res.status };
    }
    console.error('[API] Error response:', { url, status: res.status, data: errData, token_was_sent: !!token });
    throw errData;
  }
  
  const data = await res.json();
  console.log(`[API] Success:`, data);
  return data;
};