import { databaseApi } from './config';
import { User, Company, Message, Chat } from '@/types/api';

export class DatabaseService {
  // Users management
  static async getUsers(): Promise<User[]> {
    const response = await databaseApi.get('/users');
    return response.data;
  }

  static async getUserById(userId: string): Promise<User> {
    const response = await databaseApi.get(`/users/${userId}`);
    return response.data;
  }

  static async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const response = await databaseApi.put(`/users/${userId}`, userData);
    return response.data;
  }

  // Companies management
  static async getCompanies(): Promise<Company[]> {
    const response = await databaseApi.get('/companies');
    return response.data;
  }

  static async getCompanyById(companyId: string): Promise<Company> {
    const response = await databaseApi.get(`/companies/${companyId}`);
    return response.data;
  }

  static async updateCompany(companyId: string, companyData: Partial<Company>): Promise<Company> {
    const response = await databaseApi.put(`/companies/${companyId}`, companyData);
    return response.data;
  }

  // User-Company relationships
  static async getUserCompanies(userId: string): Promise<Company[]> {
    const response = await databaseApi.get(`/user_companies?user_id=${userId}`);
    return response.data;
  }

  // Messages and chat functionality
  static async getMessages(userId: string): Promise<Message[]> {
    const response = await databaseApi.get(`/messages/${userId}`);
    return response.data;
  }

  static async sendMessage(messageData: {
    receiverId: string;
    content: string;
    type?: 'text' | 'image' | 'file';
    serviceId?: string;
  }): Promise<Message> {
    const response = await databaseApi.post('/messages', messageData);
    return response.data;
  }

  static async markMessageAsRead(messageId: string): Promise<void> {
    await databaseApi.put(`/messages/${messageId}/read`);
  }

  // Chat conversations
  static async getChats(userId: string): Promise<Chat[]> {
    const response = await databaseApi.get(`/chats?user_id=${userId}`);
    return response.data;
  }

  static async getChatMessages(chatId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
    const response = await databaseApi.get(`/chats/${chatId}/messages?page=${page}&limit=${limit}`);
    return response.data;
  }

  static async createChat(participantIds: string[], serviceId?: string): Promise<Chat> {
    const response = await databaseApi.post('/chats', {
      participantIds,
      serviceId,
    });
    return response.data;
  }

  // Search users and companies
  static async searchUsers(query: string): Promise<User[]> {
    const response = await databaseApi.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  static async searchCompanies(query: string): Promise<Company[]> {
    const response = await databaseApi.get(`/companies/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
}
