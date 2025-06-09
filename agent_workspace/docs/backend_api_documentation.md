# Backend API Документация
## Полная спецификация эндпоинтов auth.tomsk-center.ru

### 🔗 Базовый URL
- **Продакшн**: `https://auth.tomsk-center.ru`
- **Разработка**: `http://localhost:8080`

---

## 📋 Общие принципы

### Структуры токенов
API использует две основные структуры для авторизации:

#### 1. Простая структура (для получения данных)
```json
{
  "user": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### 2. Расширенная структура (для операций изменения)
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}
```

### Стандартные ответы
```json
{
  "status_response": {
    "status": "success"
  },
  "user": {
    "id": 1,
    "token": "...",
    "type": "client"
  }
}
```

---

## 🔐 Аутентификация и Регистрация

### 1. Регистрация клиента
**POST** `/v1/register/client`

**Тело запроса:**
```json
{
  "full_name": "Иван Иванов",
  "email": "ivan@example.com", 
  "phone": "+7 900 123-45-67",
  "password": "password123",
  "photo": "https://example.com/photo.jpg" // необязательно
}
```

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "user": {
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "client"
  }
}
```

### 2. Регистрация компании
**POST** `/v1/register/company`

**Тело запроса:**
```json
{
  "company_name": "ООО Рога и Копыта",
  "email": "company@example.com",
  "phone": "+7 900 123-45-67", 
  "password": "password123",
  "website": "https://example.com", // необязательно
  "description": "Описание компании", // необязательно
  "photo": "https://example.com/logo.jpg" // необязательно
}
```

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "user": {
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "company"
  }
}
```

### 3. Авторизация (универсальная)
**POST** `/v1/login`

**Простой формат (рекомендуемый):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Старый формат (для обратной совместимости):**
```json
{
  "user": {
    "login": {
      "email": "user@example.com",
      "password_hash": "password123"
    }
  }
}
```

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "user": {
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "client" // или "company"
  }
}
```

### 4. Авторизация клиента (специфичная)
**POST** `/v1/login/client`

**Тело запроса:**
```json
{
  "email": "client@example.com",
  "password": "password123"
}
```

### 5. Авторизация компании (специфичная)
**POST** `/v1/login/company`

**Тело запроса:**
```json
{
  "email": "company@example.com", 
  "password": "password123"
}
```

---

## 👤 Управление аккаунтом

### 1. Получение информации о профиле
**POST** `/v1/account/`

**Тело запроса:**
```json
{
  "user": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Ответ для клиента:**
```json
{
  "status_response": {
    "status": "success"
  },
  "user": {
    "account": {
      "id": 1,
      "full_name": "Иван Иванов",
      "email": "ivan@example.com",
      "phone": "+7 900 123-45-67",
      "photo": "https://example.com/photo.jpg",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "type": "client",
      "balance": 1500.50
    }
  }
}
```

**Ответ для компании:**
```json
{
  "status_response": {
    "status": "success"
  },
  "user": {
    "account": {
      "id": 1,
      "company_name": "ООО Рога и Копыта",
      "email": "company@example.com",
      "phone": "+7 900 123-45-67",
      "full_name": "Иван Петров",
      "position_agent": "Директор",
      "id_company": "1234567890",
      "address": "г. Томск, ул. Ленина, д. 1",
      "type_service": "IT услуги",
      "photo": "https://example.com/logo.jpg",
      "documents": ["doc1.pdf", "doc2.pdf"],
      "type": "company"
    }
  }
}
```

### 2. Обновление профиля клиента
**POST** `/v1/account/profile/update`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "profile": {
    "full_name": "Новое Имя",
    "email": "newemail@example.com",
    "phone": "+7 900 000-00-00",
    "photo": "https://example.com/newphoto.jpg"
  }
}
```

---

## 💳 Управление услугами (карточки)

### 1. Создание карточки услуги (только компании)
**POST** `/v1/account/card/create`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "card": {
    "title": "Профессиональная уборка квартиры",
    "description": "Качественная уборка квартир и офисов. Используем профессиональные средства.",
    "category": "Уборка",
    "location": "Центральный район",
    "price": 2500.00
  }
}
```

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "card": {
    "id": 1,
    "title": "Профессиональная уборка квартиры",
    "description": "Качественная уборка квартир...",
    "category": "Уборка",
    "location": "Центральный район", 
    "price": 2500.00,
    "is_active": true,
    "company_id": 1,
    "company": {
      "id": 1,
      "company_name": "Чистота-Сервис",
      "stars": 4.8,
      "review_count": 127,
      "photo": "https://example.com/logo.jpg"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Список карточек компании
**POST** `/v1/account/card/list`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}
```

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "cards": [
    {
      "id": 1,
      "title": "Профессиональная уборка квартиры",
      "description": "Качественная уборка квартир...",
      "company_id": 1
    }
  ]
}
```

### 3. Обновление карточки услуги
**POST** `/v1/account/card/update`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "card_id": 1,
  "card": {
    "title": "Обновленное название",
    "description": "Обновленное описание",
    "category": "Новая категория",
    "location": "Новый район",
    "price": 3000.00
  }
}
```

### 4. Удаление карточки услуги
**POST** `/v1/account/card/delete`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "card_id": 1
}
```

