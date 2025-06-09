import { apiRequest, createSimpleToken, createExtendedToken, Order } from '@/config/api'

export interface CreateOrderRequest {
  company_id: number
  card_id: number
  description: string
}

export interface OrderListParams {
  status?: 'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
  limit?: number
  offset?: number
}

export type OrderAction = 'accept' | 'reject' | 'start' | 'complete' | 'cancel'

// Сервис для работы с заказами
export class OrdersService {
  // Создание заказа
  static async createOrder(token: string, orderData: CreateOrderRequest): Promise<Order> {
    const response = await apiRequest('/v1/account/order/create', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        order: orderData
      })
    })
    
    const data = await response.json()
    
    if (data.status_response?.status === 'success') {
      return data.order
    }
    
    throw new Error(data.error?.message || 'Failed to create order')
  }

  // Получение списка заказов
  static async getOrders(token: string, params: OrderListParams = {}): Promise<{orders: Order[], total: number}> {
    const { status = 'all', limit = 10, offset = 0 } = params
    
    const response = await apiRequest('/v1/account/order/list', {
      method: 'POST',
      body: JSON.stringify({
        ...createSimpleToken(token),
        status,
        limit,
        offset
      })
    })
    
    const data = await response.json()
    
    if (response.status === 200) {
      return {
        orders: data.orders,
        total: data.total
      }
    }
    
    throw new Error(data.error?.message || 'Failed to fetch orders')
  }

  // Обновление статуса заказа
  static async updateOrderStatus(token: string, orderId: number, action: OrderAction): Promise<void> {
    const response = await apiRequest('/v1/account/order/update-status', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        order_id: orderId,
        action
      })
    })
    
    const data = await response.json()
    
    if (data.status_response?.status !== 'success') {
      throw new Error(data.error?.message || 'Failed to update order status')
    }
  }

  // Получение всех заказов (публичный)
  static async getAllOrders(): Promise<Order[]> {
    const response = await apiRequest('/orders', {
      method: 'GET'
    })
    
    return await response.json()
  }
}
