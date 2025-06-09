import { apiRequest, createSimpleToken, createExtendedToken, Transaction } from '@/config/api'

export interface TransactionListParams {
  limit?: number
  offset?: number
}

// Сервис для работы с балансом
export class BalanceService {
  // Получение баланса
  static async getBalance(token: string): Promise<number> {
    const response = await apiRequest('/v1/account/balance/', {
      method: 'POST',
      body: JSON.stringify(createSimpleToken(token))
    })
    
    const data = await response.json()
    
    if (response.status === 200) {
      return data.balance
    }
    
    throw new Error(data.error?.message || 'Failed to fetch balance')
  }

  // Пополнение баланса
  static async depositBalance(token: string, amount: number): Promise<number> {
    const response = await apiRequest('/v1/account/balance/deposit', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        amount
      })
    })
    
    const data = await response.json()
    
    if (data.status_response?.status === 'success') {
      return data.balance
    }
    
    throw new Error(data.error?.message || 'Failed to deposit balance')
  }

  // Вывод средств
  static async withdrawBalance(token: string, amount: number): Promise<number> {
    const response = await apiRequest('/v1/account/balance/withdraw', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        amount
      })
    })
    
    const data = await response.json()
    
    if (data.status_response?.status === 'success') {
      return data.balance
    }
    
    throw new Error(data.error?.message || 'Failed to withdraw balance')
  }

  // История транзакций
  static async getTransactions(token: string, params: TransactionListParams = {}): Promise<{transactions: Transaction[], total: number}> {
    const { limit = 10, offset = 0 } = params
    
    const response = await apiRequest('/v1/account/balance/transactions', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        limit,
        offset
      })
    })
    
    const data = await response.json()
    
    if (response.status === 200) {
      return {
        transactions: data.transactions,
        total: data.total
      }
    }
    
    throw new Error(data.error?.message || 'Failed to fetch transactions')
  }
}
