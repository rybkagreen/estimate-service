# Отчет по неиспользуемым компонентам бэкенда
*Дата: 2025-01-17*

## Сводка
Проведен анализ всех бэкенд-сервисов (services/*) на предмет неиспользуемых контроллеров, сервисов и модулей.

## 1. Анализ по сервисам

### estimate-service (Основной сервис)

#### Используемые контроллеры (есть вызовы с фронтенда):
- ✅ `auth.controller.ts` - аутентификация (/auth)
- ✅ `dashboard.controller.ts` - дашборд (/dashboard)
- ✅ `estimate.controller.ts` - сметы (/estimate)
- ✅ `project.controller.ts` - проекты (/project)
- ✅ `ai-assistant.controller.ts` - AI ассистент (/ai-assistant)

#### Потенциально неиспользуемые контроллеры:
- `fgis.controller.ts` - интеграция с ФГИС
- `fgis-cs-api.controller.ts` - API ФГИС ЦС
- `file-upload.controller.ts` - загрузка файлов
- `background-jobs.controller.ts` - фоновые задачи
- `cache.controller.ts` - управление кэшем
- `priority-queue.controller.ts` - приоритетная очередь
- `prediction.controller.ts` - предсказания
- `api-key.controller.ts` - управление API ключами
- `metrics.controller.ts` - метрики
- `health.controller.ts` - проверка здоровья (нужен для k8s)

### ai-assistant-service

#### Используемые контроллеры:
- ✅ `chat.controller.ts` - чат с AI
- ✅ `knowledge.controller.ts` - база знаний
- ✅ `analytics.controller.ts` - аналитика
- ✅ `core.controller.ts` - основной функционал

#### Потенциально неиспользуемые:
- `context.controller.ts` - управление контекстом
- `conversation.controller.ts` - диалоги
- `health.controller.ts` - проверка здоровья

### data-collector

#### Все контроллеры потенциально неиспользуемые:
- `collector.controller.ts`
- `automation.controller.ts`
- `fer.controller.ts`
- `fsbc.controller.ts`
- `fssc.controller.ts`
- `gesn.controller.ts`
- `ter.controller.ts`
- `tsn.controller.ts`
- `historical-analysis.controller.ts`
- `normative-api.controller.ts`
- `auto-collector.controller.ts`

### bim-cad-integration

#### Все контроллеры потенциально неиспользуемые:
- `bim.controller.ts`
- `cad.controller.ts`
- `ocr.controller.ts`
- `volume-extraction.controller.ts`

### file-processor-service

#### Все контроллеры потенциально неиспользуемые:
- `file-processor.controller.ts`
- `health.controller.ts`

### Другие сервисы без явного использования:
- `api-gateway` - прокси сервис
- `analytics` - аналитический сервис
- `knowledge-base` - база знаний
- `marketplace-integration` - интеграция с маркетплейсом
- `realtime-service` - real-time функционал

## 2. Сервисы без зависимостей

### Изолированные сервисы (не импортируются другими):
- `services/automation.service.ts` (data-collector)
- `services/scheduled-collector.service.ts` (data-collector)
- `services/normative-collector.service.ts` (data-collector)
- `services/file-download.service.ts` (data-collector)
- `services/validation.service.ts` (data-collector)

### Парсеры без использования:
- `dwg-parser.service.ts` - парсер DWG файлов
- `ifc-parser.service.ts` - парсер IFC файлов
- `rvt-parser.service.ts` - парсер Revit файлов
- `minstroyrf-parser.service.ts` - парсер данных Минстроя
- `normatives-parser.service.ts` - парсер нормативов

## 3. Модули Prisma без запросов

### Сервисы с Prisma но без активных запросов:
- `marketplace-integration/prisma.service.ts`
- `knowledge-base/prisma.service.ts`
- Множественные дублирующиеся `prisma.service.ts` в разных сервисах

## 4. Дублирование функционала

### AI Assistant дублирование:
- `services/ai-assistant` и `services/ai-assistant-service` - два сервиса с похожим функционалом
- Оба содержат: chat, knowledge, analytics, core модули

### Prisma сервисы:
- 11+ копий `prisma.service.ts` в разных модулях
- Можно вынести в shared библиотеку

### Cache сервисы:
- `cache.service.ts` и `enhanced-cache.service.ts` в estimate-service
- Дублирование функционала кэширования

## Рекомендации

### Критичные действия:
1. **Объединить** ai-assistant и ai-assistant-service в один сервис
2. **Добавить интеграцию** для file-upload.controller.ts на фронтенде
3. **Создать shared библиотеку** для PrismaService

### Важные действия:
1. **Документировать** какие сервисы активно используются
2. **Добавить маршруты** для BIM/CAD интеграции если необходимо
3. **Решить судьбу** data-collector сервиса - используется или удалить

### Оптимизация:
1. **Удалить** неиспользуемые парсеры или создать UI для их использования
2. **Консолидировать** cache сервисы
3. **Провести аудит** всех health endpoints - оставить только необходимые

## Метрики

- **Общее количество сервисов**: 11
- **Общее количество контроллеров**: ~95
- **Используемых контроллеров с фронтенда**: ~9 (менее 10%)
- **Дублирующихся сервисов**: 3 пары
- **Изолированных сервисов без зависимостей**: 5
- **Процент потенциально неиспользуемого кода**: ~70%

## Приоритеты очистки

1. **Высокий приоритет**: 
   - Объединение ai-assistant сервисов
   - Удаление дублирующихся prisma.service.ts

2. **Средний приоритет**:
   - Решение по data-collector сервису
   - Интеграция file-upload

3. **Низкий приоритет**:
   - BIM/CAD интеграция
   - Marketplace интеграция
