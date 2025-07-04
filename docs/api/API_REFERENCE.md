# API Документация - Estimate Service

## Обзор API

Estimate Service предоставляет RESTful API для работы с системой составления сметной документации на базе ФСБЦ-2022 с интеграцией ИИ-ассистента.

**Base URL**: `https://api.estimate-service.com/v1`
**Версия API**: 1.0
**Формат данных**: JSON
**Аутентификация**: Bearer Token (JWT)

## Структура ответов

### Успешный ответ
```json
{
  "success": true,
  "data": {
    // данные ответа
  },
  "meta": {
    "timestamp": "2025-07-04T12:00:00Z",
    "version": "1.0",
    "requestId": "req_123456"
  }
}
```

### Ответ с ошибкой
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-07-04T12:00:00Z",
    "version": "1.0",
    "requestId": "req_123456"
  }
}
```

### Пагинированный ответ
```json
{
  "success": true,
  "data": [
    // массив элементов
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-07-04T12:00:00Z",
    "version": "1.0",
    "requestId": "req_123456"
  }
}
```

## Аутентификация

### Получение токена
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

### Использование токена
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Модули API

### 1. Аутентификация и авторизация

#### POST /auth/login
Аутентификация пользователя

**Тело запроса:**
```json
{
  "email": "string",
  "password": "string"
}
```

#### POST /auth/refresh
Обновление токена доступа

**Тело запроса:**
```json
{
  "refreshToken": "string"
}
```

#### POST /auth/logout
Выход из системы

**Заголовки:**
```
Authorization: Bearer <token>
```

### 2. Управление сметами

#### GET /estimates
Получение списка смет

**Параметры запроса:**
- `page` (number, optional): Номер страницы (по умолчанию: 1)
- `limit` (number, optional): Количество элементов на странице (по умолчанию: 20)
- `status` (string, optional): Фильтр по статусу (DRAFT, IN_PROGRESS, COMPLETED, APPROVED)
- `projectId` (number, optional): Фильтр по ID проекта
- `search` (string, optional): Поиск по названию или описанию

**Пример запроса:**
```http
GET /estimates?page=1&limit=10&status=DRAFT&search=офисное здание
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Смета на строительство офисного здания",
      "description": "Смета на строительство 5-этажного офисного здания",
      "status": "DRAFT",
      "totalCost": 15000000.00,
      "currency": "RUB",
      "projectId": 123,
      "region": "Москва",
      "createdAt": "2025-07-01T10:00:00Z",
      "updatedAt": "2025-07-04T12:00:00Z",
      "createdBy": {
        "id": 456,
        "name": "Иванов Иван",
        "email": "ivanov@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST /estimates
Создание новой сметы

**Тело запроса:**
```json
{
  "name": "string",
  "description": "string (optional)",
  "projectId": "number",
  "regionCode": "string",
  "templateId": "number (optional)",
  "items": [
    {
      "fsbtsCode": "string",
      "quantity": "number",
      "customPrice": "number (optional)"
    }
  ]
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Новая смета",
    "status": "DRAFT",
    "totalCost": 0,
    "items": [],
    "createdAt": "2025-07-04T12:00:00Z"
  }
}
```

#### GET /estimates/{id}
Получение сметы по ID

**Параметры пути:**
- `id` (number): ID сметы

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Смета на строительство",
    "description": "Подробное описание сметы",
    "status": "IN_PROGRESS",
    "totalCost": 15000000.00,
    "currency": "RUB",
    "region": "Москва",
    "items": [
      {
        "id": 100,
        "fsbtsCode": "01-01-001-01",
        "name": "Земляные работы",
        "unit": "м³",
        "quantity": 1000,
        "unitPrice": 150.00,
        "totalPrice": 150000.00,
        "laborCost": 50000.00,
        "machineCost": 75000.00,
        "materialCost": 25000.00
      }
    ],
    "breakdown": {
      "laborTotal": 5000000.00,
      "machineTotal": 7500000.00,
      "materialTotal": 2500000.00,
      "overhead": 1500000.00,
      "profit": 750000.00
    },
    "createdAt": "2025-07-01T10:00:00Z",
    "updatedAt": "2025-07-04T12:00:00Z"
  }
}
```

#### PUT /estimates/{id}
Обновление сметы

**Тело запроса:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "status": "string (optional)",
  "items": [
    {
      "id": "number (optional, для обновления существующих)",
      "fsbtsCode": "string",
      "quantity": "number",
      "customPrice": "number (optional)"
    }
  ]
}
```

#### DELETE /estimates/{id}
Удаление сметы

### 3. Работа с ФСБЦ-2022

#### GET /fsbts/search
Поиск в базе ФСБЦ-2022

**Параметры запроса:**
- `query` (string): Поисковый запрос
- `category` (string, optional): Категория работ
- `regionCode` (string, optional): Код региона
- `page` (number, optional): Номер страницы
- `limit` (number, optional): Количество элементов

**Пример:**
```http
GET /fsbts/search?query=земляные работы&regionCode=MOW&page=1&limit=20
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "code": "01-01-001-01",
      "name": "Разработка грунта экскаватором",
      "unit": "м³",
      "basePrice": 150.00,
      "laborCost": 50.00,
      "machineCost": 75.00,
      "materialCost": 25.00,
      "category": "EARTHWORKS",
      "region": "Москва",
      "regionCoefficient": 1.15,
      "validFrom": "2025-01-01",
      "validTo": null
    }
  ]
}
```

