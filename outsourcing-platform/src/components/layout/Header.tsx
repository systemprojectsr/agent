import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User, LogOut, MessageSquare, Heart, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LoginModal from '@/components/auth/LoginModal';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt="Платформа услуг" 
              className="h-8 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden ml-2 text-xl font-bold text-gray-900">
              Платформа услуг
            </span>
          </Link>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            {/* Location */}
            <div className="hidden sm:flex items-center space-x-2 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span className="text-sm">Москва</span>
            </div>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* Messages */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={() => navigate('/messages')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Сообщения
                </Button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName || 'Пользователь'}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <span className="hidden sm:block text-sm font-medium">
                        {user?.firstName || 'Пользователь'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate(user?.role === 'company' ? '/company-profile' : '/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Профиль
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/favorites')}>
                      <Heart className="h-4 w-4 mr-2" />
                      Избранное
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/messages')} className="sm:hidden">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Сообщения
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Настройки
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowLoginModal(true)}
                >
                  Вход
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Регистрация
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </header>
  );
};

export default Header;
