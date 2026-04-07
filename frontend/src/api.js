const TOKEN_KEY = 'hr_token';
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
  let token = localStorage.getItem(TOKEN_KEY);
  
  // Try to get test token if in development and no token exists
  if (!token && import.meta.env.DEV) {
    token = await getTestToken();
  }
  
  const url = `${BASE_URL}${endpoint}`;
  console.log(`[API] ${options.method || 'GET'} ${url}`, { token: token ? 'present' : 'missing' });
  
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
    const errData = await res.json();
    console.error('[API] Error response:', errData);
    throw errData;
  }
  
  const data = await res.json();
  console.log(`[API] Success:`, data);
  return data;
};