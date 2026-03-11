/**
 * apiClient.js
 * Centralized Axios instance — single source of truth for all API calls.
 * Production practice: Never scatter axios.get/post calls across components.
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // Fail fast — don't wait forever
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
// Attach auth token to every outgoing request automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
// Centralized error handling — handle 401/403/5xx in one place
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a non-2xx status
      const { status } = error.response;

      if (status === 401 || status === 403) {
        // Token expired or unauthorized — clear session and redirect
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
        window.location.href = '/login';
      }

      if (status >= 500) {
        console.error('[API] Server error:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response — network issue
      console.error('[API] Network error — no response received');
    } else {
      console.error('[API] Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
