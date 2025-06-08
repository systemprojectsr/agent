import React, { useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'

interface HeroSectionProps {
  onSearch: (query: string) => void
}

const popularCategories = [
  { name: 'Уборка', icon: '🧹', count: 127 },
  { name: 'Ремонт', icon: '🔧', count: 89 },
  { name: 'Красота', icon: '💄', count: 76 },
  { name: 'Доставка', icon: '🚚', count: 94 },
  { name: 'Обучение', icon: '📚', count: 52 },
  { name: 'Автомойка', icon: '🚗', count: 38 },
  { name: 'Сантехника', icon: '🚿', count: 45 },
  { name: 'IT-услуги', icon: '💻', count: 61 }
]

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  const handleCategoryClick = (categoryName: string) => {
    onSearch(categoryName)
  }

  return (
    <section 
      className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 111, 238, 0.8), rgba(59, 130, 246, 0.8)), url('/images/hero-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Заголовок */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Найдите лучшие услуги
            <br />
            <span className="text-yellow-300">рядом с вами</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Тысячи проверенных специалистов готовы помочь вам с любой задачей
          </p>

          {/* Поисковая строка */}
          <div className="max-w-4xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative bg-white rounded-full shadow-2xl overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Что вам нужно? Например: 'уборка квартиры' или 'ремонт крана'..."
                  className="w-full pl-6 pr-20 py-4 md:py-6 text-gray-700 text-lg focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 bg-blue-500 hover:bg-blue-600 text-white px-8 rounded-full transition-colors duration-200 flex items-center justify-center"
                >
                  <Search className="h-6 w-6" />
                  <span className="hidden md:block ml-2 font-medium">Найти</span>
                </button>
              </div>
            </form>
          </div>

          {/* Популярные категории */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-6 text-blue-100">
              Популярные категории услуг
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {popularCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category.name)}
                  className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 
                           rounded-xl p-4 hover:bg-opacity-20 transition-all duration-200 
                           hover:scale-105 hover:shadow-xl group"
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium text-white group-hover:text-yellow-300 transition-colors">
                    {category.name}
                  </div>
                  <div className="text-xs text-blue-200 mt-1">
                    {category.count} услуг
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Кнопка "Все категории" */}
          <button
            onClick={() => onSearch('')}
            className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-full 
                     font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg"
          >
            Все категории
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white bg-opacity-5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-yellow-300 bg-opacity-10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-300 bg-opacity-10 rounded-full blur-xl"></div>
      </div>
    </section>
  )
}

export default HeroSection
