import { apiRequest, createExtendedToken, ServiceCard } from '@/config/api'

export interface CreateCardRequest {
  title: string
  description: string
  category: string
  location: string
  price: number
}

export interface UpdateCardRequest extends CreateCardRequest {}

export interface SearchCardsParams {
  q?: string
  category?: string
  location?: string
  price_min?: number
  price_max?: number
}

// Сервис для работы с карточками услуг
export class CardsService {
  // Получение всех карточек услуг (публичный)
  static async getAllCards(): Promise<ServiceCard[]> {
    const response = await apiRequest('/cards', {
      method: 'GET'
    })

    const data = await response.json();
    return data.cards;
  }

  // Поиск карточек с фильтрами (публичный)
  static async searchCards(params: SearchCardsParams): Promise<ServiceCard[]> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    
    const response = await apiRequest(`/cards/search?${searchParams.toString()}`, {
      method: 'GET'
    })
    
    return await response.json()
  }

  // Получение карточки по ID (публичный)
  static async getCardById(id: number): Promise<ServiceCard> {
    const response = await apiRequest(`/cards/${id}`, {
      method: 'GET'
    })
    
    return await response.json()
  }

  // Получение карточек по категории (публичный)
  static async getCardsByCategory(category: string): Promise<ServiceCard[]> {
    const response = await apiRequest(`/cards/category/${category}`, {
      method: 'GET'
    })
    
    return await response.json()
  }

  // Получение карточек по ценовому диапазону (публичный)
  static async getCardsByPriceRange(min: number, max: number): Promise<ServiceCard[]> {
    const response = await apiRequest(`/cards/price-range?min=${min}&max=${max}`, {
      method: 'GET'
    })
    
    return await response.json()
  }

  // Создание карточки услуги (только для компаний)
  static async createCard(token: string, cardData: CreateCardRequest): Promise<ServiceCard> {
    const response = await apiRequest('/v1/account/card/create', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        card: cardData
      })
    })
    
    const data = await response.json()
    
    if (data.status_response?.status === 'success') {
      return data.card
    }
    
    throw new Error(data.error?.message || 'Failed to create service card')
  }

  // Получение списка карточек компании
  static async getCompanyCards(token: string): Promise<ServiceCard[]> {
    const response = await apiRequest('/v1/account/card/list', {
      method: 'POST',
      body: JSON.stringify(createExtendedToken(token))
    })
    
    const data = await response.json()
    
    if (response.status === 200) {
      return data.cards
    }
    
    throw new Error(data.error?.message || 'Failed to fetch company cards')
  }

  // Обновление карточки услуги
  static async updateCard(token: string, cardId: number, cardData: UpdateCardRequest): Promise<void> {
    const response = await apiRequest('/v1/account/card/update', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        card_id: cardId,
        card: cardData
      })
    })
    
    const data = await response.json()
    
    if (data.status_response?.status !== 'success') {
      throw new Error(data.error?.message || 'Failed to update service card')
    }
  }

  // Удаление карточки услуги
  static async deleteCard(token: string, cardId: number): Promise<void> {
    const response = await apiRequest('/v1/account/card/delete', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        card_id: cardId
      })
    })
    
    const data = await response.json()
    
    if (data.status_response?.status !== 'success') {
      throw new Error(data.error?.message || 'Failed to delete service card')
    }
  }
}
