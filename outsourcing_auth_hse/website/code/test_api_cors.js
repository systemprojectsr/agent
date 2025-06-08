/**
 * Простой тест API для диагностики CORS проблем
 */

async function testAPI() {
    console.log('🔍 Тестируем API...');
    
    const apiEndpoints = [
        'https://search.tomsk-center.ru/search',
        'https://auth.tomsk-center.ru/v1/login',
        'https://dsam.tomsk-center.ru/photos',
        'https://chat.tomsk-center.ru/'
    ];
    
    for (const url of apiEndpoints) {
        try {
            console.log(`\n📡 Тестируем: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors'
            });
            
            console.log(`✅ Статус: ${response.status} ${response.statusText}`);
            
            if (url.includes('search')) {
                const data = await response.json();
                console.log(`📊 Получено услуг: ${data.length}`);
                console.log(`📋 Первая услуга: ${data[0]?.name}`);
            }
            
        } catch (error) {
            console.error(`❌ Ошибка для ${url}:`, error.message);
            
            if (error.message.includes('CORS')) {
                console.log('🚫 CORS блокировка - это ожидаемо для браузера');
            }
        }
    }
}

// Запускаем тест
testAPI();
