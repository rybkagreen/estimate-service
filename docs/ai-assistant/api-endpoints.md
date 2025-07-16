# 🔌 API Endpoints ИИ-ассистента

## Обзор

REST API ИИ-ассистента предоставляет endpoints для взаимодействия с системой анализа смет, чата и генерации документов. Все endpoints требуют аутентификации через JWT токен.

## 🔐 Аутентификация

```http
Authorization: Bearer <JWT_TOKEN>
```

### Получение токена

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Ответ:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "estimator"
  }
}
```

## 💬 Chat API

### Создание новой сессии чата

```http
POST /api/v1/ai-assistant/chat/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Анализ сметы офисного ремонта",
  "context": {
    "projectType": "office_renovation",
    "region": "Moscow"
  }
}
```

**Ответ:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Анализ сметы офисного ремонта",
  "createdAt": "2025-07-15T10:00:00Z",
  "status": "active"
}
```

### Отправка сообщения

```http
POST /api/v1/ai-assistant/chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440001",
  "message": "Помоги оптимизировать смету на ремонт офиса 200м²",
  "attachments": [
    {
      "fileId": "file_123",
      "type": "estimate"
    }
  ]
}
```

**Ответ:**
```json
{
  "messageId": "msg_789",
  "sessionId": "550e8400-e29b-41d4-a716-446655440001",
  "role": "assistant",
  "content": "Анализирую вашу смету на ремонт офиса 200м². Вот мои рекомендации по оптимизации:\n\n1. **Материалы отделки** - можно сэкономить 15% выбрав аналоги...",
  "metadata": {
    "confidenceScore": 0.92,
    "processingTime": 3450,
    "sourcesUsed": ["FSBC-2022", "historical_estimates"]
  },
  "suggestions": [
    {
      "type": "action",
      "text": "Сгенерировать оптимизированную версию",
      "actionId": "optimize_estimate"
    }
  ],
  "timestamp": "2025-07-15T10:00:15Z"
}
```

### Получение истории чата

```http
GET /api/v1/ai-assistant/chat/sessions/{sessionId}/messages
Authorization: Bearer <token>
Query Parameters:
  - limit: 50 (default)
  - offset: 0 (default)
  - order: desc (default) | asc
```

**Ответ:**
```json
{
  "messages": [
    {
      "messageId": "msg_789",
      "role": "assistant",
      "content": "...",
      "timestamp": "2025-07-15T10:00:15Z"
    },
    {
      "messageId": "msg_788",
      "role": "user",
      "content": "Помоги оптимизировать смету...",
      "timestamp": "2025-07-15T10:00:00Z"
    }
  ],
  "total": 25,
  "hasMore": true
}
```

### WebSocket подключение для real-time чата

```javascript
const socket = io('wss://api.estimate-service.ru', {
  auth: {
    token: 'Bearer <token>'
  }
});

// Присоединение к сессии
socket.emit('join-session', { sessionId: '550e8400...' });

// Отправка сообщения
socket.emit('message', {
  sessionId: '550e8400...',
  content: 'Текст сообщения'
});

// Получение сообщений
socket.on('message', (data) => {
  console.log('Новое сообщение:', data);
});

// Индикатор набора текста
socket.on('typing', (data) => {
  console.log(`${data.user} печатает...`);
});
```

## 📊 Analysis API

### Анализ сметы

```http
POST /api/v1/ai-assistant/analysis/estimate
Authorization: Bearer <token>
Content-Type: application/json

{
  "estimateId": "est_123",
  "analysisType": "detailed",
  "options": {
    "checkCompliance": true,
    "findOptimizations": true,
    "compareWithHistorical": true,
    "generateReport": true
  }
}
```

**Ответ:**
```json
{
  "analysisId": "analysis_456",
  "status": "processing",
  "estimatedTime": 30,
  "webhookUrl": "/api/v1/ai-assistant/analysis/analysis_456/status"
}
```

### Получение результатов анализа

