/**
 * Centralized API Configuration
 * Loads the Backend API Base URL from Vite environment variables (.env).
 * Priority:
 * 1. VITE_BASE_URL (from frontend .env)
 * 2. REACT_APP_BASE_URL (backward compatibility)
 * 3. Dynamic cloud fallback (if running on Vercel deployment)
 * 4. Localhost development fallback
 */
export const API_BASE_URL = 
  import.meta.env?.VITE_BASE_URL || 
  process.env?.REACT_APP_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
    ? 'https://expense-and-spliter-backend.onrender.com/api'
    : 'http://localhost:5000/api');

export default API_BASE_URL;
