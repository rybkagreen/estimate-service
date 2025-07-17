# Интеграция нормативных баз данных НСБ

## Обзор

Сервис data-collector обеспечивает интеграцию с нормативными базами данных строительной отрасли России. Система поддерживает синхронизацию и работу со следующими базами:

- **ГЭСН** - Государственные элементные сметные нормы
- **ФЕР** - Федеральные единичные расценки  
- **ТЕР** - Территориальные единичные расценки
- **ТСН** - Территориальные сметные нормативы
- **ФССЦ** - Федеральные сборники сметных цен
- **ТССЦ** - Территориальные сборники сметных цен

## Архитектура

### Структура базы данных

Для каждого типа нормативов создана отдельная таблица в PostgreSQL:

```sql
-- ГЭСН
gesn_items (код, наименование, затраты труда, время машин)
gesn_materials (материалы для ГЭСН)

-- ФЕР/ТЕР
fer_items (федеральные расценки)
ter_items (территориальные расценки)

-- ТСН
tsn_items (территориальные нормативы)

-- ФССЦ/ТССЦ
fssc_items (федеральные цены на материалы)
tssc_items (территориальные цены на материалы)

-- Коэффициенты
index_coefficients (индексы пересчета)
overhead_profit_norms (нормативы накладных расходов и прибыли)
regional_coefficients (региональные коэффициенты)
```

### Модули системы

1. **Модули сбора данных** (`/modules/*`)
   - FerModule - работа с ФЕР
   - TerModule - работа с ТЕР
   - GesnModule - работа с ГЭСН
   - TsnModule - работа с ТСН
   - FsscModule - работа с ФССЦ/ТССЦ

2. **Унифицированный API** (`/modules/normative-api`)
   - Единая точка доступа ко всем нормативным данным
   - Расчет стоимости с учетом коэффициентов
   - Поиск по всем базам

3. **Сервис синхронизации** (`/services/normative-collector.service.ts`)
   - Автоматическая ежедневная синхронизация
   - Ручной запуск синхронизации
   - Мониторинг статуса

## API Endpoints

### Синхронизация данных

```http
# Статус синхронизации
GET /sync/status

# Полная синхронизация
POST /sync/all

# Синхронизация конкретной базы
POST /sync/{database}
```

### Работа с нормативами

```http
# Универсальный поиск
GET /normative/search?query=бетон&type=FER&regionCode=77

# Расчет стоимости с коэффициентами
GET /normative/calculate-price?code=ФЕР01-01-001-01&quantity=100&regionCode=77&targetPeriod=2024-Q1

# Региональные коэффициенты
GET /normative/coefficients/77?targetPeriod=2024-Q1

# Поиск материалов
GET /normative/materials/search?query=цемент&regionCode=77

# Список регионов
GET /normative/regions
```

### Специализированные endpoints

#### ГЭСН
```http
GET /gesn
GET /gesn/{code}
GET /gesn/chapters
GET /gesn/search?name=земляные
```

#### ФЕР
```http
GET /fer
GET /fer/{code}
GET /fer/chapters
```

#### ТЕР
```http
GET /ter?regionCode=77
GET /ter/{code}
GET /ter/regions/{regionCode}
```

#### ТСН
```http
GET /tsn?regionCode=77
GET /tsn/{code}
GET /tsn/regions/{regionCode}
```

#### ФССЦ/ТССЦ
```http
GET /price-collections/fssc?materialGroup=Вяжущие
GET /price-collections/tssc?regionCode=77
GET /price-collections/coefficients?coefficientType=labor&targetPeriod=2024-Q1
```

## Примеры использования

### 1. Поиск расценки и расчет стоимости

```javascript
// Поиск расценки
const response = await fetch('/normative/search?query=ФЕР01-01-001-01');
const { items } = await response.json();

// Расчет стоимости
const calculation = await fetch('/normative/calculate-price?' + 
  'code=ФЕР01-01-001-01&' +
  'quantity=100&' +
  'regionCode=77&' +
  'targetPeriod=2024-Q1'
);

const result = await calculation.json();
// {
//   code: "ФЕР01-01-001-01",
//   name: "Разработка грунта...",
//   unit: "м3",
//   quantity: 100,
//   basePrice: 150.25,
//   laborCost: 187.81,    // с учетом коэффициента
//   machineCost: 172.79,  // с учетом коэффициента
//   materialCost: 0,
//   totalWithCoefficients: 36060.50,
//   coefficients: {
//     labor: 1.25,
//     machine: 1.15,
//     overhead: 0.112,
//     profit: 0.08
//   }
// }
```

### 2. Получение материалов с региональными ценами

```javascript
// Поиск материалов
const materials = await fetch('/normative/materials/search?' +
  'query=цемент&' +
  'regionCode=77'
);

const { items } = await materials.json();
// Результат включает и ФССЦ и ТССЦ для региона
```

### 3. Синхронизация данных

```javascript
// Запуск синхронизации
await fetch('/sync/all', { method: 'POST' });

// Проверка статуса
const status = await fetch('/sync/status');
const syncStatus = await status.json();
// [
//   { service: "FER", status: "completed", lastSync: "2024-01-20T03:00:00Z", recordsProcessed: 5000 },
//   { service: "TER-77", status: "running", recordsProcessed: 0 },
//   ...
// ]
```

## Автоматизация

### Расписание синхронизации

Система автоматически синхронизирует данные каждую ночь в 3:00 с помощью cron-задания:

```typescript
@Cron('0 3 * * *')
async scheduledSync() {
  await this.syncAllNormativeData();
}
```

### Обновление коэффициентов

Индексные коэффициенты обновляются автоматически каждый квартал. Система определяет текущий квартал и обновляет коэффициенты для всех регионов.

## Расширение системы

### Добавление нового региона

1. Добавить код региона в массив `regions` в `NormativeCollectorService`
2. Запустить синхронизацию для нового региона
3. Добавить региональные коэффициенты

### Добавление нового типа норматива

1. Создать таблицу в миграции Prisma
2. Создать модуль в `/modules/`
3. Добавить сервис и контроллер
4. Интегрировать в `NormativeApiController`
5. Добавить в процесс синхронизации

## Мониторинг и логирование

Все операции логируются с помощью NestJS Logger:

- Начало/окончание синхронизации
- Количество обработанных записей
- Ошибки при синхронизации
- Запросы к API

## Безопасность

- Все данные валидируются перед сохранением
- Используются параметризованные запросы (Prisma)
- Ограничение количества возвращаемых записей
- Версионирование данных с историей изменений
