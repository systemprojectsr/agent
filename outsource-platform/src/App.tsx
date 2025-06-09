import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { OrdersPage } from '@/pages/OrdersPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { BalancePage } from '@/pages/BalancePage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import './App.css'

// Компонент для защищенных маршрутов
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />
}

// Компонент для гостевых маршрутов (только для неавторизованных)
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }
  
  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<HomePage />} />
        
        {/* Гостевые маршруты */}
        <Route path="/auth" element={
          <GuestRoute>
            <AuthPage />
          </GuestRoute>
        } />
        
        {/* Защищенные маршруты */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Основные страницы */}
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />
        
        <Route path="/services" element={
          <ProtectedRoute>
            <ServicesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/balance" element={
          <ProtectedRoute>
            <BalancePage />
          </ProtectedRoute>
        } />
        
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
              <p className="text-gray-600 mb-4">Страница не найдена</p>
              <a href="/" className="text-blue-600 hover:underline">
                Вернуться на главную
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