#### GET /fsbts/item/{code}
Получение позиции ФСБЦ по коду

#### GET /fsbts/categories
Получение списка категорий

#### GET /fsbts/regions
Получение списка регионов

### 4. ИИ-ассистент

#### POST /ai/chat
Чат с ИИ-ассистентом

**Тело запроса:**
```json
{
  "message": "string",
  "context": {
    "estimateId": "number (optional)",
    "projectId": "number (optional)"
  }
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "response": "Для строительства офисного здания рекомендую использовать следующие виды работ...",
    "suggestions": [
      {
        "type": "FSBTS_ITEM",
        "code": "01-01-001-01",
        "name": "Земляные работы",
        "relevance": 0.95
      }
    ],
    "conversationId": "conv_123456"
  }
}
```

#### POST /ai/analyze-estimate
Анализ сметы с помощью ИИ

**Тело запроса:**
```json
{
  "estimateId": "number"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "costOptimization": [
        {
          "item": "01-01-001-01",
          "currentCost": 150000,
          "optimizedCost": 135000,
          "savings": 15000,
          "recommendation": "Использовать альтернативную технологию"
        }
      ],
      "risks": [
        {
          "type": "COST_OVERRUN",
          "probability": 0.3,
          "impact": "MEDIUM",
          "description": "Возможное превышение бюджета на 10-15%"
        }
      ],
      "recommendations": [
        "Рассмотрите возможность использования местных материалов",
        "Планируйте работы с учетом сезонности"
      ]
    }
  }
}
```

#### POST /ai/auto-estimate
Автоматическое создание сметы по описанию

**Тело запроса:**
```json
{
  "description": "string",
  "projectType": "string",
  "regionCode": "string",
  "requirements": "string (optional)"
}
```

### 5. Шаблоны смет

#### GET /templates
Получение списка шаблонов

#### GET /templates/{id}
Получение шаблона по ID

#### POST /templates/{id}/apply
Применение шаблона к смете

### 6. Аналитика

#### GET /analytics/trends
Получение трендов цен

**Параметры запроса:**
- `category` (string, optional): Категория работ
- `regionCode` (string, optional): Код региона
- `period` (string): Период анализа (1M, 3M, 6M, 1Y)

#### GET /analytics/regional-comparison
Сравнение цен по регионам

#### POST /analytics/predict-cost
Предсказание стоимости

## Коды ошибок

| Код | Описание |
|-----|----------|
| `VALIDATION_ERROR` | Ошибка валидации входных данных |
| `AUTHENTICATION_FAILED` | Ошибка аутентификации |
| `AUTHORIZATION_FAILED` | Недостаточно прав доступа |
| `RESOURCE_NOT_FOUND` | Ресурс не найден |
| `DUPLICATE_RESOURCE` | Дублирование ресурса |
| `RATE_LIMIT_EXCEEDED` | Превышен лимит запросов |
| `INTERNAL_SERVER_ERROR` | Внутренняя ошибка сервера |
| `SERVICE_UNAVAILABLE` | Сервис недоступен |
| `AI_SERVICE_ERROR` | Ошибка ИИ-сервиса |
| `FSBTS_DATA_ERROR` | Ошибка данных ФСБЦ-2022 |

## Лимиты API

- **Запросы в минуту**: 1000 для аутентифицированных пользователей
- **Запросы к ИИ в час**: 100
- **Размер запроса**: максимум 10 МБ
- **Размер ответа**: максимум 50 МБ

## Примеры использования

### Создание сметы с ИИ-помощником

```javascript
// 1. Получить рекомендации от ИИ
const aiResponse = await fetch('/api/ai/auto-estimate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    description: 'Строительство 2-этажного офисного здания площадью 500 кв.м',
    projectType: 'OFFICE_BUILDING',
    regionCode: 'MOW'
  })
});

// 2. Создать смету на основе рекомендаций
const estimate = await fetch('/api/estimates', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Смета на офисное здание',
    projectId: 123,
    regionCode: 'MOW',
    items: aiResponse.data.recommendedItems
  })
});
```

### Поиск и добавление позиций ФСБЦ

```javascript
// Поиск позиций
const searchResults = await fetch('/api/fsbts/search?query=фундамент&regionCode=MOW');

// Добавление позиции в смету
const updateEstimate = await fetch('/api/estimates/1', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [
      {
        fsbtsCode: '02-01-001-01',
        quantity: 100
      }
    ]
  })
});
```

## WebSocket API

Для real-time обновлений сметы и чата с ИИ используется WebSocket соединение:

**Подключение:**
```
wss://api.estimate-service.com/ws?token=<jwt_token>
```

**События:**
- `estimate.updated` - обновление сметы
- `ai.response` - ответ ИИ-ассистента
- `fsbts.updated` - обновление данных ФСБЦ

## SDK и библиотеки

### JavaScript/TypeScript
```bash
npm install @estimate-service/sdk
```

### Python
```bash
pip install estimate-service-sdk
```

## Поддержка

- **Email**: api-support@estimate-service.com
- **Документация**: https://docs.estimate-service.com
- **Status Page**: https://status.estimate-service.com
