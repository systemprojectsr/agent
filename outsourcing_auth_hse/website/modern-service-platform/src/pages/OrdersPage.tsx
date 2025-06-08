import React, { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, XCircle, Eye, Star, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { toast } from 'sonner'
import { apiRequest, API_ENDPOINTS } from '../config/api'

interface Order {
  id: number
  service_name: string
  company_name: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  amount: number
  created_at: string
  completion_link?: string
  rating?: number
  description: string
}

const OrdersPage: React.FC = () => {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(0)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.ordersList, {
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
        setOrders(data.orders || [])
      } else {
        toast.error('Не удалось загрузить заказы')
      }
    } catch (error) {
      console.error('Orders fetch error:', error)
      toast.error('Ошибка при загрузке заказов')
    } finally {
      setLoading(false)
    }
  }

  const handleRateOrder = async (orderId: number) => {
    if (rating === 0) {
      toast.error('Выберите оценку')
      return
    }

    try {
      const response = await apiRequest(API_ENDPOINTS.ratingCreate, {
        method: 'POST',
        body: JSON.stringify({
          user: {
            login: {
              token: token
            }
          },
          order_id: orderId,
          rating: rating
        })
      })

      if (response.ok) {
        toast.success('Оценка отправлена')
        setShowRatingModal(false)
        setRating(0)
        fetchOrders()
      } else {
        toast.error('Не удалось отправить оценку')
      }
    } catch (error) {
      console.error('Rating error:', error)
      toast.error('Ошибка при отправке оценки')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Ожидание
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            В работе
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Выполнен
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Отменен
          </span>
        )
      default:
        return null
    }
  }

  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'active':
        return order.status === 'pending' || order.status === 'in_progress'
      case 'completed':
        return order.status === 'completed'
      case 'cancelled':
        return order.status === 'cancelled'
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Мои заказы</h1>
          <p className="text-gray-600 mt-2">Отслеживайте статус ваших заказов</p>
        </div>

        {/* Табы */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'Все заказы', count: orders.length },
                { key: 'active', label: 'Активные', count: orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length },
                { key: 'completed', label: 'Выполненные', count: orders.filter(o => o.status === 'completed').length },
                { key: 'cancelled', label: 'Отмененные', count: orders.filter(o => o.status === 'cancelled').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Список заказов */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Заказы не найдены</h3>
              <p className="text-gray-600">У вас пока нет заказов в этой категории</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.service_name}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <p className="text-gray-600 mb-2">Компания: {order.company_name}</p>
                    <p className="text-gray-600 mb-4">{order.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold text-green-600">
                          {order.amount.toLocaleString()} ₽
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Подробнее</span>
                        </button>
                        
                        {order.status === 'completed' && !order.rating && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowRatingModal(true)
                            }}
                            className="flex items-center space-x-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                          >
                            <Star className="h-4 w-4" />
                            <span>Оценить</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Модальное окно оценки */}
      {showRatingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Оценить услугу</h3>
            <p className="text-gray-600 mb-4">{selectedOrder.service_name}</p>
            
            <div className="flex items-center space-x-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  ⭐
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRatingModal(false)
                  setRating(0)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleRateOrder(selectedOrder.id)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage