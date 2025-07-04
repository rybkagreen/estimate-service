# Changelog

Все значимые изменения в проекте Estimate Service будут документированы в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
и этот проект следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
