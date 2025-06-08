// API Types for Outsourcing Platform

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'client' | 'company';
  location: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  rating: number;
  reviewsCount: number;
  services: Service[];
  verified: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'negotiable';
  category: string;
  subcategory?: string;
  images: string[];
  companyId: string;
  company?: Company;
  location: string;
  rating: number;
  reviewsCount: number;
  tags: string[];
  availability: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  query?: string;
  price_from?: number;
  price_to?: number;
  location?: string;
  rating?: number;
  sort?: 'price_low' | 'price_high' | 'rating_low' | 'rating_high';
  category?: string;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterClientRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'client';
}

export interface RegisterCompanyRequest {
  email: string;
  password: string;
  companyName: string;
  companyDescription: string;
  phone?: string;
  role: 'company';
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'client' | 'company';
  companyName?: string;
  companyDescription?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  serviceId?: string;
  createdAt: string;
}

export interface PhotoUploadResponse {
  id: string;
  url: string;
  metadata: {
    size: number;
    format: string;
    width: number;
    height: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
}

// Filter categories for services
export const SERVICE_CATEGORIES = [
  'Клининг',
  'Ремонт и отделка',
  'Грузовые перевозки',
  'Ремонт техники',
  'Бытовые услуги',
  'Красота и здоровье',
  'Образование',
  'IT услуги',
  'Дизайн',
  'Фотография',
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];

// Sort options
export const SORT_OPTIONS = [
  { value: '', label: 'Без сортировки' },
  { value: 'price_low', label: 'По цене (возрастание)' },
  { value: 'price_high', label: 'По цене (убывание)' },
  { value: 'rating_low', label: 'По рейтингу (возрастание)' },
  { value: 'rating_high', label: 'По рейтингу (убывание)' },
] as const;
