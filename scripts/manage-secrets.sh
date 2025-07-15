#!/bin/bash

# Скрипт для управления секретами в проекте
# Usage: ./scripts/manage-secrets.sh [command]

set -euo pipefail

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Проверка наличия openssl
check_dependencies() {
    if ! command -v openssl &> /dev/null; then
        error "openssl не установлен. Установите его для продолжения."
        exit 1
    fi
}

# Генерация JWT секрета
generate_jwt_secret() {
    log "Генерация нового JWT_SECRET..."
    JWT_SECRET=$(openssl rand -base64 64)
    echo "JWT_SECRET=$JWT_SECRET"
}

# Генерация Master API ключа
generate_master_api_key() {
    log "Генерация нового MASTER_API_KEY..."
    MASTER_API_KEY=$(openssl rand -hex 32)
    echo "MASTER_API_KEY=$MASTER_API_KEY"
}

# Генерация ключа шифрования
generate_encryption_key() {
    log "Генерация нового ENCRYPTION_KEY..."
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
}

# Генерация всех ключей
generate_all() {
    log "Генерация всех криптографических ключей..."
    echo ""
    generate_jwt_secret
    echo ""
    generate_master_api_key
    echo ""
    generate_encryption_key
    echo ""
    warning "Сохраните эти ключи в безопасном месте!"
}

# Проверка силы ключа
check_key_strength() {
    local key=$1
    local key_name=$2
    
    # Декодируем base64 если нужно
    if [[ $key =~ ^[A-Za-z0-9+/=]+$ ]] && [[ ${#key} -gt 40 ]]; then
        # Вероятно base64
        decoded_length=$(echo -n "$key" | base64 -d 2>/dev/null | wc -c || echo 0)
        if [ $decoded_length -ge 32 ]; then
            log "$key_name: ✓ Сильный ключ (${decoded_length} байт)"
        else
            warning "$key_name: Слабый ключ (${decoded_length} байт). Рекомендуется минимум 32 байта."
        fi
    else
        # Hex или другой формат
        byte_length=$((${#key} / 2))
        if [ $byte_length -ge 32 ]; then
            log "$key_name: ✓ Сильный ключ (${byte_length} байт)"
        else
            warning "$key_name: Слабый ключ (${byte_length} байт). Рекомендуется минимум 32 байта."
        fi
    fi
}

# Проверка текущих ключей в .env
check_current_keys() {
    log "Проверка текущих ключей в .env..."
    echo ""
    
    if [ -f .env ]; then
        # Извлекаем ключи из .env
        JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2- | tr -d '"')
        MASTER_API_KEY=$(grep "^MASTER_API_KEY=" .env | cut -d'=' -f2- | tr -d '"')
        ENCRYPTION_KEY=$(grep "^ENCRYPTION_KEY=" .env | cut -d'=' -f2- | tr -d '"')
        
        if [ -n "$JWT_SECRET" ]; then
            check_key_strength "$JWT_SECRET" "JWT_SECRET"
        else
            warning "JWT_SECRET не найден в .env"
        fi
        
        if [ -n "$MASTER_API_KEY" ]; then
            check_key_strength "$MASTER_API_KEY" "MASTER_API_KEY"
        else
            warning "MASTER_API_KEY не найден в .env"
        fi
        
        if [ -n "$ENCRYPTION_KEY" ]; then
            check_key_strength "$ENCRYPTION_KEY" "ENCRYPTION_KEY"
        else
            warning "ENCRYPTION_KEY не найден в .env"
        fi
    else
        error "Файл .env не найден"
    fi
}

# Ротация ключей
rotate_keys() {
    warning "Начинаем ротацию ключей..."
    echo ""
    
    # Создаем резервную копию текущего .env
    if [ -f .env ]; then
        backup_file=".env.backup.$(date +%Y%m%d_%H%M%S)"
        cp .env "$backup_file"
        log "Создана резервная копия: $backup_file"
    fi
    
    # Генерируем новые ключи
    generate_all
    echo ""
    warning "Обновите .env файл новыми ключами и перезапустите все сервисы!"
}

# Экспорт ключей для production
export_for_production() {
    log "Экспорт переменных для production..."
    echo ""
    
    if [ -f .env ]; then
        JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2- | tr -d '"')
        MASTER_API_KEY=$(grep "^MASTER_API_KEY=" .env | cut -d'=' -f2- | tr -d '"')
        ENCRYPTION_KEY=$(grep "^ENCRYPTION_KEY=" .env | cut -d'=' -f2- | tr -d '"')
        
        echo "# Добавьте эти переменные в ваш CI/CD или secret manager:"
        echo ""
        echo "export JWT_SECRET_PROD='$JWT_SECRET'"
        echo "export MASTER_API_KEY_PROD='$MASTER_API_KEY'"
        echo "export ENCRYPTION_KEY_PROD='$ENCRYPTION_KEY'"
        echo ""
        warning "Никогда не коммитьте эти значения в репозиторий!"
    else
        error "Файл .env не найден"
    fi
}

# Показать меню помощи
show_help() {
    echo "Управление криптографическими ключами"
    echo ""
    echo "Использование: $0 [команда]"
    echo ""
    echo "Команды:"
    echo "  generate-jwt      Генерировать новый JWT_SECRET"
    echo "  generate-api      Генерировать новый MASTER_API_KEY"
    echo "  generate-enc      Генерировать новый ENCRYPTION_KEY"
    echo "  generate-all      Генерировать все ключи"
    echo "  check             Проверить текущие ключи"
    echo "  rotate            Ротация всех ключей"
    echo "  export            Экспорт для production"
    echo "  help              Показать это сообщение"
}

# Главная функция
main() {
    check_dependencies
    
    case "${1:-help}" in
        generate-jwt)
            generate_jwt_secret
            ;;
        generate-api)
            generate_master_api_key
            ;;
        generate-enc)
            generate_encryption_key
            ;;
        generate-all)
            generate_all
            ;;
        check)
            check_current_keys
            ;;
        rotate)
            rotate_keys
            ;;
        export)
            export_for_production
            ;;
        help)
            show_help
            ;;
        *)
            error "Неизвестная команда: $1"
            show_help
            exit 1
            ;;
    esac
}

# Запуск
main "$@"
