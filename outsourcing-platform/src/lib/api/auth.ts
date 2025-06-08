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
    const response = await authApi.post('/login', credentials);
    const authData: AuthResponse = response.data;

    setAuthToken(authData.token);
    setRefreshToken(authData.refreshToken);

    return authData;
  }

  // Register client
  static async registerClient(userData: RegisterClientRequest): Promise<AuthResponse> {
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
  }

  // Register company
  static async registerCompany(userData: RegisterCompanyRequest): Promise<AuthResponse> {
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
  }

  // Get current user account info
  static async getAccount(): Promise<User> {
    const response = await authApi.get('/account');
    return response.data;
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await authApi.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    clearTokens();
  }

  // Service card management (based on outsourcing-auth API)
  static async createServiceCard(serviceData: {
    title: string;
    description: string;
    price: number;
    category: string;
    images?: string[];
  }): Promise<Service> {
    const response = await authApi.post('/services', serviceData);
    return response.data;
  }

  static async getServiceCards(): Promise<Service[]> {
    const response = await authApi.get('/services');
    return response.data;
  }

  static async updateServiceCard(serviceId: string, serviceData: Partial<Service>): Promise<Service> {
    const response = await authApi.put(`/services/${serviceId}`, serviceData);
    return response.data;
  }

  static async deleteServiceCard(serviceId: string): Promise<void> {
    await authApi.delete(`/services/${serviceId}`);
  }

  static async getServiceCard(serviceId: string): Promise<Service> {
    const response = await authApi.get(`/services/${serviceId}`);
    return response.data;
  }
}
