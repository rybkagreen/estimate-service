# Проектные задачи VS Code для Estimate Service

## Обзор
Этот файл содержит предварительно настроенные задачи для разработки проекта Estimate Service в VS Code.

## Доступные задачи

### 🏗️ Сборка проекта
- **build** - Собрать все сервисы
- **build:estimate-service** - Собрать estimate-service
- **build:prod** - Production сборка

### 🧪 Тестирование
- **test** - Запустить все тесты
- **test:unit** - Unit тесты
- **test:e2e** - E2E тесты
- **test:watch** - Тесты в watch режиме
- **test:coverage** - Тесты с покрытием

### 🔍 Линтинг и форматирование
- **lint** - Проверить код ESLint
- **lint:fix** - Исправить проблемы ESLint
- **format** - Форматировать код Prettier
- **type-check** - Проверить типы TypeScript

### 🚀 Запуск сервисов
- **dev** - Запустить в режиме разработки
- **start** - Запустить production версию
- **start:docker** - Запустить через Docker Compose

### 🗄️ База данных
- **db:migrate** - Применить миграции Prisma
- **db:seed** - Заполнить тестовыми данными
- **db:reset** - Сбросить и пересоздать БД
- **db:studio** - Открыть Prisma Studio

### 📦 Управление зависимостями
- **install** - Установить зависимости
- **update** - Обновить зависимости
- **audit** - Проверить уязвимости

## Использование

1. Откройте Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Введите "Tasks: Run Task"
3. Выберите нужную задачу из списка

Или используйте горячие клавиши:
- **Ctrl+Shift+P** → "Tasks: Run Task"
- **Ctrl+Shift+B** → "Tasks: Run Build Task"
- **Ctrl+Shift+T** → "Tasks: Run Test Task"
