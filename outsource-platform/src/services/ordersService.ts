import { apiRequest, createSimpleToken, createExtendedToken, Order } from '@/config/api'
import { BalanceService } from './balanceService'
import { handlePayOrder } from '@/services/ordersService';

export interface CreateOrderRequest {
  company_id: number
  card_id: number
  description: string
}

export interface OrderListParams {
  status?: 'all' | 'created' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
  limit?: number
  offset?: number
}

export type OrderAction = 'accept' | 'reject' | 'start' | 'complete' | 'cancel'

// Сервис для работы с заказами
export class OrdersService {
  // Создание заказа с проверкой баланса и автоматической оплатой
  static async createOrder(token: string, orderData: CreateOrderRequest, cardPrice: number): Promise<Order> {
    try {
      // 1. Проверяем баланс клиента
      const currentBalance = await BalanceService.getBalance(token)
      
      if (currentBalance < cardPrice) {
        throw new Error(`Недостаточно средств. Требуется: ${cardPrice}₽, доступно: ${currentBalance}₽`)
      }

      // 2. Создаем заказ
      const response = await apiRequest('/v1/account/order/create', {
        method: 'POST',
        body: JSON.stringify({
          ...createExtendedToken(token),
          order: orderData
        })
      })
      
      const data = await response.json()
      
      if (data.order) {
        // 3. После успешного создания заказа, снимаем деньги с баланса клиента (создаем эскроу)
        try {
          // await BalanceService.withdrawBalance(token, cardPrice)
          // console.log(`Средства ${cardPrice}₽ заблокированы в эскроу для заказа #${data.order.id}`)
        } catch (withdrawError) {
          console.error('Ошибка снятия средств:', withdrawError)
          // В реальном приложении здесь нужно отменить заказ или обработать ошибку
        }
        
        return data.order
      }
      
      throw new Error(data.error?.message || 'Failed to create order')
    } catch (error: any) {
      console.error('Order creation failed:', error)
      throw error
    }
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

  static async payOrder(token: string, orderId: number): Promise<void> {
    const response = await apiRequest('/v1/account/order/pay', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        order_id: orderId
      })
    })

    const data = await response.json()
    if (data.message !== 'Order paid successfully') {
      throw new Error(data.error?.message || 'Failed to pay order')
    }
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
