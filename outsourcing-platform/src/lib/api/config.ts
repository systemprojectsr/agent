import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

// API Base URLs for microservices
export const API_ENDPOINTS = {
  AUTH: 'http://176.57.215.221:8080/v1',
  SEARCH: 'http://176.57.215.221:8070',
  DATABASE: 'http://176.57.215.221:5000',
  PHOTOS: 'http://176.57.215.221:9003',
} as const;

// Create axios instances for each microservice
export const authApi = axios.create({
  baseURL: API_ENDPOINTS.AUTH,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchApi = axios.create({
  baseURL: API_ENDPOINTS.SEARCH,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const databaseApi = axios.create({
  baseURL: API_ENDPOINTS.DATABASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const photosApi = axios.create({
  baseURL: API_ENDPOINTS.PHOTOS,
  timeout: 15000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Token management
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getAuthToken = (): string | null => {
  return Cookies.get(TOKEN_KEY) || null;
};

export const setAuthToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' });
};

export const getRefreshToken = (): string | null => {
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
};

export const setRefreshToken = (token: string): void => {
  Cookies.set(REFRESH_TOKEN_KEY, token, { expires: 30, secure: true, sameSite: 'strict' });
};

export const clearTokens = (): void => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};

// Request interceptors to add auth token
[authApi, searchApi, databaseApi, photosApi].forEach(api => {
  api.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
});

// Response interceptors for error handling
[authApi, searchApi, databaseApi, photosApi].forEach(api => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const message = error.response?.data?.message || error.message || 'Произошла ошибка';
      
      if (error.response?.status === 401) {
        clearTokens();
        window.location.href = '/login';
        toast.error('Сессия истекла. Пожалуйста, войдите в аккаунт снова.');
      } else if (error.response?.status >= 500) {
        toast.error('Ошибка сервера. Попробуйте позже.');
      } else {
        toast.error(message);
      }
      
      return Promise.reject(error);
    }
  );
});

// Mock data fallbacks for development
export const MOCK_MODE = false; // Set to true for development with mock data

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
