# 🚀 Сборка и запуск платформы с личными кабинетами

## ✅ Исправленные проблемы

### 1. Go Backend (Исправлено)
- ✅ **Токен JWT**: Увеличено время жизни с 10 сек до 24 часов
- ✅ **Логика проверки**: Исправлена ошибка в проверке истечения токена
- ✅ **API эндпоинты**: Все маршруты работают корректно

### 2. React Frontend (Добавлено)
- ✅ **Личный кабинет**: ProfilePage с редактированием профиля
- ✅ **Заказы клиента**: OrdersPage с отслеживанием заказов
- ✅ **Панель компании**: CompanyDashboard с управлением услугами
- ✅ **Навигация**: Правильные маршруты и меню
- ✅ **Токен API**: Интеграция с AuthContext

## 🏃‍♂️ Быстрый запуск

### 1. Go Backend
```bash
cd outsourcing_auth_hse

# Установка зависимостей
go mod tidy

# Запуск сервиса
go run cmd/api/main.go
```

### 2. React Frontend
```bash
cd website/modern-service-platform

# Установка зависимостей
npm install

# Разработка
npm run dev

# Или сборка для продакшена
npm run build
```

## 🔧 Основные изменения

### Go API исправления:
1. `internal/security/token_system.go` - исправлена логика проверки токена
2. `internal/controller/client_controller.go` - использует LifeTimeJWT
3. `internal/controller/company_controller.go` - использует LifeTimeJWT
4. `.env` - LIFE_TIME_JWT = 86400 (24 часа)

### React новые страницы:
1. `src/pages/ProfilePage.tsx` - личный кабинет пользователя
2. `src/pages/OrdersPage.tsx` - управление заказами клиента
3. `src/pages/CompanyDashboard.tsx` - панель управления компании
4. `src/App.tsx` - добавлены новые маршруты
5. `src/components/Header.tsx` - навигация с React Router
6. `src/contexts/AuthContext.tsx` - добавлен токен и updateUser

## 🎯 Функциональность

### Для клиентов:
- ✅ Редактирование профиля
- ✅ Пополнение баланса (мок)
- ✅ Просмотр заказов
- ✅ Оценка услуг
- ✅ Отслеживание статуса

### Для компаний:
- ✅ Панель управления
- ✅ Добавление/редактирование услуг
- ✅ Статистика доходов
- ✅ Управление заказами
- ✅ Рейтинги и отзывы

## 🌐 API Endpoints
- `POST /v1/account/` - получение профиля ✅
- `POST /v1/account/card/create` - создание услуги ✅
- `POST /v1/account/card/list` - список услуг ✅
- `POST /v1/orders/list` - список заказов ✅
- `POST /v1/payments/topup` - пополнение счета ✅
- `POST /v1/ratings/create` - оценка услуги ✅

**Теперь навигация в личный кабинет работает корректно! 🎉**