import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useServicesStore } from '@/store/servicesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ServiceCard from '@/components/services/ServiceCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SERVICE_CATEGORIES, SORT_OPTIONS } from '@/types/api';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    services, 
    searchParams: storeSearchParams,
    isSearching, 
    searchServices, 
    updateSearchParams,
    loadMoreServices,
    hasMore
  } = useServicesStore();

  const [searchQuery, setSearchQuery] = useState(storeSearchParams.query || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Initialize search from URL params or store
    const query = searchParams.get('q') || storeSearchParams.query || '';
    const category = searchParams.get('category') || storeSearchParams.category || '';
    const sort = searchParams.get('sort') || storeSearchParams.sort || 'date';

    setSearchQuery(query);
    
    const params = {
      query,
      category,
      sort: sort as any,
      page: 1,
      limit: 12,
    };

    updateSearchParams(params);
    searchServices(params);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = { ...storeSearchParams, query: searchQuery, page: 1 };
    updateSearchParams(params);
    searchServices(params);
    
    // Update URL
    const newSearchParams = new URLSearchParams();
    if (searchQuery) newSearchParams.set('q', searchQuery);
    if (storeSearchParams.category) newSearchParams.set('category', storeSearchParams.category);
    if (storeSearchParams.sort) newSearchParams.set('sort', storeSearchParams.sort);
    setSearchParams(newSearchParams);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = { ...storeSearchParams, [key]: value, page: 1 };
    updateSearchParams(params);
    searchServices(params);
  };

  const handleLoadMore = () => {
    if (!isSearching && hasMore) {
      loadMoreServices();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Поиск услуг..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
              Найти
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Фильтры
            </Button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория
                  </label>
                  <Select
                    value={storeSearchParams.category || ''}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все категории" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все категории</SelectItem>
                      {SERVICE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сортировка
                  </label>
                  <Select
                    value={storeSearchParams.sort || 'date'}
                    onValueChange={(value) => handleFilterChange('sort', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Местоположение
                  </label>
                  <Input
                    placeholder="Введите город"
                    value={storeSearchParams.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Результаты поиска
            {storeSearchParams.query && (
              <span className="text-gray-500 font-normal"> для "{storeSearchParams.query}"</span>
            )}
          </h2>
          {services.length > 0 && (
            <p className="text-gray-600">Найдено: {services.length} услуг</p>
          )}
        </div>

        {/* Services Grid */}
        {isSearching && services.length === 0 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : services.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={isSearching}
                  variant="outline"
                  size="lg"
                >
                  {isSearching ? 'Загрузка...' : 'Показать еще'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Услуги не найдены
            </h3>
            <p className="text-gray-600 mb-6">
              Попробуйте изменить параметры поиска или выберите другую категорию
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                updateSearchParams({ query: '', category: '', page: 1 });
                searchServices({ query: '', category: '', page: 1, limit: 12 });
              }}
              variant="outline"
            >
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
