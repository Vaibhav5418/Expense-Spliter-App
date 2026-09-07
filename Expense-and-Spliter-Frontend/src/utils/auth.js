import axios from 'axios';

/**
 * Safely decodes a Base64URL encoded JWT token payload.
 * Handles missing padding, URL-safe characters (- and _), and unicode characters.
 * Returns null if token is corrupted, malformed, or damaged.
 */
export const decodeJWT = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;

  try {
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    
    // Safely decode base64 to unicode string
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const decodedText = new TextDecoder().decode(bytes);
    return JSON.parse(decodedText);
  } catch (err) {
    console.warn('JWT Decode Error: Malformed or damaged token payload', err);
    return null;
  }
};

/**
 * Checks whether a token is valid, undamaged, and not expired.
 */
export const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  const cleanToken = token.trim();
  if (cleanToken === '' || cleanToken === 'undefined' || cleanToken === 'null') return false;

  const payload = decodeJWT(cleanToken);
  if (!payload || typeof payload !== 'object') return false;

  // Check expiration if exp claim is present
  if (payload.exp) {
    const expirationTimeMs = payload.exp * 1000;
    // Buffer of 5 seconds to prevent edge-of-expiry race conditions
    if (Date.now() >= expirationTimeMs - 5000) {
      return false;
    }
  }

  return true;
};

/**
 * Clears authentication data from storage.
 */
export const clearAuthStorage = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  } catch (e) {
    console.error('Error clearing auth storage:', e);
  }
};

/**
 * Retrieves the currently stored token if and only if it is completely valid and undamaged.
 * Automatically purges expired/damaged tokens.
 */
export const getValidToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    if (isTokenValid(token)) {
      return token.trim();
    } else {
      // Purge damaged/expired token
      clearAuthStorage();
      return null;
    }
  } catch (e) {
    clearAuthStorage();
    return null;
  }
};

/**
 * Retrieves user profile from storage or decodes it from valid JWT token.
 */
export const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        if (parsed.name === 'Operative') {
          parsed.name = parsed.username || '';
        }
        return parsed;
      }
    }
  } catch (e) { }

  const token = getValidToken();
  if (token) {
    const payload = decodeJWT(token);
    if (payload) {
      const name = (payload.name && payload.name !== 'Operative') ? payload.name : (payload.username || 'User');
      return {
        _id: payload.userId,
        name,
        username: payload.username || '',
        email: payload.email || ''
      };
    }
  }

  return null;
};

/**
 * Stores authentication token and user data.
 */
export const setAuthSession = (token, user) => {
  if (!token) return;
  localStorage.setItem('token', token);
  if (user) {
    localStorage.setItem('user', typeof user === 'string' ? user : JSON.stringify(user));
  }
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

/**
 * Logs the user out completely and redirects to /login.
 */
export const logoutUser = () => {
  clearAuthStorage();
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login';
  }
};

let isInterceptorConfigured = false;

/**
 * Configures global Axios interceptors to automatically handle:
 * 1. Attaching valid Bearer token to all outgoing requests.
 * 2. Catching 401 Unauthorized responses (token expired / damaged) and clearing session gracefully.
 */
export const setupAxiosInterceptors = () => {
  if (isInterceptorConfigured) return;
  isInterceptorConfigured = true;

  // Set initial token header if valid
  const initialToken = getValidToken();
  if (initialToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
  }

  // Request Interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = getValidToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        if (config.headers) {
          delete config.headers['Authorization'];
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        const url = error.config?.url || '';
        // Only trigger logout if it's not a login or register attempt
        if (!url.includes('/login') && !url.includes('/register')) {
          console.warn('Unauthorized (401) received from API - Clearing invalid/damaged JWT session');
          logoutUser();
        }
      }
      return Promise.reject(error);
    }
  );
};
