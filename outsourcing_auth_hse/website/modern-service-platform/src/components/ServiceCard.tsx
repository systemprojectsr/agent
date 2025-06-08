import React from 'react'
import { Star, MapPin, Clock, Heart, Phone, MessageCircle } from 'lucide-react'

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

interface ServiceCardProps {
  service: Service
  onContact?: (serviceId: number) => void
  onFavorite?: (serviceId: number) => void
  onView?: (serviceId: number) => void
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onContact, 
  onFavorite, 
  onView 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price)
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />
        )
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        )
      }
    }
    return stars
  }

  // Определяем изображение по умолчанию на основе названия услуги
  const getDefaultImage = (serviceName: string) => {
    const name = serviceName.toLowerCase()
    if (name.includes('уборка') || name.includes('чист')) return '/images/cleaning-service.jpg'
    if (name.includes('ремонт') || name.includes('монтаж')) return '/images/repair-service.jpg'
    if (name.includes('красота') || name.includes('маникюр') || name.includes('стрижка')) return '/images/beauty-service.jpg'
    if (name.includes('доставка') || name.includes('курьер')) return '/images/delivery-service.jpg'
    if (name.includes('обучение') || name.includes('репетитор')) return '/images/education-service.jpg'
    if (name.includes('мойка') || name.includes('автомобиль')) return '/images/car-wash-service.jpg'
    if (name.includes('сантехник') || name.includes('водопровод')) return '/images/plumbing-service.webp'
    if (name.includes('компьютер') || name.includes('программист') || name.includes('сайт')) return '/images/tech-service.jpg'
    return '/images/repair-service.jpg' // По умолчанию
  }

  const imageUrl = service.photo || getDefaultImage(service.name)

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group">
      {/* Изображение */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/images/repair-service.jpg'
          }}
        />
        
        {/* Статус доступности */}
        {service.isAvailable !== false && (
          <div className="absolute top-3 left-3">
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Доступен
            </span>
          </div>
        )}

        {/* Кнопка избранного */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavorite?.(service.id)
          }}
          className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 
                   rounded-full transition-all duration-200 hover:scale-110"
        >
          <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
        </button>

        {/* Цена */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full font-semibold">
            {formatPrice(service.price)}
          </span>
        </div>
      </div>

      {/* Контент */}
      <div className="p-5">
        {/* Заголовок и рейтинг */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {service.name}
          </h3>
          
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-1">
              {renderStars(service.rating)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {service.rating.toFixed(1)}
            </span>
            {service.reviewsCount && (
              <span className="text-sm text-gray-500">
                ({service.reviewsCount} отзывов)
              </span>
            )}
          </div>
        </div>

        {/* Описание */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>

        {/* Локация и время ответа */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{service.location}</span>
          </div>
          
          {service.responseTime && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Ответ в течение {service.responseTime}</span>
            </div>
          )}
          
          {service.company && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Компания:</span> {service.company}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView?.(service.id)
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 
                     rounded-lg font-medium transition-colors duration-200"
          >
            Подробнее
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onContact?.(service.id)
            }}
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 
                     text-white p-2 rounded-lg transition-colors duration-200"
          >
            <Phone className="w-5 h-5" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onContact?.(service.id)
            }}
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 
                     text-white p-2 rounded-lg transition-colors duration-200"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
