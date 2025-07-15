#!/bin/bash

# ==============================================================================
# Production Environment Setup Script for Estimate Service
# ==============================================================================
# 
# Этот скрипт помогает автоматизировать настройку production окружения
# ВАЖНО: Проверьте и адаптируйте под вашу инфраструктуру перед использованием!
#
# Использование:
#   ./setup-production.sh [команда]
#
# Команды:
#   generate-secrets  - Генерация всех необходимых секретов
#   validate-env      - Проверка .env.production файла
#   setup-aws        - Настройка AWS ресурсов
#   setup-gcp        - Настройка Google Cloud ресурсов
#   setup-azure      - Настройка Azure ресурсов
#   test-connection  - Тестирование подключений
#   deploy           - Полное развертывание
#
# ==============================================================================

set -euo pipefail

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функции для вывода
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ==============================================================================
# Генерация секретов
# ==============================================================================
generate_secrets() {
    log_info "Генерация секретных ключей..."
    
    # JWT Secret
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    log_info "JWT_SECRET сгенерирован"
    
    # Master API Key
    MASTER_API_KEY=$(openssl rand -hex 32)
    log_info "MASTER_API_KEY сгенерирован"
    
    # Encryption Key
    ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d '\n')
    log_info "ENCRYPTION_KEY сгенерирован"
    
    # Database Password
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr -d '=' | tr -d '/')
    log_info "DB_PASSWORD сгенерирован"
    
    # Redis Password
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr -d '=' | tr -d '/')
    log_info "REDIS_PASSWORD сгенерирован"
    
    # Сохранение в временный файл (НЕ коммитить!)
    cat > .secrets.tmp << EOF
# ВНИМАНИЕ: Этот файл содержит секретные данные!
# НЕ коммитьте его в репозиторий!
# Сохраните эти значения в вашем секретном менеджере

JWT_SECRET_PROD="${JWT_SECRET}"
MASTER_API_KEY_PROD="${MASTER_API_KEY}"
ENCRYPTION_KEY_PROD="${ENCRYPTION_KEY}"
DB_PASSWORD="${DB_PASSWORD}"
REDIS_PASSWORD="${REDIS_PASSWORD}"

# Команды для сохранения в AWS Secrets Manager:
aws secretsmanager create-secret --name estimate-service/jwt-secret --secret-string "${JWT_SECRET}"
aws secretsmanager create-secret --name estimate-service/master-api-key --secret-string "${MASTER_API_KEY}"
aws secretsmanager create-secret --name estimate-service/encryption-key --secret-string "${ENCRYPTION_KEY}"
aws secretsmanager create-secret --name estimate-service/db-password --secret-string "${DB_PASSWORD}"
aws secretsmanager create-secret --name estimate-service/redis-password --secret-string "${REDIS_PASSWORD}"
EOF
    
    log_warn "Секреты сохранены в .secrets.tmp"
    log_warn "ВАЖНО: Перенесите их в секретный менеджер и удалите файл!"
}

# ==============================================================================
# Валидация окружения
# ==============================================================================
validate_env() {
    log_info "Проверка .env.production файла..."
    
    if [ ! -f ".env.production" ]; then
        log_error ".env.production файл не найден!"
        exit 1
    fi
    
    # Список обязательных переменных
    REQUIRED_VARS=(
        "NODE_ENV"
        "PORT"
        "DATABASE_URL"
        "JWT_SECRET"
        "MASTER_API_KEY"
        "ENCRYPTION_KEY"
        "DEEPSEEK_API_KEY"
        "GRAND_SMETA_API_KEY"
        "REDIS_URL"
        "CORS_ORIGIN"
    )
    
    # Проверка наличия переменных
    MISSING_VARS=()
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${var}=" .env.production; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        log_error "Отсутствуют обязательные переменные:"
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    # Проверка на placeholder значения
    if grep -q "yourdomain\|example\|${.*_PROD}" .env.production; then
        log_warn "Найдены placeholder значения в .env.production!"
        log_warn "Убедитесь, что все значения заменены на реальные"
    fi
    
    log_info "Валидация пройдена успешно"
}

