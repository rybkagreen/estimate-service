# Индекс документации Estimate Service

## ⭐ НОВИНКА: Система сбора данных ФСБЦ-2022

**Автоматизированная система сбора, скачивания, парсинга и ETL-обработки данных ФСБЦ-2022 реализована!**

### 📊 Ключевые документы по новой функциональности:
- **[📋 Полный отчет о реализации](../IMPLEMENTATION_REPORT.md)** - Детальный отчет о выполненной работе ⭐
- **[�️ Обновленный ROADMAP](ESTIMATE_SYSTEM_ROADMAP.txt)** - Актуальная дорожная карта развития
- **[🔧 Документация data-collector](../services/data-collector/README.md)** - Руководство по новому сервису
- **[📋 Отчет о завершении автоматизации](../services/data-collector/AUTOMATION_COMPLETION_REPORT.md)** - Техническая документация

### 🚀 Что реализовано:
```text
✅ 21 файл создан/изменен
✅ 13,279+ строк кода
✅ 12 сервисов реализовано
✅ 5 REST API endpoints
✅ 3 автоматические Cron задачи
✅ 4 типа парсеров файлов
✅ 100% покрытие TypeScript типами
```

## �📁 Структура документации

```
docs/
├── 🆕 НОВЫЕ ДОКУМЕНТЫ:
│   ├── IMPLEMENTATION_REPORT.md         # Отчет о реализации системы сбора данных
│   └── ESTIMATE_SYSTEM_ROADMAP.txt     # Обновленный ROADMAP проекта
├── api/                     # API документация
│   └── API_REFERENCE.md     # Полный справочник API
├── architecture/            # Архитектурная документация
│   └── SYSTEM_ARCHITECTURE.md  # Архитектура системы
├── backend/                 # Backend документация
│   ├── PRODUCTION_ROADMAP.md    # Дорожная карта backend (ОБНОВЛЕН)
│   └── ITERATION_2_COMPLETE.md # Отчет о завершении итерации 2
├── development/             # Документация разработчика
│   ├── CODING_STANDARDS.md      # Стандарты кодирования
│   ├── LINTING_AND_FORMATTING.md  # Правила линтинга
│   ├── PROJECT_STRUCTURE.md     # Структура проекта
│   └── TESTING_STRATEGY.md      # Стратегия тестирования
├── guides/                  # Руководства
│   ├── DEPLOYMENT_GUIDE.md      # Руководство по развертыванию
│   └── PERFORMANCE_GUIDE.md     # Руководство по производительности
├── standards/               # Стандарты и процессы
│   ├── CODE_REVIEW_CHECKLIST.md    # Чеклист код-ревью
│   ├── DOCUMENTATION_STANDARDS.md  # Стандарты документации
│   ├── REPORTING_STANDARDS.md      # Стандарты отчетности
│   └── SECURITY_GUIDELINES.md      # Руководство по безопасности
└── user-guides/            # Руководства пользователя
    └── USER_MANUAL.md          # Руководство пользователя
```

## 🎯 Быстрый доступ к документам

### ⭐ НОВИНКА: Система сбора данных ФСБЦ-2022
- **[📊 Полный отчет о реализации](../IMPLEMENTATION_REPORT.md)** ⭐ Детальный отчет с архитектурой и статистикой
- **[🗺️ Обновленный ROADMAP](ESTIMATE_SYSTEM_ROADMAP.txt)** ⭐ Дорожная карта с отмеченными завершенными этапами
- **[🔧 Руководство по data-collector](../services/data-collector/README.md)** - Документация нового сервиса
- **[📋 Отчет о завершении автоматизации](../services/data-collector/AUTOMATION_COMPLETION_REPORT.md)** - Техническая документация

