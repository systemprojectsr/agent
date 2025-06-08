import { Link } from 'react-router-dom';
import { Star, ArrowRight, MapPin } from 'lucide-react';
import { Service } from '@/types/api';
import { Button } from '@/components/ui/button';

interface ServiceCardProps {
  service: Service;
  className?: string;
}

const ServiceCard = ({ service, className = '' }: ServiceCardProps) => {
  const formatPrice = (price: number, priceType: string) => {
    const formattedPrice = price.toLocaleString('ru-RU');
    switch (priceType) {
      case 'hourly':
        return `${formattedPrice} ₽/час`;
      case 'negotiable':
        return 'Договорная';
      default:
        return `${formattedPrice} ₽`;
    }
  };

  const getImageSrc = (images: string[]) => {
    if (images && images.length > 0) {
      return images[0];
    }
    return '/images/moika.png'; // Default image from existing assets
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
      {/* Service Image */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <img
          src={getImageSrc(service.images)}
          alt={service.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/moika.png';
          }}
        />
        {service.rating > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{service.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Service Content */}
      <div className="p-4">
        {/* Category */}
        {service.category && (
          <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full mb-2">
            {service.category}
          </span>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {service.description}
        </p>

        {/* Company info */}
        {service.company && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {service.company.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-600">{service.company.name}</span>
            {service.company.verified && (
              <span className="text-blue-500 text-xs">✓</span>
            )}
          </div>
        )}

        {/* Location */}
        {service.location && (
          <div className="flex items-center gap-1 mb-3">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">{service.location}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Price */}
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(service.price, service.priceType)}
            </span>
          </div>

          {/* Action Button */}
          <Link to={`/service/${service.id}`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Подробнее
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
