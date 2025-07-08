# Статус установки портативных приложений

## ✅ Успешно установлены и добавлены в PATH:

### 1. Node.js v20.13.1
- Путь: `/c/Users/Belinad/portable-apps/node-v20.13.1-win-x64/`
- Команда: `node`
- Статус: Работает

### 2. GitHub CLI v2.74.2
- Путь: `/c/Users/Belinad/portable-apps/gh_cli/`
- Команда: `gh`
- Статус: Работает

### 3. Redis 3.0.504
- Путь: `/c/Users/Belinad/portable-apps/redis/`
- Команда: `redis-cli.exe`
- Статус: Работает

### 4. Python 3.12.7
- Путь: `/c/Users/Belinad/portable-apps/python/`
- Команда: `python.exe`
- Статус: Установлен, но без pip (блокируется антивирусом)

## ⚠️ Требует ручной установки:

### PostgreSQL
1. Скачайте с: https://www.enterprisedb.com/download-postgresql-binaries
2. Выберите версию Windows x86-64
3. Распакуйте в `C:\Users\Belinad\portable-apps\postgresql`
4. Файлы должны быть в структуре: `postgresql/bin/psql.exe`

## Альтернативные решения:

### Для pip в Python:
- Временно отключите антивирус и выполните:
  ```bash
  cd /c/Users/Belinad/portable-apps/python
  ./python.exe -m ensurepip
  ```

### Для PostgreSQL:
- Использовать Docker:
  ```bash
  docker run --name postgres-local -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
  ```

## Применение изменений PATH:
- Для текущей сессии: `source ~/.bashrc`
- Для Windows глобально: запустите `setup-path-windows.ps1` от администратора
