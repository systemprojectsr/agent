import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  Wrench, 
  Sparkles, 
  Hammer, 
  Home,
  Car,
  PaintBucket,
  Zap,
  Laptop,
  ShoppingBag
} from 'lucide-react';

interface Category {
  name: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

interface CategoriesProps {
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

const Categories: React.FC<CategoriesProps> = ({ onCategorySelect, selectedCategory }) => {
  const categories: Category[] = [
    {
      name: 'Грузовые перевозки',
      count: 156,
      icon: <Truck className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      name: 'Ремонт техники',
      count: 89,
      icon: <Wrench className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      name: 'Клининг',
      count: 234,
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-purple-500'
    },
    {
      name: 'Ремонт и отделка',
      count: 178,
      icon: <Hammer className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      name: 'Бытовые услуги',
      count: 312,
      icon: <Home className="w-5 h-5" />,
      color: 'bg-pink-500'
    },
    {
      name: 'Автосервис',
      count: 67,
      icon: <Car className="w-5 h-5" />,
      color: 'bg-red-500'
    },
    {
      name: 'Покраска',
      count: 45,
      icon: <PaintBucket className="w-5 h-5" />,
      color: 'bg-yellow-500'
    },
    {
      name: 'Электрика',
      count: 98,
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-indigo-500'
    },
    {
      name: 'IT услуги',
      count: 123,
      icon: <Laptop className="w-5 h-5" />,
      color: 'bg-cyan-500'
    },
    {
      name: 'Доставка',
      count: 87,
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'bg-teal-500'
    }
  ];

  const handleCategoryClick = (categoryName: string) => {
    if (onCategorySelect) {
      // Если уже выбрана эта категория, снимаем выбор
      if (selectedCategory === categoryName) {
        onCategorySelect('');
      } else {
        onCategorySelect(categoryName);
      }
    }
  };

  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Популярные категории
          </h2>
          <p className="text-gray-600">
            Выберите категорию услуг, которая вас интересует
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={selectedCategory === category.name ? "default" : "outline"}
              className={`h-auto p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-all duration-200 ${
                selectedCategory === category.name ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center text-white`}>
                {category.icon}
              </div>
              <div className="text-center">
                <div className="font-medium text-sm leading-tight">
                  {category.name}
                </div>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {category.count}
                </Badge>
              </div>
            </Button>
          ))}
        </div>
        
        {selectedCategory && (
          <div className="mt-6 text-center">
            <Badge variant="outline" className="text-base px-4 py-2">
              Выбрана категория: {selectedCategory}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