---

## 📦 Управление заказами

### 1. Создание заказа
**POST** `/v1/account/order/create`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "order": {
    "company_id": 1,
    "card_id": 1,
    "description": "Нужно убрать квартиру завтра в 10 утра"
  }
}
```

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "order": {
    "id": 1,
    "client_id": 1,
    "company_id": 1,
    "card_id": 1,
    "amount": 2500.00,
    "status": "pending",
    "payment_status": "unpaid",
    "description": "Нужно убрать квартиру завтра в 10 утра",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "client": {
      "id": 1,
      "full_name": "Иван Иванов",
      "email": "ivan@example.com",
      "phone": "+7 900 123-45-67",
      "photo": "https://example.com/photo.jpg"
    },
    "company": {
      "id": 1,
      "company_name": "Чистота-Сервис",
      "stars": 4.8,
      "photo": "https://example.com/logo.jpg"
    },
    "card": {
      "id": 1,
      "title": "Профессиональная уборка квартиры",
      "description": "Качественная уборка квартир..."
    }
  }
}
```

### 2. Список заказов
**POST** `/v1/account/order/list`

**Тело запроса:**
```json
{
  "user": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "status": "all", // "all", "pending", "in_progress", "completed", "cancelled"
  "limit": 10, // необязательно, по умолчанию 10
  "offset": 0  // необязательно, по умолчанию 0
}
```

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "orders": [
    {
      "id": 1,
      "client_name": "Иван Иванов",
      "company_name": "Чистота-Сервис",
      "service_name": "Профессиональная уборка квартиры",
      "description": "Нужно убрать квартиру завтра в 10 утра",
      "amount": 2500.00,
      "status": "pending",
      "payment_status": "unpaid", 
      "created_at": "2024-01-15T10:30:00Z",
      "completed_at": null,
      "worker_url": "https://auth.tomsk-center.ru/worker/complete/abc123",
      "can_cancel": true,
      "can_pay": true,
      "can_rate": false
    }
  ],
  "total": 1
}
```

### 3. Обновление статуса заказа
**POST** `/v1/account/order/update-status`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "order_id": 1,
  "action": "accept" // "accept", "reject", "start", "complete", "cancel"
}
```

---

## 💰 Управление балансом

### 1. Получение баланса
**POST** `/v1/account/balance/`

**Тело запроса:**
```json
{
  "user": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "balance": 1500.50
}
```

### 2. Пополнение баланса
**POST** `/v1/account/balance/deposit`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "amount": 1000.00
}
```

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "balance": 2500.50
}
```

