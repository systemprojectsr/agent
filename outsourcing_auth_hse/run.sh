#!/bin/bash

echo "🚀 Запуск платформы аутсорсинга с эскроу-платежами"

# Проверяем наличие Go
if ! command -v go &> /dev/null; then
    echo "❌ Go не установлен. Устанавливаем Go..."
    
    # Для Ubuntu/Debian
    if command -v apt &> /dev/null; then
        sudo apt update
        sudo apt install -y golang-go
    # Для CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y golang
    else
        echo "❌ Не удалось установить Go автоматически."
        echo "Установите Go вручную: https://golang.org/doc/install"
        exit 1
    fi
fi

echo "✅ Go установлен: $(go version)"

# Проверяем переменные окружения
if [ ! -f ".env" ]; then
    echo "⚠️  Файл .env не найден. Копируем .env.example..."
    cp .env.example .env
    echo "📝 Отредактируйте .env с вашими настройками PostgreSQL"
fi

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
go mod tidy

# Проверяем компиляцию
echo "🔍 Проверка компиляции..."
if go build cmd/api/main.go; then
    echo "✅ Проект компилируется успешно"
    rm -f main
else
    echo "❌ Ошибки компиляции:"
    exit 1
fi

# Запускаем сервис
echo "🌐 Запуск Go сервиса на порту 8080..."
echo "📋 API будет доступен на: http://localhost:8080"
echo "🧪 Тестирование: откройте templates/api_test.html в браузере"
echo "📖 Документация: README.md"
echo ""
echo "Нажмите Ctrl+C для остановки"

go run cmd/api/main.go
