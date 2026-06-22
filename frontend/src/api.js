const TOKEN_KEY = 'auth_token';
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // Fallback: use relative path /api (will use the same server hosting the frontend)
  // This works whether the frontend and backend are on the same server or behind a reverse proxy
  return '/api';
};

const BASE_URL = getBaseUrl();

// Get test token in development if no token exists
const getTestToken = async () => {
  try {
    const res = await fetch(`${BASE_URL}/dev/test-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem(TOKEN_KEY, data.token);
      return data.token;
    }
  } catch (err) {
    console.warn('Could not get test token:', err);
  }
  return null;
};

export const api = async (endpoint, options = {}) => {
  // Try hr_token first (for HR pages), then fall back to auth_token
  let token = sessionStorage.getItem('hr_token') || sessionStorage.getItem(TOKEN_KEY);

  // Try to get test token if in development and no token exists
  if (!token && import.meta.env.DEV) {
    token = await getTestToken();
  }

  const url = `${BASE_URL}${endpoint}`;
  const tokenPreview = token ? token.substring(0, 20) + '...' : 'MISSING';
  const storage_keys = Object.keys(sessionStorage);
  console.log(`[API] ${options.method || 'GET'} ${url}`, {
    token: tokenPreview,
    sessionStorage_has_hr_token: !!sessionStorage.getItem('hr_token'),
    sessionStorage_has_auth_token: !!sessionStorage.getItem(TOKEN_KEY),
    all_storage_keys: storage_keys
  });

  const isFormData = options.body instanceof FormData || options.data instanceof FormData;
  const bodyData = options.data instanceof FormData ? options.data : options.body;

  const fetchOptions = {
    ...options,
    method: options.method || 'GET',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: isFormData
      ? bodyData
      : options.data
        ? JSON.stringify(options.data)
        : options.body,
  };
  const res = await fetch(url, fetchOptions);

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