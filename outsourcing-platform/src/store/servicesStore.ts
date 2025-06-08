import { create } from 'zustand';
import { Service, SearchParams, SearchResponse } from '@/types/api';
import { SearchService } from '@/lib/api/search';
import { AuthService } from '@/lib/api/auth';

interface ServicesState {
  // Services data
  services: Service[];
  featuredServices: Service[];
  currentService: Service | null;
  relatedServices: Service[];
  myServices: Service[];
  
  // Search and filtering
  searchParams: SearchParams;
  searchResults: SearchResponse | null;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  hasMore: boolean;
  
  // Actions
  searchServices: (params: SearchParams) => Promise<void>;
  loadMoreServices: () => Promise<void>;
  getFeaturedServices: () => Promise<void>;
  getServiceById: (serviceId: string) => Promise<void>;
  getRelatedServices: (serviceId: string) => Promise<void>;
  getMyServices: () => Promise<void>;
  createService: (serviceData: any) => Promise<Service>;
  updateService: (serviceId: string, serviceData: any) => Promise<Service>;
  deleteService: (serviceId: string) => Promise<void>;
  
  // Filters and search params
  updateSearchParams: (params: Partial<SearchParams>) => void;
  clearFilters: () => void;
  setCurrentService: (service: Service | null) => void;
  
  // Utility
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const initialSearchParams: SearchParams = {
  query: '',
  price_from: undefined,
  price_to: undefined,
  location: '',
  rating: undefined,
  sort: undefined,
  category: '',
  page: 1,
  limit: 12,
};

export const useServicesStore = create<ServicesState>((set, get) => ({
  // Initial state
  services: [],
  featuredServices: [],
  currentService: null,
  relatedServices: [],
  myServices: [],
  searchParams: initialSearchParams,
  searchResults: null,
  isLoading: false,
  isSearching: false,
  error: null,
  currentPage: 1,
  hasMore: false,

  // Search services
  searchServices: async (params: SearchParams) => {
    set({ isSearching: true, error: null });
    try {
      const searchResults = await SearchService.searchServices(params);
      set({ 
        searchResults,
        services: searchResults.services,
        searchParams: params,
        currentPage: searchResults.page,
        hasMore: searchResults.hasMore,
        isSearching: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка поиска услуг',
        isSearching: false 
      });
    }
  },

  // Load more services (pagination)
  loadMoreServices: async () => {
    const { searchParams, currentPage, isSearching, services } = get();
    if (isSearching) return;

    set({ isSearching: true });
    try {
      const nextPage = currentPage + 1;
      const searchResults = await SearchService.searchServices({
        ...searchParams,
        page: nextPage,
      });
      
      set({ 
        services: [...services, ...searchResults.services],
        currentPage: nextPage,
        hasMore: searchResults.hasMore,
        isSearching: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка загрузки услуг',
        isSearching: false 
      });
    }
  },

  // Get featured services
  getFeaturedServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const featuredServices = await SearchService.getFeaturedServices(8);
      set({ featuredServices, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка загрузки рекомендуемых услуг',
        isLoading: false 
      });
    }
  },

  // Get service by ID
  getServiceById: async (serviceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const service = await SearchService.getServiceById(serviceId);
      set({ currentService: service, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка загрузки услуги',
        isLoading: false 
      });
    }
  },

  // Get related services
  getRelatedServices: async (serviceId: string) => {
    try {
      const relatedServices = await SearchService.getRelatedServices(serviceId, 4);
      set({ relatedServices });
    } catch (error: any) {
      console.error('Error loading related services:', error);
    }
  },

  // Get my services (for companies)
  getMyServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const myServices = await AuthService.getServiceCards();
      set({ myServices, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка загрузки ваших услуг',
        isLoading: false 
      });
    }
  },

  // Create new service
  createService: async (serviceData: any) => {
    set({ isLoading: true, error: null });
    try {
      const newService = await AuthService.createServiceCard(serviceData);
      const { myServices } = get();
      set({ 
        myServices: [newService, ...myServices],
        isLoading: false 
      });
      return newService;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка создания услуги',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update service
  updateService: async (serviceId: string, serviceData: any) => {
    set({ isLoading: true, error: null });
    try {
      const updatedService = await AuthService.updateServiceCard(serviceId, serviceData);
      const { myServices } = get();
      set({ 
        myServices: myServices.map(service => 
          service.id === serviceId ? updatedService : service
        ),
        currentService: updatedService,
        isLoading: false 
      });
      return updatedService;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка обновления услуги',
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete service
  deleteService: async (serviceId: string) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.deleteServiceCard(serviceId);
      const { myServices } = get();
      set({ 
        myServices: myServices.filter(service => service.id !== serviceId),
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка удаления услуги',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update search parameters
  updateSearchParams: (params: Partial<SearchParams>) => {
    const { searchParams } = get();
    const newParams = { ...searchParams, ...params, page: 1 };
    set({ searchParams: newParams });
  },

  // Clear all filters
  clearFilters: () => {
    set({ searchParams: initialSearchParams });
  },

  // Set current service
  setCurrentService: (service: Service | null) => {
    set({ currentService: service });
  },

  // Utility functions
  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
