import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { OrdersService, OrderListParams, OrderAction } from '@/services/ordersService'
import { ReviewsService } from '@/services/reviewsService'
import { Order } from '@/config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star,
  MessageSquare,
  Calendar,
  User,
  Building,
  Banknote
} from 'lucide-react'

export const OrdersPage: React.FC = () => {
  const { user, isClient, isCompany } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'>('all')
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean, order: Order | null }>({ open: false, order: null })
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user?.token) {
      loadOrders()
    }
  }, [user, selectedStatus])

  const loadOrders = async () => {
    if (!user?.token) return

    try {
      setLoading(true)
      const params: OrderListParams = { status: selectedStatus, limit: 50 }
      const data = await OrdersService.getOrders(user.token, params)
      setOrders(data.orders)
    } catch (error) {
      console.error('Failed to load orders:', error)
      setError('Ошибка загрузки заказов')
    } finally {
      setLoading(false)
    }
  }

  const handleOrderAction = async (orderId: number, action: OrderAction) => {
    if (!user?.token) return

    try {
      setActionLoading(orderId)
      await OrdersService.updateOrderStatus(user.token, orderId, action)
      setSuccess(`Статус заказа обновлен`)
      await loadOrders()
    } catch (error: any) {
      setError(error.message || 'Ошибка обновления статуса')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReviewSubmit = async () => {
    if (!user?.token || !reviewDialog.order) return

    try {
      await ReviewsService.createReview(user.token, {
        order_id: reviewDialog.order.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      })
      setSuccess('Отзыв успешно добавлен')
      setReviewDialog({ open: false, order: null })
      setReviewForm({ rating: 5, comment: '' })
      await loadOrders()
    } catch (error: any) {
      setError(error.message || 'Ошибка добавления отзыва')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'accepted':
      case 'in_progress':
        return <Package className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'secondary',
      accepted: 'default',
      in_progress: 'outline',
      completed: 'default',
      cancelled: 'destructive'
    }

    const labels: any = {
      pending: 'Ожидает подтверждения',
      accepted: 'Принят',
      in_progress: 'В работе',
      completed: 'Завершен',
      cancelled: 'Отменен'
    }

    return (
      <Badge variant={variants[status] || 'secondary'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {labels[status] || status}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants: any = {
      unpaid: 'destructive',
      paid: 'default',
      refunded: 'secondary'
    }

    const labels: any = {
      unpaid: 'Не оплачен',
      paid: 'Оплачен',
      refunded: 'Возвращен'
    }

    return (
      <Badge variant={variants[status] || 'secondary'}>
        <Banknote className="h-3 w-3 mr-1" />
        {labels[status] || status}
      </Badge>
    )
  }

  const filteredOrders = orders.filter(order => {
    if (selectedStatus === 'all') return true
    return order.status === selectedStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Загрузка заказов...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isClient() ? 'Мои заказы' : 'Входящие заказы'}
            </h1>
            <p className="text-gray-600">
              {isClient() ? 'Управление вашими заказами' : 'Управление заказами от клиентов'}
            </p>
          </div>

          {/* Уведомления */}
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
            <CardHeader>
              <CardTitle>Фильтры</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="pending">Ожидают</TabsTrigger>
                  <TabsTrigger value="in_progress">В работе</TabsTrigger>
                  <TabsTrigger value="completed">Завершены</TabsTrigger>
                  <TabsTrigger value="cancelled">Отменены</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Список заказов */}
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Заказов не найдено
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedStatus === 'all' 
                    ? 'У вас пока нет заказов' 
                    : `Нет заказов со статусом "${selectedStatus}"`
                  }
                </p>
                {isClient() && (
                  <Button onClick={() => window.location.href = '/'}>
                    Найти услуги
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            Заказ #{order.id}
                          </CardTitle>
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.payment_status)}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(order.created_at).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {order.amount.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Информация о сторонах */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm font-medium">
                          {isClient() ? <Building className="h-4 w-4 mr-2" /> : <User className="h-4 w-4 mr-2" />}
                          {isClient() ? 'Исполнитель' : 'Клиент'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {isClient() ? order.company?.company_name : order.client?.full_name}
                        </div>
                        {isClient() && order.company?.stars && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                            {order.company.stars}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Услуга</div>
                        <div className="text-sm text-gray-600">
                          {order.card?.title}
                        </div>
                      </div>
                    </div>

                    {/* Описание заказа */}
                    {order.description && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Описание заказа</div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {order.description}
                        </div>
                      </div>
                    )}

                    {/* Действия */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      {/* Действия для клиентов */}
                      {isClient() && (
                        <>
                          {order.can_cancel && (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={actionLoading === order.id}
                              onClick={() => handleOrderAction(order.id, 'cancel')}
                            >
                              {actionLoading === order.id ? 'Отмена...' : 'Отменить заказ'}
                            </Button>
                          )}
                          
                          {order.can_pay && order.payment_status === 'unpaid' && (
                            <Button
                              size="sm"
                              disabled={actionLoading === order.id}
                              onClick={() => {
                                // TODO: Интеграция с платежной системой
                                alert('Интеграция с платежной системой в разработке')
                              }}
                            >
                              Оплатить
                            </Button>
                          )}
                          
                          {order.can_rate && order.status === 'completed' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setReviewDialog({ open: true, order })}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  Оставить отзыв
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                          )}
                        </>
                      )}

                      {/* Действия для компаний */}
                      {isCompany() && (
                        <>
                          {order.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                disabled={actionLoading === order.id}
                                onClick={() => handleOrderAction(order.id, 'accept')}
                              >
                                {actionLoading === order.id ? 'Принятие...' : 'Принять заказ'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={actionLoading === order.id}
                                onClick={() => handleOrderAction(order.id, 'reject')}
                              >
                                {actionLoading === order.id ? 'Отклонение...' : 'Отклонить'}
                              </Button>
                            </>
                          )}
                          
                          {order.status === 'accepted' && (
                            <Button
                              size="sm"
                              disabled={actionLoading === order.id}
                              onClick={() => handleOrderAction(order.id, 'start')}
                            >
                              {actionLoading === order.id ? 'Начало...' : 'Начать работу'}
                            </Button>
                          )}
                          
                          {order.status === 'in_progress' && (
                            <Button
                              size="sm"
                              disabled={actionLoading === order.id}
                              onClick={() => handleOrderAction(order.id, 'complete')}
                            >
                              {actionLoading === order.id ? 'Завершение...' : 'Завершить работу'}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Диалог отзыва */}
          <Dialog 
            open={reviewDialog.open} 
            onOpenChange={(open) => setReviewDialog({ open, order: reviewDialog.order })}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Оставить отзыв</DialogTitle>
                <DialogDescription>
                  Оцените качество выполненной работы
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Оценка</Label>
                  <Select value={reviewForm.rating.toString()} onValueChange={(value) => setReviewForm({ ...reviewForm, rating: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 - Отлично</SelectItem>
                      <SelectItem value="4">4 - Хорошо</SelectItem>
                      <SelectItem value="3">3 - Нормально</SelectItem>
                      <SelectItem value="2">2 - Плохо</SelectItem>
                      <SelectItem value="1">1 - Ужасно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comment">Комментарий</Label>
                  <Textarea
                    id="comment"
                    placeholder="Расскажите о качестве работы..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setReviewDialog({ open: false, order: null })}
                >
                  Отмена
                </Button>
                <Button onClick={handleReviewSubmit}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Отправить отзыв
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
