import { create } from 'zustand';
import { AuthUser, User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (authUser: AuthUser) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (authUser) =>
    set({
      user: {
        id: authUser.id,
        name: authUser.name,
        officeId: authUser.officeId,
        email: authUser.email,
        role: authUser.role,
        createdAt: authUser.createdAt,
      },
      accessToken: authUser.accessToken,
      refreshToken: authUser.refreshToken,
      isAuthenticated: true,
    }),

  setAccessToken: (token) => set({ accessToken: token }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
