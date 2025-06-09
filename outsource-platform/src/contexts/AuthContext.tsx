import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, ClientProfile, CompanyProfile } from '@/config/api'
import { AuthService } from '@/services/authService'
import { ProfileService } from '@/services/profileService'

interface AuthContextType {
  user: User | null
  profile: ClientProfile | CompanyProfile | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  registerClient: (userData: any) => Promise<void>
  registerCompany: (userData: any) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  isClient: () => boolean
  isCompany: () => boolean
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
  const [profile, setProfile] = useState<ClientProfile | CompanyProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Инициализация при загрузке приложения
  useEffect(() => {
    const initializeAuth = async () => {
      const token = AuthService.getToken()
      const userType = AuthService.getUserType()
      const userId = AuthService.getUserId()

      if (token && userType && userId) {
        try {
          const userData: User = {
            id: parseInt(userId),
            token,
            type: userType
          }
          setUser(userData)
          
          // Получаем профиль пользователя
          const profileData = await ProfileService.getProfile(token)
          setProfile(profileData)
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          AuthService.logout()
        }
      }
      
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const userData = await AuthService.login({ email, password })
      setUser(userData)
      
      // Получаем профиль после авторизации
      const profileData = await ProfileService.getProfile(userData.token)
      setProfile(profileData)
    } catch (error) {
      throw error
    }
  }

  const registerClient = async (userData: any) => {
    try {
      const user = await AuthService.registerClient(userData)
      setUser(user)
      
      // Получаем профиль после регистрации
      const profileData = await ProfileService.getProfile(user.token)
      setProfile(profileData)
    } catch (error) {
      throw error
    }
  }

  const registerCompany = async (userData: any) => {
    try {
      const user = await AuthService.registerCompany(userData)
      setUser(user)
      
      // Получаем профиль после регистрации
      const profileData = await ProfileService.getProfile(user.token)
      setProfile(profileData)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user?.token) {
      try {
        const profileData = await ProfileService.getProfile(user.token)
        setProfile(profileData)
      } catch (error) {
        console.error('Failed to refresh profile:', error)
      }
    }
  }

  const isClient = () => user?.type === 'client'
  const isCompany = () => user?.type === 'company'

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    login,
    registerClient,
    registerCompany,
    logout,
    refreshProfile,
    isClient,
    isCompany
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
