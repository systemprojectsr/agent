import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { useServicesStore } from '@/store/servicesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ServiceCard from '@/components/services/ServiceCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SERVICE_CATEGORIES } from '@/types/api';

const HomePage = () => {
  const navigate = useNavigate();
  const { 
    featuredServices, 
    isLoading, 
    getFeaturedServices, 
    searchServices, 
    updateSearchParams 
  } = useServicesStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getFeaturedServices();
  }, [getFeaturedServices]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      updateSearchParams({ query: searchQuery.trim() });
      navigate('/search');
    }
  };

  const handleCategoryClick = (category: string) => {
    updateSearchParams({ category, query: '' });
    navigate('/search');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Найдите идеальные услуги
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Тысячи проверенных исполнителей готовы помочь вам с любыми задачами
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Поиск услуги..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-full"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 px-8 h-14 rounded-full"
              >
                Найти
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex items-center gap-2 h-14 px-6 rounded-full"
                onClick={() => navigate('/search')}
              >
                <Filter className="h-4 w-4" />
                Все категории
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Популярные категории
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {SERVICE_CATEGORIES.slice(0, 10).map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors group"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🔧</div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                    {category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Рекомендуемые услуги
            </h2>
            <Link
              to="/search"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Посмотреть все
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredServices.length > 0 ? (
                featuredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Услуги загружаются...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Как это работает
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Найдите услугу</h3>
              <p className="text-gray-600">
                Используйте поиск или выберите категорию для поиска нужной услуги
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Свяжитесь с исполнителем</h3>
              <p className="text-gray-600">
                Обсудите детали задачи и договоритесь о цене с исполнителем
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Получите результат</h3>
              <p className="text-gray-600">
                Исполнитель выполняет работу, а вы получаете качественный результат
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Готовы предложить свои услуги?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам исполнителей и начните зарабатывать уже сегодня
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Стать исполнителем
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
