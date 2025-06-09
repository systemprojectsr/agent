import { apiRequest, User } from '@/config/api'

// Интерфейсы для запросов
export interface RegisterClientRequest {
  full_name: string
  email: string
  phone: string
  password: string
  photo?: string
}

export interface RegisterCompanyRequest {
  company_name: string
  email: string
  phone: string
  password: string
  website?: string
  description?: string
  photo?: string
}

export interface LoginRequest {
  email: string
  password: string
}

// Сервис аутентификации
export class AuthService {
  // Регистрация клиента
  static async registerClient(userData: RegisterClientRequest): Promise<User> {
    const response = await apiRequest('/v1/register/client', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    
    const data = await response.json()
    
    if (data.status_response?.status === 'success') {
      // Сохраняем токен и данные пользователя
      localStorage.setItem('authToken', data.user.token)
      localStorage.setItem('userId', data.user.id.toString())
      localStorage.setItem('userType', data.user.type)
      return data.user
    }
    
    throw new Error(data.error?.message || 'Registration failed')
  }

  // Регистрация компании
  static async registerCompany(userData: RegisterCompanyRequest): Promise<User> {
    const response = await apiRequest('/v1/register/company', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    
    const data = await response.json()
    
    if (data.status_response?.status === 'success') {
      localStorage.setItem('authToken', data.user.token)
      localStorage.setItem('userId', data.user.id.toString())
      localStorage.setItem('userType', data.user.type)
      return data.user
    }
    
    throw new Error(data.error?.message || 'Registration failed')
  }

  // Универсальная авторизация
  static async login(credentials: LoginRequest): Promise<User> {
    const response = await apiRequest('/v1/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
    
    const data = await response.json()
    
    if (data.status_response?.status === 'success') {
      localStorage.setItem('authToken', data.user.token)
      localStorage.setItem('userId', data.user.id.toString())
      localStorage.setItem('userType', data.user.type)
      return data.user
    }
    
    throw new Error(data.error?.message || 'Invalid credentials')
  }

  // Выход из системы
  static logout(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('userType')
  }

  // Получение сохраненного токена
  static getToken(): string | null {
    return localStorage.getItem('authToken')
  }

  // Получение типа пользователя
  static getUserType(): 'client' | 'company' | null {
    return localStorage.getItem('userType') as 'client' | 'company' | null
  }

  // Получение ID пользователя
  static getUserId(): string | null {
    return localStorage.getItem('userId')
  }

  // Проверка авторизации
  static isAuthenticated(): boolean {
    return !!this.getToken()
  }
}
