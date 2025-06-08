# Backend API Руководство

## Обзор

Это полное руководство по Backend API функционалу, реализованному в Go сервисе для платформы аутсорсинга. API поддерживает полный жизненный цикл заказов, управление профилями, баланс пользователей, уведомления и систему отзывов.

## Базовый URL

Локальная разработка: `http://localhost:8080`
Продакшн: `https://auth.tomsk-center.ru`

## Аутентификация

Все API эндпоинты (кроме публичных) требуют JWT токен в поле `token` в теле запроса:

```json
{
  "user": {
    "login": {
      "token": "your-jwt-token-here"
    }
  }
}
```

## API Эндпоинты

### 1. Аутентификация и Регистрация

#### Вход в систему
- **POST** `/v1/login`
- Автоматически определяет тип пользователя (клиент/компания) по email

```json
{
  "general_login": {
    "general_login_attributes": {
      "email": "user@example.com",
      "password": "password123"
    }
  }
}
```

#### Регистрация клиента
- **POST** `/v1/register/client`

#### Регистрация компании
- **POST** `/v1/register/company`

#### Получение информации об аккаунте
- **POST** `/v1/account/`

### 2. Управление Профилем

#### Обновление профиля
- **POST** `/v1/account/profile/update`

```json
{
  "user": {
    "login": {
      "token": "jwt-token"
    }
  },
  "profile": {
    "company_name": "Новое название компании",
    "full_name": "Новое ФИО",
    "email": "new@email.com",
    "phone": "+79991234567",
    "address": "Новый адрес",
    "type_service": "Новый тип услуг",
    "position_agent": "Новая должность",
    "photo": "base64-encoded-photo",
    "documents": "документы"
  }
}
```

### 3. Управление Балансом

#### Пополнение баланса
- **POST** `/v1/account/balance/topup`

```json
{
  "user": {
    "login": {
      "token": "jwt-token"
    }
  },
  "amount": 1000.50
}
```

#### Получение истории транзакций
- **POST** `/v1/account/balance/transactions`

Параметры URL: `?page=1&limit=20`

#### Получение текущего баланса
- **POST** `/v1/account/balance/`

### 4. Управление Заказами

#### Создание заказа
- **POST** `/v1/account/order/create`

```json
{
  "user": {
    "login": {
      "token": "jwt-token"
    }
  },
  "order": {
    "company_id": 1,
    "card_id": 1,
    "description": "Описание заказа"
  }
}
```

#### Список заказов с фильтрацией
- **POST** `/v1/account/order/list`

```json
{
  "user": {
    "login": {
      "token": "jwt-token"
    }
  },
  "status": "created", // optional: created, paid, in_progress, completed, finished, cancelled
  "limit": 10,
  "offset": 0
}
```

#### Обновление статуса заказа
- **POST** `/v1/account/order/update-status`

```json
{
  "user": {
    "login": {
      "token": "jwt-token"
    }
  },
  "order_id": 1,
  "action": "pay" // pay, start_work, complete, cancel
}
```

#### Устаревшие эндпоинты заказов (поддерживаются для совместимости)
- **POST** `/v1/account/order/pay` - Оплата заказа
- **POST** `/v1/account/order/start` - Начать работу (для компаний)
- **POST** `/v1/account/order/finish` - Завершить заказ (для клиентов)
- **POST** `/v1/account/order/cancel` - Отменить заказ

### 5. Подтверждение Работы (Для Работников)

#### Одноразовая ссылка для работника
- **GET** `/worker/complete/{token}`

Эта ссылка генерируется автоматически при создании заказа и отправляется работнику. При переходе по ссылке работник может отметить заказ как выполненный.

### 6. Управление Карточками Услуг

#### Создание карточки (только для компаний)
- **POST** `/v1/account/card/create`

#### Список карточек компании
- **POST** `/v1/account/card/list`

#### Удаление карточки
- **POST** `/v1/account/card/delete`

#### Обновление карточки
- **POST** `/v1/account/card/update`

```json
{
  "user": {
    "login": {
      "token": "jwt-token"
    }
  },
  "card_id": 1,
  "card": {
    "title": "Новое название",
    "description": "Новое описание",
    "price": 5000.00,
    "category": "development"
  }
}
```

### 7. Система Отзывов и Рейтингов

#### Создание отзыва (только для клиентов)
- **POST** `/v1/account/review/create`

```json
{
  "user": {
    "login": {
      "token": "jwt-token"
    }
  },
  "review": {
    "company_id": 1,
    "order_id": 1,
    "rating": 5,
    "comment": "Отличная работа!"
  }
}
```

### 8. Уведомления

