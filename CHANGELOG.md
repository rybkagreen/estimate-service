# Changelog

Все значимые изменения в проекте Estimate Service будут документированы в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
и этот проект следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-07-07 - Production Sync

### Added
- **Data Collection Service (ФСБЦ-2022)** - полная система автоматизированного сбора данных
  - ETL Pipeline для официальных источников строительных данных (Минстрой РФ, ФЕР, ТЕР, ГЭСН)
  - Автоматический парсинг файлов (Excel, PDF, XML, JSON)
  - Планировщик обновления данных с cron задачами
  - Мультиисточниковая интеграция с валидацией
  - Поддержка региональных коэффициентов
  - Интеграция рыночных цен
  - REST API для управления сбором данных
- **CI/CD Pipeline** - настройка GitHub Actions
  - Автоматическое тестирование (unit, integration, e2e)
  - Проверка типов TypeScript
  - Проверка качества кода с ESLint
  - Этапы сборки и развертывания
  - PostgreSQL сервис для тестирования
- **Новые зависимости**
  - axios: HTTP клиент для API запросов
  - tslib: TypeScript runtime библиотека

### Changed
- Обновлена конфигурация DATABASE_URL для подключения PostgreSQL
- Расширена документация проекта с функциями сбора данных
- Улучшен README со статусом production sync
- Интегрированы изменения из feature/data-collection-clean ветки

### Fixed
- Ошибки компиляции TypeScript в AI Assistant провайдере
- Недостающие зависимости для интеграции DeepSeek
- Конфигурация подключения к базе данных

### Security
- Обновлен .gitignore для исключения API ключей и секретов
- Безопасное управление учетными данными базы данных

## [Unreleased]

### Added
- Полная документация проекта
- Стандарты кодирования и разработки
- Конфигурация VS Code (задачи, настройки, расширения)
- Шаблоны GitHub (issue, pull request)
- Настройки ESLint и Prettier
- Руководства по развертыванию и производительности
- Документация API и архитектуры системы
- Руководство пользователя
- Стандарты безопасности и отчетности

### Changed
- Обновлен README.md с полной документацией
- Упрощена конфигурация .env.example для standalone режима

### Fixed
- Исправлены настройки VS Code tasks.json и settings.json

## [1.0.0] - 2025-07-04

### Added
- Инициальная версия Estimate Service (standalone)
- Извлечение из монорепозитория AI Construction Ecosystem
- Базовая функциональность ИИ-ассистента для составления смет
- Интеграция с DeepSeek R1
- Поддержка Гранд Смета формата
- REST API с документацией Swagger
- Prisma ORM для работы с базой данных
- Docker поддержка
- Базовые тесты
- Health checks и метрики

### Technical Details
- NestJS framework
- TypeScript
- PostgreSQL
- Docker & Docker Compose
- Jest для тестирования
- Основные модули: ai-assistant, classification, estimate, grand-smeta, templates

---

## Типы изменений

- `Added` - новые функции
- `Changed` - изменения в существующей функциональности
- `Deprecated` - функции, которые будут удалены в будущих версиях
- `Removed` - удаленные функции
- `Fixed` - исправления багов
- `Security` - изменения, связанные с безопасностью
