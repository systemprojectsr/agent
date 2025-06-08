import { searchApi, delay } from './config';
import { SearchParams, SearchResponse, Service } from '@/types/api';

export class SearchService {
  // Search services with filters
  static async searchServices(params: SearchParams): Promise<SearchResponse> {
    try {
      // Try real API first
      const queryParams = new URLSearchParams();
      
      if (params.query) queryParams.append('q', params.query);
      if (params.price_from) queryParams.append('price_from', params.price_from.toString());
      if (params.price_to) queryParams.append('price_to', params.price_to.toString());
      if (params.location) queryParams.append('location', params.location);
      if (params.rating) queryParams.append('rating', params.rating.toString());
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.category) queryParams.append('category', params.category);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await searchApi.get(`/search?${queryParams.toString()}`);
      
      return {
        services: response.data.results || response.data.services || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        hasMore: response.data.hasMore || false,
      };
    } catch (error) {
      console.warn('Real API unavailable, using mock data:', error);
      return this.searchServicesMock(params);
    }
  }

  // Mock data fallback
  private static async searchServicesMock(params: SearchParams): Promise<SearchResponse> {
    await delay(500); // Simulate network delay
    
    try {
      const response = await fetch('/data/mock-services.json');
      const mockData = await response.json();
      let services = mockData.services;

      // Apply filters
      if (params.query) {
        const query = params.query.toLowerCase();
        services = services.filter((service: Service) =>
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query)
        );
      }

      if (params.category) {
        services = services.filter((service: Service) =>
          service.category === params.category
        );
      }

      if (params.price_from) {
        services = services.filter((service: Service) =>
          service.price >= params.price_from!
        );
      }

      if (params.price_to) {
        services = services.filter((service: Service) =>
          service.price <= params.price_to!
        );
      }

      if (params.location) {
        services = services.filter((service: Service) =>
          service.location.toLowerCase().includes(params.location!.toLowerCase())
        );
      }

      if (params.rating) {
        services = services.filter((service: Service) =>
          service.rating >= params.rating!
        );
      }

      // Apply sorting
      if (params.sort) {
        switch (params.sort) {
          case 'price_low':
            services.sort((a: Service, b: Service) => a.price - b.price);
            break;
          case 'price_high':
            services.sort((a: Service, b: Service) => b.price - a.price);
            break;
          case 'rating_low':
            services.sort((a: Service, b: Service) => a.rating - b.rating);
            break;
          case 'rating_high':
            services.sort((a: Service, b: Service) => b.rating - a.rating);
            break;
          default:
            break;
        }
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedServices = services.slice(startIndex, endIndex);

      return {
        services: paginatedServices,
        total: services.length,
        page,
        limit,
        hasMore: endIndex < services.length,
      };
    } catch (error) {
      console.error('Mock data error:', error);
      return {
        services: [],
        total: 0,
        page: 1,
        limit: 12,
        hasMore: false,
      };
    }
  }

  // Get popular/featured services
  static async getFeaturedServices(limit: number = 8): Promise<Service[]> {
    try {
      const response = await searchApi.get(`/search?featured=true&limit=${limit}`);
      return response.data.results || response.data.services || [];
    } catch (error) {
      console.warn('Real API unavailable, using mock data for featured services');
      return this.getFeaturedServicesMock(limit);
    }
  }

  private static async getFeaturedServicesMock(limit: number = 8): Promise<Service[]> {
    await delay(300);
    try {
      const response = await fetch('/data/mock-services.json');
      const mockData = await response.json();
      return mockData.services.slice(0, limit);
    } catch (error) {
      console.error('Mock data error:', error);
      return [];
    }
  }

  // Get services by category
  static async getServicesByCategory(category: string, limit: number = 12): Promise<Service[]> {
    try {
      const response = await searchApi.get(`/search?category=${encodeURIComponent(category)}&limit=${limit}`);
      return response.data.results || response.data.services || [];
    } catch (error) {
      console.warn('Real API unavailable, using mock data for category services');
      return this.getServicesByCategoryMock(category, limit);
    }
  }

  private static async getServicesByCategoryMock(category: string, limit: number = 12): Promise<Service[]> {
    await delay(300);
    try {
      const response = await fetch('/data/mock-services.json');
      const mockData = await response.json();
      const filteredServices = mockData.services.filter((service: Service) => 
        service.category === category
      );
      return filteredServices.slice(0, limit);
    } catch (error) {
      console.error('Mock data error:', error);
      return [];
    }
  }

  // Get service details by ID
  static async getServiceById(serviceId: string): Promise<Service> {
    try {
      const response = await searchApi.get(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      console.warn('Real API unavailable, using mock data for service details');
      return this.getServiceByIdMock(serviceId);
    }
  }

  private static async getServiceByIdMock(serviceId: string): Promise<Service> {
    await delay(300);
    try {
      const response = await fetch('/data/mock-services.json');
      const mockData = await response.json();
      const service = mockData.services.find((s: Service) => s.id === serviceId);
      if (!service) {
        throw new Error('Service not found');
      }
      return service;
    } catch (error) {
      console.error('Mock data error:', error);
      throw error;
    }
  }

  // Get related services
  static async getRelatedServices(serviceId: string, limit: number = 4): Promise<Service[]> {
    try {
      const response = await searchApi.get(`/services/${serviceId}/related?limit=${limit}`);
      return response.data.results || response.data.services || [];
    } catch (error) {
      console.warn('Real API unavailable, using mock data for related services');
      return this.getRelatedServicesMock(serviceId, limit);
    }
  }

  private static async getRelatedServicesMock(serviceId: string, limit: number = 4): Promise<Service[]> {
    await delay(300);
    try {
      const response = await fetch('/data/mock-services.json');
      const mockData = await response.json();
      const currentService = mockData.services.find((s: Service) => s.id === serviceId);
      if (!currentService) return [];
      
      // Get services from same category, excluding current service
      const relatedServices = mockData.services
        .filter((s: Service) => s.id !== serviceId && s.category === currentService.category)
        .slice(0, limit);
      
      return relatedServices;
    } catch (error) {
      console.error('Mock data error:', error);
      return [];
    }
  }

  // Get autocomplete suggestions
  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const response = await searchApi.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      return response.data.suggestions || [];
    } catch (error) {
      // Return simple mock suggestions
      const suggestions = [
        'Клининг квартир',
        'Ремонт техники',
        'Грузоперевозки',
        'Сантехник',
        'Электрик',
        'Мойка окон',
      ];
      return suggestions.filter(s => 
        s.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    }
  }
}
