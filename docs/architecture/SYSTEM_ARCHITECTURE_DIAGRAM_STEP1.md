# Диаграмма архитектуры системы с точками интеграции AI

## Текущая архитектура системы

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[React Frontend<br/>- TypeScript<br/>- Vite<br/>- Tailwind CSS]
    end

    subgraph "API Gateway"
        GW[API Gateway<br/>- Rate Limiting<br/>- Auth<br/>- CORS]
    end

    subgraph "Backend Services"
        ES[Estimate Service<br/>- NestJS<br/>- Main Business Logic]
        DC[Data Collector<br/>- ГЭСН/ФЕР/ТЕР<br/>- Scheduled Jobs]
        KB[Knowledge Base<br/>- Vector Store<br/>- Indexing]
        
        subgraph "AI Assistant Module"
            AI[AI Assistant<br/>- DeepSeek R1<br/>- Task Planning<br/>- Response Building]
        end
    end

    subgraph "MCP Server"
        MCP[Model Context Protocol<br/>- DeepSeek Service<br/>- HuggingFace Service<br/>- Tools Integration]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL<br/>- Estimates<br/>- FSBTS Items<br/>- Regional Coefficients)]
        RD[(Redis<br/>- Cache<br/>- Sessions<br/>- Queues)]
        VB[(Vector DB<br/>- Embeddings<br/>- Semantic Search)]
    end

    subgraph "External Services"
        DS[DeepSeek API<br/>- R1 Model]
        HF[HuggingFace<br/>- Alternative Models]
        NORM[Normative DBs<br/>- Минстрой РФ<br/>- ФСБЦ-2022]
    end

    FE --> GW
    GW --> ES
    GW --> DC
    GW --> KB
    
    ES --> AI
    ES --> PG
    ES --> RD
    
    AI --> MCP
    MCP --> DS
    MCP --> HF
    
    DC --> NORM
    DC --> PG
    
    KB --> VB
    KB --> AI
    
    style AI fill:#ff9999
    style MCP fill:#99ccff
    style DS fill:#99ff99
```

## Новые точки интеграции AI

```mermaid
graph LR
    subgraph "AI Enhancement Points"
        EP1[Construction Context<br/>Understanding]
        EP2[Smart Code<br/>Classification]
        EP3[Cost<br/>Optimization]
        EP4[Risk<br/>Analysis]
        EP5[Document<br/>Processing]
    end
    
    subgraph "Normative Integration"
        NI1[ГЭСН Search<br/>& Analysis]
        NI2[ФЕР/ТЕР<br/>Regional Pricing]
        NI3[ФССЦ/ТССЦ<br/>Material Costs]
        NI4[Cross-DB<br/>Smart Search]
    end
    
    subgraph "Knowledge Enhancement"
        KE1[Historical<br/>Estimates]
        KE2[Regional<br/>Specifics]
        KE3[Building<br/>Types]
        KE4[Best<br/>Practices]
    end
    
    EP1 --> NI1
    EP2 --> NI4
    EP3 --> NI2
    EP3 --> NI3
    EP4 --> KE1
    EP5 --> KE2
    
    NI1 --> KE4
    NI2 --> KE2
    NI4 --> KE3
```

## API структура для нормативных баз

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API Gateway
    participant AI Assistant
    participant Normatives API
    participant Cache
    participant External DBs

    User->>Frontend: Запрос расценки по описанию
    Frontend->>API Gateway: POST /api/normatives/smart-search
    API Gateway->>AI Assistant: Analyze description
    AI Assistant->>Cache: Check cache
    
    alt Cache miss
        AI Assistant->>Normatives API: Search in databases
        Normatives API->>External DBs: Query ГЭСН/ФЕР/ТЕР
        External DBs-->>Normatives API: Results
        Normatives API-->>AI Assistant: Aggregated data
        AI Assistant->>Cache: Store results
    end
    
    AI Assistant->>AI Assistant: Apply AI analysis
    AI Assistant-->>API Gateway: Enriched results
    API Gateway-->>Frontend: Response with suggestions
    Frontend-->>User: Display results
```

