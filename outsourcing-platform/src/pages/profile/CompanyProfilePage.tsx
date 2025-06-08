import { useAuthStore } from '@/store/authStore';

const CompanyProfilePage = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Профиль компании
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 mb-4">
            Добро пожаловать в профиль компании!
          </p>
          <p className="text-gray-600">
            Страница профиля компании будет реализована в следующих итерациях.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
