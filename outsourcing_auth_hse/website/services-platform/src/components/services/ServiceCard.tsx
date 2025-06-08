import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, ArrowRight, ShoppingCart } from 'lucide-react';

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

interface ServiceCardProps {
  service: Service;
  onSelect?: (service: Service) => void;
  onOrder?: (service: Service) => void;
  isAuthenticated?: boolean;
  userType?: 'client' | 'company';
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onSelect, 
  onOrder, 
  isAuthenticated = false, 
  userType = 'client' 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-4 h-4 fill-yellow-200 text-yellow-400" />
        )}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {service.name}
          </h3>
          <Badge variant="secondary" className="ml-2 text-lg font-semibold shrink-0">
            {formatPrice(service.price)}
          </Badge>
        </div>
        
        {/* Информация о компании */}
        {service.company && (
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <span className="font-medium">{service.company.company_name}</span>
            <div className="ml-2 flex items-center">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
              <span>{service.company.stars.toFixed(1)}</span>
            </div>
          </div>
        )}
        
        {/* Категория */}
        {service.category && (
          <Badge variant="outline" className="text-xs w-fit">
            {service.category}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {service.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            {service.location}
          </div>
          
          <div className="flex items-center justify-between">
            {renderStars(service.rating)}
          </div>
          
          {/* Кнопки действий */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onSelect?.(service)}
              className="flex-1"
            >
              Подробнее
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            
            {/* Кнопка заказа только для авторизованных клиентов */}
            {isAuthenticated && userType === 'client' && onOrder && (
              <Button 
                size="sm" 
                onClick={() => onOrder(service)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Заказать
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
