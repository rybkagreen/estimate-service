# Start Development Services Script
Write-Host "Starting Estimate Service Development Environment..." -ForegroundColor Green

# Check if infrastructure is running
$postgresRunning = docker ps --format "table {{.Names}}" | Select-String "estimate-service-postgres-1"
$redisRunning = docker ps --format "table {{.Names}}" | Select-String "estimate-service-redis-1"

if (!$postgresRunning -or !$redisRunning) {
    Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.infra.yml up -d
    Start-Sleep -Seconds 5
}

Write-Host "Infrastructure is ready!" -ForegroundColor Green

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:frontend"

# Start Backend
Write-Host "Starting Backend (Estimate Service)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:backend"

# Start MCP Server
Write-Host "Starting MCP Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:mcp"

# Start AI Assistant
Write-Host "Starting AI Assistant..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:ai-assistant"

Write-Host "`nAll services are starting!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend API: http://localhost:3022" -ForegroundColor Yellow
Write-Host "AI Assistant: http://localhost:3002" -ForegroundColor Yellow
Write-Host "MCP Server: http://localhost:3333" -ForegroundColor Yellow
Write-Host "`nCheck individual terminal windows for service logs." -ForegroundColor Cyan
