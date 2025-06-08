import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FilterIcon, X, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface FilterState {
  priceFrom: number;
  priceTo: number;
  location: string;
  rating: number;
  sort: string;
}

interface FiltersProps {
  onFiltersChange?: (filters: FilterState) => void;
  isVisible?: boolean;
  onToggle?: () => void;
}

const Filters: React.FC<FiltersProps> = ({ onFiltersChange, isVisible = false, onToggle }) => {
  const [filters, setFilters] = useState<FilterState>({
    priceFrom: 0,
    priceTo: 10000,
    location: '',
    rating: 0,
    sort: ''
  });

  const locations = [
    'Все районы',
    'Центральный район',
    'Северный район', 
    'Западный район',
    'Восточный район',
    'Южный район'
  ];

  const sortOptions = [
    { value: '', label: 'По умолчанию' },
    { value: 'price_low', label: 'Сначала дешевые' },
    { value: 'price_high', label: 'Сначала дорогие' },
    { value: 'rating_high', label: 'По рейтингу' },
    { value: 'rating_low', label: 'По рейтингу (по возрастанию)' }
  ];

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handlePriceRangeChange = (values: number[]) => {
    const newFilters = { ...filters, priceFrom: values[0], priceTo: values[1] };
    setFilters(newFilters);
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const resetFilters = () => {
    const defaultFilters = {
      priceFrom: 0,
      priceTo: 10000,
      location: '',
      rating: 0,
      sort: ''
    };
    setFilters(defaultFilters);
    
    if (onFiltersChange) {
      onFiltersChange(defaultFilters);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceFrom > 0 || filters.priceTo < 10000) count++;
    if (filters.location && filters.location !== 'Все районы') count++;
    if (filters.rating > 0) count++;
    if (filters.sort) count++;
    return count;
  };

  if (!isVisible) {
    return (
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="outline" 
            onClick={onToggle}
            className="flex items-center"
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            Фильтры
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FilterIcon className="w-5 h-5 mr-2" />
                Фильтры
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={resetFilters}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Сбросить
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onToggle}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Цена */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Цена: {filters.priceFrom.toLocaleString()} - {filters.priceTo.toLocaleString()} ₽
                </Label>
                <Slider
                  value={[filters.priceFrom, filters.priceTo]}
                  onValueChange={handlePriceRangeChange}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="От"
                    value={filters.priceFrom}
                    onChange={(e) => handleFilterChange('priceFrom', parseInt(e.target.value) || 0)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="До"
                    value={filters.priceTo}
                    onChange={(e) => handleFilterChange('priceTo', parseInt(e.target.value) || 10000)}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Район */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Район</Label>
                <Select 
                  value={filters.location} 
                  onValueChange={(value) => handleFilterChange('location', value === 'Все районы' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите район" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Рейтинг */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Минимальный рейтинг: {filters.rating.toFixed(1)}
                </Label>
                <Slider
                  value={[filters.rating]}
                  onValueChange={(values) => handleFilterChange('rating', values[0])}
                  max={5}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Сортировка */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Сортировка</Label>
                <Select 
                  value={filters.sort} 
                  onValueChange={(value) => handleFilterChange('sort', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите сортировку" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Активные фильтры */}
            {getActiveFiltersCount() > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {(filters.priceFrom > 0 || filters.priceTo < 10000) && (
                    <Badge variant="secondary" className="flex items-center">
                      {filters.priceFrom.toLocaleString()} - {filters.priceTo.toLocaleString()} ₽
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => {
                          handleFilterChange('priceFrom', 0);
                          handleFilterChange('priceTo', 10000);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.location && filters.location !== 'Все районы' && (
                    <Badge variant="secondary" className="flex items-center">
                      {filters.location}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => handleFilterChange('location', '')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.rating > 0 && (
                    <Badge variant="secondary" className="flex items-center">
                      Рейтинг {filters.rating.toFixed(1)}+
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => handleFilterChange('rating', 0)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.sort && (
                    <Badge variant="secondary" className="flex items-center">
                      {sortOptions.find(opt => opt.value === filters.sort)?.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => handleFilterChange('sort', '')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Filters;
