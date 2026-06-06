import { create } from 'zustand';
import type { UserInfo } from '../types';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isLoggedIn: boolean;
  setAuth: (token: string, user: UserInfo) => void;
  setUser: (user: UserInfo) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  isLoggedIn: !!localStorage.getItem('token'),
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isLoggedIn: true });
  },
  setUser: (user) => {
    set({ user, isLoggedIn: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isLoggedIn: false });
  },
}));
