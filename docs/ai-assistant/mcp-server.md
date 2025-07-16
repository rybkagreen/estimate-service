# 🔮 MCP Server - Model Context Protocol

## Обзор

MCP (Model Context Protocol) сервер обеспечивает расширенный контекст для DeepSeek R1, позволяя модели лучше понимать специфику строительной отрасли и работать с данными ФСБЦ-2022.

## 🏗️ Архитектура MCP

```mermaid
graph TB
    A[DeepSeek R1] <-->|MCP Protocol| B[MCP Server]
    B --> C[Context Manager]
    B --> D[Tools Registry]
    B --> E[Resource Provider]
    
    C --> F[FSBC Context]
    C --> G[Historical Data]
    C --> H[User Preferences]
    
    D --> I[Analysis Tools]
    D --> J[Generation Tools]
    D --> K[Search Tools]
    
    E --> L[Vector DB]
    E --> M[PostgreSQL]
    E --> N[Redis Cache]
    
    style B fill:#f9f,stroke:#333,stroke-width:4px
    style A fill:#bbf,stroke:#333,stroke-width:2px
```

## 📦 Установка и настройка

### 1. Установка зависимостей

```bash
# Клонирование репозитория
git clone https://github.com/estimate-service/mcp-server
cd mcp-server

# Установка зависимостей
npm install

# Создание конфигурации
cp .env.example .env
```

### 2. Конфигурация

```typescript
// config/mcp.config.ts
export const mcpConfig = {
  server: {
    port: process.env.MCP_PORT || 3333,
    host: process.env.MCP_HOST || 'localhost',
    protocol: 'stdio' as const,
  },
  
  ai: {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-r1-2024',
      baseUrl: 'https://api.deepseek.com/v1',
      mockMode: process.env.NODE_ENV === 'test',
    },
  },
  
  context: {
    maxTokens: 128000,
    defaultLanguage: 'ru',
    specialization: 'construction_estimation',
  },
  
  tools: {
    enabled: [
      'deepseek_analyze_code',
      'deepseek_generate_docs',
      'deepseek_generate_tests',
      'deepseek_refactor_code',
      'deepseek_architecture_advice',
      'deepseek_chat',
      'fsbc_search',
      'estimate_analysis',
    ],
  },
};
```

### 3. Переменные окружения

```env
# .env файл
MCP_PORT=3333
MCP_HOST=localhost

# DeepSeek API
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_MODEL=deepseek-r1-2024

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/estimate_db

# Vector Store
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=your_weaviate_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

## 🛠️ Инструменты MCP

### 1. Контекстные инструменты

```typescript
// tools/context-tools.ts
export const contextTools = [
  {
    name: 'get_fsbc_context',
    description: 'Получить контекст ФСБЦ для конкретной расценки',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Код расценки ФСБЦ' },
        includeHistory: { type: 'boolean', default: false },
        includeAnalogs: { type: 'boolean', default: true },
      },
      required: ['code'],
    },
    handler: async (args) => {
      const context = await fsbcService.getContextForRate(args.code, {
        includeHistory: args.includeHistory,
        includeAnalogs: args.includeAnalogs,
      });
      
      return {
        content: [
          {
            type: 'context',
            data: context,
          },
        ],
      };
    },
  },
  
  {
    name: 'get_project_context',
    description: 'Получить контекст текущего проекта',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string' },
        depth: { 
          type: 'string', 
          enum: ['basic', 'detailed', 'comprehensive'],
          default: 'detailed',
        },
      },
      required: ['projectId'],
    },
    handler: async (args) => {
      const project = await projectService.getProjectContext(
        args.projectId,
        args.depth
      );
      
      return {
        content: [
          {
            type: 'context',
            data: project,
          },
        ],
      };
    },
  },
];
```

### 2. Аналитические инструменты

```typescript
// tools/analysis-tools.ts
export const analysisTools = [
  {
    name: 'analyze_estimate_quality',
    description: 'Анализ качества составления сметы',
    inputSchema: {
      type: 'object',
      properties: {
        estimateId: { type: 'string' },
        checkpoints: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'completeness',
              'accuracy',
              'compliance',
              'optimization',
              'risks',
            ],
          },
          default: ['completeness', 'accuracy', 'compliance'],
        },
      },
      required: ['estimateId'],
    },
    handler: async (args) => {
      const analysis = await estimateAnalyzer.analyzeQuality(
        args.estimateId,
        args.checkpoints
      );
      
      return {
        content: [
          {
            type: 'analysis',
            data: {
              score: analysis.overallScore,
              details: analysis.checkpointResults,
              recommendations: analysis.recommendations,
            },
          },
        ],
      };
    },
  },
];
```

### 3. Генеративные инструменты

```typescript
// tools/generation-tools.ts
export const generationTools = [
  {
    name: 'generate_estimate_section',
    description: 'Генерация раздела сметы',
    inputSchema: {
      type: 'object',
      properties: {
        sectionType: {
          type: 'string',
          enum: [
            'earthworks',
            'foundation',
            'walls',
            'roofing',
            'finishing',
            'utilities',
          ],
        },
        parameters: {
          type: 'object',
          properties: {
            area: { type: 'number' },
            height: { type: 'number' },
            complexity: { 
              type: 'string',
              enum: ['simple', 'standard', 'complex'],
            },
          },
        },
        region: { type: 'string' },
      },
      required: ['sectionType', 'parameters'],
    },
    handler: async (args) => {
      const section = await estimateGenerator.generateSection(
        args.sectionType,
        args.parameters,
        args.region
      );
      
      return {
        content: [
          {
            type: 'generated',
            format: 'estimate_section',
            data: section,
          },
        ],
      };
    },
  },
];
```

## 📡 Протокол взаимодействия

### 1. Инициализация соединения

```typescript
// Клиент MCP
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['./mcp-server/dist/index.js'],
});