## Архитектура DeepSeek R1 интеграции

```mermaid
graph TB
    subgraph "Request Flow"
        REQ[Client Request] --> VAL[Request Validation]
        VAL --> CTX[Context Building]
        CTX --> TOK[Token Management]
    end
    
    subgraph "DeepSeek Integration"
        TOK --> DS[DeepSeek Service]
        DS --> API[DeepSeek API<br/>- Model: deepseek-reasoner<br/>- Russian support<br/>- Confidence levels]
        API --> RESP[Response Processing]
    end
    
    subgraph "Response Enhancement"
        RESP --> CONF[Confidence<br/>Analysis]
        RESP --> CACHE[Response<br/>Caching]
        RESP --> META[Metadata<br/>Enrichment]
    end
    
    subgraph "Specialized Features"
        META --> EST[Estimate<br/>Analysis]
        META --> OPT[Cost<br/>Optimization]
        META --> RISK[Risk<br/>Assessment]
    end
    
    EST --> OUT[Enhanced Response]
    OPT --> OUT
    RISK --> OUT
    
    style DS fill:#99ff99
    style API fill:#ffcc99
```

## Поток данных нормативных баз

```mermaid
flowchart LR
    subgraph "Data Sources"
        MIN[Минстрой РФ]
        GESN[ГЭСН База]
        FER[ФЕР База]
        TER[ТЕР База]
        FSSC[ФССЦ База]
    end
    
    subgraph "Data Collector Service"
        CRON[Scheduler<br/>- Daily updates<br/>- Weekly sync<br/>- Monthly cleanup]
        PARSE[Parser<br/>- Excel<br/>- PDF<br/>- XML<br/>- JSON]
        VALID[Validator<br/>- Data integrity<br/>- Format check<br/>- Deduplication]
    end
    
    subgraph "Storage & Processing"
        DB[(PostgreSQL<br/>Normalized Data)]
        INDEX[Search Index<br/>- Full-text<br/>- Semantic]
        CACHE[(Redis Cache<br/>- Hot data<br/>- Coefficients)]
    end
    
    subgraph "API Layer"
        REST[REST API<br/>- CRUD operations<br/>- Search<br/>- Analytics]
        GQL[GraphQL<br/>- Complex queries<br/>- Relationships]
    end
    
    MIN --> CRON
    GESN --> CRON
    FER --> CRON
    TER --> CRON
    FSSC --> CRON
    
    CRON --> PARSE
    PARSE --> VALID
    VALID --> DB
    
    DB --> INDEX
    DB --> CACHE
    
    INDEX --> REST
    CACHE --> REST
    INDEX --> GQL
    CACHE --> GQL
```

## Масштабирование AI сервисов

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[NGINX/HAProxy<br/>- Health checks<br/>- Round-robin]
    end
    
    subgraph "AI Service Instances"
        AI1[AI Instance 1<br/>- DeepSeek<br/>- Task Queue]
        AI2[AI Instance 2<br/>- DeepSeek<br/>- Task Queue]
        AI3[AI Instance N<br/>- DeepSeek<br/>- Task Queue]
    end
    
    subgraph "Queue System"
        Q[Redis Queue<br/>- Priority tasks<br/>- Batch processing<br/>- Retry logic]
    end
    
    subgraph "Monitoring"
        MON[Prometheus<br/>- Metrics<br/>- Alerts]
        LOG[ELK Stack<br/>- Logs<br/>- Analysis]
    end
    
    LB --> AI1
    LB --> AI2
    LB --> AI3
    
    AI1 --> Q
    AI2 --> Q
    AI3 --> Q
    
    AI1 --> MON
    AI2 --> MON
    AI3 --> MON
    
    AI1 --> LOG
    AI2 --> LOG
    AI3 --> LOG
    
    style AI1 fill:#99ccff
    style AI2 fill:#99ccff
    style AI3 fill:#99ccff
```
