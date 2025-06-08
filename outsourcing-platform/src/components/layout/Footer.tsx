import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">О нас</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Мы предоставляем услуги, чтобы улучшить вашу жизнь и бизнес. 
              Узнайте больше о нас и наших предложениях.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-gray-600 hover:text-blue-600 text-sm">
                  Поиск услуг
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-blue-600 text-sm">
                  Стать исполнителем
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-blue-600 text-sm">
                  О платформе
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-600 hover:text-blue-600 text-sm">
                  Помощь
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Контакты</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Email: support@services.com</p>
              <p>Телефон: 8 800 555 35 35</p>
              <p>Адрес: г. Москва</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2025 Все права защищены.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-blue-600">
                Политика конфиденциальности
              </Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-blue-600">
                Условия использования
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
