import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useServicesStore } from '@/store/servicesStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ServicePage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentService, isLoading, getServiceById } = useServicesStore();

  useEffect(() => {
    if (id) {
      getServiceById(id);
    }
  }, [id, getServiceById]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {currentService?.title || 'Страница услуги'}
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600">
            Детальная страница услуги будет реализована в следующих итерациях.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
