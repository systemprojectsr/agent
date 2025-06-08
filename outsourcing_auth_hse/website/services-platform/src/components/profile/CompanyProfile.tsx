import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building, 
  Mail, 
  Phone, 
  Edit, 
  Save, 
  X, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Star,
  MapPin 
} from 'lucide-react';

interface CompanyData {
  id: number;
  company_name: string;
  stars: number;
  email: string;
  photo?: string;
  type: string;
}

interface ServiceCard {
  id: number;
  title: string;
  description: string;
  company_id: number;
}

interface CompanyProfileProps {
  onBack: () => void;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ onBack }) => {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [serviceCards, setServiceCards] = useState<ServiceCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCardsLoading, setIsCardsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    loadCompanyData();
    loadServiceCards();
  }, []);

  const loadCompanyData = async () => {
    setIsLoading(true);
    try {
      const api = (window as any).serviceAPI;
      if (!api) {
        throw new Error('API не инициализован');
      }

      const response = await api.getAccount();
      if (response.user && response.user.account) {
        setCompanyData(response.user.account);
      } else {
        throw new Error('Данные профиля не найдены');
      }
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err);
      setError('Не удалось загрузить данные профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const loadServiceCards = async () => {
    setIsCardsLoading(true);
    try {
      const api = (window as any).serviceAPI;
      if (!api) return;

      const response = await api.getCards();
      if (response.cards) {
        setServiceCards(response.cards);
      }
    } catch (err) {
      console.error('Ошибка загрузки карточек:', err);
    } finally {
      setIsCardsLoading(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.title || !newCard.description) return;

    try {
      const api = (window as any).serviceAPI;
      if (!api) throw new Error('API не инициализован');

      const response = await api.createCard(newCard.title, newCard.description);
      if (response.card) {
        setServiceCards(prev => [...prev, response.card]);
        setNewCard({ title: '', description: '' });
        setShowAddCard(false);
      }
    } catch (err) {
      console.error('Ошибка создания карточки:', err);
      setError('Не удалось создать карточку услуги');
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    try {
      const api = (window as any).serviceAPI;
      if (!api) throw new Error('API не инициализован');

      // Пытаемся удалить через API
      const deleteData = {
        user: {
          login: {
            token: api.token
          }
        },
        card: {
          id: cardId
        }
      };

      const response = await fetch(`${api.authUrl}/v1/account/card/delete`, {
        method: 'POST',
        headers: api.defaultHeaders,
        body: JSON.stringify(deleteData)
      });

      if (response.ok) {
        setServiceCards(prev => prev.filter(card => card.id !== cardId));
      } else {
        throw new Error('Ошибка удаления');
      }
    } catch (err) {
      console.error('Ошибка удаления карточки:', err);
      // Удаляем локально даже если API не работает
      setServiceCards(prev => prev.filter(card => card.id !== cardId));
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error && !companyData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Профиль компании</h1>
            <p className="text-gray-600">Управление услугами и профилем</p>
          </div>
        </div>
        <Badge variant="default">
          <Building className="w-4 h-4 mr-1" />
          Компания
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Информация о компании */}
      {companyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Информация о компании
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Название компании</p>
                    <p className="font-medium text-lg">{companyData.company_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{companyData.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Рейтинг</p>
                    <div className="flex items-center space-x-1">
                      {renderStars(Math.floor(companyData.stars))}
                      <span className="font-medium ml-2">{companyData.stars}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">ID компании</p>
                  <p className="font-medium">#{companyData.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Управление карточками услуг */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Карточки услуг</CardTitle>
            <Button onClick={() => setShowAddCard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить услугу
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Форма добавления новой карточки */}
          {showAddCard && (
            <Card className="mb-6 border-dashed">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Новая услуга</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddCard(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCard} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название услуги</Label>
                    <Input
                      id="title"
                      value={newCard.title}
                      onChange={(e) => setNewCard(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Например: Профессиональная мойка окон"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={newCard.description}
                      onChange={(e) => setNewCard(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Подробное описание вашей услуги..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Создать услугу
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAddCard(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Список карточек */}
          {isCardsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Загрузка карточек...</p>
            </div>
          ) : serviceCards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>У вас пока нет карточек услуг</p>
              <p className="text-sm">Создайте первую карточку, чтобы клиенты могли найти ваши услуги</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceCards.map((card) => (
                <Card key={card.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{card.title}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCard(card.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-3">{card.description}</p>
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-xs text-gray-500">ID: #{card.id}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Действия */}
      <Card>
        <CardHeader>
          <CardTitle>Действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <Mail className="w-4 h-4 mr-2" />
              История заказов
            </Button>
            <Button variant="outline" className="justify-start">
              <Building className="w-4 h-4 mr-2" />
              Настройки компании
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              variant="destructive" 
              onClick={() => {
                const api = (window as any).serviceAPI;
                if (api) api.logout();
                onBack();
                window.location.reload();
              }}
            >
              Выйти из аккаунта
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfile;
