/**
 * Модуль для взаимодействия с API платформы услуг
 */

class ServicePlatformAPI {
    constructor() {
        // Базовые URL сервисов
        this.authUrl = 'https://auth.tomsk-center.ru';
        this.searchUrl = 'https://search.tomsk-center.ru';
        this.photoUrl = 'https://dsam.tomsk-center.ru';
        this.chatUrl = 'https://chat.tomsk-center.ru';
        
        // Текущий токен пользователя
        this.token = localStorage.getItem('authToken');
        
        // Заголовки по умолчанию
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // === Утилиты ===
    
    /**
     * Выполняет HTTP запрос с обработкой ошибок
     */
    async makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.defaultHeaders,
                    ...options.headers
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${data.message || 'Ошибка запроса'}`);
            }
            
            return data;
        } catch (error) {
            console.error('Ошибка API запроса:', error);
            throw error;
        }
    }

    /**
     * Сохраняет токен в localStorage
     */
    saveToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    /**
     * Удаляет токен из localStorage
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    /**
     * Проверяет авторизацию пользователя
     */
    isAuthenticated() {
        return !!this.token;
    }

    // === API авторизации ===

    /**
     * Регистрация клиента
     */
    async registerClient(fullName, email, phone, password, photo = null) {
        const data = {
            user: {
                register: {
                    full_name: fullName,
                    email: email,
                    phone: phone,
                    password: password,
                    photo: photo,
                    type: 'client'
                }
            }
        };

        const response = await this.makeRequest(`${this.authUrl}/v1/register/client`, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (response.user && response.user.token) {
            this.saveToken(response.user.token);
        }

        return response;
    }

    /**
     * Регистрация компании
     */
    async registerCompany(companyData) {
        const data = {
            user: {
                register: {
                    ...companyData,
                    type: 'company'
                }
            }
        };

        const response = await this.makeRequest(`${this.authUrl}/v1/register/company`, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (response.user && response.user.token) {
            this.saveToken(response.user.token);
        }

        return response;
    }

    /**
     * Авторизация пользователя
     */
    async login(email, password) {
        const data = {
            user: {
                login: {
                    email: email,
                    password_hash: password
                }
            }
        };

        const response = await this.makeRequest(`${this.authUrl}/v1/login`, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (response.user && response.user.token) {
            this.saveToken(response.user.token);
        }

        return response;
    }

    /**
     * Получение информации об аккаунте
     */
    async getAccount() {
        if (!this.token) {
            throw new Error('Токен авторизации отсутствует');
        }

        const data = {
            user: {
                login: {
                    token: this.token
                }
            }
        };

        return await this.makeRequest(`${this.authUrl}/v1/account`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Создание карточки услуги
     */
    async createCard(title, description) {
        if (!this.token) {
            throw new Error('Требуется авторизация');
        }

        const data = {
            user: {
                login: {
                    token: this.token
                }
            },
            card: {
                title: title,
                description: description
            }
        };

        return await this.makeRequest(`${this.authUrl}/v1/account/card/create`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Получение списка карточек
     */
    async getCards(limit = 10, page = 0) {
        if (!this.token) {
            throw new Error('Требуется авторизация');
        }

        const data = {
            user: {
                login: {
                    token: this.token
                }
            }
        };

        return await this.makeRequest(`${this.authUrl}/v1/account/card/list?limit=${limit}&page=${page}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Выход из системы
     */
    logout() {
        this.clearToken();
        // Здесь можно добавить дополнительную логику очистки
    }

    // === API поиска ===

    /**
     * Поиск услуг с фильтрами
     */
    async searchServices(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.priceFrom) params.append('price_from', filters.priceFrom);
        if (filters.priceTo) params.append('price_to', filters.priceTo);
        if (filters.location) params.append('location', filters.location);
        if (filters.rating) params.append('rating', filters.rating);
        if (filters.sort) params.append('sort', filters.sort);

        const url = `${this.searchUrl}/search${params.toString() ? '?' + params.toString() : ''}`;
        
        return await this.makeRequest(url, {
            method: 'GET'
        });
    }

    /**
     * Получение всех доступных услуг
     */
    async getAllServices() {
        return await this.searchServices();
    }

    /**
     * Получение популярных категорий услуг
     */
    async getPopularCategories() {
        // Получаем все услуги и группируем по локациям/типам
        const services = await this.getAllServices();
        if (!services || !Array.isArray(services)) return [];

        const categories = {};
        services.forEach(service => {
            const location = service.location || 'Другое';
            if (!categories[location]) {
                categories[location] = [];
            }
            categories[location].push(service);
        });

        return Object.keys(categories).map(location => ({
            name: location,
            count: categories[location].length,
            services: categories[location]
        }));
    }

    // === API фотосервиса ===

    /**
     * Загрузка фотографии
     */
    async uploadPhoto(file, userId, companyId = null, taskId = null, isTaskResult = false) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', userId.toString());
        if (companyId) formData.append('company_id', companyId.toString());
        if (taskId) formData.append('task_id', taskId.toString());
        formData.append('is_task_result', isTaskResult.toString());

        return await fetch(`${this.photoUrl}/photos/upload`, {
            method: 'POST',
            body: formData
        }).then(response => response.json());
    }

    /**
     * Получение фотографии
     */
    getPhotoUrl(photoId, size = 'original') {
        return `${this.photoUrl}/photos/${photoId}?size=${size}`;
    }

    /**
     * Получение списка фотографий
     */
    async getPhotos(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.userId) params.append('user_id', filters.userId);
        if (filters.companyId) params.append('company_id', filters.companyId);
        if (filters.taskId) params.append('task_id', filters.taskId);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.offset) params.append('offset', filters.offset);

        const url = `${this.photoUrl}/photos${params.toString() ? '?' + params.toString() : ''}`;
        
        return await this.makeRequest(url, {
            method: 'GET'
        });
    }

    // === Дополнительные утилиты ===

    /**
     * Форматирование цены
     */
    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    }

    /**
     * Форматирование рейтинга
     */
    formatRating(rating) {
        return parseFloat(rating).toFixed(1);
    }

    /**
     * Получение звезд рейтинга
     */
    getStarsHtml(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        if (hasHalfStar) {
            stars += '☆';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }
        
        return stars;
    }

    /**
     * Валидация email
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Валидация телефона
     */
    validatePhone(phone) {
        const re = /^[\+]?[7-8][\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
        return re.test(phone);
    }
}

// Создаем глобальный экземпляр API
window.serviceAPI = new ServicePlatformAPI();

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServicePlatformAPI;
}
