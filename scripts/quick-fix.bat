@echo off
echo === Estimate Service Quick Fix ===
echo.

echo Checking for port conflicts...
echo.

echo Port 3000 (Frontend):
netstat -ano | findstr :3000
echo.

echo Port 3022 (Estimate Service):
netstat -ano | findstr :3022
echo.

echo Port 5433 (PostgreSQL):
netstat -ano | findstr :5433
echo.

echo Port 6380 (Redis):
netstat -ano | findstr :6380
echo.

echo === Available Actions ===
echo 1. Kill process on specific port
echo 2. Disable Nx Cloud
echo 3. Reset Docker environment
echo 4. Restart estimate-service only
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    set /p port="Enter port number: "
    set /p pid="Enter PID to kill: "
    taskkill /PID %pid% /F
    echo Process killed!
    pause
)

if "%choice%"=="2" (
    set NX_CLOUD_ACCESS_TOKEN=
    set NX_NO_CLOUD=true
    echo Nx Cloud disabled for this session!
    pause
)

if "%choice%"=="3" (
    docker-compose -f docker-compose.full.yml down -v
    docker volume create estimate-service_postgres_data
    echo Docker environment reset!
    pause
)

if "%choice%"=="4" (
    docker-compose -f docker-compose.full.yml restart estimate-service
    echo Estimate service restarted!
    pause
)

if "%choice%"=="5" (
    exit
)