```http
GET /api/v1/ai-assistant/analysis/{analysisId}
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "analysisId": "analysis_456",
  "status": "completed",
  "results": {
    "summary": {
      "totalCost": 4500000,
      "itemsCount": 156,
      "issuesFound": 23,
      "potentialSavings": 675000,
      "complianceScore": 85,
      "overallAssessment": "Смета составлена корректно с возможностью оптимизации"
    },
    "issues": [
      {
        "id": "issue_1",
        "type": "PRICE_DEVIATION",
        "severity": "medium",
        "itemCode": "ФЕР01-02-033-02",
        "description": "Цена завышена на 25% относительно базовой",
        "recommendation": "Использовать базовую расценку 1,250 руб/м²",
        "potentialSaving": 45000
      }
    ],
    "recommendations": [
      {
        "id": "rec_1",
        "category": "materials",
        "priority": "high",
        "description": "Замена импортных материалов на отечественные аналоги",
        "estimatedSaving": 320000,
        "implementation": "easy"
      }
    ],
    "complianceReport": {
      "fsbcCompliance": true,
      "missingCodes": [],
      "incorrectUnits": ["ФЕР06-01-001-01"],
      "coefficientsCheck": "passed"
    }
  },
  "generatedAt": "2025-07-15T10:05:00Z"
}
```

### Сравнительный анализ

```http
POST /api/v1/ai-assistant/analysis/compare
Authorization: Bearer <token>
Content-Type: application/json

{
  "baseEstimateId": "est_123",
  "compareWithIds": ["est_124", "est_125"],
  "metrics": ["totalCost", "laborCost", "materialCost", "efficiency"]
}
```

## 🤖 Generation API

### Генерация сметы

```http
POST /api/v1/ai-assistant/generate/estimate
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectDescription": "Косметический ремонт офиса 200м²: покраска стен, замена напольного покрытия, установка подвесных потолков",
  "parameters": {
    "area": 200,
    "projectType": "office_renovation",
    "workTypes": ["painting", "flooring", "ceiling"],
    "region": "Moscow",
    "priceLevel": "current",
    "quality": "standard"
  },
  "preferences": {
    "detailLevel": "detailed",
    "includeLabor": true,
    "includeMaterials": true,
    "includeEquipment": true
  }
}
```

**Ответ:**
```json
{
  "generationId": "gen_789",
  "status": "completed",
  "estimate": {
    "id": "est_generated_001",
    "title": "Смета на косметический ремонт офиса 200м²",
    "sections": [
      {
        "name": "Подготовительные работы",
        "items": [
          {
            "code": "ФЕР61-01-001",
            "description": "Демонтаж старого покрытия",
            "unit": "м²",
            "quantity": 200,
            "unitPrice": 150,
            "totalPrice": 30000
          }
        ]
      }
    ],
    "summary": {
      "subtotal": 1850000,
      "overheads": 277500,
      "profit": 185000,
      "vat": 462500,
      "total": 2775000
    }
  },
  "metadata": {
    "generationTime": 8500,
    "sourcesUsed": ["FSBC-2022", "historical_data", "ai_optimization"],
    "confidence": 0.88
  }
}
```

### Генерация документации

```http
POST /api/v1/ai-assistant/generate/documentation
Authorization: Bearer <token>
Content-Type: application/json

{
  "estimateId": "est_123",
  "documentType": "explanatory_note",
  "language": "ru",
  "sections": [
    "project_overview",
    "work_scope",
    "materials_justification",
    "timeline",
    "quality_assurance"
  ]
}
```

## 📁 File Management API

### Загрузка файла для анализа

```http
POST /api/v1/ai-assistant/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
  - file: <binary>
  - type: "estimate" | "drawing" | "specification"
  - sessionId: "550e8400..." (optional)
```

**Ответ:**
```json
{
  "fileId": "file_999",
  "filename": "smeta_office_200m2.xlsx",
  "size": 256000,
  "type": "estimate",
  "uploadedAt": "2025-07-15T10:00:00Z",
  "status": "processing",
  "metadata": {
    "format": "xlsx",
    "estimateType": "detected:grand_smeta",
    "rowsCount": 156
  }
}
```

