// API конфигурация
export const API_BASE_URL = 'http://localhost:8080'

// Типы токенов для разных операций
export interface SimpleTokenRequest {
  user: {
    login: {
      token: string
    }
  }
}

export interface ExtendedTokenRequest {
  token_access: {
    user: {
      login: {
        token: string
      }
    }
  }
}

// Интерфейсы для API
export interface User {
  id: number
  token: string
  type: 'client' | 'company'
}

export interface ClientProfile {
  id: number
  full_name: string
  email: string
  phone: string
  photo?: string
  token: string
  type: 'client'
  balance: number
}

export interface CompanyProfile {
  id: number
  company_name: string
  email: string
  phone: string
  full_name: string
  position_agent?: string
  id_company?: string
  address?: string
  type_service?: string
  photo?: string
  documents?: string[]
  type: 'company'
}

export interface ServiceCard {
  id: number
  title: string
  description: string
  category: string
  location: string
  price: number
  is_active: boolean
  company_id: number
  company: {
    id: number
    company_name: string
    stars: number
    review_count: number
    photo?: string
  }
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  client_id?: number
  company_id?: number
  card_id?: number
  amount: number
  status: 'created' | 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'paid'
  payment_status: 'pending' | 'paid' | 'refunded'
  description: string
  created_at: string
  updated_at: string
  completed_at?: string
  worker_url?: string
  can_cancel: boolean
  can_pay: boolean
  can_rate: boolean
  client?: {
    id: number
    full_name: string
    email: string
    phone: string
    photo?: string
  }
  company?: {
    id: number
    company_name: string
    stars: number
    photo?: string
  }
  card?: {
    id: number
    title: string
    description: string
  }
}

export interface Transaction {
  id: number
  amount: number
  type: 'deposit' | 'withdraw' | 'payment' | 'refund'
  status: string
  description: string
  created_at: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: string
  is_read: boolean
  order_id?: number
  related_id?: number
  created_at: string
}

export interface CompanyStats {
  total_services: number
  total_orders: number
  active_orders: number
  completed_orders: number
  total_earnings: number
  total_revenue: number
  average_rating: number
  total_reviews: number
  review_count: number
  balance_available: number
}

export interface Review {
  id: number
  client_name: string
  service_name: string
  rating: number
  comment: string
  created_at: string
}

// Базовая функция для API запросов
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const config = { ...defaultOptions, ...options }
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    return response
  } catch (error) {
    console.error('API Request failed:', error)
    throw error
  }
}

// Создание токенов для запросов
export const createSimpleToken = (token: string): SimpleTokenRequest => ({
  user: {
    login: {
      token
    }
  }
})

export const createExtendedToken = (token: string): ExtendedTokenRequest => ({
  token_access: {
    user: {
      login: {
        token
      }
    }
  }
})