### Для разработчиков
- **[Стандарты кодирования](development/CODING_STANDARDS.md)** - Правила написания кода
- **[Правила линтинга](development/LINTING_AND_FORMATTING.md)** - ESLint и Prettier конфигурация
- **[Структура проекта](development/PROJECT_STRUCTURE.md)** - Организация файлов и папок
- **[Стратегия тестирования](development/TESTING_STRATEGY.md)** - Подходы к тестированию
- **[Чеклист код-ревью](standards/CODE_REVIEW_CHECKLIST.md)** - Что проверять при ревью

### Для DevOps
- **[Руководство по развертыванию](guides/DEPLOYMENT_GUIDE.md)** - Docker, Kubernetes, CI/CD
- **[Руководство по производительности](guides/PERFORMANCE_GUIDE.md)** - Оптимизация и мониторинг
- **[Руководство по безопасности](standards/SECURITY_GUIDELINES.md)** - Безопасность системы
- **[Backend Production Roadmap](backend/PRODUCTION_ROADMAP.md)** ⭐ Обновлен с новыми функциями

### Для аналитиков и менеджеров
- **[Стандарты отчетности](standards/REPORTING_STANDARDS.md)** - Создание отчетов и дашбордов
- **[Архитектура системы](architecture/SYSTEM_ARCHITECTURE.md)** - Обзор системы

### Для пользователей
- **[Руководство пользователя](user-guides/USER_MANUAL.md)** - Как работать с системой

### Для API интеграций
- **[Справочник API](api/API_REFERENCE.md)** - Полная документация REST API

## 📚 Основные документы по ролям

### 👨‍💻 Backend разработчик
1. [Стандарты кодирования](development/CODING_STANDARDS.md) - NestJS, TypeScript, принципы SOLID
2. [Архитектура системы](architecture/SYSTEM_ARCHITECTURE.md) - Микросервисы, база данных
3. [Справочник API](api/API_REFERENCE.md) - REST endpoints, схемы данных
4. [Безопасность](standards/SECURITY_GUIDELINES.md) - Аутентификация, авторизация, валидация

### 🎨 Frontend разработчик
1. [Стандарты кодирования](development/CODING_STANDARDS.md) - React, TypeScript
2. [Руководство пользователя](user-guides/USER_MANUAL.md) - UX требования
3. [Справочник API](api/API_REFERENCE.md) - Интеграция с backend

### 🧪 QA Engineer
1. [Стратегия тестирования](development/TESTING_STRATEGY.md) - Unit, Integration, E2E тесты
2. [Чеклист код-ревью](standards/CODE_REVIEW_CHECKLIST.md) - Что тестировать
3. [Руководство пользователя](user-guides/USER_MANUAL.md) - Функциональность системы

### 🚀 DevOps Engineer
1. [Руководство по развертыванию](guides/DEPLOYMENT_GUIDE.md) - Инфраструктура
2. [Руководство по производительности](guides/PERFORMANCE_GUIDE.md) - Мониторинг
3. [Безопасность](standards/SECURITY_GUIDELINES.md) - Секьюрити практики

### 📊 Системный аналитик
1. [Архитектура системы](architecture/SYSTEM_ARCHITECTURE.md) - Обзор системы
2. [Стандарты отчетности](standards/REPORTING_STANDARDS.md) - Аналитика и BI
3. [Руководство пользователя](user-guides/USER_MANUAL.md) - Бизнес-процессы

### 👔 Product Manager
1. [Руководство пользователя](user-guides/USER_MANUAL.md) - Возможности продукта
2. [Стандарты отчетности](standards/REPORTING_STANDARDS.md) - Метрики и KPI
3. [Архитектура системы](architecture/SYSTEM_ARCHITECTURE.md) - Технические ограничения

## 🔗 Связанные ресурсы

