# Руководство по развертыванию Estimate Service

## Обзор системы

Estimate Service - это микросервисная система для составления сметной документации, включающая:
- Backend сервисы на NestJS
- Frontend приложение на React
- PostgreSQL база данных
- Redis для кэширования
- Vector DB для ИИ-компонентов
- ИИ-сервисы (OpenAI, локальные модели)

## Архитектура развертывания

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   API Gateway   │    │  Frontend App   │
│    (Nginx)      │    │   (NestJS)      │    │    (React)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
    ┌─────────────────────────────┼─────────────────────────────┐
    │                             │                             │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Estimate Service│    │  AI Assistant   │    │ Data Collector  │
│   (NestJS)      │    │   Service       │    │   Service       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
    ┌─────────────────────────────┼─────────────────────────────┐
    │                             │                             │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   Vector DB     │
│   (Primary DB)  │    │   (Cache)       │    │ (AI Knowledge)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Требования к инфраструктуре

### Минимальные требования (Development/Testing)
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **Network**: 100 Mbps

### Рекомендуемые требования (Production)
- **CPU**: 8+ cores
- **RAM**: 32+ GB
- **Storage**: 200+ GB NVMe SSD
- **Network**: 1 Gbps
- **Backup**: 500+ GB для резервных копий

### Кластерная конфигурация (High Load)
- **API Gateway**: 2+ instances (2 CPU, 4 GB RAM each)
- **Estimate Service**: 3+ instances (2 CPU, 4 GB RAM each)
- **AI Service**: 2+ instances (4 CPU, 8 GB RAM each)
- **Database**: PostgreSQL cluster (8 CPU, 16 GB RAM)
- **Cache**: Redis cluster (2 CPU, 4 GB RAM)

## Развертывание с Docker Compose

### 1. Подготовка окружения

```bash
# Клонирование репозитория
git clone https://github.com/your-org/estimate-service.git
cd estimate-service

# Копирование конфигурации
cp .env.example .env
```

### 2. Конфигурация переменных окружения

```bash
# .env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://estimate_user:secure_password@postgres:5432/estimate_db"
POSTGRES_USER=estimate_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=estimate_db

# Redis
REDIS_URL="redis://redis:6379"

# JWT
JWT_SECRET=your-super-secret-jwt-key-256-bit
JWT_REFRESH_SECRET=your-super-secret-refresh-key-256-bit
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=2592000

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4

# Vector Database
CHROMA_URL=http://chroma:8000
CHROMA_API_KEY=your-chroma-api-key

# File Storage
STORAGE_TYPE=local # local | s3 | azure
UPLOAD_MAX_SIZE=10485760 # 10MB

# S3 Configuration (if using S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=estimate-service-files

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Security
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=1000

# Data Collection
FSBTS_UPDATE_SCHEDULE="0 2 * * *" # Daily at 2 AM
MINSTROYRF_API_KEY=your-minstroyrf-api-key
```

### 3. Запуск сервисов

```bash
# Сборка и запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f estimate-service
```

### 4. Инициализация базы данных

```bash
# Запуск миграций
docker-compose exec estimate-service npm run prisma:migrate

# Заполнение начальными данными
docker-compose exec estimate-service npm run prisma:seed
```

## Развертывание в Kubernetes

### 1. Подготовка кластера

```bash
# Создание namespace
kubectl create namespace estimate-service

# Создание secrets
kubectl create secret generic estimate-secrets \
  --from-literal=database-url="postgresql://user:pass@postgres:5432/db" \
  --from-literal=jwt-secret="your-jwt-secret" \
  --from-literal=openai-api-key="sk-your-key" \
  -n estimate-service
```

### 2. ConfigMap для конфигурации

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: estimate-config
  namespace: estimate-service
data:
  NODE_ENV: "production"
  PORT: "3000"
  LOG_LEVEL: "info"
  LOG_FORMAT: "json"
  CORS_ORIGIN: "https://your-domain.com"
  RATE_LIMIT_TTL: "60000"
  RATE_LIMIT_LIMIT: "1000"
  PROMETHEUS_ENABLED: "true"
```

### 3. PostgreSQL deployment

```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: estimate-service
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: "estimate_db"
        - name: POSTGRES_USER
          value: "estimate_user"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: estimate-secrets
              key: postgres-password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"
            cpu: "2"
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: estimate-service
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

### 4. Estimate Service deployment

```yaml
# k8s/estimate-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: estimate-service
  namespace: estimate-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: estimate-service
  template:
    metadata:
      labels:
        app: estimate-service
    spec:
      containers:
      - name: estimate-service
        image: estimate-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: estimate-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: estimate-secrets
              key: jwt-secret
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: estimate-secrets
              key: openai-api-key
        envFrom:
        - configMapRef:
            name: estimate-config
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: estimate-service
  namespace: estimate-service
spec:
  selector:
    app: estimate-service
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

### 5. Ingress для внешнего доступа

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: estimate-ingress
  namespace: estimate-service
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/use-regex: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.estimate-service.com
    secretName: estimate-tls
  rules:
  - host: api.estimate-service.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: estimate-service
            port:
              number: 80
```

