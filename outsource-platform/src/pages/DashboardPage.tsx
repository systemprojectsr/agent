import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  CreditCard, 
  ShoppingBag, 
  Star, 
  Bell, 
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CompanyStats } from '@/config/api'
import { ReviewsService } from '@/services/reviewsService'
import { BalanceService } from '@/services/balanceService'
import { OrdersService } from '@/services/ordersService'
import { NotificationsService } from '@/services/notificationsService'

export const DashboardPage: React.FC = () => {
  const { user, profile, isClient, isCompany } = useAuth()
  const navigate = useNavigate()
  
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.token) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user?.token) return

    try {
      // Загрузка баланса
      if (isClient()) {
        const balanceData = await BalanceService.getBalance(user.token)
        setBalance(balanceData)
      }

      // Загрузка статистики для компаний
      if (isCompany()) {
        const statsData = await ReviewsService.getCompanyStats(user.token)
        setStats(statsData)
      }

      // Загрузка последних заказов
      const ordersData = await OrdersService.getOrders(user.token, { limit: 5 })
      setRecentOrders(ordersData.orders)

      // Загрузка количества непрочитанных уведомлений
      const notificationsData = await NotificationsService.getNotifications(user.token, { limit: 1 })
      setUnreadNotifications(notificationsData.unread_count)

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
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
      pending: 'Ожидает',
      accepted: 'Принят',
      in_progress: 'В работе',
      completed: 'Завершен',
      cancelled: 'Отменен'
    }

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Загрузка дашборда...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать, {isClient() ? profile?.full_name : (profile as any)?.company_name}!
          </h1>
          <p className="text-gray-600">
            {isClient() ? 'Управляйте своими заказами и балансом' : 'Управляйте услугами и заказами'}
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isClient() && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Баланс</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{balance.toLocaleString('ru-RU')} ₽</div>
                  <p className="text-xs text-muted-foreground">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => navigate('/balance')}
                    >
                      Пополнить баланс
                    </Button>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Мои заказы</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentOrders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => navigate('/orders')}
                    >
                      Посмотреть все
                    </Button>
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {isCompany() && stats && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Доступный баланс</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.balance_available.toLocaleString('ru-RU')} ₽</div>
                  <p className="text-xs text-muted-foreground">
                    Общий доход: {stats.total_revenue.toLocaleString('ru-RU')} ₽
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего заказов</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_orders}</div>
                  <p className="text-xs text-muted-foreground">
                    Активных: {stats.active_orders}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Рейтинг</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.average_rating}</div>
                  <p className="text-xs text-muted-foreground">
                    Отзывов: {stats.review_count}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Услуги</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_services}</div>
                  <p className="text-xs text-muted-foreground">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => navigate('/services')}
                    >
                      Управление услугами
                    </Button>
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Уведомления</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadNotifications}</div>
              <p className="text-xs text-muted-foreground">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto"
                  onClick={() => navigate('/notifications')}
                >
                  Посмотреть все
                </Button>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Быстрые действия */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
              <CardDescription>Основные функции системы</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {isClient() && (
                  <>
                    <Button onClick={() => navigate('/')} className="h-20 flex flex-col">
                      <ShoppingBag className="h-6 w-6 mb-2" />
                      Найти услуги
                    </Button>
                    <Button onClick={() => navigate('/orders')} variant="outline" className="h-20 flex flex-col">
                      <Package className="h-6 w-6 mb-2" />
                      Мои заказы
                    </Button>
                    <Button onClick={() => navigate('/balance')} variant="outline" className="h-20 flex flex-col">
                      <CreditCard className="h-6 w-6 mb-2" />
                      Пополнить баланс
                    </Button>
                    <Button onClick={() => navigate('/profile')} variant="outline" className="h-20 flex flex-col">
                      <User className="h-6 w-6 mb-2" />
                      Профиль
                    </Button>
                  </>
                )}

                {isCompany() && (
                  <>
                    <Button onClick={() => navigate('/services')} className="h-20 flex flex-col">
                      <CreditCard className="h-6 w-6 mb-2" />
                      Мои услуги
                    </Button>
                    <Button onClick={() => navigate('/orders')} variant="outline" className="h-20 flex flex-col">
                      <Package className="h-6 w-6 mb-2" />
                      Заказы
                    </Button>
                    <Button onClick={() => navigate('/balance')} variant="outline" className="h-20 flex flex-col">
                      <TrendingUp className="h-6 w-6 mb-2" />
                      Финансы
                    </Button>
                    <Button onClick={() => navigate('/profile')} variant="outline" className="h-20 flex flex-col">
                      <User className="h-6 w-6 mb-2" />
                      Профиль
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Последние заказы */}
          <Card>
            <CardHeader>
              <CardTitle>Последние заказы</CardTitle>
              <CardDescription>
                Ваши недавние {isClient() ? 'заказы' : 'входящие заказы'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Заказов пока нет</p>
                  {isClient() && (
                    <Button onClick={() => navigate('/')} className="mt-2">
                      Найти услуги
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {isClient() ? order.company?.company_name : order.client?.full_name}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {order.card?.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.amount.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(order.CreatedAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/orders')}
                    className="w-full"
                  >
                    Посмотреть все заказы
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