# ==============================================================================
# Настройка AWS
# ==============================================================================
setup_aws() {
    log_info "Настройка AWS ресурсов..."
    
    # Проверка AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI не установлен!"
        exit 1
    fi
    
    # Получение региона
    AWS_REGION=${AWS_REGION:-us-east-1}
    log_info "Используется регион: $AWS_REGION"
    
    # Создание RDS instance
    read -p "Создать RDS PostgreSQL instance? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Создание RDS instance..."
        aws rds create-db-instance \
            --db-instance-identifier estimate-prod \
            --db-instance-class db.t3.medium \
            --engine postgres \
            --engine-version 15.4 \
            --master-username estimate_prod_user \
            --master-user-password "${DB_PASSWORD}" \
            --allocated-storage 100 \
            --backup-retention-period 30 \
            --multi-az \
            --storage-encrypted \
            --region "$AWS_REGION"
    fi
    
    # Создание ElastiCache Redis
    read -p "Создать ElastiCache Redis cluster? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Создание Redis cluster..."
        aws elasticache create-cache-cluster \
            --cache-cluster-id estimate-prod-cache \
            --engine redis \
            --cache-node-type cache.t3.micro \
            --num-cache-nodes 1 \
            --auth-token "${REDIS_PASSWORD}" \
            --region "$AWS_REGION"
    fi
    
    # Создание S3 bucket для бэкапов
    read -p "Создать S3 bucket для бэкапов? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        BUCKET_NAME="estimate-service-backups-${AWS_REGION}-$(date +%s)"
        log_info "Создание S3 bucket: $BUCKET_NAME"
        
        aws s3api create-bucket \
            --bucket "$BUCKET_NAME" \
            --region "$AWS_REGION"
        
        # Включение версионирования
        aws s3api put-bucket-versioning \
            --bucket "$BUCKET_NAME" \
            --versioning-configuration Status=Enabled
        
        # Включение шифрования
        aws s3api put-bucket-encryption \
            --bucket "$BUCKET_NAME" \
            --server-side-encryption-configuration '{
                "Rules": [{
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }]
            }'
        
        log_info "S3 bucket создан: $BUCKET_NAME"
    fi
}

# ==============================================================================
# Тестирование подключений
# ==============================================================================
test_connection() {
    log_info "Тестирование подключений..."
    
    # Загрузка переменных окружения
    if [ -f ".env.production" ]; then
        export $(grep -v '^#' .env.production | xargs)
    fi
    
    # Тест подключения к базе данных
    log_info "Проверка подключения к PostgreSQL..."
    if command -v psql &> /dev/null; then
        # Извлечение параметров из DATABASE_URL
        DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
        DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
        
        PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" || log_error "Не удалось подключиться к PostgreSQL"
    else
        log_warn "psql не установлен, пропуск теста PostgreSQL"
    fi
    
    # Тест подключения к Redis
    log_info "Проверка подключения к Redis..."
    if command -v redis-cli &> /dev/null; then
        REDIS_HOST=$(echo $REDIS_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
        REDIS_PORT=$(echo $REDIS_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" ping || log_error "Не удалось подключиться к Redis"
    else
        log_warn "redis-cli не установлен, пропуск теста Redis"
    fi
    
    # Тест API ключей
    log_info "Проверка DeepSeek API..."
    curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
        "$DEEPSEEK_BASE_URL/models" || log_error "Не удалось проверить DeepSeek API"
    
    log_info "Тестирование завершено"
}

# ==============================================================================
# Health Check
# ==============================================================================
health_check() {
    log_info "Выполнение health check..."
    
    # Проверка доступности приложения
    APP_URL=${APP_URL:-http://localhost:3022}
    
    # Health endpoint
    HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/health")
    if [ "$HEALTH_RESPONSE" = "200" ]; then
        log_info "Health check: OK"
    else
        log_error "Health check failed: HTTP $HEALTH_RESPONSE"
    fi
    
    # Metrics endpoint
    METRICS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/metrics")
    if [ "$METRICS_RESPONSE" = "200" ]; then
        log_info "Metrics endpoint: OK"
    else
        log_warn "Metrics endpoint: HTTP $METRICS_RESPONSE"
    fi
}

# ==============================================================================
# Главная функция
# ==============================================================================
main() {
    case "${1:-help}" in
        generate-secrets)
            generate_secrets
            ;;
        validate-env)
            validate_env
            ;;
        setup-aws)
            setup_aws
            ;;
        setup-gcp)
            log_warn "Google Cloud setup еще не реализован"
            ;;
        setup-azure)
            log_warn "Azure setup еще не реализован"
            ;;
        test-connection)
            test_connection
            ;;
        health-check)
            health_check
            ;;
        deploy)
            validate_env
            test_connection
            log_info "Deployment готов к выполнению"
            ;;
        *)
            echo "Использование: $0 {generate-secrets|validate-env|setup-aws|test-connection|deploy}"
            echo ""
            echo "Команды:"
            echo "  generate-secrets  - Генерация всех необходимых секретов"
            echo "  validate-env      - Проверка .env.production файла"
            echo "  setup-aws        - Настройка AWS ресурсов"
            echo "  setup-gcp        - Настройка Google Cloud ресурсов"
            echo "  setup-azure      - Настройка Azure ресурсов"
            echo "  test-connection  - Тестирование подключений"
            echo "  health-check     - Проверка здоровья сервиса"
            echo "  deploy           - Полное развертывание"
            exit 1
            ;;
    esac
}

# Запуск
main "$@"