### Получение обработанного файла

```http
GET /api/v1/ai-assistant/files/{fileId}
Authorization: Bearer <token>
```

## 🔍 Search API

### Поиск расценок ФСБЦ

```http
POST /api/v1/ai-assistant/search/rates
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "штукатурка стен гипсовая",
  "filters": {
    "category": "finishing",
    "region": "Moscow",
    "year": 2022
  },
  "limit": 20,
  "includeAnalogs": true
}
```

**Ответ:**
```json
{
  "results": [
    {
      "code": "ФЕР15-02-001-01",
      "name": "Оштукатуривание поверхностей стен гипсовыми смесями",
      "unit": "100 м²",
      "basePrice": 12500,
      "laborCost": 7500,
      "materialCost": 4200,
      "equipmentCost": 800,
      "relevance": 0.95,
      "source": "FSBC-2022"
    }
  ],
  "total": 15,
  "suggestions": [
    "штукатурка механизированная",
    "штукатурка декоративная"
  ]
}
```

### Семантический поиск в базе знаний

```http
POST /api/v1/ai-assistant/search/knowledge
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "как правильно учитывать зимние коэффициенты",
  "context": "estimate_preparation",
  "limit": 5
}
```

## 🎛️ Settings API

### Получение настроек пользователя

```http
GET /api/v1/ai-assistant/settings
Authorization: Bearer <token>
```

### Обновление настроек

```http
PUT /api/v1/ai-assistant/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "chat": {
    "aiResponseStyle": "detailed",
    "autoSaveConversations": true,
    "preferredLanguage": "ru"
  },
  "analysis": {
    "defaultAnalysisType": "detailed",
    "autoAnalyzeOnUpload": true,
    "notificationPreferences": {
      "email": true,
      "inApp": true
    }
  }
}
```

## 📊 Webhooks

### Регистрация webhook

```http
POST /api/v1/ai-assistant/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": [
    "analysis.completed",
    "generation.completed",
    "chat.message.received"
  ],
  "secret": "your-webhook-secret"
}
```

### Формат webhook события

```json
{
  "id": "evt_123",
  "type": "analysis.completed",
  "created": "2025-07-15T10:05:00Z",
  "data": {
    "analysisId": "analysis_456",
    "estimateId": "est_123",
    "status": "completed",
    "results": {
      // результаты анализа
    }
  }
}
```

## 🚨 Обработка ошибок

### Формат ошибок

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Превышен лимит запросов. Попробуйте через 60 секунд.",
    "details": {
      "limit": 100,
      "window": "1h",
      "retryAfter": 60
    }
  },
  "requestId": "req_xyz789"
}
```

### Коды ошибок

| Код | Статус | Описание |
|-----|--------|----------|
| `INVALID_REQUEST` | 400 | Неверный формат запроса |
| `UNAUTHORIZED` | 401 | Требуется аутентификация |
| `FORBIDDEN` | 403 | Недостаточно прав |
| `NOT_FOUND` | 404 | Ресурс не найден |
| `RATE_LIMIT_EXCEEDED` | 429 | Превышен лимит запросов |
| `INTERNAL_ERROR` | 500 | Внутренняя ошибка сервера |
| `SERVICE_UNAVAILABLE` | 503 | Сервис временно недоступен |

## 📈 Rate Limiting

- **Анонимные запросы**: 10 запросов/час
- **Аутентифицированные**: 100 запросов/час
- **Pro аккаунты**: 1000 запросов/час
- **Enterprise**: Без ограничений

Headers в ответе:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1689415200
```

## 🔄 Версионирование

API использует версионирование через URL:
- Текущая версия: `v1`
- Формат: `/api/v1/...`

При выпуске новой версии старая поддерживается минимум 6 месяцев.

---

**Версия API**: 1.0  
**Обновлено**: 15.07.2025  
**OpenAPI спецификация**: [/api/v1/docs](https://api.estimate-service.ru/api/v1/docs)
