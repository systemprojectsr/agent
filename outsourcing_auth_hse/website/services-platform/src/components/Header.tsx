import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, User, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';

interface HeaderProps {
  onSearch?: (query: string) => void;
  isAuthenticated?: boolean;
  userType?: 'client' | 'company';
  onProfileClick?: () => void;
  onLogout?: () => void;
  onAuthSuccess?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  isAuthenticated = false, 
  userType,
  onProfileClick,
  onLogout,
  onAuthSuccess
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип */}
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">У</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Услуги.Томск</span>
              </div>
            </div>

            {/* Поиск - скрыт на мобильных */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Поиск услуг..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-20 h-12"
                  />
                  <Button 
                    type="submit"
                    className="absolute right-1 top-1 h-10"
                  >
                    Найти
                  </Button>
                </div>
              </form>
            </div>

            {/* Правая часть */}
            <div className="flex items-center space-x-4">
              {/* Локация */}
              <div className="hidden sm:flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">Томск</span>
              </div>

              {/* Аутентификация */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Badge variant={userType === 'company' ? 'default' : 'secondary'}>
                    {userType === 'company' ? 'Компания' : 'Клиент'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={onProfileClick}>
                    <User className="w-4 h-4 mr-2" />
                    Профиль
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Вход
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowRegisterModal(true)}
                  >
                    Регистрация
                  </Button>
                </div>
              )}

              {/* Мобильное меню */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Мобильный поиск */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Поиск услуг..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-20 h-12"
                />
                <Button 
                  type="submit"
                  className="absolute right-1 top-1 h-10"
                  size="sm"
                >
                  Найти
                </Button>
              </div>
            </form>
          </div>

          {/* Мобильное меню */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t pt-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">Томск</span>
                </div>
                
                {!isAuthenticated && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowLoginModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Вход
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setShowRegisterModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Регистрация
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Модальные окна */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
        onLoginSuccess={onAuthSuccess}
      />
      
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
        onRegisterSuccess={onAuthSuccess}
      />
    </>
  );
};

export default Header;
