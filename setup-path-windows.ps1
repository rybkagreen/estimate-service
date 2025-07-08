# PowerShell скрипт для добавления приложений в PATH
Write-Host "Добавление приложений в системный PATH..." -ForegroundColor Green

# Получаем текущий PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)

# Пути для добавления
$pathsToAdd = @(
    "C:\Users\Belinad\portable-apps\gh_cli",
    "C:\Users\Belinad\portable-apps\nodejs",
    "C:\Users\Belinad\portable-apps\node-v20.13.1-win-x64",
    "C:\Users\Belinad\portable-apps\postgresql\bin",
    "C:\Users\Belinad\portable-apps\python",
    "C:\Users\Belinad\portable-apps\python\Scripts",
    "C:\Users\Belinad\portable-apps\redis",
    "C:\Users\Belinad\gh_cli"
)

# Проверяем и добавляем только новые пути
$newPaths = @()
foreach ($path in $pathsToAdd) {
    if ($currentPath -notlike "*$path*") {
        $newPaths += $path
        Write-Host "Добавляем: $path" -ForegroundColor Yellow
    } else {
        Write-Host "Уже существует: $path" -ForegroundColor Cyan
    }
}

if ($newPaths.Count -gt 0) {
    $newPath = $currentPath + ";" + ($newPaths -join ";")
    [Environment]::SetEnvironmentVariable("Path", $newPath, [EnvironmentVariableTarget]::User)
    Write-Host "`nПути успешно добавлены в PATH!" -ForegroundColor Green
} else {
    Write-Host "`nВсе пути уже существуют в PATH." -ForegroundColor Yellow
}

Write-Host "`nДля применения изменений:" -ForegroundColor Magenta
Write-Host "1. Закройте все окна терминала" -ForegroundColor White
Write-Host "2. Откройте новое окно терминала" -ForegroundColor White
Write-Host "`nИли в Git Bash выполните: source ~/.bashrc" -ForegroundColor White