const client = new Client({
  name: 'estimate-service-client',
  version: '1.0.0',
});

await client.connect(transport);

// Получение списка доступных инструментов
const tools = await client.listTools();
console.log('Available tools:', tools);
```

### 2. Вызов инструментов

```typescript
// Пример вызова инструмента анализа
const result = await client.callTool({
  name: 'analyze_estimate_quality',
  arguments: {
    estimateId: 'est_123',
    checkpoints: ['completeness', 'accuracy', 'compliance'],
  },
});

console.log('Analysis result:', result);
```

### 3. Управление контекстом

```typescript
// Установка контекста сессии
await client.setContext({
  sessionId: 'session_123',
  user: {
    id: 'user_456',
    role: 'estimator',
    preferences: {
      language: 'ru',
      detailLevel: 'detailed',
    },
  },
  project: {
    type: 'residential',
    region: 'Moscow',
    season: 'winter',
  },
});
```

## 🔍 Расширенные возможности

### 1. Кастомные провайдеры ресурсов

```typescript
// providers/custom-resource-provider.ts
export class FSBCResourceProvider implements ResourceProvider {
  async getResource(uri: string): Promise<Resource> {
    if (uri.startsWith('fsbc://')) {
      const code = uri.replace('fsbc://', '');
      const rate = await this.fsbcService.getRate(code);
      
      return {
        uri,
        mimeType: 'application/json',
        content: JSON.stringify({
          code: rate.code,
          name: rate.name,
          unit: rate.unit,
          prices: {
            base: rate.basePrice,
            labor: rate.laborCost,
            materials: rate.materialCost,
            equipment: rate.equipmentCost,
          },
          composition: rate.workComposition,
          coefficients: rate.regionalCoefficients,
        }),
      };
    }
    
    throw new Error(`Unsupported URI: ${uri}`);
  }
}
```

### 2. Middleware для обработки запросов

```typescript
// middleware/context-enrichment.ts
export const contextEnrichmentMiddleware: MCPMiddleware = async (
  request,
  next
) => {
  // Обогащение контекста перед обработкой
  if (request.method === 'tools/call') {
    const enrichedRequest = {
      ...request,
      params: {
        ...request.params,
        context: await enrichContext(request.params),
      },
    };
    
    return next(enrichedRequest);
  }
  
  return next(request);
};
```

### 3. Кэширование результатов

```typescript
// cache/mcp-cache.ts
export class MCPCache {
  private redis: Redis;
  private ttl: number = 3600; // 1 час
  
  async getCached(key: string): Promise<any | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async setCached(key: string, value: any): Promise<void> {
    await this.redis.setex(
      key,
      this.ttl,
      JSON.stringify(value)
    );
  }
  
  generateKey(toolName: string, args: any): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ toolName, args }))
      .digest('hex');
    
    return `mcp:${toolName}:${hash}`;
  }
}
```

## 📊 Мониторинг и метрики

### 1. Сбор метрик

```typescript
// monitoring/metrics.ts
export const mcpMetrics = {
  toolCalls: new Counter({
    name: 'mcp_tool_calls_total',
    help: 'Total number of MCP tool calls',
    labelNames: ['tool', 'status'],
  }),
  
  responseTime: new Histogram({
    name: 'mcp_response_time_seconds',
    help: 'MCP response time in seconds',
    labelNames: ['tool'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  }),
  
  contextSize: new Gauge({
    name: 'mcp_context_size_tokens',
    help: 'Size of context in tokens',
    labelNames: ['type'],
  }),
};
```

### 2. Логирование

```typescript
// logging/mcp-logger.ts
export const mcpLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mcp-server' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/mcp-error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/mcp-combined.log' 
    }),
  ],
});
```

## 🛡️ Безопасность

### 1. Аутентификация

```typescript
// security/auth.ts
export const authenticateClient = async (
  clientInfo: ClientInfo
): Promise<boolean> => {
  // Проверка API ключа
  if (!clientInfo.apiKey) {
    return false;
  }
  
  const isValid = await validateApiKey(clientInfo.apiKey);
  
  // Проверка разрешений
  if (isValid) {
    const permissions = await getClientPermissions(clientInfo.apiKey);
    return permissions.includes('mcp:access');
  }
  
  return false;
};
```

### 2. Ограничение доступа к инструментам

```typescript
// security/tool-access.ts
export const toolAccessControl = {
  async canAccessTool(
    clientId: string,
    toolName: string
  ): Promise<boolean> {
    const clientPermissions = await getClientPermissions(clientId);
    const requiredPermission = `tool:${toolName}`;
    
    return clientPermissions.includes(requiredPermission) ||
           clientPermissions.includes('tool:*');
  },
};
```

## 🚀 Запуск и развертывание

### 1. Локальная разработка

```bash
# Запуск в режиме разработки
npm run dev

# Запуск тестов
npm run test

# Проверка типов
npm run type-check
```

### 2. Production развертывание

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3333

CMD ["node", "dist/index.js"]
```

### 3. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mcp-server:
    build: ./mcp-server
    ports:
      - "3333:3333"
    environment:
      - NODE_ENV=production
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
      - redis
      - weaviate
    restart: unless-stopped
```

## 🔗 Интеграция с DeepSeek

Подробности интеграции с DeepSeek R1 см. в [документации интеграции](./deepseek-integration.md).

---

**Версия**: 1.0  
**Обновлено**: 15.07.2025
