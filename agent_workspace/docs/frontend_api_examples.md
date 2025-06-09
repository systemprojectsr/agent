# Примеры использования API на Frontend
## Практические примеры интеграции с backend

### 🔧 Настройка API клиента

```typescript
// config/api.ts
export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080' 
  : 'https://auth.tomsk-center.ru'

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
    return response
  } catch (error) {
    console.error('API Request failed:', error)
    throw error
  }
}
```

---

## 🔐 Примеры авторизации

### 1. Регистрация клиента
```typescript
const registerClient = async (userData: {
  full_name: string
  email: string
  phone: string
  password: string
  photo?: string
}) => {
  try {
    const response = await apiRequest('/v1/register/client', {
      method: 'POST',
      body: JSON.stringify(userData)
    })

    if (response.ok) {
      const data = await response.json()
      // Сохраняем токен и данные пользователя
      localStorage.setItem('authToken', data.user.token)
      localStorage.setItem('userId', data.user.id.toString())
      localStorage.setItem('userType', data.user.type)
      return data
    } else {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Registration failed')
    }
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}
```

### 2. Универсальная авторизация
```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await apiRequest('/v1/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    if (response.ok) {
      const data = await response.json()
      // Сохраняем данные пользователя
      localStorage.setItem('authToken', data.user.token)
      localStorage.setItem('userId', data.user.id.toString())
      localStorage.setItem('userType', data.user.type)
      return data
    } else {
      throw new Error('Invalid credentials')
    }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}
```

---

## 👤 Примеры работы с профилем

### 1. Получение профиля пользователя
```typescript
const getUserProfile = async (token: string) => {
  try {
    const response = await apiRequest('/v1/account/', {
      method: 'POST',
      body: JSON.stringify({
        user: {
          login: {
            token: token
          }
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.user.account
    } else {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch profile')
    }
  } catch (error) {
    console.error('Profile fetch error:', error)
    throw error
  }
}
```

### 2. Обновление профиля клиента
```typescript
const updateClientProfile = async (token: string, profileData: {
  full_name: string
  email: string
  phone: string
  photo?: string
}) => {
  try {
    const response = await apiRequest('/v1/account/profile/update', {
      method: 'POST',
      body: JSON.stringify({
        token_access: {
          user: {
            login: {
              token: token
            }
          }
        },
        profile: profileData
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      throw new Error('Failed to update profile')
    }
  } catch (error) {
    console.error('Profile update error:', error)
    throw error
  }
}
```

---

## 💳 Примеры работы с услугами

### 1. Создание карточки услуги (только компании)
```typescript
const createServiceCard = async (token: string, cardData: {
  title: string
  description: string
  category: string
  location: string
  price: number
}) => {
  try {
    const response = await apiRequest('/v1/account/card/create', {
      method: 'POST',
      body: JSON.stringify({
        token_access: {
          user: {
            login: {
              token: token
            }
          }
        },
        card: cardData
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.card
    } else {
      throw new Error('Failed to create service card')
    }
  } catch (error) {
    console.error('Card creation error:', error)
    throw error
  }
}
```

### 2. Получение списка услуг компании
```typescript
const getCompanyCards = async (token: string) => {
  try {
    const response = await apiRequest('/v1/account/card/list', {
      method: 'POST',
      body: JSON.stringify({
        token_access: {
          user: {
            login: {
              token: token
            }
          }
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.cards || []
    } else {
      throw new Error('Failed to fetch company cards')
    }
  } catch (error) {
    console.error('Cards fetch error:', error)
    throw error
  }
}
```

### 3. Получение всех публичных услуг
```typescript
const getAllPublicServices = async () => {
  try {
    const response = await apiRequest('/cards', {
      method: 'GET'
    })

    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      throw new Error('Failed to fetch public services')
    }
  } catch (error) {
    console.error('Public services fetch error:', error)
    // Возвращаем пустой массив в случае ошибки
    return []
  }
}
```

---

## 📦 Примеры работы с заказами

### 1. Создание заказа
```typescript
const createOrder = async (token: string, orderData: {
  company_id: number
  card_id: number
  description: string
}) => {
  try {
    const response = await apiRequest('/v1/account/order/create', {
      method: 'POST',
      body: JSON.stringify({
        token_access: {
          user: {
            login: {
              token: token
            }
          }
        },
        order: orderData
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.order
    } else {
      throw new Error('Failed to create order')
    }
  } catch (error) {
    console.error('Order creation error:', error)
    throw error
  }
}
```

### 2. Получение списка заказов
```typescript
const getUserOrders = async (token: string, filters: {
  status?: string
  limit?: number
  offset?: number
} = {}) => {
  try {
    const requestBody = {
      user: {
        login: {
          token: token
        }
      },
      status: filters.status || 'all',
      limit: filters.limit || 10,
      offset: filters.offset || 0
    }

    const response = await apiRequest('/v1/account/order/list', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })

    if (response.ok) {
      const data = await response.json()
      return {
        orders: data.orders || [],
        total: data.total || 0
      }
    } else {
      throw new Error('Failed to fetch orders')
    }
  } catch (error) {
    console.error('Orders fetch error:', error)
    return { orders: [], total: 0 }
  }
}
```

### 3. Обновление статуса заказа
```typescript
const updateOrderStatus = async (token: string, orderId: number, action: string) => {
  try {
    const response = await apiRequest('/v1/account/order/update-status', {
      method: 'POST',
      body: JSON.stringify({
        token_access: {
          user: {
            login: {
              token: token
            }
          }
        },
        order_id: orderId,
        action: action // 'accept', 'reject', 'start', 'complete', 'cancel'
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      throw new Error('Failed to update order status')
    }
  } catch (error) {
    console.error('Order status update error:', error)
    throw error
  }
}
```

