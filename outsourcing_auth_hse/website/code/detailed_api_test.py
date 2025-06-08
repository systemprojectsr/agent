#!/usr/bin/env python3
"""
Детальное тестирование API для понимания структуры данных
"""

import requests
import json
from api_integration import ServicePlatformAPI

def test_search_api_detailed():
    """Детальное тестирование API поиска"""
    print("=== Детальное тестирование API поиска ===")
    
    api = ServicePlatformAPI()
    
    # Базовый поиск
    print("\n1. Базовый поиск услуг:")
    services = api.search_services()
    if services:
        print(f"   Общее количество услуг: {len(services)}")
        for i, service in enumerate(services[:3]):  # Показываем первые 3
            print(f"   Услуга {i+1}:")
            print(f"     ID: {service.get('id')}")
            print(f"     Название: {service.get('name')}")
            print(f"     Описание: {service.get('description')}")
            print(f"     Цена: {service.get('price')} руб.")
            print(f"     Район: {service.get('location')}")
            print(f"     Рейтинг: {service.get('rating')}")
            print()
    
    # Тест фильтров
    print("2. Тестирование фильтров:")
    
    # Фильтр по цене
    cheap_services = api.search_services(price_from=0, price_to=2000)
    print(f"   Дешевые услуги (до 2000 руб): {len(cheap_services) if cheap_services else 0}")
    
    # Фильтр по району
    central_services = api.search_services(location="Центральный район")
    print(f"   Услуги в Центральном районе: {len(central_services) if central_services else 0}")
    
    # Фильтр по рейтингу
    high_rated = api.search_services(rating=4.5)
    print(f"   Услуги с рейтингом 4.5+: {len(high_rated) if high_rated else 0}")
    
    # Тест сортировки
    print("\n3. Тестирование сортировки:")
    sorted_by_price_low = api.search_services(sort="price_low")
    sorted_by_price_high = api.search_services(sort="price_high")
    sorted_by_rating_high = api.search_services(sort="rating_high")
    
    print(f"   Сортировка по возрастанию цены: {len(sorted_by_price_low) if sorted_by_price_low else 0}")
    print(f"   Сортировка по убыванию цены: {len(sorted_by_price_high) if sorted_by_price_high else 0}")
    print(f"   Сортировка по рейтингу: {len(sorted_by_rating_high) if sorted_by_rating_high else 0}")
    
    # Показываем отсортированные по цене
    if sorted_by_price_low:
        print("\n   Первые 3 услуги по возрастанию цены:")
        for i, service in enumerate(sorted_by_price_low[:3]):
            print(f"     {i+1}. {service.get('name')}: {service.get('price')} руб.")

def test_auth_api_detailed():
    """Детальное тестирование API авторизации"""
    print("\n=== Детальное тестирование API авторизации ===")
    
    api = ServicePlatformAPI()
    
    # Тест регистрации клиента
    print("\n1. Тест регистрации клиента:")
    client_data = {
        "full_name": "Иван Иванов Иванович",
        "email": f"test_client_{int(time.time())}@example.com",
        "phone": "89017335432",
        "password": "testpassword123"
    }
    
    try:
        result = api.register_client(**client_data)
        if "error" not in result:
            print(f"   ✅ Клиент зарегистрирован: ID {result.get('user', {}).get('id')}")
            print(f"   Токен получен: {bool(result.get('user', {}).get('token'))}")
        else:
            print(f"   ❌ Ошибка регистрации: {result['error']}")
    except Exception as e:
        print(f"   ❌ Исключение при регистрации: {e}")
    
    # Тест регистрации компании
    print("\n2. Тест регистрации компании:")
    company_data = {
        "company_name": "ТестКомпания ООО",
        "email": f"test_company_{int(time.time())}@example.com",
        "phone": "89017335433",
        "full_name": "Петр Петров Петрович",
        "position_agent": "Генеральный директор",
        "id_company": "1234567890",
        "address": "Москва, ул. Тестовая, д. 1",
        "type_service": "Клининговые услуги",
        "password": "testpassword123"
    }
    
    try:
        result = api.register_company(**company_data)
        if "error" not in result:
            print(f"   ✅ Компания зарегистрирована: ID {result.get('user', {}).get('id')}")
            print(f"   Токен получен: {bool(result.get('user', {}).get('token'))}")
            
            # Тест создания карточки услуги
            if api.token:
                print("\n3. Тест создания карточки услуги:")
                card_result = api.create_card("Тестовая услуга", "Описание тестовой услуги")
                if "error" not in card_result:
                    print(f"   ✅ Карточка создана: ID {card_result.get('card', {}).get('id')}")
                    
                    # Тест получения списка карточек
                    print("\n4. Тест получения карточек:")
                    cards_result = api.get_cards()
                    if "error" not in cards_result:
                        cards = cards_result.get('cards', [])
                        print(f"   ✅ Получено карточек: {len(cards)}")
                        for card in cards:
                            print(f"     - {card.get('title')}: {card.get('description')}")
                    else:
                        print(f"   ❌ Ошибка получения карточек: {cards_result['error']}")
                else:
                    print(f"   ❌ Ошибка создания карточки: {card_result['error']}")
        else:
            print(f"   ❌ Ошибка регистрации компании: {result['error']}")
    except Exception as e:
        print(f"   ❌ Исключение при регистрации компании: {e}")

def test_photo_api():
    """Тестирование API фотосервиса"""
    print("\n=== Тестирование API фотосервиса ===")
    
    api = ServicePlatformAPI()
    
    # Тест получения списка фото
    print("\n1. Тест получения списка фотографий:")
    try:
        photos = api.list_photos(limit=5)
        print(f"   Получено фотографий: {len(photos) if photos else 0}")
        if photos:
            for i, photo in enumerate(photos[:2]):
                print(f"   Фото {i+1}: {json.dumps(photo, ensure_ascii=False, indent=2)}")
    except Exception as e:
        print(f"   ❌ Ошибка получения списка фото: {e}")

if __name__ == "__main__":
    import time
    
    # Запускаем все тесты
    test_search_api_detailed()
    test_auth_api_detailed() 
    test_photo_api()
    
    print("\n=== Детальное тестирование завершено ===")
