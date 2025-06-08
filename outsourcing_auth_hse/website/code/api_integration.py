#!/usr/bin/env python3
"""
Модуль для тестирования и интеграции с API платформы услуг
"""

import requests
import json
import time
from typing import Dict, List, Optional, Any
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ServicePlatformAPI:
    """Класс для взаимодействия с API платформы услуг"""
    
    def __init__(self):
        # Базовые URL сервисов
        self.auth_url = "https://auth.tomsk-center.ru"
        self.search_url = "https://search.tomsk-center.ru"
        self.photo_url = "https://dsam.tomsk-center.ru"
        self.chat_url = "https://chat.tomsk-center.ru"
        
        # Заголовки по умолчанию
        self.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        self.token = None
        
    def test_connection(self, url: str, endpoint: str = "/") -> bool:
        """Тестирует подключение к сервису"""
        try:
            full_url = f"{url}{endpoint}"
            response = requests.get(full_url, timeout=10)
            logger.info(f"Тест подключения к {full_url}: {response.status_code}")
            return response.status_code in [200, 404, 405]  # 404/405 означает что сервер доступен
        except Exception as e:
            logger.error(f"Ошибка подключения к {url}: {e}")
            return False
    
    def test_all_services(self) -> Dict[str, bool]:
        """Тестирует подключение ко всем сервисам"""
        services = {
            "auth": self.auth_url,
            "search": self.search_url, 
            "photo": self.photo_url,
            "chat": self.chat_url
        }
        
        results = {}
        for name, url in services.items():
            results[name] = self.test_connection(url)
            time.sleep(1)  # Пауза между запросами
            
        return results
    
    # === API авторизации ===
    
    def register_client(self, full_name: str, email: str, phone: str, password: str, photo: str = None) -> Dict[str, Any]:
        """Регистрация клиента"""
        data = {
            "user": {
                "register": {
                    "full_name": full_name,
                    "email": email,
                    "phone": phone,
                    "password": password,
                    "photo": photo,
                    "type": "client"
                }
            }
        }
        
        try:
            response = requests.post(f"{self.auth_url}/v1/register/client", 
                                   json=data, headers=self.headers, timeout=10)
            result = response.json()
            
            if response.status_code == 200:
                self.token = result.get('user', {}).get('token')
                logger.info(f"Клиент зарегистрирован успешно: {result}")
            
            return result
        except Exception as e:
            logger.error(f"Ошибка регистрации клиента: {e}")
            return {"error": str(e)}
    
    def register_company(self, company_name: str, email: str, phone: str, full_name: str, 
                        position_agent: str, id_company: str, address: str, 
                        type_service: str, password: str, photo: str = None, 
                        documents: List[str] = None) -> Dict[str, Any]:
        """Регистрация компании"""
        data = {
            "user": {
                "register": {
                    "company_name": company_name,
                    "email": email,
                    "phone": phone,
                    "full_name": full_name,
                    "position_agent": position_agent,
                    "id_company": id_company,
                    "address": address,
                    "type_service": type_service,
                    "password": password,
                    "photo": photo,
                    "documents": documents or [],
                    "type": "company"
                }
            }
        }
        
        try:
            response = requests.post(f"{self.auth_url}/v1/register/company", 
                                   json=data, headers=self.headers, timeout=10)
            result = response.json()
            
            if response.status_code == 200:
                self.token = result.get('user', {}).get('token')
                logger.info(f"Компания зарегистрирована успешно: {result}")
            
            return result
        except Exception as e:
            logger.error(f"Ошибка регистрации компании: {e}")
            return {"error": str(e)}
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Авторизация пользователя"""
        data = {
            "user": {
                "login": {
                    "email": email,
                    "password_hash": password  # В документации password_hash
                }
            }
        }
        
        try:
            response = requests.post(f"{self.auth_url}/v1/login", 
                                   json=data, headers=self.headers, timeout=10)
            result = response.json()
            
            if response.status_code == 200:
                self.token = result.get('user', {}).get('token')
                logger.info(f"Авторизация успешна: {result}")
            
            return result
        except Exception as e:
            logger.error(f"Ошибка авторизации: {e}")
            return {"error": str(e)}
    
    def get_account(self, token: str = None) -> Dict[str, Any]:
        """Получение информации об аккаунте"""
        use_token = token or self.token
        if not use_token:
            return {"error": "Токен не предоставлен"}
        
        data = {
            "user": {
                "login": {
                    "token": use_token
                }
            }
        }
        
        try:
            response = requests.post(f"{self.auth_url}/v1/account", 
                                   json=data, headers=self.headers, timeout=10)
            result = response.json()
            logger.info(f"Информация об аккаунте: {result}")
            return result
        except Exception as e:
            logger.error(f"Ошибка получения аккаунта: {e}")
            return {"error": str(e)}
    
    def create_card(self, title: str, description: str, token: str = None) -> Dict[str, Any]:
        """Создание карточки услуги"""
        use_token = token or self.token
        if not use_token:
            return {"error": "Токен не предоставлен"}
        
        data = {
            "user": {
                "login": {
                    "token": use_token
                }
            },
            "card": {
                "title": title,
                "description": description
            }
        }
        
        try:
            response = requests.post(f"{self.auth_url}/v1/account/card/create", 
                                   json=data, headers=self.headers, timeout=10)
            result = response.json()
            logger.info(f"Карточка создана: {result}")
            return result
        except Exception as e:
            logger.error(f"Ошибка создания карточки: {e}")
            return {"error": str(e)}
    
    def get_cards(self, token: str = None, limit: int = 10, page: int = 0) -> Dict[str, Any]:
        """Получение списка карточек"""
        use_token = token or self.token
        if not use_token:
            return {"error": "Токен не предоставлен"}
        
        data = {
            "user": {
                "login": {
                    "token": use_token
                }
            }
        }
        
        try:
            url = f"{self.auth_url}/v1/account/card/list?limit={limit}&page={page}"
            response = requests.post(url, json=data, headers=self.headers, timeout=10)
            result = response.json()
            logger.info(f"Карточки получены: {result}")
            return result
        except Exception as e:
            logger.error(f"Ошибка получения карточек: {e}")
            return {"error": str(e)}
    
    # === API поиска ===
    
    def search_services(self, price_from: int = None, price_to: int = None, 
                       location: str = None, rating: float = None, 
                       sort: str = None) -> List[Dict[str, Any]]:
        """Поиск услуг с фильтрами"""
        params = {}
        if price_from: params['price_from'] = price_from
        if price_to: params['price_to'] = price_to
        if location: params['location'] = location
        if rating: params['rating'] = rating
        if sort: params['sort'] = sort
        
        try:
            response = requests.get(f"{self.search_url}/search", 
                                  params=params, timeout=10)
            result = response.json()
            logger.info(f"Поиск услуг: найдено {len(result) if isinstance(result, list) else 0} результатов")
            return result
        except Exception as e:
            logger.error(f"Ошибка поиска услуг: {e}")
            return []
    
    # === API фотосервиса ===
    
    def upload_photo(self, file_path: str, user_id: int, 
                    company_id: int = None, task_id: int = None, 
                    is_task_result: bool = False) -> Dict[str, Any]:
        """Загрузка фотографии"""
        try:
            with open(file_path, 'rb') as f:
                files = {'file': f}
                data = {
                    'user_id': user_id,
                    'company_id': company_id or '',
                    'task_id': task_id or '',
                    'is_task_result': is_task_result
                }
                
                response = requests.post(f"{self.photo_url}/photos/upload", 
                                       files=files, data=data, timeout=30)
                result = response.json()
                logger.info(f"Фото загружено: {result}")
                return result
        except Exception as e:
            logger.error(f"Ошибка загрузки фото: {e}")
            return {"error": str(e)}
    
    def get_photo(self, photo_id: int, size: str = "original") -> bytes:
        """Получение фотографии"""
        try:
            params = {'size': size}
            response = requests.get(f"{self.photo_url}/photos/{photo_id}", 
                                  params=params, timeout=10)
            if response.status_code == 200:
                logger.info(f"Фото получено: ID {photo_id}, размер {size}")
                return response.content
            else:
                logger.error(f"Ошибка получения фото: {response.status_code}")
                return b""
        except Exception as e:
            logger.error(f"Ошибка получения фото: {e}")
            return b""
    
    def list_photos(self, user_id: int = None, company_id: int = None, 
                   task_id: int = None, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """Получение списка фотографий"""
        params = {'limit': limit, 'offset': offset}
        if user_id: params['user_id'] = user_id
        if company_id: params['company_id'] = company_id
        if task_id: params['task_id'] = task_id
        
        try:
            response = requests.get(f"{self.photo_url}/photos", 
                                  params=params, timeout=10)
            result = response.json()
            logger.info(f"Список фото получен: {len(result) if isinstance(result, list) else 0} элементов")
            return result
        except Exception as e:
            logger.error(f"Ошибка получения списка фото: {e}")
            return []


def main():
    """Основная функция для тестирования API"""
    print("=== Тестирование API платформы услуг ===")
    
    api = ServicePlatformAPI()
    
    # Тест подключений
    print("\n1. Тестирование подключений к сервисам...")
    connections = api.test_all_services()
    for service, status in connections.items():
        status_text = "✅ Доступен" if status else "❌ Недоступен"
        print(f"   {service}: {status_text}")
    
    # Тест поиска услуг
    print("\n2. Тестирование поиска услуг...")
    services = api.search_services()
    if services:
        print(f"   Найдено услуг: {len(services)}")
        if len(services) > 0:
            print(f"   Пример услуги: {services[0].get('name', 'Без названия')}")
    else:
        print("   Услуги не найдены или ошибка API")
    
    # Тест поиска с фильтрами
    print("\n3. Тестирование поиска с фильтрами...")
    filtered_services = api.search_services(price_from=1000, price_to=5000, sort="rating_high")
    print(f"   Найдено услуг с фильтрами: {len(filtered_services) if filtered_services else 0}")
    
    print("\n=== Тестирование завершено ===")


if __name__ == "__main__":
    main()
