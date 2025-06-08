import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Categories from './components/services/Categories';
import Filters from './components/services/Filters';
import ServiceCard from './components/services/ServiceCard';
import ClientProfile from './components/profile/ClientProfile';
import CompanyProfile from './components/profile/CompanyProfile';
import { Button } from './components/ui/button';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './components/ui/alert';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  location: string;
  rating: number;
  category?: string;
  company?: {
    id: number;
    company_name: string;
    stars: number;
    photo?: string;
  };
}

interface FilterState {
  priceFrom: number;
  priceTo: number;
  location: string;
  rating: number;
  sort: string;
}

function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'client' | 'company'>('client');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    priceFrom: 0,
    priceTo: 10000,
    location: '',
    rating: 0,
    sort: ''
  });
  const [apiInitialized, setApiInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'profile'>('home');

  // Инициализация API в глобальном объекте
  useEffect(() => {
    const initAPI = async () => {
      try {
        // Динамический импорт API модуля
        const { default: ServicePlatformAPI } = await import('./api.js');
        (window as any).serviceAPI = new ServicePlatformAPI();
        setApiInitialized(true);
        console.log('API успешно инициализирован');
      } catch (error) {
        console.error('Ошибка инициализации API:', error);
        setApiInitialized(false);
      }
    };
    
    initAPI();
  }, []);

  // Загружаем услуги независимо от состояния API
  useEffect(() => {
    loadServices();
  }, []);

  // Проверяем авторизацию после инициализации API
  useEffect(() => {
    if (apiInitialized) {
      checkAuthentication();
    }
  }, [apiInitialized]);

  // Применение фильтров
  useEffect(() => {
    applyFilters();
  }, [services, searchQuery, selectedCategory, currentFilters]);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token && apiInitialized) {
        // Проверяем токен через API только если API инициализирован
        const api = (window as any).serviceAPI;
        if (api) {
          try {
            const accountInfo = await api.getAccount();
            if (accountInfo && accountInfo.user) {
              setIsAuthenticated(true);
              setUserType(accountInfo.user.account?.type || 'client');
            }
          } catch (apiError) {
            console.warn('Ошибка проверки токена через API:', apiError);
            // Не удаляем токен, API может быть временно недоступен
          }
        }
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      // Только удаляем токен если это критическая ошибка
      if (error.message && error.message.includes('invalid')) {
        localStorage.removeItem('authToken');
      }
    }
  };

  const loadServices = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Загружаем карточки услуг из auth API...');
      const api = (window as any).serviceAPI;
      
      if (api) {
        // Получаем карточки услуг через новый API
        const response = await api.getAllCards(1, 20);
        if (response && response.cards && Array.isArray(response.cards)) {
          // Преобразуем карточки в формат Service
          const cards = response.cards.map((card: any) => ({
            id: card.id,
            name: card.title,
            description: card.description,
            price: card.price || 0,
            location: card.location || 'Не указано',
            rating: card.company?.stars || 0,
            category: card.category || '',
            company: card.company || {}
          }));
          
          setServices(cards);
          setError('');
          console.log('✅ Карточки услуг успешно загружены:', cards.length);
          setIsLoading(false);
          return;
        }
      }

      // Если API недоступен, пробуем прямой запрос
      console.log('Пробуем прямой запрос к auth API...');
      const response = await fetch('https://auth.tomsk-center.ru/cards?page=1&limit=20', {
        method: 'GET',
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.cards && Array.isArray(data.cards)) {
          const cards = data.cards.map((card: any) => ({
            id: card.id,
            name: card.title,
            description: card.description,
            price: card.price || 0,
            location: card.location || 'Не указано',
            rating: card.company?.stars || 0,
            category: card.category || '',
            company: card.company || {}
          }));
          
          setServices(cards);
          setError('');
          console.log('✅ Карточки услуг загружены прямым запросом:', cards.length);
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.warn('Ошибка загрузки карточек услуг:', error);
    }

    // Если все методы не сработали, используем демо-данные
    console.log('⚠️ Используем демонстрационные данные');
    setServices(getDemoServices());
    setError('Отображаются демонстрационные данные. Для полной функциональности запустите Go сервис.');
    setIsLoading(false);
  };

  const loadDemoServices = () => {
    setIsLoading(true);
    console.log('Загружаем демо-данные...');
    
    // Имитируем задержку загрузки для лучшего UX
    setTimeout(() => {
      setServices(getDemoServices());
      setError('Используются демонстрационные данные для демонстрации функционала.');
      setIsLoading(false);
    }, 500);
  };

  // Демонстрационные данные для случая недоступности API
  const getDemoServices = (): Service[] => {
    return [
      {
        id: 1,
        name: "Профессиональная мойка окон",
        description: "Качественная мойка окон в квартирах и офисах. Используем профессиональные средства, оставляем окна кристально чистыми без разводов.",
        price: 2000,
        location: "Центральный район",
        rating: 4.8,
        category: "Клининг",
        company: {
          id: 1,
          company_name: "ЧистоОкна Про",
          stars: 4.8
        }
      },
      {
        id: 2,
        name: "Химчистка мебели на дому",
        description: "Глубокая очистка мягкой мебели с выездом на дом. Удаляем любые пятна и запахи, используем безопасные средства.",
        price: 3500,
        location: "Северный район",
        rating: 4.9,
        category: "Клининг",
        company: {
          id: 2,
          company_name: "МебельЧист",
          stars: 4.9
        }
      },
      {
        id: 3,
        name: "Ремонт компьютеров и ноутбуков",
        description: "Диагностика и ремонт компьютерной техники. Замена комплектующих, установка ПО, настройка системы.",
        price: 1500,
        location: "Западный район",
        rating: 4.6,
        category: "IT услуги",
        company: {
          id: 3,
          company_name: "КомпьютерМастер",
          stars: 4.6
        }
      },
      {
        id: 4,
        name: "Электромонтажные работы",
        description: "Установка розеток, выключателей, замена проводки. Все виды электромонтажных работ с гарантией.",
        price: 2500,
        location: "Восточный район",
        rating: 4.7,
        category: "Ремонт",
        company: {
          id: 4,
          company_name: "ЭлектроСервис",
          stars: 4.7
        }
      },
      {
        id: 5,
        name: "Генеральная уборка квартир",
        description: "Комплексная уборка всех помещений: мытье полов, окон, сантехники, пылесос, влажная уборка.",
        price: 3000,
        location: "Центральный район",
        rating: 4.5,
        category: "Клининг",
        company: {
          id: 5,
          company_name: "УборкаПрофи",
          stars: 4.5
        }
      },
      {
        id: 6,
        name: "Грузовые перевозки по городу",
        description: "Перевозка мебели, техники, стройматериалов. Опытные грузчики, бережная упаковка, доставка точно в срок.",
        price: 1200,
        location: "Весь город",
        rating: 4.4,
        category: "Логистика",
        company: {
          id: 6,
          company_name: "ГрузТранс",
          stars: 4.4
        }
      },
      {
        id: 7,
        name: "Ремонт стиральных машин",
        description: "Ремонт всех марок стиральных машин на дому. Диагностика бесплатно, запчасти в наличии, гарантия на работы.",
        price: 2200,
        location: "Южный район",
        rating: 4.8,
        category: "Ремонт техники",
        company: {
          id: 7,
          company_name: "СтиралкаМастер",
          stars: 4.8
        }
      },
      {
        id: 8,
        name: "Малярные работы",
        description: "Покраска стен, потолков, фасадов. Подготовка поверхности, грунтовка, нанесение краски в несколько слоев.",
        price: 800,
        location: "Северный район",
        rating: 4.3,
        category: "Ремонт",
        company: {
          id: 8,
          company_name: "КраскаПро",
          stars: 4.3
        }
      },
      {
        id: 9,
        name: "Установка сантехники",
        description: "Монтаж и замена сантехнического оборудования: раковины, унитазы, ванны, смесители, трубы.",
        price: 2800,
        location: "Западный район",
        rating: 4.6,
        category: "Ремонт",
        company: {
          id: 9,
          company_name: "СантехМонтаж",
          stars: 4.6
        }
      },
      {
        id: 10,
        name: "Доставка продуктов на дом",
        description: "Быстрая доставка продуктов питания и товаров первой необходимости. Заказ принимаем круглосуточно.",
        price: 300,
        location: "Весь город",
        rating: 4.2,
        category: "Доставка",
        company: {
          id: 10,
          company_name: "БыстроДоставка",
          stars: 4.2
        }
      }
    ];
  };

  const applyFilters = () => {
    let filtered = [...services];

    // Поиск по названию и описанию
    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по категории (здесь используем location как категорию для демонстрации)
    if (selectedCategory) {
      filtered = filtered.filter(service =>
        service.location.includes(selectedCategory) ||
        service.name.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Фильтр по цене
    if (currentFilters.priceFrom > 0 || currentFilters.priceTo < 10000) {
      filtered = filtered.filter(service =>
        service.price >= currentFilters.priceFrom &&
        service.price <= currentFilters.priceTo
      );
    }

    // Фильтр по району
    if (currentFilters.location) {
      filtered = filtered.filter(service =>
        service.location === currentFilters.location
      );
    }

    // Фильтр по рейтингу
    if (currentFilters.rating > 0) {
      filtered = filtered.filter(service =>
        service.rating >= currentFilters.rating
      );
    }

    // Сортировка
    if (currentFilters.sort) {
      switch (currentFilters.sort) {
        case 'price_low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating_high':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'rating_low':
          filtered.sort((a, b) => a.rating - b.rating);
          break;
      }
    }

    setFilteredServices(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleFiltersChange = (filters: FilterState) => {
    setCurrentFilters(filters);
  };

  const handleServiceSelect = (service: Service) => {
    console.log('Выбрана услуга:', service);
    // Здесь можно добавить навигацию к детальной странице услуги
  };

  const handleProfileClick = () => {
    setCurrentPage('profile');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const handleAuthSuccess = () => {
    // Обновляем состояние авторизации после успешного входа/регистрации
    checkAuthentication();
  };

  const handleLogout = () => {
    const api = (window as any).serviceAPI;
    if (api && apiInitialized) {
      api.logout();
    } else {
      // Если API недоступен, просто очищаем локальные данные
      localStorage.removeItem('authToken');
    }
    setIsAuthenticated(false);
    setUserType('client');
    setCurrentPage('home');
  };

  // Рендер страницы профиля
  if (currentPage === 'profile' && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onSearch={handleSearch}
          isAuthenticated={isAuthenticated}
          userType={userType}
          onProfileClick={handleProfileClick}
          onLogout={handleLogout}
          onAuthSuccess={handleAuthSuccess}
        />
        
        {userType === 'client' ? (
          <ClientProfile onBack={handleBackToHome} />
        ) : (
          <CompanyProfile onBack={handleBackToHome} />
        )}
      </div>
    );
  }

  // Рендер главной страницы
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={handleSearch}
        isAuthenticated={isAuthenticated}
        userType={userType}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        onAuthSuccess={handleAuthSuccess}
      />

      <Categories
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />

      <Filters
        onFiltersChange={handleFiltersChange}
        isVisible={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant={error.includes('демонстрационные') ? "default" : "destructive"} className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {error.includes('CORS') && (
                <div className="mt-2 text-sm">
                  <strong>Техническая информация:</strong> Браузер блокирует запросы к API из соображений безопасности. 
                  Демонстрационные данные показывают полную функциональность платформы.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCategory ? `Услуги: ${selectedCategory}` : 'Все услуги'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isLoading ? 'Загрузка...' : `Найдено ${filteredServices.length} услуг`}
            </p>
          </div>
          
          {!isLoading && services.length > 0 && (
            <Button 
              variant="outline" 
              onClick={loadServices}
              className="flex items-center"
            >
              Обновить
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Загрузка услуг...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Услуги не найдены
            </h3>
            <p className="text-gray-600 mb-4">
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setCurrentFilters({
                    priceFrom: 0,
                    priceTo: 10000,
                    location: '',
                    rating: 0,
                    sort: ''
                  });
                }}
              >
                Сбросить фильтры
              </Button>
              <Button onClick={loadServices}>
                Обновить список
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={handleServiceSelect}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Услуги.Томск. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
