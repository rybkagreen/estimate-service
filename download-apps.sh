#!/bin/bash

echo "=== Загрузка портативных приложений ==="

PORTABLE_APPS_PATH="/c/Users/Belinad/portable-apps"

# Функция для безопасной загрузки
safe_download() {
    local url=$1
    local output=$2
    
    echo "Загружаем: $url"
    
    # Пробуем wget
    if command -v wget >/dev/null 2>&1; then
        wget --no-check-certificate -O "$output" "$url" && return 0
    fi
    
    # Пробуем curl с игнорированием SSL
    if command -v curl >/dev/null 2>&1; then
        curl -k -L -o "$output" "$url" && return 0
    fi
    
    echo "Ошибка: не удалось загрузить файл"
    return 1
}

# Python
echo -e "\nЗагрузка Python 3.12.7..."
PYTHON_PATH="$PORTABLE_APPS_PATH/python"
mkdir -p "$PYTHON_PATH"

if [ ! -f "$PYTHON_PATH/python.exe" ]; then
    # Альтернативный URL
    PYTHON_URL="https://www.python.org/ftp/python/3.12.7/python-3.12.7-embed-amd64.zip"
    PYTHON_ZIP="$PORTABLE_APPS_PATH/python-3.12.7.zip"
    
    if safe_download "$PYTHON_URL" "$PYTHON_ZIP"; then
        echo "Распаковываем Python..."
        unzip -q -o "$PYTHON_ZIP" -d "$PYTHON_PATH" || {
            echo "Ошибка распаковки Python"
            rm -f "$PYTHON_ZIP"
        }
        rm -f "$PYTHON_ZIP"
        
        # Создаем python._pth для правильной работы
        cat > "$PYTHON_PATH/python312._pth" << 'PTH'
python312.zip
.

# Uncomment to run site.main() automatically
import site
PTH
        
        echo "Python загружен!"
    else
        echo "Не удалось загрузить Python"
    fi
fi

# PostgreSQL - используем альтернативный метод
echo -e "\nДля PostgreSQL рекомендуется:"
echo "1. Скачать вручную с https://www.enterprisedb.com/download-postgresql-binaries"
echo "2. Выбрать версию для Windows x86-64"
echo "3. Распаковать в $PORTABLE_APPS_PATH/postgresql"

# Создаем инструкцию для ручной установки
cat > "$PORTABLE_APPS_PATH/INSTALL_POSTGRESQL.txt" << 'INSTRUCTIONS'
ИНСТРУКЦИЯ ПО УСТАНОВКЕ PostgreSQL

1. Откройте в браузере: https://www.enterprisedb.com/download-postgresql-binaries
2. Скачайте версию для Windows x86-64 (например, postgresql-16.1-1-windows-x64-binaries.zip)
3. Распакуйте архив
4. Переместите содержимое папки pgsql в C:\Users\Belinad\portable-apps\postgresql
5. Перезапустите терминал

Альтернативный вариант - использовать Docker:
docker run --name postgres-local -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
INSTRUCTIONS

echo -e "\nИнструкция сохранена в: $PORTABLE_APPS_PATH/INSTALL_POSTGRESQL.txt"

# Проверяем что уже установлено
echo -e "\n=== Статус установки ==="
echo -n "Python: "
if [ -f "$PYTHON_PATH/python.exe" ]; then
    echo "Найден"
else
    echo "Не найден"
fi

echo -n "PostgreSQL: "
if [ -f "$PORTABLE_APPS_PATH/postgresql/bin/psql.exe" ]; then
    echo "Найден"
else
    echo "Требуется ручная установка"
fi

echo -n "Redis: "
if [ -f "$PORTABLE_APPS_PATH/redis/redis-cli.exe" ]; then
    echo "Найден"
else
    echo "Не найден"
fi
