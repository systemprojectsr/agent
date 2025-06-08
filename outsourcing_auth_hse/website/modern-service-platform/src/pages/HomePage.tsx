import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import ServiceCard from '../components/ServiceCard'
import ServiceFilters from '../components/ServiceFilters'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Service {
  id: number
  name: string
  description: string
  price: number
  location: string
  rating: number
  photo?: string
  company?: string
  isAvailable?: boolean
  reviewsCount?: number
  responseTime?: string
}

interface FilterOptions {
  priceFrom?: number
  priceTo?: number
  location?: string
  rating?: number
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'name'
}

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [showFilters, setShowFilters] = useState(false)

  // Загрузка услуг при монтировании компонента
  useEffect(() => {
    loadServices()
  }, [])

  // Обновление URL при изменении поискового запроса
  useEffect(() => {
    if (searchQuery) {
      setSearchParams({ q: searchQuery })
    } else {
      setSearchParams({})
    }
  }, [searchQuery, setSearchParams])

  // Применение фильтров и поиска
  useEffect(() => {
    applyFiltersAndSearch()
  }, [services, filters, searchQuery])

  const loadServices = async () => {
    try {
      setLoading(true)
      
      // Ждем загрузки API клиента
      await new Promise(resolve => {
        const checkAPI = () => {
          if (window.serviceAPI) {
            resolve(true)
          } else {
            setTimeout(checkAPI, 100)
          }
        }
        checkAPI()
      })

      const response = await window.serviceAPI.getAllServices()
      
      if (Array.isArray(response)) {
        const servicesWithDefaults = response.map((service: any, index: number) => ({
          id: service.id || index + 1,
          name: service.name || 'Услуга без названия',
          description: service.description || 'Описание не указано',
          price: service.price || 1000,
          location: service.location || 'Центральный район',
          rating: service.rating || 4.0,
          photo: service.photo,
          company: service.company || 'Частный специалист',
          isAvailable: service.isAvailable !== false,
          reviewsCount: service.reviewsCount || Math.floor(Math.random() * 50) + 5,
          responseTime: service.responseTime || '1 час'
        }))
        setServices(servicesWithDefaults)
      } else {
        // Если API не работает, используем моковые данные
        setServices(getMockServices())
      }
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error)
      // Используем моковые данные в случае ошибки
      setServices(getMockServices())
      toast.error('Не удалось загрузить данные. Показаны примеры услуг.')
    } finally {
      setLoading(false)
    }
  }

  const getMockServices = (): Service[] => [
    {
      id: 1,
      name: 'Профессиональная уборка квартиры',
      description: 'Качественная уборка квартир и офисов. Используем профессиональные средства.',
      price: 2500,
      location: 'Центральный район',
      rating: 4.8,
      company: 'Чистота-Сервис',
      reviewsCount: 127,
      responseTime: '30 минут',
      isAvailable: true
    },
    {
      id: 2,
      name: 'Ремонт сантехники',
      description: 'Устранение протечек, замена кранов, установка сантехники.',
      price: 1800,
      location: 'Советский район',
      rating: 4.6,
      company: 'Мастер на дом',
      reviewsCount: 89,
      responseTime: '1 час',
      isAvailable: true
    },
    {
      id: 3,
      name: 'Маникюр и педикюр',
      description: 'Профессиональный маникюр и педикюр с покрытием гель-лак.',
      price: 1200,
      location: 'Кировский район',
      rating: 4.9,
      company: 'Салон красоты "Грация"',
      reviewsCount: 156,
      responseTime: '2 часа',
      isAvailable: true
    },
    {
      id: 4,
      name: 'Доставка продуктов',
      description: 'Быстрая доставка продуктов из магазинов прямо к вашему дому.',
      price: 300,
      location: 'Ленинский район',
      rating: 4.4,
      company: 'Экспресс-доставка',
      reviewsCount: 234,
      responseTime: '45 минут',
      isAvailable: true
    },
    {
      id: 5,
      name: 'Репетитор по математике',
      description: 'Индивидуальные занятия по математике для школьников и студентов.',
      price: 800,
      location: 'Октябрьский район',
      rating: 4.7,
      company: 'Образование-Плюс',
      reviewsCount: 67,
      responseTime: '3 часа',
      isAvailable: true
    },
    {
      id: 6,
      name: 'Мойка автомобиля',
      description: 'Профессиональная мойка автомобилей внутри и снаружи.',
      price: 800,
      location: 'Центральный район',
      rating: 4.3,
      company: 'АвтоМойка Премиум',
      reviewsCount: 45,
      responseTime: '1 час',
      isAvailable: true
    }
  ]

  const applyFiltersAndSearch = () => {
    let result = [...services]

    // Поиск по запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.company?.toLowerCase().includes(query)
      )
    }

    // Фильтрация по цене
    if (filters.priceFrom !== undefined) {
      result = result.filter(service => service.price >= filters.priceFrom!)
    }
    if (filters.priceTo !== undefined) {
      result = result.filter(service => service.price <= filters.priceTo!)
    }

    // Фильтрация по локации
    if (filters.location) {
      result = result.filter(service => service.location === filters.location)
    }

    // Фильтрация по рейтингу
    if (filters.rating !== undefined) {
      result = result.filter(service => service.rating >= filters.rating!)
    }

    // Сортировка
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          result.sort((a, b) => a.price - b.price)
          break
        case 'price_desc':
          result.sort((a, b) => b.price - a.price)
          break
        case 'rating':
          result.sort((a, b) => b.rating - a.rating)
          break
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name))
          break
      }
    }

    setFilteredServices(result)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query && filteredServices.length === 0) {
      // Если нет результатов, переходим на страницу фильтров
      navigate('/filter?q=' + encodeURIComponent(query))
    }
  }

  const handleContact = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId)
    toast.success(`Связываемся с поставщиком услуги "${service?.name}"`)
  }

  const handleFavorite = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId)
    toast.success(`Услуга "${service?.name}" добавлена в избранное`)
  }

  const handleView = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId)
    toast(`Просмотр подробной информации о "${service?.name}"`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      
      {/* Hero секция отображается только если нет поискового запроса */}
      {!searchQuery && <HeroSection onSearch={handleSearch} />}
      
      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Результаты поиска "{searchQuery}"
            </h2>
            <p className="text-gray-600">
              Найдено {filteredServices.length} услуг
            </p>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Фильтры */}
          <div className="lg:col-span-1">
            <ServiceFilters
              filters={filters}
              onFiltersChange={setFilters}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
              serviceCount={filteredServices.length}
            />
          </div>

          {/* Список услуг */}
          <div className="lg:col-span-3">
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.87 0-5.431.58-7.543 1.56A1.999 1.999 0 002 14.559V4a2 2 0 012-2h16a2 2 0 012 2v10.559a1.999 1.999 0 01-2.457 1.943A7.962 7.962 0 0012 15z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Услуги не найдены
                </h3>
                <p className="text-gray-500 mb-4">
                  Попробуйте изменить параметры поиска или фильтры
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilters({})
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onContact={handleContact}
                    onFavorite={handleFavorite}
                    onView={handleView}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
