# Diagnostic script for estimate-service issues
Write-Host "=== Estimate Service Diagnostics ===" -ForegroundColor Cyan
Write-Host ""

# Function to check port usage
function Check-Port {
    param([int]$Port)
    Write-Host "Checking port $Port..." -ForegroundColor Yellow
    $result = netstat -ano | findstr ":$Port"
    if ($result) {
        Write-Host "Port $Port is in use:" -ForegroundColor Red
        Write-Host $result
        
        # Extract PID and show process details
        $lines = $result -split "`n"
        foreach ($line in $lines) {
            if ($line -match 'LISTENING\s+(\d+)') {
                $processId = $matches[1]
                Write-Host "Process using port $Port (PID: $processId):" -ForegroundColor Yellow
                Get-Process -Id $processId -ErrorAction SilentlyContinue | Format-Table Name, Id, Path -AutoSize
                
                Write-Host "To kill this process, run: taskkill /PID $processId /F" -ForegroundColor Cyan
            }
        }
    } else {
        Write-Host "Port $Port is free" -ForegroundColor Green
    }
    Write-Host ""
}

# Check common ports
Write-Host "=== Checking Port Availability ===" -ForegroundColor Cyan
Check-Port 3000  # Frontend
Check-Port 3001  # Data Collector
Check-Port 3002  # AI Assistant
Check-Port 3003  # Knowledge Base
Check-Port 3022  # Estimate Service
Check-Port 5433  # PostgreSQL
Check-Port 6380  # Redis

# Check Docker status
Write-Host "=== Docker Status ===" -ForegroundColor Cyan
$dockerRunning = Get-Service docker -ErrorAction SilentlyContinue
if ($dockerRunning -and $dockerRunning.Status -eq 'Running') {
    Write-Host "Docker is running" -ForegroundColor Green
    
    # Check Docker containers
    Write-Host "`nRunning containers:" -ForegroundColor Yellow
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Check Docker volumes
    Write-Host "`nDocker volumes:" -ForegroundColor Yellow
    docker volume ls | findstr estimate
} else {
    Write-Host "Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop" -ForegroundColor Yellow
}
Write-Host ""

# Check environment variables
Write-Host "=== Environment Variables ===" -ForegroundColor Cyan
Write-Host "NX_CLOUD_ACCESS_TOKEN: $($env:NX_CLOUD_ACCESS_TOKEN)" -ForegroundColor Yellow
Write-Host "NX_NO_CLOUD: $($env:NX_NO_CLOUD)" -ForegroundColor Yellow
Write-Host ""

# Provide quick fixes
Write-Host "=== Quick Fix Commands ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. If ports are busy:" -ForegroundColor Yellow
Write-Host "   # Find process using port 3000" -ForegroundColor Gray
Write-Host "   netstat -ano | findstr :3000" -ForegroundColor White
Write-Host "   # Kill process (replace <PID> with actual PID)" -ForegroundColor Gray
Write-Host "   taskkill /PID <PID> /F" -ForegroundColor White
Write-Host ""

Write-Host "2. If Nx Cloud is causing issues:" -ForegroundColor Yellow
Write-Host "   # Disable Nx Cloud" -ForegroundColor Gray
Write-Host "   `$env:NX_CLOUD_ACCESS_TOKEN=''" -ForegroundColor White
Write-Host "   `$env:NX_NO_CLOUD='true'" -ForegroundColor White
Write-Host ""

Write-Host "3. If volume permission issues:" -ForegroundColor Yellow
Write-Host "   # Remove all containers and volumes" -ForegroundColor Gray
Write-Host "   docker-compose -f docker-compose.full.yml down -v" -ForegroundColor White
Write-Host "   # Recreate volume" -ForegroundColor Gray
Write-Host "   docker volume create estimate-service_postgres_data" -ForegroundColor White
Write-Host ""

Write-Host "4. Restart specific service:" -ForegroundColor Yellow
Write-Host "   # Restart estimate-service" -ForegroundColor Gray
Write-Host "   docker-compose -f docker-compose.full.yml restart estimate-service" -ForegroundColor White
Write-Host ""

Write-Host "5. Full restart:" -ForegroundColor Yellow
Write-Host "   # Stop all services" -ForegroundColor Gray
Write-Host "   docker-compose -f docker-compose.full.yml down" -ForegroundColor White
Write-Host "   # Start all services" -ForegroundColor Gray
Write-Host "   docker-compose -f docker-compose.full.yml up -d" -ForegroundColor White
Write-Host ""

# Interactive menu
Write-Host "=== Interactive Fixes ===" -ForegroundColor Cyan
Write-Host "Select an option:" -ForegroundColor Yellow
Write-Host "1. Kill all processes on common ports"
Write-Host "2. Disable Nx Cloud"
Write-Host "3. Reset Docker volumes"
Write-Host "4. Restart all services"
Write-Host "5. Exit"
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "Killing processes on common ports..." -ForegroundColor Yellow
        @(3000, 3001, 3002, 3003, 3022) | ForEach-Object {
            $port = $_
            $result = netstat -ano | findstr ":$port" | findstr "LISTENING"
            if ($result -match 'LISTENING\s+(\d+)') {
                $processId = $matches[1]
                Write-Host "Killing process on port ${port} (PID: $processId)" -ForegroundColor Red
                taskkill /PID $processId /F
            }
        }
        Write-Host "Done!" -ForegroundColor Green
    }
    "2" {
        Write-Host "Disabling Nx Cloud..." -ForegroundColor Yellow
        [Environment]::SetEnvironmentVariable("NX_CLOUD_ACCESS_TOKEN", "", "User")
        [Environment]::SetEnvironmentVariable("NX_NO_CLOUD", "true", "User")
        $env:NX_CLOUD_ACCESS_TOKEN = ""
        $env:NX_NO_CLOUD = "true"
        Write-Host "Nx Cloud disabled for current session" -ForegroundColor Green
    }
    "3" {
        Write-Host "Resetting Docker volumes..." -ForegroundColor Yellow
        docker-compose -f docker-compose.full.yml down -v
        docker volume create estimate-service_postgres_data
        Write-Host "Volumes reset!" -ForegroundColor Green
    }
    "4" {
        Write-Host "Restarting all services..." -ForegroundColor Yellow
        docker-compose -f docker-compose.full.yml down
        docker-compose -f docker-compose.full.yml up -d
        Write-Host "Services restarted!" -ForegroundColor Green
    }
    "5" {
        Write-Host "Exiting..." -ForegroundColor Gray
        exit
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}
