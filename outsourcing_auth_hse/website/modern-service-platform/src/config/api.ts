// API конфигурация
const isDevelopment = process.env.NODE_ENV === 'development'

// В разработке используем localhost, в продакшене - относительные пути
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8080' 
  : ''

// Вспомогательная функция для создания полного URL
export const createApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
}

// Готовые эндпоинты
export const API_ENDPOINTS = {
  // Аутентификация
  login: '/v1/login',
  registerClient: '/v1/register/client',
  registerCompany: '/v1/register/company',
  
  // Аккаунт
  account: '/v1/account/',
  accountUpdate: '/v1/account/update',
  
  // Карточки услуг
  cardCreate: '/v1/account/card/create',
  cardList: '/v1/account/card/list',
  cardDelete: '/v1/account/card/delete',
  cardUpdate: '/v1/account/card/update',
  
  // Заказы
  ordersList: '/v1/orders/list',
  orderCreate: '/v1/orders/create',
  orderUpdate: '/v1/orders/update',
  
  // Платежи
  paymentTopup: '/v1/payments/topup',
  paymentHistory: '/v1/payments/history',
  
  // Рейтинги
  ratingCreate: '/v1/ratings/create',
  ratingList: '/v1/ratings/list',
  
  // Статистика компании
  companyStats: '/v1/company/stats'
}

// Вспомогательная функция для выполнения API запросов
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = createApiUrl(endpoint)
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  const config = { ...defaultOptions, ...options }
  
  try {
    const response = await fetch(url, config)
    return response
  } catch (error) {
    console.error('API Request failed:', error)
    throw error
  }
}