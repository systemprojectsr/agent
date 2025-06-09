import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CardsService, CreateCardRequest, UpdateCardRequest } from '@/services/cardsService'
import { ServiceCard } from '@/config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin,
  DollarSign,
  Calendar,
  Package
} from 'lucide-react'

const categories = [
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
  'Центральный район',
  'Ленинский район',
  'Октябрьский район',
  'Кировский район',
  'Советский район'
]

export const ServicesPage: React.FC = () => {
  const { user, isCompany } = useAuth()
  const [cards, setCards] = useState<ServiceCard[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<ServiceCard | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [cardForm, setCardForm] = useState<CreateCardRequest>({
    title: '',
    description: '',
    category: '',
    location: '',
    price: 0
  })

  useEffect(() => {
    if (user?.token && isCompany()) {
      loadCards()
    }
  }, [user, isCompany])

  const loadCards = async () => {
    if (!user?.token) return

    try {
      setLoading(true)
      const data = await CardsService.getCompanyCards(user.token)
      setCards(data)
    } catch (error) {
      console.error('Failed to load cards:', error)
      setError('Ошибка загрузки услуг')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCardForm({
      title: '',
      description: '',
      category: '',
      location: '',
      price: 0
    })
    setEditingCard(null)
    setError('')
    setSuccess('')
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (card: ServiceCard) => {
    setCardForm({
      title: card.title,
      description: card.description,
      category: card.category,
      location: card.location,
      price: card.price
    })
    setEditingCard(card)
    setError('')
    setSuccess('')
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    resetForm()
    // Очищаем сообщения с задержкой
    setTimeout(() => {
      setError('')
      setSuccess('')
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.token) return

    setError('')
    setSuccess('')
    setActionLoading(true)

    try {
      if (editingCard) {
        // Обновление существующей карточки
        await CardsService.updateCard(user.token, editingCard.id, cardForm)
        setSuccess('Услуга успешно обновлена')
      } else {
        // Создание новой карточки
        await CardsService.createCard(user.token, cardForm)
        setSuccess('Услуга успешно создана')
      }
      
      // Закрываем диалог и обновляем список
      closeDialog()
      await loadCards()
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения услуги')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (cardId: number) => {
    if (!user?.token) return
    
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) {
      return
    }

    try {
      setActionLoading(true)
      await CardsService.deleteCard(user.token, cardId)
      setSuccess('Услуга успешно удалена')
      await loadCards()
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления услуги')
    } finally {
      setActionLoading(false)
    }
  }

  // Проверка доступа - только для компаний
  if (!isCompany()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Доступ запрещен</h1>
          <p className="text-gray-600">Эта страница доступна только для компаний</p>
        </div>
      </div>
    )
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои услуги</h1>
              <p className="text-gray-600">Управление предлагаемыми услугами</p>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить услугу
            </Button>
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

          {/* Список услуг */}
          {cards.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  У вас пока нет услуг
                </h3>
                <p className="text-gray-600 mb-4">
                  Создайте первую услугу, чтобы начать получать заказы
                </p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить услугу
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <Card key={card.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{card.category}</Badge>
                      <Badge variant={card.is_active ? 'default' : 'secondary'}>
                        {card.is_active ? 'Активна' : 'Неактивна'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {card.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {card.location}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {card.price.toLocaleString('ru-RU')} ₽
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(card.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(card)}
                        disabled={actionLoading}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Изменить
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(card.id)}
                        disabled={actionLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Диалог создания/редактирования услуги */}
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            if (!open) {
              closeDialog()
            } else {
              setDialogOpen(true)
            }
          }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCard ? 'Редактировать услугу' : 'Создать новую услугу'}
                </DialogTitle>
                <DialogDescription>
                  {editingCard ? 'Обновите информацию об услуге' : 'Заполните данные для новой услуги'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название услуги *</Label>
                    <Input
                      id="title"
                      placeholder="Профессиональная уборка квартиры"
                      value={cardForm.title}
                      onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Цена (₽) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="2500"
                      value={cardForm.price || ''}
                      onChange={(e) => setCardForm({ ...cardForm, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Категория *</Label>
                    <Select value={cardForm.category} onValueChange={(value) => setCardForm({ ...cardForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Район *</Label>
                    <Select value={cardForm.location} onValueChange={(value) => setCardForm({ ...cardForm, location: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите район" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание услуги *</Label>
                  <Textarea
                    id="description"
                    placeholder="Подробно опишите вашу услугу..."
                    value={cardForm.description}
                    onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    disabled={actionLoading}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading ? 'Сохранение...' : editingCard ? 'Обновить' : 'Создать'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
