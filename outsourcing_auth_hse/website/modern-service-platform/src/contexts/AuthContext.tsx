import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  full_name: string
  type: 'client' | 'company'
  photo?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  registerClient: (data: {
    fullName: string
    email: string
    phone: string
    password: string
    photo?: string
  }) => Promise<boolean>
  registerCompany: (data: any) => Promise<boolean>
  updateUser: (userData: Partial<User>) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Инициализация API клиента
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/api_client.js'
    script.onload = () => {
      // Проверяем, есть ли сохраненный токен
      const savedToken = localStorage.getItem('authToken')
      setToken(savedToken)
      if (savedToken && window.serviceAPI) {
        // Получаем информацию о пользователе
        window.serviceAPI.getAccount()
          .then((response: any) => {
            if (response.user) {
              setUser({
                id: response.user.id || '1',
                email: response.user.email || '',
                full_name: response.user.full_name || '',
                type: response.user.type || 'client',
                photo: response.user.photo
              })
            }
          })
          .catch(() => {
            // Если токен недействителен, удаляем его
            localStorage.removeItem('authToken')
          })
          .finally(() => {
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      if (!window.serviceAPI) {
        throw new Error('API клиент не загружен')
      }

      const response = await window.serviceAPI.login(email, password)
      
      if (response.user) {
        const userToken = response.user.token || localStorage.getItem('authToken')
        setToken(userToken)
        setUser({
          id: response.user.id || '1',
          email: response.user.email || email,
          full_name: response.user.full_name || '',
          type: response.user.type || 'client',
          photo: response.user.photo
        })
        if (userToken) {
          localStorage.setItem('authToken', userToken)
        }
        toast.success('Вход выполнен успешно!')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Ошибка входа:', error)
      toast.error('Ошибка входа. Проверьте ваши данные.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    if (window.serviceAPI) {
      window.serviceAPI.logout()
    }
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    toast.success('Вы вышли из системы')
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  const registerClient = async (data: {
    fullName: string
    email: string
    phone: string
    password: string
    photo?: string
  }): Promise<boolean> => {
    try {
      setLoading(true)
      if (!window.serviceAPI) {
        throw new Error('API клиент не загружен')
      }

      const response = await window.serviceAPI.registerClient(
        data.fullName,
        data.email,
        data.phone,
        data.password,
        data.photo
      )
      
      if (response.user) {
        setUser({
          id: response.user.id || '1',
          email: response.user.email || data.email,
          full_name: response.user.full_name || data.fullName,
          type: 'client',
          photo: response.user.photo
        })
        toast.success('Регистрация прошла успешно!')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Ошибка регистрации:', error)
      toast.error('Ошибка регистрации. Попробуйте еще раз.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const registerCompany = async (data: any): Promise<boolean> => {
    try {
      setLoading(true)
      if (!window.serviceAPI) {
        throw new Error('API клиент не загружен')
      }

      const response = await window.serviceAPI.registerCompany(data)
      
      if (response.user) {
        setUser({
          id: response.user.id || '1',
          email: response.user.email || data.email,
          full_name: response.user.full_name || data.company_name,
          type: 'company',
          photo: response.user.photo
        })
        toast.success('Регистрация компании прошла успешно!')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Ошибка регистрации компании:', error)
      toast.error('Ошибка регистрации компании. Попробуйте еще раз.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    logout,
    registerClient,
    registerCompany,
    updateUser,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Декларация типов для глобального объекта window
declare global {
  interface Window {
    serviceAPI: any
  }
}
