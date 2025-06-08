#!/usr/bin/env python3
"""
Тестирование API Backend
Скрипт для проверки основного функционала API
"""

import requests
import json
import time

# Конфигурация
BASE_URL = "http://localhost:8080"
TEST_EMAIL_CLIENT = "test_client@example.com"
TEST_EMAIL_COMPANY = "test_company@example.com"
TEST_PASSWORD = "testpassword123"

class APITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.client_token = None
        self.company_token = None
        self.test_results = []

    def log_test(self, test_name, success, details=""):
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")

    def test_public_endpoints(self):
        """Тестирование публичных эндпоинтов"""
        print("\n🔍 Тестирование публичных эндпоинтов...")
        
        try:
            # Тест получения всех карточек
            response = requests.get(f"{self.base_url}/cards")
            self.log_test("GET /cards", response.status_code == 200, f"Status: {response.status_code}")
            
            # Тест получения всех заказов
            response = requests.get(f"{self.base_url}/orders")
            self.log_test("GET /orders", response.status_code == 200, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Public endpoints", False, f"Error: {str(e)}")

    def test_registration(self):
        """Тестирование регистрации"""
        print("\n👤 Тестирование регистрации...")
        
        # Регистрация клиента
        client_data = {
            "full_name": "Test Client",
            "email": TEST_EMAIL_CLIENT,
            "password_hash": TEST_PASSWORD,
            "phone": "+79991234567"
        }
        
        try:
            response = requests.post(f"{self.base_url}/v1/register/client", json=client_data)
            if response.status_code == 200:
                data = response.json()
                self.client_token = data.get("response_user", {}).get("token")
                self.log_test("Client registration", True, f"Token received: {bool(self.client_token)}")
            else:
                self.log_test("Client registration", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Client registration", False, f"Error: {str(e)}")

        # Регистрация компании
        company_data = {
            "company_name": "Test Company",
            "full_name": "Test Company Owner",
            "position_agent": "CEO",
            "id_company": "123456789",
            "email": TEST_EMAIL_COMPANY,
            "password_hash": TEST_PASSWORD,
            "phone": "+79991234568",
            "address": "Test Address",
            "type_service": "IT Services"
        }
        
        try:
            response = requests.post(f"{self.base_url}/v1/register/company", json=company_data)
            if response.status_code == 200:
                data = response.json()
                self.company_token = data.get("response_user", {}).get("token")
                self.log_test("Company registration", True, f"Token received: {bool(self.company_token)}")
            else:
                self.log_test("Company registration", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Company registration", False, f"Error: {str(e)}")

    def test_login(self):
        """Тестирование входа в систему"""
        print("\n🔐 Тестирование входа в систему...")
        
        login_data = {
            "general_login": {
                "general_login_attributes": {
                    "email": TEST_EMAIL_CLIENT,
                    "password": TEST_PASSWORD
                }
            }
        }
        
        try:
            response = requests.post(f"{self.base_url}/v1/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                token = data.get("response_user", {}).get("token")
                if token:
                    self.client_token = token
                self.log_test("Client login", True, f"Token updated: {bool(token)}")
            else:
                self.log_test("Client login", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Client login", False, f"Error: {str(e)}")

    def test_account_access(self):
        """Тестирование доступа к аккаунту"""
        print("\n👤 Тестирование доступа к аккаунту...")
        
        if not self.client_token:
            self.log_test("Account access", False, "No client token available")
            return
            
        account_data = {
            "user": {
                "login": {
                    "token": self.client_token
                }
            }
        }
        
        try:
            response = requests.post(f"{self.base_url}/v1/account/", json=account_data)
            self.log_test("Client account access", response.status_code == 200, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Client account access", False, f"Error: {str(e)}")

    def test_balance_operations(self):
        """Тестирование операций с балансом"""
        print("\n💰 Тестирование операций с балансом...")
        
        if not self.client_token:
            self.log_test("Balance operations", False, "No client token available")
            return
            
        # Тест получения баланса
        balance_data = {
            "user": {
                "login": {
                    "token": self.client_token
                }
            }
        }
        
        try:
            response = requests.post(f"{self.base_url}/v1/account/balance/", json=balance_data)
            self.log_test("Get balance", response.status_code == 200, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get balance", False, f"Error: {str(e)}")
            
        # Тест пополнения баланса
        topup_data = {
            "user": {
                "login": {
                    "token": self.client_token
                }
            },
            "amount": 1000.0
        }
        
        try:
            response = requests.post(f"{self.base_url}/v1/account/balance/topup", json=topup_data)
            self.log_test("Balance topup", response.status_code == 200, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Balance topup", False, f"Error: {str(e)}")

    def test_notifications(self):
        """Тестирование уведомлений"""
        print("\n🔔 Тестирование уведомлений...")
        
        if not self.client_token:
            self.log_test("Notifications", False, "No client token available")
            return
            
        notifications_data = {
            "user": {
                "login": {
                    "token": self.client_token
                }
            },
            "limit": 10,
            "offset": 0
        }
        
        try:
            response = requests.post(f"{self.base_url}/v1/account/notification/list", json=notifications_data)
            self.log_test("Get notifications", response.status_code == 200, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get notifications", False, f"Error: {str(e)}")
            
        # Тест получения количества непрочитанных
        unread_data = {
            "user": {
                "login": {
                    "token": self.client_token
                }
            }
        }
        
        try:
            response = requests.post(f"{self.base_url}/v1/account/notification/unread-count", json=unread_data)
            self.log_test("Get unread count", response.status_code == 200, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get unread count", False, f"Error: {str(e)}")

    def test_profile_update(self):
        """Тестирование обновления профиля"""
        print("\n✏️ Тестирование обновления профиля...")
        
        if not self.client_token:
            self.log_test("Profile update", False, "No client token available")
            return
            
        profile_data = {
            "user": {
                "login": {
                    "token": self.client_token
                }
            },
            "profile": {
                "full_name": "Updated Test Client",
                "phone": "+79991234999"
            }
        }
        
        try:
            response = requests.post(f"{self.base_url}/v1/account/profile/update", json=profile_data)
            self.log_test("Profile update", response.status_code == 200, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Profile update", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Запуск всех тестов"""
        print("🚀 Запуск тестирования API...")
        print(f"Base URL: {self.base_url}")
        
        self.test_public_endpoints()
        self.test_registration()
        self.test_login()
        self.test_account_access()
        self.test_balance_operations()
        self.test_notifications()
        self.test_profile_update()
        
        # Подведение итогов
        print("\n📊 Результаты тестирования:")
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Всего тестов: {total_tests}")
        print(f"Пройдено: {passed_tests} ✅")
        print(f"Провалено: {failed_tests} ❌")
        print(f"Процент успеха: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Провалившиеся тесты:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")

def main():
    """Основная функция"""
    print("Backend API Tester")
    print("==================")
    
    tester = APITester(BASE_URL)
    
    # Проверка доступности сервера
    try:
        response = requests.get(f"{BASE_URL}/cards", timeout=5)
        print(f"✅ Сервер доступен (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Сервер недоступен: {e}")
        print("Убедитесь, что сервер запущен на http://localhost:8080")
        return
    
    tester.run_all_tests()

if __name__ == "__main__":
    main()
