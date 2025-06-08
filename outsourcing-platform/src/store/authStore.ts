import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/api';
import { AuthService } from '@/lib/api/auth';
import { getAuthToken } from '@/lib/api/config';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  registerClient: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  registerCompany: (userData: {
    email: string;
    password: string;
    companyName: string;
    companyDescription: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  getAccount: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.login({ email, password });
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Ошибка входа в аккаунт',
            isLoading: false 
          });
          throw error;
        }
      },

      registerClient: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.registerClient({
            ...userData,
            role: 'client',
          });
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Ошибка регистрации',
            isLoading: false 
          });
          throw error;
        }
      },

      registerCompany: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.registerCompany({
            ...userData,
            role: 'company',
          });
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Ошибка регистрации',
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await AuthService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
        }
      },

      getAccount: async () => {
        const token = getAuthToken();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await AuthService.getAccount();
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Ошибка получения данных аккаунта'
          });
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
