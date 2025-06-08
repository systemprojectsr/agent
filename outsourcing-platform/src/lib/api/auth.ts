import { authApi, setAuthToken, setRefreshToken, clearTokens } from './config';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterClientRequest,
  RegisterCompanyRequest,
  User, 
  ApiResponse,
  Service
} from '@/types/api';

export class AuthService {
  // Login user
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/login', credentials);
      const authData: AuthResponse = response.data;
      
      setAuthToken(authData.token);
      setRefreshToken(authData.refreshToken);
      
      return authData;
    } catch (error) {
      throw error;
    }
  }

  // Register client
  static async registerClient(userData: RegisterClientRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/register/client', {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      });
      
      const authData: AuthResponse = response.data;
      
      setAuthToken(authData.token);
      setRefreshToken(authData.refreshToken);
      
      return authData;
    } catch (error) {
      throw error;
    }
  }

  // Register company
  static async registerCompany(userData: RegisterCompanyRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/register/company', {
        email: userData.email,
        password: userData.password,
        companyName: userData.companyName,
        companyDescription: userData.companyDescription,
        phone: userData.phone,
      });
      
      const authData: AuthResponse = response.data;
      
      setAuthToken(authData.token);
      setRefreshToken(authData.refreshToken);
      
      return authData;
    } catch (error) {
      throw error;
    }
  }

  // Get current user account info
  static async getAccount(): Promise<User> {
    try {
      const response = await authApi.get('/account');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await authApi.post('/logout');
    } catch (error) {
      // Even if logout fails, clear local tokens
      console.error('Logout error:', error);
    } finally {
      clearTokens();
    }
  }

  // Service card management (based on outsourcing-auth API)
  static async createServiceCard(serviceData: {
    title: string;
    description: string;
    price: number;
    category: string;
    images?: string[];
  }): Promise<Service> {
    try {
      const response = await authApi.post('/services', serviceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getServiceCards(): Promise<Service[]> {
    try {
      const response = await authApi.get('/services');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateServiceCard(serviceId: string, serviceData: Partial<Service>): Promise<Service> {
    try {
      const response = await authApi.put(`/services/${serviceId}`, serviceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteServiceCard(serviceId: string): Promise<void> {
    try {
      await authApi.delete(`/services/${serviceId}`);
    } catch (error) {
      throw error;
    }
  }

  static async getServiceCard(serviceId: string): Promise<Service> {
    try {
      const response = await authApi.get(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
