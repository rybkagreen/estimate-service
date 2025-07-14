#!/bin/bash

# Быстрый старт для estimate-service в новом проекте
# Этот скрипт автоматизирует развертывание сервиса

set -e

echo "🚀 Быстрый старт Estimate Service"
echo "================================="

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 20+ и попробуйте снова."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Требуется Node.js 20+. Текущая версия: $(node -v)"
    exit 1
fi

echo "✅ Node.js версия: $(node -v)"

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не найден."
    exit 1
fi

echo "✅ npm версия: $(npm -v)"

# Установка зависимостей
echo ""
echo "📦 Установка зависимостей..."
npm install

# Проверка .env файла
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Создание .env файла из примера..."
        cp .env.example .env
        echo "⚠️  Отредактируйте .env файл с вашими настройками перед запуском!"
    else
        echo "⚠️  Создайте .env файл с настройками подключения к БД"
    fi
fi

# Генерация Prisma клиента
echo ""
echo "🗄️ Генерация Prisma клиента..."
npm run prisma:generate

# Проверка базы данных
echo ""
echo "💾 Проверка подключения к базе данных..."
if npm run prisma:migrate --dry-run; then
    echo "✅ Схема БД актуальна"
else
    echo "📄 Применение миграций..."
    npm run prisma:migrate
fi

# Сборка проекта
echo ""
echo "🔨 Сборка проекта..."
npm run build

echo ""
echo "✨ Готово! Estimate Service настроен и готов к запуску."
echo ""
echo "🚀 Команды для запуска:"
echo "  npm run start:dev    # Режим разработки"
echo "  npm run start        # Продакшн режим"
echo "  npm test             # Запуск тестов"
echo ""
echo "🌐 После запуска сервис будет доступен на:"
echo "  http://localhost:3022          # API"
echo "  http://localhost:3022/api/docs # Swagger документация"
echo ""
echo "💡 Полезные команды:"
echo "  npm run prisma:studio  # GUI для базы данных"
echo "  npm run lint           # Проверка кода"
echo "  docker-compose up -d   # Запуск через Docker"
