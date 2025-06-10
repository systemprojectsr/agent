import { apiRequest, createExtendedToken, Notification } from '@/config/api'

export interface NotificationListParams {
  is_read?: boolean | null
  limit?: number
  offset?: number
}

// Сервис для работы с уведомлениями
export class NotificationsService {
  // Получение списка уведомлений
  static async getNotifications(token: string, params: NotificationListParams = {}): Promise<{
    notifications: Notification[]
    total: number
    unread_count: number
  }> {
    const { is_read = null, limit = 10, offset = 0 } = params
    
    const response = await apiRequest('/v1/account/notification/list', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        is_read,
        limit,
        offset
      })
    })
    
    const data = await response.json()
    
    if (response.status === 200) {
      return {
        notifications: data.notifications,
        total: data.total,
        unread_count: data.unread_count
      }
    }
    
    throw new Error(data.error?.message || 'Failed to fetch notifications')
  }

  // Отметить уведомление как прочитанное
  static async markAsRead(token: string, notificationId: number): Promise<void> {
    const response = await apiRequest('/v1/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({
        ...createExtendedToken(token),
        notification_id: notificationId
      })
    })
    
    const data = await response.json()
    
    if (data.status_response?.status !== 'success') {
      throw new Error(data.error?.message || 'Failed to mark notification as read')
    }
  }
}
