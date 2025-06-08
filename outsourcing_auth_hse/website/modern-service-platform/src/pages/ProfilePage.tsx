import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, Camera, Save, Wallet, CreditCard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import { toast } from 'sonner'
import { apiRequest, API_ENDPOINTS } from '../config/api'

interface UserProfile {
  id: number
  full_name: string
  email: string
  phone: string
  photo?: string
  type: string
  balance?: number
}

const ProfilePage: React.FC = () => {
  const { user, token, updateUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    photo: ''
  })
  const [topUpAmount, setTopUpAmount] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.account, {
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
        const profileData = data.user.account
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          photo: profileData.photo || ''
        })
      } else {
        toast.error('Не удалось загрузить профиль')
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
      toast.error('Ошибка при загрузке профиля')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.accountUpdate, {
        method: 'POST',
        body: JSON.stringify({
          user: {
            login: {
              token: token
            }
          },
          profile: formData
        })
      })

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, ...formData } : null)
        setEditing(false)
        toast.success('Профиль обновлен')
        updateUser({ ...user, ...formData })
      } else {
        toast.error('Не удалось обновить профиль')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Ошибка при обновлении профиля')
    }
  }

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast.error('Введите корректную сумму')
      return
    }

    try {
      const response = await apiRequest(API_ENDPOINTS.paymentTopup, {
        method: 'POST',
        body: JSON.stringify({
          user: {
            login: {
              token: token
            }
          },
          amount: parseFloat(topUpAmount)
        })
      })

      if (response.ok) {
        toast.success(`Счет пополнен на ${topUpAmount} ₽`)
        setTopUpAmount('')
        fetchProfile() // Обновляем баланс
      } else {
        toast.error('Не удалось пополнить счет')
      }
    } catch (error) {
      console.error('Top up error:', error)
      toast.error('Ошибка при пополнении счета')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
          <p className="text-gray-600 mt-2">Управляйте своей личной информацией и настройками</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Основная информация</h2>
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{editing ? 'Сохранить' : 'Редактировать'}</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Аватар */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {profile?.photo ? (
                      <img 
                        src={profile.photo} 
                        alt="Profile" 
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    {editing && (
                      <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg hover:bg-gray-50 transition-colors">
                        <Camera className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{profile?.full_name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{profile?.type}</p>
                  </div>
                </div>

                {/* Поля формы */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Полное имя
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Баланс */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Wallet className="h-5 w-5 inline mr-2" />
                Баланс
              </h3>
              <div className="text-3xl font-bold text-green-600 mb-4">
                {profile?.balance?.toLocaleString() || '0'} ₽
              </div>
              
              <div className="space-y-3">
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Сумма пополнения"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleTopUp}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Пополнить</span>
                </button>
              </div>
            </div>

            {/* Статистика */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Активных заказов</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Завершенных заказов</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Рейтинг</span>
                  <span className="font-medium">⭐ 0.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage