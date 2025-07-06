# API Data Collector - ФСБЦ-2022

Сервис для сбора и предоставления данных Федеральной сметно-нормативной базы цен строительства 2022 года (ФСБЦ-2022).

## Обзор

Data Collector собирает данные из трех основных источников:
- **ФЕР** - Федеральные единичные расценки
- **ТЕР** - Территориальные единичные расценки
- **ГЭСН** - Государственные элементные сметные нормы

## Базовый URL

```
http://localhost:3021/api
```

## Эндпоинты

### ФСБЦ-2022 (Объединенные данные)

#### GET `/fsbc`
Получить данные ФСБЦ-2022

**Параметры запроса:**
- `region` (string, optional) - Регион для фильтрации
- `category` (string, optional) - Категория данных: `FER`, `TER`, `GESN`

**Пример запроса:**
```bash
curl "http://localhost:3021/api/fsbc?region=Московская область&category=TER"
```

**Ответ:**
```json
[
  {
    "code": "01-01-001",
    "name": "Разработка грунта экскаватором",
    "unit": "м3",
    "basePrice": 120.50,
    "laborCost": 45.20,
    "materialCost": 25.30,
    "machineCost": 50.00,
    "totalCost": 120.50,
    "region": "Московская область",
    "category": "TER",
    "source": "ТЕР-Московская область",
    "chapter": "Глава 1. Земляные работы",
    "validFrom": "2001-01-01T00:00:00.000Z"
  }
]
```

#### GET `/fsbc/:code`
Получить позицию ФСБЦ-2022 по коду

**Параметры пути:**
- `code` (string) - Код расценки

**Параметры запроса:**
- `region` (string, optional) - Регион

**Пример:**
```bash
curl "http://localhost:3021/api/fsbc/01-01-001?region=Московская область"
```

#### GET `/fsbc/search/:term`
Поиск в ФСБЦ-2022

**Параметры пути:**
- `term` (string) - Поисковый запрос

**Параметры запроса:**
- `region` (string, optional) - Регион
- `category` (string, optional) - Категория: `FER`, `TER`, `GESN`

**Пример:**
```bash
curl "http://localhost:3021/api/fsbc/search/земляные работы"
```

#### GET `/fsbc/statistics/overview`
Статистика ФСБЦ-2022

**Ответ:**
```json
{
  "total": 15420,
  "fer": 8200,
  "ter": 4320,
  "gesn": 2900,
  "byChapter": {
    "Глава 1. Земляные работы": 1250,
    "Глава 2. Основания и фундаменты": 890
  }
}
```

### ФЕР (Федеральные единичные расценки)

#### GET `/fer`
Получить все данные ФЕР

**Параметры запроса:**
- `region` (string, optional) - Регион

#### GET `/fer/:code`
Получить ФЕР по коду

#### GET `/fer/structure/chapters`
Получить список глав ФЕР

**Ответ:**
```json
[
  "Глава 1. Земляные работы",
  "Глава 2. Основания и фундаменты",
  "Глава 3. Каменные работы"
]
```

### ТЕР (Территориальные единичные расценки)

#### GET `/ter`
Получить все данные ТЕР

**Параметры запроса:**
- `region` (string, optional) - Регион

#### GET `/ter/:code`
Получить ТЕР по коду

**Параметры запроса:**
- `region` (string, optional) - Регион

#### GET `/ter/structure/regions`
Получить список регионов ТЕР

**Ответ:**
```json
[
  "Московская область",
  "Санкт-Петербург и Ленинградская область",
  "Краснодарский край"
]
```

#### GET `/ter/structure/chapters`
Получить список глав ТЕР

### ГЭСН (Государственные элементные сметные нормы)

#### GET `/gesn`
Получить все данные ГЭСН

**Параметры запроса:**
- `chapter` (string, optional) - Глава

#### GET `/gesn/:code`
Получить ГЭСН по коду

#### GET `/gesn/search/:term`
Поиск ГЭСН по названию

#### GET `/gesn/structure/chapters`
Получить список глав ГЭСН

**Ответ:**
```json
[
  "Глава 1. ГЭСН-2001-01. Земляные работы",
  "Глава 2. ГЭСН-2001-02. Основания и фундаменты"
]
```

## Типы данных

### FsbcItem
```typescript
interface FsbcItem {
  code: string;           // Код расценки
  name: string;           // Наименование работ
  unit: string;           // Единица измерения
  basePrice: number;      // Базовая цена
  laborCost: number;      // Затраты на труд
  materialCost: number;   // Затраты на материалы
  machineCost: number;    // Затраты на машины и механизмы
  totalCost: number;      // Общая стоимость
  region?: string;        // Регион (для ТЕР)
  category: 'FER' | 'TER' | 'GESN';
  source: string;         // Источник данных
  chapter?: string;       // Глава/раздел
  section?: string;       // Подраздел
  validFrom: Date;        // Дата начала действия
  validTo?: Date;         // Дата окончания действия
  materials?: Material[]; // Материалы (для ГЭСН)
  laborConsumption?: number;  // Трудозатраты в чел.-ч
  machineTime?: number;       // Машинное время в маш.-ч
}
```

### FerItem
```typescript
interface FerItem {
  code: string;
  name: string;
  unit: string;
  laborCost: number;
  materialCost: number;
  machineCost: number;
  totalCost: number;
  region?: string;
  chapter?: string;
  section?: string;
}
```

### TerItem
```typescript
interface TerItem {
  code: string;
  name: string;
  unit: string;
  laborCost: number;
  materialCost: number;
  machineCost: number;
  totalCost: number;
  region: string;         // Обязательно для ТЕР
  chapter?: string;
  section?: string;
  climateZone?: string;
}
```

### GesnItem
```typescript
interface GesnItem {
  code: string;
  name: string;
  unit: string;
  laborConsumption: number;  // Трудозатраты в чел.-ч
  machineTime: number;       // Машинное время в маш.-ч
  materials: Material[];     // Список материалов
  chapter?: string;
  section?: string;
  complexity?: string;      // Группа сложности
  conditions?: string;      // Условия выполнения
}
```

### Material
```typescript
interface Material {
  code: string;
  name: string;
  unit: string;
  consumption: number;       // Расход на единицу
  wasteCoefficient?: number; // Коэффициент отходов
}
```

## Коды ошибок

- `200` - Успешный запрос
- `400` - Неверные параметры запроса
- `404` - Данные не найдены
- `500` - Внутренняя ошибка сервера
- `503` - Сервис временно недоступен

## Примеры использования

### Получение всех ТЕР для Московской области
```bash
curl "http://localhost:3021/api/ter?region=Московская область"
```

### Поиск работ по земляным работам во всех источниках
```bash
curl "http://localhost:3021/api/fsbc/search/земляные работы"
```

### Получение конкретной расценки по коду
```bash
curl "http://localhost:3021/api/fsbc/01-01-001"
```

### Получение статистики по всей базе
```bash
curl "http://localhost:3021/api/fsbc/statistics/overview"
```

## Лимиты и ограничения

- Максимум 1000 записей за один запрос
- Максимум 100 запросов в минуту с одного IP
- Кэширование ответов на 1 час
- Таймаут запроса: 30 секунд

## Примечания

1. Данные обновляются ежедневно в 02:00 МСК
2. Региональные коэффициенты применяются автоматически для ТЕР
3. Для ГЭСН стоимость рассчитывается на основе трудозатрат и машинного времени
4. Все денежные значения указаны в рублях без НДС на базовый период (2000 год)