### 3. Вывод средств
**POST** `/v1/account/balance/withdraw`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "amount": 500.00
}
```

### 4. История транзакций
**POST** `/v1/account/balance/transactions`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "limit": 10, // необязательно
  "offset": 0  // необязательно
}
```

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "transactions": [
    {
      "id": 1,
      "amount": 1000.00,
      "type": "deposit", // "deposit", "withdraw", "payment", "refund"
      "status": "completed",
      "description": "Пополнение баланса",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

---

## ⭐ Управление отзывами

### 1. Создание отзыва
**POST** `/v1/ratings/create`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "order_id": 1,
  "rating": 5, // от 1 до 5
  "comment": "Отличная работа, все сделали качественно и в срок!"
}
```

### 2. Список отзывов компании
**GET** `/reviews/company/{company_id}`

**Параметры URL:**
- `company_id` - ID компании

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "reviews": [
    {
      "id": 1,
      "client_name": "Иван И.",
      "service_name": "Профессиональная уборка квартиры",
      "rating": 5,
      "comment": "Отличная работа!",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

---

## 📊 Статистика компании

### 1. Получение статистики
**POST** `/v1/company/stats`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}
```

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "stats": {
    "total_services": 5,
    "total_orders": 127,
    "active_orders": 12,
    "completed_orders": 105,
    "total_earnings": 125000.00,
    "total_revenue": 150000.00,
    "average_rating": 4.8,
    "total_reviews": 89,
    "review_count": 89,
    "balance_available": 25000.00
  }
}
```

---

## 🔔 Уведомления

### 1. Список уведомлений
**POST** `/v1/notifications/list`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "is_read": false, // null = все, true = прочитанные, false = непрочитанные
  "limit": 10,
  "offset": 0
}
```

**Ответ:**
```json
{
  "status_response": {
    "status": "success"
  },
  "notifications": [
    {
      "id": 1,
      "title": "Новый заказ",
      "message": "У вас новый заказ на уборку квартиры",
      "type": "order_new",
      "is_read": false,
      "order_id": 15,
      "related_id": null,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "unread_count": 1
}
```

### 2. Отметить уведомление как прочитанное
**POST** `/v1/notifications/mark-read`

**Тело запроса:**
```json
{
  "token_access": {
    "user": {
      "login": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "notification_id": 1
}
```

---

## 🌐 Публичные эндпоинты (без авторизации)

### 1. Все карточки услуг
**GET** `/cards`

**Ответ:**
```json
[
  {
    "id": 1,
    "title": "Профессиональная уборка квартиры",
    "description": "Качественная уборка квартир...",
    "category": "Уборка",
    "location": "Центральный район",
    "price": 2500.00,
    "is_active": true,
    "company_id": 1,
    "company": {
      "id": 1,
      "company_name": "Чистота-Сервис",
      "stars": 4.8,
      "review_count": 127,
      "photo": "https://example.com/logo.jpg"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### 2. Карточки по категории
**GET** `/cards/category/{category}`

### 3. Конкретная карточка
**GET** `/cards/{id}`

### 4. Поиск карточек
**GET** `/cards/search?q={query}&category={category}&location={location}&price_min={min}&price_max={max}`

### 5. Карточки по диапазону цен
**GET** `/cards/price-range?min={min}&max={max}`

### 6. Все заказы (публичные)
**GET** `/orders`

### 7. Рейтинг компании
**GET** `/companies/{company_id}/rating`

---

## 🔧 Специальные эндпоинты

### 1. Завершение работы (для исполнителей)
**GET** `/worker/complete/{token}`

Специальная страница для исполнителей, где они могут отметить заказ как выполненный.

---

## ❌ Обработка ошибок

### Стандартный формат ошибки:
```json
{
  "error": {
    "message": "Описание ошибки",
    "code": 400
  }
}
```

### Коды ошибок:
- **400** - Неверный запрос (невалидный JSON, отсутствующие поля)
- **401** - Неавторизован (неверные учетные данные)
- **403** - Запрещено (недостаточно прав, истекший токен)
- **404** - Не найдено (ресурс не существует)
- **412** - Условие не выполнено (пользователь уже существует, недостаточно средств)
- **500** - Внутренняя ошибка сервера

---

## 📝 Примечания

### Форматы данных:
- **Даты**: ISO 8601 формат (`2024-01-15T10:30:00Z`)
- **Деньги**: Число с плавающей точкой (`1500.50`)
- **Телефоны**: Строка (`"+7 900 123-45-67"`)
- **Email**: Стандартный email формат

### Статусы заказов:
- `pending` - Ожидает подтверждения
- `accepted` - Принят компанией
- `in_progress` - В работе
- `completed` - Завершен
- `cancelled` - Отменен

### Статусы платежей:
- `unpaid` - Не оплачен
- `paid` - Оплачен
- `refunded` - Возвращен

### Типы пользователей:
- `client` - Клиент
- `company` - Компания

---

*Документация актуальна на 2024-06-09. Для получения последних обновлений обращайтесь к разработчикам.*
