#!/bin/bash

echo "=== Установка портативных приложений ==="

PORTABLE_APPS_PATH="/c/Users/Belinad/portable-apps"

# Установка Python
echo -e "\nУстановка Python..."
PYTHON_PATH="$PORTABLE_APPS_PATH/python"

if [ ! -f "$PYTHON_PATH/python.exe" ]; then
    echo "Загружаем портативную версию Python 3.12.7..."
    
    # Скачиваем Python embeddable package
    PYTHON_URL="https://www.python.org/ftp/python/3.12.7/python-3.12.7-embed-amd64.zip"
    PYTHON_ZIP="$PORTABLE_APPS_PATH/python-portable.zip"
    
    echo "Скачиваем Python..."
    curl -L -o "$PYTHON_ZIP" "$PYTHON_URL"
    
    # Распаковываем
    echo "Распаковываем Python..."
    unzip -q -o "$PYTHON_ZIP" -d "$PYTHON_PATH"
    rm "$PYTHON_ZIP"
    
    # Скачиваем get-pip.py
    echo "Устанавливаем pip..."
    curl -L -o "$PYTHON_PATH/get-pip.py" "https://bootstrap.pypa.io/get-pip.py"
    
    # Создаем скрипт-обертку для python
    cat > "$PYTHON_PATH/python" << 'WRAPPER'
#!/bin/bash
exec "$(dirname "$0")/python.exe" "$@"
WRAPPER
    chmod +x "$PYTHON_PATH/python"
    
    echo "Python установлен!"
else
    echo "Python уже установлен."
fi

# Установка PostgreSQL
echo -e "\nУстановка PostgreSQL..."
POSTGRES_PATH="$PORTABLE_APPS_PATH/postgresql"

if [ ! -f "$POSTGRES_PATH/bin/psql.exe" ]; then
    echo "Загружаем портативную версию PostgreSQL 16.1..."
    
    # URL для PostgreSQL portable
    POSTGRES_URL="https://get.enterprisedb.com/postgresql/postgresql-16.1-1-windows-x64-binaries.zip"
    POSTGRES_ZIP="$PORTABLE_APPS_PATH/postgresql-portable.zip"
    
    echo "Скачиваем PostgreSQL (это может занять несколько минут)..."
    curl -L -o "$POSTGRES_ZIP" "$POSTGRES_URL"
    
    # Создаем временную директорию
    TEMP_DIR="$PORTABLE_APPS_PATH/temp_postgres"
    mkdir -p "$TEMP_DIR"
    
    # Распаковываем
    echo "Распаковываем PostgreSQL..."
    unzip -q -o "$POSTGRES_ZIP" -d "$TEMP_DIR"
    
    # Перемещаем файлы
    if [ -d "$TEMP_DIR/pgsql" ]; then
        mkdir -p "$POSTGRES_PATH"
        mv "$TEMP_DIR/pgsql"/* "$POSTGRES_PATH/"
        rm -rf "$TEMP_DIR"
    fi
    
    rm "$POSTGRES_ZIP"
    
    # Создаем скрипты-обертки для основных утилит PostgreSQL
    for tool in psql pg_dump pg_restore createdb dropdb; do
        cat > "$POSTGRES_PATH/bin/$tool" << WRAPPER
#!/bin/bash
exec "\$(dirname "\$0")/$tool.exe" "\$@"
WRAPPER
        chmod +x "$POSTGRES_PATH/bin/$tool"
    done
    
    echo "PostgreSQL установлен!"
else
    echo "PostgreSQL уже установлен."
fi

echo -e "\nВсе приложения установлены!"
echo "PATH уже настроен в вашем ~/.bashrc"

# Проверка установки
echo -e "\n=== Проверка установки ==="
echo -n "Python: "
if "$PYTHON_PATH/python.exe" --version 2>/dev/null; then
    echo "OK"
else
    echo "Ошибка"
fi

echo -n "PostgreSQL: "
if "$POSTGRES_PATH/bin/psql.exe" --version 2>/dev/null; then
    echo "OK"
else
    echo "Ошибка"
fi

echo -n "Redis: "
if "$PORTABLE_APPS_PATH/redis/redis-cli.exe" --version 2>/dev/null; then
    echo "OK"
else
    echo "Ошибка"
fi

echo -e "\nДля применения изменений выполните: source ~/.bashrc"
