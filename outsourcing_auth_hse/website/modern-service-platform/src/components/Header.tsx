import React, { useState, useRef, useEffect } from 'react'
import { Search, MapPin, Menu, X, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import AuthModal from './AuthModal'

interface HeaderProps {
  onSearch?: (query: string) => void
  searchQuery?: string
}

const Header: React.FC<HeaderProps> = ({ onSearch, searchQuery = '' }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchValue, setSearchValue] = useState(searchQuery)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchValue)
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  const handleUserMenuItemClick = (path: string) => {
    navigate(path)
    setUserMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
  }

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Логотип */}
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/images/logo.png" 
                  alt="Logo" 
                  className="h-8 w-auto"
                />
              </button>
            </div>

            {/* Центральная часть - поиск на десктопе */}
            <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Поиск услуг..."
                    className="w-full pl-4 pr-12 py-3 border-2 border-blue-500 rounded-full 
                             focus:outline-none focus:border-blue-600 bg-white text-gray-700"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-6 bg-blue-500 hover:bg-blue-600 
                             rounded-full text-white transition-colors duration-200"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Правая часть */}
            <div className="flex items-center space-x-4">
              {/* Локация */}
              <div className="hidden md:flex items-center space-x-2 text-gray-700">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium">Томск</span>
              </div>

              {/* Авторизация/Профиль */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    {user?.photo ? (
                      <img 
                        src={user.photo} 
                        alt="Profile" 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                        {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.full_name || 'Пользователь'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Выпадающее меню */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 transform opacity-100 scale-100 transition-all duration-150 ease-out">
                      <div className="py-2">
                        <button 
                          onClick={() => handleUserMenuItemClick('/profile')}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          👤 Мой профиль
                        </button>
                        {user?.type === 'company' ? (
                          <button 
                            onClick={() => handleUserMenuItemClick('/dashboard')}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            📊 Панель управления
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUserMenuItemClick('/orders')}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            📦 Мои заказы
                          </button>
                        )}
                        <hr className="my-1" />
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          🚪 Выйти
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full 
                           text-sm font-medium transition-colors duration-200"
                >
                  Вход
                </button>
              )}

              {/* Мобильное меню */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Мобильное меню */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white">
              <div className="px-4 py-4 space-y-4">
                {/* Мобильный поиск */}
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Поиск услуг..."
                    className="w-full pl-4 pr-12 py-2 border-2 border-blue-500 rounded-full 
                             focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-4 bg-blue-500 rounded-full text-white"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>

                {/* Мобильная локация */}
                <div className="flex items-center space-x-2 text-gray-700">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm font-medium">Томск</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Модальное окно авторизации */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}

export default Header
