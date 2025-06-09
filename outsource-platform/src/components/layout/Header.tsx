import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { 
  User, 
  LogOut, 
  Settings, 
  CreditCard, 
  Package, 
  Bell, 
  Home,
  Search,
  Building,
  TrendingUp,
  Menu,
  X
} from 'lucide-react'
import { NotificationsService } from '@/services/notificationsService'

export const Header: React.FC = () => {
  const { user, profile, logout, isClient, isCompany } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (user?.token) {
      loadNotificationCount()
    }
  }, [user])

  const loadNotificationCount = async () => {
    if (!user?.token) return

    try {
      const data = await NotificationsService.getNotifications(user.token, { limit: 1 })
      setUnreadCount(data.unread_count)
    } catch (error) {
      console.error('Failed to load notification count:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getInitials = () => {
    if (isClient()) {
      return profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'У'
    } else {
      return (profile as any)?.company_name?.split(' ').map((n: string) => n[0]).join('') || 'К'
    }
  }

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Логотип */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">OS</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:inline">
              OutSource
            </span>
          </Link>

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant={isActivePath('/') ? 'default' : 'ghost'}
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Главная
            </Button>

            {user && (
              <>
                <Button
                  variant={isActivePath('/dashboard') ? 'default' : 'ghost'}
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Дашборд
                </Button>

                <Button
                  variant={isActivePath('/orders') ? 'default' : 'ghost'}
                  onClick={() => navigate('/orders')}
                  className="flex items-center"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Заказы
                </Button>

                {isCompany() && (
                  <Button
                    variant={isActivePath('/services') ? 'default' : 'ghost'}
                    onClick={() => navigate('/services')}
                    className="flex items-center"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Услуги
                  </Button>
                )}

                <Button
                  variant={isActivePath('/balance') ? 'default' : 'ghost'}
                  onClick={() => navigate('/balance')}
                  className="flex items-center"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Баланс
                </Button>
              </>
            )}
          </nav>

          {/* Правая часть */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Уведомления */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/notifications')}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>

                {/* Профиль пользователя */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profile?.photo} alt="Аватар" />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {isClient() ? profile?.full_name : (profile as any)?.company_name}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {profile?.email}
                        </p>
                        <Badge variant="secondary" className="w-fit">
                          {isClient() ? 'Клиент' : 'Компания'}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Дашборд
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Профиль
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      Заказы
                    </DropdownMenuItem>
                    {isCompany() && (
                      <DropdownMenuItem onClick={() => navigate('/services')}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Услуги
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/balance')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Баланс
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Войти
                </Button>
                <Button onClick={() => navigate('/auth')}>
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
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Мобильная навигация */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              <Button
                variant={isActivePath('/') ? 'default' : 'ghost'}
                onClick={() => {
                  navigate('/')
                  setMobileMenuOpen(false)
                }}
                className="justify-start"
              >
                <Home className="h-4 w-4 mr-2" />
                Главная
              </Button>

              {user && (
                <>
                  <Button
                    variant={isActivePath('/dashboard') ? 'default' : 'ghost'}
                    onClick={() => {
                      navigate('/dashboard')
                      setMobileMenuOpen(false)
                    }}
                    className="justify-start"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Дашборд
                  </Button>

                  <Button
                    variant={isActivePath('/orders') ? 'default' : 'ghost'}
                    onClick={() => {
                      navigate('/orders')
                      setMobileMenuOpen(false)
                    }}
                    className="justify-start"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Заказы
                  </Button>

                  {isCompany() && (
                    <Button
                      variant={isActivePath('/services') ? 'default' : 'ghost'}
                      onClick={() => {
                        navigate('/services')
                        setMobileMenuOpen(false)
                      }}
                      className="justify-start"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Услуги
                    </Button>
                  )}

                  <Button
                    variant={isActivePath('/balance') ? 'default' : 'ghost'}
                    onClick={() => {
                      navigate('/balance')
                      setMobileMenuOpen(false)
                    }}
                    className="justify-start"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Баланс
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
