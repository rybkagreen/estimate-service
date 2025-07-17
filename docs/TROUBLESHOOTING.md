# Estimate Service Troubleshooting Guide

## Common Issues and Solutions

### 1. Port Conflicts

#### Problem: Port is already in use
**Symptoms:**
- Error: "bind: address already in use"
- Service fails to start

**Solution:**
```bash
# Windows: Check which process is using the port
netstat -ano | findstr :3000

# Kill the process (replace <PID> with actual Process ID)
taskkill /PID <PID> /F
```

**Common ports used by estimate-service:**
- 3000: Frontend (estimate-frontend)
- 3001: Data Collector Service
- 3002: AI Assistant Service
- 3003: Knowledge Base Service
- 3022: Main Estimate Service
- 5433: PostgreSQL
- 6380: Redis

### 2. Nx Cloud Issues

#### Problem: Nx Cloud authentication or connection errors
**Symptoms:**
- Build failures with Nx Cloud errors
- Slow builds due to failed cloud cache attempts

**Solution:**
```bash
# Windows Command Prompt
set NX_CLOUD_ACCESS_TOKEN=
set NX_NO_CLOUD=true

# PowerShell
$env:NX_CLOUD_ACCESS_TOKEN=""
$env:NX_NO_CLOUD="true"
```

### 3. Docker Volume Permission Issues

#### Problem: Database connection errors or permission denied
**Symptoms:**
- PostgreSQL connection refused
- Permission denied errors in logs
- Data not persisting between restarts

**Solution:**
```bash
# Stop all services and remove volumes
docker-compose -f docker-compose.full.yml down -v

# Recreate the postgres data volume
docker volume create estimate-service_postgres_data

# Start services again
docker-compose -f docker-compose.full.yml up -d
```

### 4. Service-Specific Issues

#### Problem: Individual service crashes or not responding
**Solution:**
```bash
# Restart a specific service
docker-compose -f docker-compose.full.yml restart estimate-service

# View logs for a specific service
docker-compose -f docker-compose.full.yml logs estimate-service

# Follow logs in real-time
docker-compose -f docker-compose.full.yml logs -f estimate-service
```

### 5. Database Connection Issues

#### Problem: Cannot connect to PostgreSQL
**Symptoms:**
- "ECONNREFUSED" errors
- "Connection timeout" errors

**Solution:**
1. Check if PostgreSQL container is running:
   ```bash
   docker ps | findstr postgres
   ```

2. Check PostgreSQL logs:
   ```bash
   docker-compose -f docker-compose.full.yml logs postgres
   ```

3. Ensure DATABASE_URL is correct:
   ```
   postgresql://postgres:postgres@postgres:5432/estimate_service
   ```

### 6. Redis Connection Issues

#### Problem: Cannot connect to Redis
**Solution:**
1. Check if Redis is running:
   ```bash
   docker ps | findstr redis
   ```

2. Test Redis connection:
   ```bash
   docker exec -it estimate-service_redis_1 redis-cli ping
   ```

## Quick Diagnostic Commands

### Check All Services Status
```bash
docker-compose -f docker-compose.full.yml ps
```

### View All Logs
```bash
docker-compose -f docker-compose.full.yml logs
```

### Complete Reset
```bash
# Stop everything
docker-compose -f docker-compose.full.yml down -v

# Remove all images
docker-compose -f docker-compose.full.yml down --rmi all

# Start fresh
docker-compose -f docker-compose.full.yml up -d --build
```

## Using the Diagnostic Scripts

We provide two diagnostic scripts:

### 1. PowerShell Script (Recommended)
```powershell
.\scripts\diagnose-issues.ps1
```
Features:
- Interactive menu
- Automatic port checking
- Process identification
- One-click fixes

### 2. Batch Script (Quick fixes)
```batch
.\scripts\quick-fix.bat
```
Features:
- Simple port checking
- Basic troubleshooting options

## Environment-Specific Issues

### Windows-Specific
- Use PowerShell as Administrator for best results
- Ensure Docker Desktop is running
- Check Windows Defender Firewall settings

### WSL2 Integration
- Ensure WSL2 backend is enabled in Docker Desktop
- Check WSL2 memory limits in .wslconfig

## Getting Help

If you continue to experience issues:

1. Check the logs:
   ```bash
   docker-compose -f docker-compose.full.yml logs > debug.log
   ```

2. Run the diagnostic script:
   ```powershell
   .\scripts\diagnose-issues.ps1
   ```

3. Check Docker Desktop settings
4. Restart Docker Desktop if necessary
5. Contact the development team with the debug.log file
