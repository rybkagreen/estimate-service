#!/bin/bash

# ==============================================
# Production Secrets Generator
# ==============================================
# Этот скрипт помогает сгенерировать безопасные секреты для production окружения

set -euo pipefail

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Production Secrets Generator ===${NC}"
echo -e "${YELLOW}ВНИМАНИЕ: Сохраните сгенерированные секреты в безопасном месте!${NC}"
echo ""

# Функция для генерации секрета
generate_secret() {
    local name=$1
    local length=${2:-64}
    local value=$(openssl rand -base64 $length | tr -d '\n')
    echo -e "${GREEN}$name:${NC}"
    echo "$value"
    echo ""
}

# Функция для генерации пароля
generate_password() {
    local name=$1
    local length=${2:-24}
    # Генерируем пароль с буквами, цифрами и специальными символами
    local value=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-$length)
    echo -e "${GREEN}$name:${NC}"
    echo "$value"
    echo ""
}

# Генерация секретов
echo -e "${YELLOW}=== Секреты и ключи ===${NC}"
echo ""

generate_secret "JWT_SECRET_PROD" 64
generate_secret "MASTER_API_KEY_PROD" 32
generate_password "DB_PASSWORD" 24
generate_password "REDIS_PASSWORD" 24

echo -e "${YELLOW}=== Инструкции по использованию ===${NC}"
echo ""
echo "1. Скопируйте сгенерированные значения"
echo "2. Сохраните их в вашем менеджере секретов (Vault, AWS Secrets Manager, etc.)"
echo "3. НЕ сохраняйте их в файлах в репозитории!"
echo "4. Используйте переменные окружения при деплое:"
echo ""
echo "   export JWT_SECRET_PROD='<ваш_сгенерированный_секрет>'"
echo "   export DB_PASSWORD='<ваш_сгенерированный_пароль>'"
echo "   # и т.д."
echo ""

echo -e "${YELLOW}=== Дополнительные API ключи ===${NC}"
echo ""
echo "Следующие ключи нужно получить от поставщиков сервисов:"
echo ""
echo "- DEEPSEEK_API_KEY_PROD: https://platform.deepseek.com/"
echo "- GRAND_SMETA_API_KEY_PROD: Обратитесь к поставщику Гранд Смета"
echo "- SENTRY_DSN_PROD: https://sentry.io (после создания проекта)"
echo ""

echo -e "${GREEN}=== Генерация завершена ===${NC}"
echo -e "${RED}ВАЖНО: Этот скрипт не сохраняет секреты. Скопируйте их сейчас!${NC}"
