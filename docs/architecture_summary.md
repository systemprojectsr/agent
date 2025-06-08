# 🏗️ АРХИТЕКТУРА МИКРОСЕРВИСОВ

## 📊 Распределение по технологиям:

**Go**: 3 сервисов
  - outsourcing-auth (порт: unknown)
  - Search+Parameters (порт: 8080)
  - DS-AM (порт: 8081)

**Python**: 1 сервисов
  - BD Client-Company (порт: 5000)

**unknown**: 2 сервисов
  - Region (порт: unknown)
  - TG_BOT_for_workers (порт: unknown)

## 🔗 Детальная информация по сервисам:

### outsourcing-auth
- **Технология**: Go
- **Порт**: unknown
- **Описание**: 1. `git clone git@github.com:APSN4/outsourcing-auth.git`.
- **API эндпоинты**:
  - `outsourcing-auth`
  - `account/card/create`
  - `OGRN`
  - `Company`
  - `account/card/list`
  - `account/card/delete`
  - `register/client`
  - `notes/docker-compose-pgsql-pgadmin/`
  - `login`
  - `register/company`
  - `account`
  - `/cpit`

### Search+Parameters
- **Технология**: Go
- **Порт**: 8080
- **Описание**: Микросервис для поиска и фильтрации услуг специалистов с возможностью сортировки.
- **API эндпоинты**:
  - `price_from`
  - `location`
  - `rating`
  - `sort`
  - `search`
  - `catalog/main`
  - `/localhost`
  - `price_to`

### BD Client-Company
- **Технология**: Python
- **Порт**: 5000
- **Описание**: ﻿БД уже создана и находится в архиве
- **API эндпоинты**:
  - `user_companies`
  - `/users/<int:user_id>/companies`
  - `users`
  - `users/`
  - `messages/`
  - `/`
  - `/companies`
  - `/users`
  - `/stream`
  - `/messages/<int:user_id>`
  - `/user_companies`
  - `/uploads/<path:name>`
  - `companies`

### DS-AM
- **Технология**: Go
- **Порт**: 8081
- **Описание**: Данный микросервис предназначен для хранения и обработки фотографий с использованием SeaweedFS в качестве S3-совместимого хранилища.
- **API эндпоинты**:
  - `json`
  - `form-data`
  - `photos/`
  - `price_from`
  - `limit`
  - `is_task_result`
  - `size`
  - `price_to`
  - `photos/upload`
  - `Content-Length`
  - `user_id`
  - `from_date`
  - `Content-Type`
  - `photos`
  - `rating`
  - `false`
  - `/`
  - `to_date`
  - `company_id`
  - `photos/process`
  - `metadata`
  - `task_id`
  - `location`
  - `id`
  - `offset`
  - `/localhost`

### Region
- **Технология**: unknown
- **Порт**: unknown
- **Описание**: 

### TG_BOT_for_workers
- **Технология**: unknown
- **Порт**: unknown
- **Описание**: 

## 💡 Рекомендации по интеграции:

1. **API Gateway**: Создать единую точку входа для всех микросервисов
2. **CORS**: Настроить корректную обработку межсайтовых запросов
3. **Авторизация**: Интегрировать токены из outsourcing-auth во все запросы
4. **Error Handling**: Единая система обработки ошибок
5. **Caching**: Кеширование для улучшения производительности