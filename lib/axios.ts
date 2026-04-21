import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('ks_token');
    }
    if (!token) {
      try {
        token = useAuthStore.getState().token;
      } catch (e) {
        // Store might not be initialized
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      // Redirect to login would happen in middleware
    }
    return Promise.reject(error);
  }
);

export default api;
