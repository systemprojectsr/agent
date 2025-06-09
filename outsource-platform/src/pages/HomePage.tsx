import React, { useState, useEffect } from 'react'
import { ServiceCard } from '@/config/api'
import { CardsService, SearchCardsParams } from '@/services/cardsService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Search, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {OrdersService} from "@/services/ordersService.ts";

const categories = [
  'Все категории',
  'Уборка',
  'Ремонт',
  'IT услуги',
  'Доставка',
  'Красота',
  'Образование',
  'Консультации',
  'Дизайн',
  'Маркетинг'
]

const locations = [
  'Все районы',
  'Центральный район',
  'Ленинский район',
  'Октябрьский район',
  'Кировский район',
  'Советский район'
]

export const HomePage: React.FC = () => {
  const [cards, setCards] = useState<ServiceCard[]>([])
  const [filteredCards, setFilteredCards] = useState<ServiceCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Все категории')
  const [selectedLocation, setSelectedLocation] = useState('Все районы')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    loadCards()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [cards, searchQuery, selectedCategory, selectedLocation, priceMin, priceMax])

  const loadCards = async () => {
    try {
      const data = await CardsService.getAllCards()
      setCards(data)
      setFilteredCards(data)
    } catch (error) {
      console.error('Failed to load cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    if (!Array.isArray(cards) || cards.length === 0) {
      setFilteredCards([])
      return
    }

    let filtered = [...cards] // создаем копию массива

    // Поиск по тексту
    if (searchQuery) {
      filtered = filtered.filter(card =>
          card.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.company?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Фильтр по категории
    if (selectedCategory !== 'Все категории') {
      filtered = filtered.filter(card => card.category === selectedCategory)
    }

    // Фильтр по району
    if (selectedLocation !== 'Все районы') {
      filtered = filtered.filter(card => card.location === selectedLocation)
    }

    // Фильтр по цене
    const minPrice = priceMin ? parseFloat(priceMin) : 0
    const maxPrice = priceMax ? parseFloat(priceMax) : Infinity
    filtered = filtered.filter(card => card.price >= minPrice && card.price <= maxPrice)

    setFilteredCards(filtered)
  }

  const handleSearch = async () => {
    if (!searchQuery && selectedCategory === 'Все категории' && selectedLocation === 'Все районы' && !priceMin && !priceMax) {
      return loadCards()
    }

    try {
      setLoading(true)
      const searchParams: SearchCardsParams = {}
      
      if (searchQuery) searchParams.q = searchQuery
      if (selectedCategory !== 'Все категории') searchParams.category = selectedCategory
      if (selectedLocation !== 'Все районы') searchParams.location = selectedLocation
      if (priceMin) searchParams.price_min = parseFloat(priceMin)
      if (priceMax) searchParams.price_max = parseFloat(priceMax)
      
      const data = await CardsService.searchCards(searchParams)
      setCards(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = (card: ServiceCard) => {
    if (!user) {
      navigate('/auth')
      return
    }

    if (user.type === 'client') {
      // Показываем подтверждение с информацией о стоимости
      const confirmMessage = `Создать заказ на услугу "${card.title}"?\n\nСтоимость: ${card.price.toLocaleString('ru-RU')}₽\nИсполнитель: ${card.company.company_name}\n\nСредства будут заблокированы до завершения работы.`
      
      if (!confirm(confirmMessage)) {
        return
      }

      const orderData = {
        company_id: card.company_id,
        card_id: card.id,
        description: `Заказ услуги "${card.title}" через платформу`
      }

      // Передаем цену карточки для проверки баланса и списания средств
      OrdersService.createOrder(user.token, orderData, card.price)
          .then(createdOrder => {
            alert(`Заказ #${createdOrder.id} успешно создан и оплачен!\nСредства заблокированы в эскроу до завершения работы.`)
            navigate('/orders')
          })
          .catch(error => {
            alert(`Ошибка создания заказа: ${error.message}`)
          })
    } else {
      alert('Только клиенты могут создавать заказы')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('Все категории')
    setSelectedLocation('Все районы')
    setPriceMin('')
    setPriceMax('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Загрузка услуг...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Найдите идеальные услуги
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Тысячи профессионалов готовы помочь вам
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Что вы ищете?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus:ring-0 text-lg text-gray-800"
                />
              </div>
              <Button onClick={handleSearch} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-5 h-5 mr-2" />
                Найти
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-800"
              >
                <Filter className="w-5 h-5 mr-2" />
                Фильтры
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="text-gray-800">
                      <SelectValue placeholder="Категория" />
                    </SelectTrigger>
                    <SelectContent className="text-gray-800">
                      {categories.map(category => (
                        <SelectItem key={category} value={category} className="text-gray-800">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="text-gray-800">
                      <SelectValue placeholder="Район" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Мин. цена"
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="text-gray-800"
                  />

                  <Input
                    placeholder="Макс. цена"
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="text-gray-800"
                  />
                </div>

                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="outline" onClick={clearFilters} className="text-gray-800">
                    Сбросить
                  </Button>
                  <Button onClick={handleSearch}>
                    Применить фильтры
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Доступные услуги ({filteredCards.length})
          </h2>
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Услуги не найдены
            </h3>
            <p className="text-gray-600 mb-4">
              Попробуйте изменить параметры поиска
            </p>
            <Button onClick={clearFilters}>
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{card.category}</Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {card.price.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {card.location}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={card.company.photo || 'https://cdn4.iconfinder.com/data/icons/basic-interface-overcolor/512/user-1024.png'}
                          alt={card.company.company_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium">
                            {card.company.company_name}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                            {card.company.stars} ({card.company.review_count})
                          </div>
                        </div>
                      </div>
                    </div>

                    {user?.type === 'client' && (
                      <Button
                        onClick={() => handleCreateOrder(card)}
                        className="w-full mt-4"
                      >
                        Заказать услугу
                      </Button>
                    )}

                    {!user && (
                      <Button
                        onClick={() => navigate('/auth')}
                        variant="outline"
                        className="w-full mt-4"
                      >
                        Войти для заказа
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