---

## 💰 Примеры работы с балансом

### 1. Получение баланса
```typescript
const getUserBalance = async (token: string) => {
  try {
    const response = await apiRequest('/v1/account/balance/', {
      method: 'POST',
      body: JSON.stringify({
        user: {
          login: {
            token: token
          }
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.balance
    } else {
      throw new Error('Failed to fetch balance')
    }
  } catch (error) {
    console.error('Balance fetch error:', error)
    return 0
  }
}
```

### 2. Пополнение баланса
```typescript
const depositBalance = async (token: string, amount: number) => {
  try {
    const response = await apiRequest('/v1/account/balance/deposit', {
      method: 'POST',
      body: JSON.stringify({
        token_access: {
          user: {
            login: {
              token: token
            }
          }
        },
        amount: amount
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.balance
    } else {
      throw new Error('Failed to deposit balance')
    }
  } catch (error) {
    console.error('Balance deposit error:', error)
    throw error
  }
}
```

### 3. История транзакций
```typescript
const getBalanceTransactions = async (token: string, filters: {
  limit?: number
  offset?: number
} = {}) => {
  try {
    const response = await apiRequest('/v1/account/balance/transactions', {
      method: 'POST',
      body: JSON.stringify({
        token_access: {
          user: {
            login: {
              token: token
            }
          }
        },
        limit: filters.limit || 10,
        offset: filters.offset || 0
      })
    })

    if (response.ok) {
      const data = await response.json()
      return {
        transactions: data.transactions || [],
        total: data.total || 0
      }
    } else {
      throw new Error('Failed to fetch transactions')
    }
  } catch (error) {
    console.error('Transactions fetch error:', error)
    return { transactions: [], total: 0 }
  }
}
```

---

## 📊 Примеры получения статистики

### 1. Статистика компании
```typescript
const getCompanyStats = async (token: string) => {
  try {
    const response = await apiRequest('/v1/company/stats', {
      method: 'POST',
      body: JSON.stringify({
        token_access: {
          user: {
            login: {
              token: token
            }
          }
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.stats
    } else {
      throw new Error('Failed to fetch company stats')
    }
  } catch (error) {
    console.error('Company stats fetch error:', error)
    return null
  }
}
```

---

## 🔔 Примеры работы с уведомлениями

### 1. Получение уведомлений
```typescript
const getNotifications = async (token: string, filters: {
  is_read?: boolean | null
  limit?: number
  offset?: number
} = {}) => {
  try {
    const requestBody: any = {
      token_access: {
        user: {
          login: {
            token: token
          }
        }
      },
      limit: filters.limit || 10,
      offset: filters.offset || 0
    }

    if (filters.is_read !== undefined) {
      requestBody.is_read = filters.is_read
    }

    const response = await apiRequest('/v1/notifications/list', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })

    if (response.ok) {
      const data = await response.json()
      return {
        notifications: data.notifications || [],
        total: data.total || 0,
        unreadCount: data.unread_count || 0
      }
    } else {
      throw new Error('Failed to fetch notifications')
    }
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return { notifications: [], total: 0, unreadCount: 0 }
  }
}
```

### 2. Отметить уведомление как прочитанное
```typescript
const markNotificationAsRead = async (token: string, notificationId: number) => {
  try {
    const response = await apiRequest('/v1/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({
        token_access: {
          user: {
            login: {
              token: token
            }
          }
        },
        notification_id: notificationId
      })
    })

    if (response.ok) {
      return true
    } else {
      throw new Error('Failed to mark notification as read')
    }
  } catch (error) {
    console.error('Mark notification error:', error)
    return false
  }
}
```

---

## 🛡️ Обработка ошибок

### Универсальная обработка ошибок API
```typescript
const handleApiError = (error: any, defaultMessage: string = 'Произошла ошибка') => {
  if (error.response) {
    // Ошибка от сервера
    const status = error.response.status
    switch (status) {
      case 400:
        return 'Неверный запрос. Проверьте данные.'
      case 401:
        return 'Неверные учетные данные.'
      case 403:
        return 'Недостаточно прав доступа.'
      case 404:
        return 'Ресурс не найден.'
      case 412:
        return 'Условие не выполнено.'
      case 500:
        return 'Внутренняя ошибка сервера.'
      default:
        return defaultMessage
    }
  } else if (error.request) {
    // Ошибка сети
    return 'Ошибка сети. Проверьте подключение к интернету.'
  } else {
    // Другая ошибка
    return error.message || defaultMessage
  }
}
```

### Пример использования с обработкой ошибок
```typescript
const safeApiCall = async (apiFunction: () => Promise<any>, errorMessage: string) => {
  try {
    return await apiFunction()
  } catch (error) {
    const errorMsg = handleApiError(error, errorMessage)
    toast.error(errorMsg)
    throw error
  }
}

// Использование
const profile = await safeApiCall(
  () => getUserProfile(token),
  'Не удалось загрузить профиль'
)
```

---

## 🔄 Автоматическое обновление токена

### Проверка валидности токена
```typescript
const isTokenValid = (token: string): boolean => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    const payload = JSON.parse(atob(parts[1]))
    const exp = payload.exp
    
    return Date.now() < exp * 1000
  } catch {
    return false
  }
}

const checkAndRefreshAuth = async () => {
  const token = localStorage.getItem('authToken')
  
  if (!token || !isTokenValid(token)) {
    // Очищаем недействительный токен
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    // Перенаправляем на страницу входа
    window.location.href = '/login'
    return null
  }
  
  return token
}
```

---

*Эти примеры показывают корректное использование API в соответствии с backend спецификацией. Все структуры данных соответствуют ожидаемым форматам.*
