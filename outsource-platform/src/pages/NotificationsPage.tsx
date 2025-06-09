import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationsService, NotificationListParams } from '@/services/notificationsService'
import { Notification } from '@/config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Bell, 
  BellOff, 
  Check, 
  Package, 
  Star,
  CreditCard,
  Calendar,
  CheckCircle2
} from 'lucide-react'

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'read'>('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user?.token) {
      loadNotifications()
    }
  }, [user, selectedTab])

  const loadNotifications = async () => {
    if (!user?.token) return

    try {
      setLoading(true)
      const params: NotificationListParams = { 
        limit: 50,
        is_read: selectedTab === 'all' ? null : selectedTab === 'read' 
      }
      
      const data = await NotificationsService.getNotifications(user.token, params)
      setNotifications(data.notifications)
      setUnreadCount(data.unread_count)
    } catch (error) {
      console.error('Failed to load notifications:', error)
      setError('Ошибка загрузки уведомлений')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    if (!user?.token) return

    try {
      setActionLoading(notificationId)
      await NotificationsService.markAsRead(user.token, notificationId)
      setSuccess('Уведомление отмечено как прочитанное')
      await loadNotifications()
    } catch (error: any) {
      setError(error.message || 'Ошибка обновления уведомления')
    } finally {
      setActionLoading(null)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_new':
      case 'order_accepted':
      case 'order_completed':
      case 'order_cancelled':
        return <Package className="h-5 w-5 text-blue-600" />
      case 'rating_new':
        return <Star className="h-5 w-5 text-yellow-600" />
      case 'payment_received':
      case 'balance_updated':
        return <CreditCard className="h-5 w-5 text-green-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    const labels: any = {
      order_new: 'Новый заказ',
      order_accepted: 'Заказ принят',
      order_completed: 'Заказ завершен',
      order_cancelled: 'Заказ отменен',
      rating_new: 'Новый отзыв',
      payment_received: 'Платеж получен',
      balance_updated: 'Баланс обновлен'
    }
    return labels[type] || 'Уведомление'
  }

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes} мин назад`
    } else if (diffInHours < 24) {
      return `${diffInHours} ч назад`
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Загрузка уведомлений...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Уведомления
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-gray-600">Важные события и обновления</p>
          </div>

          {/* Уведомления об ошибках/успехе */}
          {success && (
            <Alert className="mb-6" variant="default">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Фильтры */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">
                    Все ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                    Непрочитанные ({unreadCount})
                  </TabsTrigger>
                  <TabsTrigger value="read">
                    Прочитанные ({notifications.length - unreadCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Список уведомлений */}
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BellOff className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Нет уведомлений
                </h3>
                <p className="text-gray-600">
                  {selectedTab === 'all' 
                    ? 'У вас пока нет уведомлений' 
                    : selectedTab === 'unread'
                    ? 'Все уведомления прочитаны'
                    : 'Нет прочитанных уведомлений'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all hover:shadow-md ${
                    !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Иконка */}
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Содержимое */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            
                            {!notification.is_read && (
                              <Badge variant="secondary" className="text-xs">
                                Новое
                              </Badge>
                            )}
                            
                            <Badge variant="outline" className="text-xs">
                              {getNotificationTypeLabel(notification.type)}
                            </Badge>
                          </div>

                          <p className="text-gray-600 mb-3">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatNotificationTime(notification.created_at)}
                            </div>

                            {notification.order_id && (
                              <div>
                                Заказ #{notification.order_id}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Действия */}
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoading === notification.id}
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {actionLoading === notification.id ? (
                              'Отмечается...'
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Прочитано
                              </>
                            )}
                          </Button>
                        )}

                        {notification.is_read && (
                          <div className="flex items-center text-green-600 text-sm">
                            <Check className="h-4 w-4 mr-1" />
                            Прочитано
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
