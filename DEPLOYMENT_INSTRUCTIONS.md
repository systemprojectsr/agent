# 🚀 Инструкция по развертыванию с исправленным nginx

## 🔍 Диагностика проблемы

**ПРОБЛЕМА**: Кнопка пользователя не нажимается из-за неправильной конфигурации nginx.

**ПРИЧИНА**: Сейчас nginx проксирует ВСЕ запросы на Go backend, но React приложение должно обслуживаться как статические файлы.

## ✅ Решение

### 1. Обновленная архитектура

**Было** (неправильно):
```
auth.tomsk-center.ru/* → Go backend (8080)
```

**Стало** (правильно):
```
auth.tomsk-center.ru/v1/* → Go backend (8080)  # API
auth.tomsk-center.ru/*   → React статика       # Frontend
```

### 2. Ключевые изменения в nginx

```nginx
# 📁 React приложение обслуживается как статические файлы
root /path/to/outsourcing_auth_hse/website/modern-service-platform/dist;

# 🔌 API запросы идут на Go backend  
location /v1/ {
    proxy_pass http://176.57.215.221:8080;
}

# 🔄 React Router поддержка - все пути ведут к index.html
location / {
    try_files $uri $uri/ /index.html;
}
```

## 📋 Пошаговая инструкция развертывания

### Шаг 1: Сборка React приложения
```bash
cd /path/to/outsourcing_auth_hse/website/modern-service-platform
npm run build
# Создастся папка dist/ со статическими файлами
```

### Шаг 2: Размещение файлов на сервере
```bash
# Загрузите папку dist/ на сервер
scp -r dist/ user@176.57.215.221:/path/to/outsourcing_auth_hse/website/modern-service-platform/

# Или если уже есть на сервере
cd /path/to/outsourcing_auth_hse/website/modern-service-platform
npm run build
```

### Шаг 3: Обновление конфигурации nginx

**Замените раздел для auth.tomsk-center.ru:**

```nginx
server {
    listen 443 ssl;
    server_name auth.tomsk-center.ru;

    ssl_certificate     /etc/letsencrypt/live/auth.tomsk-center.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/auth.tomsk-center.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # 🎯 ВАЖНО: Укажите правильный путь к папке dist
    root /path/to/outsourcing_auth_hse/website/modern-service-platform/dist;
    index index.html;

    # API запросы к Go backend
    location /v1/ {
        proxy_pass http://176.57.215.221:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Статические файлы с кешированием
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # React Router поддержка
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Шаг 4: Перезапуск nginx
```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск nginx
sudo systemctl reload nginx
```

### Шаг 5: Проверка Go backend
```bash
# Убедитесь что Go сервис работает на порту 8080
cd /path/to/outsourcing_auth_hse
go run cmd/api/main.go

# Или запустите как сервис
```

## 🧪 Проверка работоспособности

### 1. Проверьте статические файлы
```bash
curl -I https://auth.tomsk-center.ru/
# Должен вернуть 200 и HTML
```

### 2. Проверьте API
```bash
curl -I https://auth.tomsk-center.ru/v1/
# Должен проксироваться на Go backend
```

### 3. Проверьте React Router
```bash
curl -I https://auth.tomsk-center.ru/profile
# Должен вернуть index.html (200)
```

## 🎯 Что будет работать после исправления

✅ **Главная страница**: `https://auth.tomsk-center.ru/`
✅ **Личный кабинет**: `https://auth.tomsk-center.ru/profile`  
✅ **Заказы**: `https://auth.tomsk-center.ru/orders`
✅ **Панель компании**: `https://auth.tomsk-center.ru/dashboard`
✅ **API**: `https://auth.tomsk-center.ru/v1/*`

## ⚠️ Важные моменты

1. **Путь к dist**: Обязательно укажите правильный абсолютный путь к папке `dist`
2. **Права доступа**: Убедитесь что nginx имеет права на чтение папки `dist`
3. **Go backend**: Должен работать на `localhost:8080` на сервере
4. **CORS**: Добавлены заголовки для работы с фронтендом

## 🔧 Альтернативный подход (если нужно)

Если не хотите менять nginx глобально, можете:

1. **Поднять статику на отдельном порту** (например 3000)
2. **Настроить проксирование** в nginx на этот порт
3. **API оставить как есть** на порту 8080

**После этих изменений кнопка пользователя будет работать корректно!** 🎉