## CI/CD Pipeline

### 1. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm run test:ci

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Build application
      run: npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3

    - name: Build and push Docker image
      env:
        DOCKER_REGISTRY: ${{ secrets.DOCKER_REGISTRY }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $DOCKER_REGISTRY/estimate-service:$IMAGE_TAG .
        docker push $DOCKER_REGISTRY/estimate-service:$IMAGE_TAG

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to Kubernetes
      env:
        KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        echo "$KUBE_CONFIG" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/estimate-service estimate-service=$DOCKER_REGISTRY/estimate-service:$IMAGE_TAG -n estimate-service
        kubectl rollout status deployment/estimate-service -n estimate-service
```

## Мониторинг и логирование

### 1. Prometheus конфигурация

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'estimate-service'
    static_configs:
      - targets: ['estimate-service:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### 2. Grafana dashboard

Основные метрики для мониторинга:
- Request rate и latency
- Error rate
- Database connections
- Memory и CPU usage
- AI service response times
- Cache hit ratio

### 3. Централизованное логирование

```yaml
# logging/fluentd-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      format json
      time_format %Y-%m-%dT%H:%M:%S.%NZ
    </source>

    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch
      port 9200
      index_name estimate-service
    </match>
```

## Резервное копирование

### 1. База данных

```bash
#!/bin/bash
# scripts/backup-db.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/estimate_db_$DATE.sql"

# Создание резервной копии
docker-compose exec postgres pg_dump -U estimate_user estimate_db > $BACKUP_FILE

# Сжатие
gzip $BACKUP_FILE

# Удаление старых копий (старше 30 дней)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### 2. Файлы и конфигурация

```bash
#!/bin/bash
# scripts/backup-files.sh

BACKUP_DIR="/backups/files"
DATE=$(date +%Y%m%d_%H%M%S)

# Резервное копирование загруженных файлов
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" uploads/

# Резервное копирование конфигурации
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" config/ .env
```

## Восстановление после сбоя

### 1. Восстановление базы данных

```bash
# Остановка сервисов
docker-compose stop estimate-service

# Восстановление из резервной копии
gunzip -c /backups/postgres/estimate_db_20250704_120000.sql.gz | \
docker-compose exec -T postgres psql -U estimate_user -d estimate_db

# Запуск сервисов
docker-compose start estimate-service
```

### 2. Масштабирование при высокой нагрузке

```bash
# Увеличение количества реплик
kubectl scale deployment estimate-service --replicas=5 -n estimate-service

# Горизонтальное автомасштабирование
kubectl autoscale deployment estimate-service --cpu-percent=70 --min=3 --max=10 -n estimate-service
```

## Безопасность

### 1. Network Policies

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: estimate-network-policy
  namespace: estimate-service
spec:
  podSelector:
    matchLabels:
      app: estimate-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: nginx-ingress
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
```

### 2. Pod Security Standards

```yaml
# k8s/pod-security.yaml
apiVersion: v1
kind: Pod
metadata:
  name: estimate-service
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
  containers:
  - name: estimate-service
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

## Обновление системы

### 1. Rolling update

```bash
# Обновление образа
kubectl set image deployment/estimate-service estimate-service=estimate-service:v1.2.0 -n estimate-service

# Проверка статуса обновления
kubectl rollout status deployment/estimate-service -n estimate-service

# Откат при необходимости
kubectl rollout undo deployment/estimate-service -n estimate-service
```

### 2. Blue-Green deployment

```bash
# Создание новой версии (green)
kubectl apply -f k8s/estimate-service-green.yaml

# Переключение трафика
kubectl patch service estimate-service -p '{"spec":{"selector":{"version":"green"}}}'

# Удаление старой версии (blue)
kubectl delete deployment estimate-service-blue
```

## Устранение неполадок

### Общие проблемы

1. **Сервис не отвечает**
   ```bash
   kubectl logs deployment/estimate-service -n estimate-service
   kubectl describe pod estimate-service-xxx -n estimate-service
   ```

2. **Ошибки подключения к БД**
   ```bash
   kubectl exec -it postgres-0 -n estimate-service -- psql -U estimate_user -d estimate_db
   ```

3. **Проблемы с ИИ-сервисом**
   ```bash
   # Проверка API ключей
   kubectl get secret estimate-secrets -o yaml

   # Проверка логов
   kubectl logs deployment/ai-service -n estimate-service
   ```

### Полезные команды

```bash
# Просмотр всех ресурсов
kubectl get all -n estimate-service

# Просмотр событий
kubectl get events -n estimate-service --sort-by='.lastTimestamp'

# Проверка метрик
kubectl top pods -n estimate-service

# Подключение к контейнеру
kubectl exec -it deployment/estimate-service -n estimate-service -- /bin/bash
```
