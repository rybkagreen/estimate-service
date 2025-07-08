# Скрипт для установки портативных версий Python и PostgreSQL

Write-Host "=== Установка портативных приложений ===" -ForegroundColor Cyan

# Создаем директории если их нет
$portableAppsPath = "C:\Users\Belinad\portable-apps"

# Python установка
Write-Host "`nУстановка Python..." -ForegroundColor Yellow
$pythonPath = "$portableAppsPath\python"

# Проверяем наличие Python
if (-not (Test-Path "$pythonPath\python.exe")) {
    Write-Host "Загружаем портативную версию Python..." -ForegroundColor Green
    
    # URL для скачивания Python embeddable package
    $pythonUrl = "https://www.python.org/ftp/python/3.12.7/python-3.12.7-embed-amd64.zip"
    $pythonZip = "$portableAppsPath\python-portable.zip"
    
    # Скачиваем Python
    Write-Host "Скачиваем Python 3.12.7..."
    Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonZip
    
    # Распаковываем
    Write-Host "Распаковываем Python..."
    Expand-Archive -Path $pythonZip -DestinationPath $pythonPath -Force
    Remove-Item $pythonZip
    
    # Скачиваем get-pip.py
    Write-Host "Устанавливаем pip..."
    $getPipUrl = "https://bootstrap.pypa.io/get-pip.py"
    Invoke-WebRequest -Uri $getPipUrl -OutFile "$pythonPath\get-pip.py"
    
    # Создаем батник для запуска Python
    @"
@echo off
"%~dp0\python.exe" %*
"@ | Out-File -FilePath "$pythonPath\python.bat" -Encoding ASCII
    
    Write-Host "Python установлен!" -ForegroundColor Green
} else {
    Write-Host "Python уже установлен." -ForegroundColor Green
}

# PostgreSQL установка
Write-Host "`nУстановка PostgreSQL..." -ForegroundColor Yellow
$postgresPath = "$portableAppsPath\postgresql"

if (-not (Test-Path "$postgresPath\bin\psql.exe")) {
    Write-Host "Загружаем портативную версию PostgreSQL..." -ForegroundColor Green
    
    # URL для PostgreSQL portable
    $postgresUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.1-1-windows-x64-binaries.zip"
    $postgresZip = "$portableAppsPath\postgresql-portable.zip"
    
    # Скачиваем PostgreSQL
    Write-Host "Скачиваем PostgreSQL 16.1..."
    Invoke-WebRequest -Uri $postgresUrl -OutFile $postgresZip
    
    # Распаковываем
    Write-Host "Распаковываем PostgreSQL..."
    Expand-Archive -Path $postgresZip -DestinationPath "$portableAppsPath\temp" -Force
    
    # Перемещаем файлы
    if (Test-Path "$portableAppsPath\temp\pgsql") {
        Move-Item -Path "$portableAppsPath\temp\pgsql\*" -Destination $postgresPath -Force
        Remove-Item "$portableAppsPath\temp" -Recurse -Force
    }
    
    Remove-Item $postgresZip
    
    Write-Host "PostgreSQL установлен!" -ForegroundColor Green
} else {
    Write-Host "PostgreSQL уже установлен." -ForegroundColor Green
}

Write-Host "`nВсе приложения установлены!" -ForegroundColor Cyan
Write-Host "Перезапустите терминал для применения изменений PATH." -ForegroundColor Yellow