#### Получение списка уведомлений
- **POST** `/v1/account/notification/list`

```json
{
  "user": {
    "login": {
      "token": "jwt-token"
    }
  },
  "limit": 20,
  "offset": 0
}
```

#### Отметить уведомление как прочитанное
- **POST** `/v1/account/notification/mark-read`

```json
{
  "user": {
    "login": {
      "token": "jwt-token"
    }
  },
  "notification_id": 1
}
```

#### Получить количество непрочитанных уведомлений
- **POST** `/v1/account/notification/unread-count`

### 9. Статистика Компании

#### Получение статистики (только для компаний)
- **POST** `/v1/account/stats/company`

```json
{
  "user": {
    "login": {
      "token": "jwt-token"
    }
  }
}
```

Возвращает:
```json
{
  "status": "success",
  "stats": {
    "total_orders": 100,
    "active_orders": 5,
    "completed_orders": 95,
    "total_revenue": 50000.00,
    "average_rating": 4.8,
    "review_count": 45
  }
}
```

### 10. Публичные API (без авторизации)

#### Получение всех карточек услуг
- **GET** `/cards`

#### Получение карточек по категории
- **GET** `/cards/category/{category}`

#### Получение карточки по ID
- **GET** `/cards/{id}`

#### Поиск карточек
- **GET** `/cards/search?q=query`

#### Получение карточек по ценовому диапазону
- **GET** `/cards/price-range?min=1000&max=5000`

#### Получение всех активных заказов
- **GET** `/orders`

#### Получение отзывов компании
- **GET** `/reviews/company/{company_id}`

#### Получение отзыва по заказу
- **GET** `/reviews/order/{order_id}`

#### Получение рейтинга компании
- **GET** `/companies/{company_id}/rating`

## Статусы Заказов

1. **created** - Заказ создан, ожидает оплаты
2. **paid** - Заказ оплачен, ожидает начала работы
3. **in_progress** - Работа начата компанией
4. **completed** - Работа выполнена работником
5. **finished** - Заказ завершен клиентом (деньги переведены компании)
6. **cancelled** - Заказ отменен

## Типы Уведомлений

- **order_status** - Изменение статуса заказа
- **payment** - Получение оплаты
- **new_order** - Новый заказ
- **review** - Новый отзыв

## Система Эскроу

При оплате заказа деньги блокируются на эскроу-счете и переводятся компании только после завершения заказа клиентом. Это обеспечивает безопасность для обеих сторон.

## Пример Полного Жизненного Цикла Заказа

1. **Клиент создает заказ** (`POST /v1/account/order/create`)
2. **Клиент оплачивает заказ** (`POST /v1/account/order/update-status` с action="pay")
3. **Компания начинает работу** (`POST /v1/account/order/update-status` с action="start_work")
4. **Работник отмечает работу как выполненную** (`GET /worker/complete/{token}`)
5. **Клиент подтверждает завершение** (`POST /v1/account/order/update-status` с action="complete")
6. **Клиент оставляет отзыв** (`POST /v1/account/review/create`)

## Коды Ошибок

- **200** - Успешно
- **400** - Неверный запрос (невалидный JSON, отсутствующие параметры)
- **401** - Неавторизован (неверный токен)
- **403** - Запрещено (недостаточно прав, токен истек)
- **404** - Не найдено
- **412** - Предварительное условие не выполнено (например, email уже существует)
- **500** - Внутренняя ошибка сервера

## Запуск Сервера

```bash
cd /workspace/outsourcing_auth_hse
go run cmd/api/main.go
```

Сервер запустится на порту 8080 (или на порту, указанном в переменных окружения).

## Переменные Окружения

Создайте файл `.env` с следующими переменными:

```
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=your_db_name
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
JWT_SECRET=your_jwt_secret
```

## База Данных

Сервис автоматически создаст необходимые таблицы при первом запуске:
- clients (клиенты)
- companies (компании)
- cards (карточки услуг)
- orders (заказы)
- reviews (отзывы)
- notifications (уведомления)
- balance_transactions (транзакции баланса)
- escrow_transactions (эскроу транзакции)
- worker_links (ссылки для работников)

## Интеграция с Frontend

Все API эндпоинты возвращают JSON в стандартном формате:

```json
{
  "status": "success|error",
  "data": {...},
  "message": "optional message"
}
```

Для отображения на главной странице используйте `GET /cards` для получения всех доступных услуг вместо внешнего поиска.

## Безопасность

- Все пароли хэшируются
- JWT токены имеют ограниченное время жизни
- Эскроу-система обеспечивает безопасность платежей
- Проверка прав доступа на всех защищенных эндпоинтах
