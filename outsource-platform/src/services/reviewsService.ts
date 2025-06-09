import { apiRequest, createExtendedToken, Review, CompanyStats } from '@/config/api'

export interface CreateReviewRequest {
  order_id: number
  rating: number
  comment: string
}

// Сервис для работы с отзывами и статистикой
export class ReviewsService {
  // Создание отзыва
  static async createReview(token: string, reviewData: CreateReviewRequest): Promise<void> {
    const response = await apiRequest('/v1/ratings/create', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        ...reviewData
      })
    })
    
    const data = await response.json()
    
    if (data.status_response?.status !== 'success') {
      throw new Error(data.error?.message || 'Failed to create review')
    }
  }

  // Получение отзывов компании (публичный)
  static async getCompanyReviews(companyId: number): Promise<{reviews: Review[], total: number}> {
    const response = await apiRequest(`/reviews/company/${companyId}`, {
      method: 'GET'
    })
    
    const data = await response.json()
    
    if (data.status_response?.status === 'success') {
      return {
        reviews: data.reviews,
        total: data.total
      }
    }
    
    throw new Error(data.error?.message || 'Failed to fetch company reviews')
  }

  // Получение рейтинга компании (публичный)
  static async getCompanyRating(companyId: number): Promise<{rating: number, review_count: number}> {
    const response = await apiRequest(`/companies/${companyId}/rating`, {
      method: 'GET'
    })
    
    return await response.json()
  }

  // Получение статистики компании
  static async getCompanyStats(token: string): Promise<CompanyStats> {
    const response = await apiRequest('/v1/account/stats/company', {
      method: 'POST',
      body: JSON.stringify(createExtendedToken(token))
    })
    
    const data = await response.json()
    
    if (data.status_response?.status === 'success') {
      return data.stats
    }
    
    throw new Error(data.error?.message || 'Failed to fetch company stats')
  }
}