### Внешние ресурсы
- **[ФСБЦ-2022](https://www.minstroyrf.gov.ru/)** - Официальная база Минстроя
- **[NestJS Docs](https://docs.nestjs.com/)** - Документация фреймворка
- **[Prisma Docs](https://www.prisma.io/docs/)** - ORM документация
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript

### Инструменты разработки
- **ESLint Config**: `eslint.config.mjs` - Настройки линтера
- **TypeScript Config**: `tsconfig.*.json` - Конфигурация TypeScript
- **Docker**: `docker-compose.yml` - Локальная разработка
- **CI/CD**: `.github/workflows/` - GitHub Actions

## 📋 Чеклисты

### Новый разработчик
- [ ] Прочитать [Стандарты кодирования](development/CODING_STANDARDS.md)
- [ ] Изучить [Структуру проекта](development/PROJECT_STRUCTURE.md)
- [ ] Настроить среду разработки по [Руководству по развертыванию](guides/DEPLOYMENT_GUIDE.md)
- [ ] Ознакомиться с [Чеклистом код-ревью](standards/CODE_REVIEW_CHECKLIST.md)
- [ ] Прочитать [Стратегию тестирования](development/TESTING_STRATEGY.md)

### Новый проект/фича
- [ ] Обновить [Архитектуру системы](architecture/SYSTEM_ARCHITECTURE.md)
- [ ] Добавить эндпоинты в [Справочник API](api/API_REFERENCE.md)
- [ ] Написать тесты согласно [Стратегии тестирования](development/TESTING_STRATEGY.md)
- [ ] Обновить [Руководство пользователя](user-guides/USER_MANUAL.md)

### Релиз
- [ ] Проверить соответствие [Стандартам кодирования](development/CODING_STANDARDS.md)
- [ ] Пройти [Чеклист код-ревью](standards/CODE_REVIEW_CHECKLIST.md)
- [ ] Обновить [Справочник API](api/API_REFERENCE.md)
- [ ] Проверить [Безопасность](standards/SECURITY_GUIDELINES.md)
- [ ] Обновить документацию пользователя

## 🔄 Обновление документации

### Принципы поддержания актуальности
1. **Документация как код** - хранение в git, ревью изменений
2. **Обновление при изменениях** - документация обновляется вместе с кодом
3. **Регулярные аудиты** - ежемесячная проверка актуальности
4. **Обратная связь** - пользователи могут сообщать об ошибках

### Ответственность за разделы

| Раздел | Ответственный | Частота обновления |
|--------|---------------|-------------------|
| API Reference | Backend Lead | При каждом изменении API |
| Architecture | Solution Architect | При архитектурных изменениях |
| Coding Standards | Tech Lead | Ежемесячно |
| User Manual | Product Manager | При новых фичах |
| Security Guidelines | Security Engineer | Ежемесячно |
| Deployment Guide | DevOps Lead | При изменении инфраструктуры |

### Процесс обновления
1. Создать ветку для обновления документации
2. Внести изменения в соответствующие файлы
3. Создать Pull Request с меткой `documentation`
4. Пройти ревью от ответственного за раздел
5. Объединить изменения в main ветку

## 📧 Контакты и поддержка

### Команда документации
- **Tech Writer**: docs@estimate-service.com
- **Technical Lead**: tech-lead@estimate-service.com
- **Product Manager**: product@estimate-service.com

### Процесс обратной связи
1. **Ошибки в документации**: создать Issue в GitHub
2. **Предложения по улучшению**: обсудить в команде
3. **Новые разделы**: согласовать с Tech Lead

## 📈 Метрики документации

### Отслеживаемые показатели
- Количество просмотров каждого документа
- Время, проведенное на странице
- Количество обращений в поддержку по каждой теме
- Обратная связь от разработчиков

### Цели качества
- ✅ 95% разработчиков находят нужную информацию без помощи
- ✅ Новый разработчик может настроить среду за 30 минут
- ✅ 90% API вопросов решаются через документацию
- ✅ Документация обновляется в течение 24 часов после изменений

---

*Документация обновлена: 4 июля 2025*
*Версия: 1.0*
*Статус: Готова к использованию*
