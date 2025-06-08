import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Star, Users, Package, DollarSign } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { toast } from 'sonner'
import { apiRequest, API_ENDPOINTS } from '../config/api'

interface Service {
  id: number
  title: string
  description: string
  category: string
  location: string
  price: number
  created_at: string
  orders_count: number
  rating: number
}

interface CompanyStats {
  total_services: number
  active_orders: number
  completed_orders: number
  total_earnings: number
  average_rating: number
}

const CompanyDashboard: React.FC = () => {
  const { token } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    price: ''
  })

  useEffect(() => {
    fetchServices()
    fetchStats()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.cardList, {
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
        setServices(data.cards || [])
      } else {
        toast.error('Не удалось загрузить услуги')
      }
    } catch (error) {
      console.error('Services fetch error:', error)
      toast.error('Ошибка при загрузке услуг')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.companyStats, {
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
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Stats fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddService = async () => {
    if (!formData.title || !formData.description || !formData.price) {
      toast.error('Заполните все обязательные поля')
      return
    }

    try {
      const response = await apiRequest(API_ENDPOINTS.cardCreate, {
        method: 'POST',
        body: JSON.stringify({
          user: {
            login: {
              token: token
            }
          },
          card: {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            location: formData.location,
            price: parseFloat(formData.price)
          }
        })
      })

      if (response.ok) {
        toast.success('Услуга добавлена')
        setShowAddModal(false)
        setFormData({ title: '', description: '', category: '', location: '', price: '' })
        fetchServices()
      } else {
        toast.error('Не удалось добавить услугу')
      }
    } catch (error) {
      console.error('Add service error:', error)
      toast.error('Ошибка при добавлении услуги')
    }
  }

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) {
      return
    }

    try {
      const response = await apiRequest(API_ENDPOINTS.cardDelete, {
        method: 'POST',
        body: JSON.stringify({
          user: {
            login: {
              token: token
            }
          },
          card_id: serviceId
        })
      })

      if (response.ok) {
        toast.success('Услуга удалена')
        fetchServices()
      } else {
        toast.error('Не удалось удалить услугу')
      }
    } catch (error) {
      console.error('Delete service error:', error)
      toast.error('Ошибка при удалении услуги')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
          <p className="text-gray-600 mt-2">Управляйте своими услугами и заказами</p>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Услуги</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_services}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Активные заказы</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active_orders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Выполнено</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed_orders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Доходы</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_earnings.toLocaleString()} ₽</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Рейтинг</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.average_rating.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Заголовок и кнопка добавления */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Мои услуги</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить услугу</span>
          </button>
        </div>

        {/* Список услуг */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет услуг</h3>
              <p className="text-gray-600 mb-4">Добавьте свою первую услугу</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Добавить услугу
              </button>
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {service.title}
                  </h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditingService(service)
                        setFormData({
                          title: service.title,
                          description: service.description,
                          category: service.category,
                          location: service.location,
                          price: service.price.toString()
                        })
                        setShowAddModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{service.category}</span>
                  <span>{service.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {service.price.toLocaleString()} ₽
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm">{service.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{service.orders_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Модальное окно добавления/редактирования */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingService ? 'Редактировать услугу' : 'Добавить услугу'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название услуги *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: Веб-разработка"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Подробное описание услуги..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Выберите категорию</option>
                  <option value="Веб-разработка">Веб-разработка</option>
                  <option value="Мобильная разработка">Мобильная разработка</option>
                  <option value="Дизайн">Дизайн</option>
                  <option value="Маркетинг">Маркетинг</option>
                  <option value="Консалтинг">Консалтинг</option>
                  <option value="Другое">Другое</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Местоположение
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Томск"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingService(null)
                  setFormData({ title: '', description: '', category: '', location: '', price: '' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleAddService}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {editingService ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyDashboard