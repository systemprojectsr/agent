import React, { useState } from 'react'
import { Filter, X, SlidersHorizontal, MapPin, Star, DollarSign } from 'lucide-react'

interface FilterOptions {
  priceFrom?: number
  priceTo?: number
  location?: string
  rating?: number
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'name'
}

interface ServiceFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  isOpen: boolean
  onToggle: () => void
  serviceCount?: number
}

const locations = [
  'Все районы',
  'Центральный район',
  'Советский район', 
  'Кировский район',
  'Ленинский район',
  'Октябрьский район'
]

const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
  serviceCount = 0
}) => {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters)

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...tempFilters, [key]: value }
    setTempFilters(newFilters)
  }

  const applyFilters = () => {
    onFiltersChange(tempFilters)
  }

  const resetFilters = () => {
    const emptyFilters = {}
    setTempFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <>
      {/* Кнопка фильтров для мобильных */}
      <div className="lg:hidden mb-4">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Фильтры</span>
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {Object.keys(filters).length}
            </span>
          )}
        </button>
      </div>

      {/* Панель фильтров */}
      <div className={`
        lg:block ${isOpen ? 'block' : 'hidden'}
        bg-white rounded-2xl shadow-lg p-6 sticky top-4
      `}>
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Фильтры</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Сбросить
              </button>
            )}
            <button
              onClick={onToggle}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Количество найденных услуг */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            Найдено услуг: <span className="font-semibold">{serviceCount}</span>
          </span>
        </div>

        {/* Сортировка */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Сортировка
          </label>
          <select
            value={tempFilters.sort || ''}
            onChange={(e) => handleFilterChange('sort', e.target.value || undefined)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">По умолчанию</option>
            <option value="price_asc">Цена: по возрастанию</option>
            <option value="price_desc">Цена: по убыванию</option>
            <option value="rating">По рейтингу</option>
            <option value="name">По названию</option>
          </select>
        </div>

        {/* Цена */}
        <div className="mb-6">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
            <DollarSign className="w-4 h-4" />
            <span>Цена, ₽</span>
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="От"
                value={tempFilters.priceFrom || ''}
                onChange={(e) => handleFilterChange('priceFrom', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="До"
                value={tempFilters.priceTo || ''}
                onChange={(e) => handleFilterChange('priceTo', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Локация */}
        <div className="mb-6">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
            <MapPin className="w-4 h-4" />
            <span>Район</span>
          </label>
          
          <select
            value={tempFilters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {locations.map((location, index) => (
              <option key={index} value={index === 0 ? '' : location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Рейтинг */}
        <div className="mb-6">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
            <Star className="w-4 h-4" />
            <span>Минимальный рейтинг</span>
          </label>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={tempFilters.rating === rating}
                  onChange={(e) => handleFilterChange('rating', e.target.checked ? rating : undefined)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-1">
                  {Array.from({ length: rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600">и выше</span>
                </div>
              </label>
            ))}
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                value=""
                checked={!tempFilters.rating}
                onChange={() => handleFilterChange('rating', undefined)}
                className="text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Любой рейтинг</span>
            </label>
          </div>
        </div>

        {/* Кнопка применения */}
        <button
          onClick={applyFilters}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          Применить фильтры
        </button>
      </div>
    </>
  )
}

export default ServiceFilters
