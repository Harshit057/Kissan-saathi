import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  phone: string;
  name?: string;
  language?: string;
  state?: string;
  district?: string;
  crops?: string[];
  avatar?: string;
  createdAt?: string;
  upi_id?: string;
  profile_photo_url?: string;
  role?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  setLanguage: (code: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setAuth: (user: User, token: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('ks_token', token);
        }
        set({ user, token, isAuthenticated: true });
      },
      setUser: (user: User) => {
        set({ user });
      },
      setLanguage: (code: string) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, language: code } });
        }
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ks_token');
          localStorage.removeItem('auth-token');
        }
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ks_token');
          localStorage.removeItem('auth-token');
        }
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },
    }),
    {
      name: 'ks-auth',
      version: 1,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
