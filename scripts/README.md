# Estimate Service Diagnostic Scripts

This folder contains diagnostic and troubleshooting scripts for the estimate-service project.

## Available Scripts

### 1. diagnose-issues.ps1 (PowerShell)
**Purpose:** Comprehensive diagnostic tool with interactive fixes

**Features:**
- Automatic port conflict detection
- Docker status checking
- Environment variable inspection
- Interactive menu with one-click fixes
- Process identification and management

**Usage:**
```powershell
.\diagnose-issues.ps1
```

**Menu Options:**
1. Kill all processes on common ports (3000, 3001, 3002, 3003, 3022)
2. Disable Nx Cloud (sets environment variables)
3. Reset Docker volumes (complete cleanup)
4. Restart all services (docker-compose restart)
5. Exit

### 2. quick-fix.bat (Batch)
**Purpose:** Quick troubleshooting for common issues

**Features:**
- Port status checking
- Simple interactive menu
- Basic Docker operations

**Usage:**
```batch
quick-fix.bat
```

## Common Issues These Scripts Address

### Port Conflicts
- Identifies processes using required ports
- Provides PID information for manual termination
- Option to automatically kill conflicting processes

### Nx Cloud Issues
- Disables Nx Cloud when it causes build problems
- Sets appropriate environment variables

### Docker Volume Problems
- Removes and recreates Docker volumes
- Fixes permission issues
- Ensures clean database state

### Service Failures
- Restarts individual or all services
- Provides docker-compose commands

## Required Ports

The scripts check the following ports:
- **3000**: Frontend (estimate-frontend)
- **3001**: Data Collector Service
- **3002**: AI Assistant Service
- **3003**: Knowledge Base Service
- **3022**: Main Estimate Service
- **5433**: PostgreSQL
- **6380**: Redis

## Prerequisites

- Windows PowerShell (for .ps1 script)
- Windows Command Prompt (for .bat script)
- Docker Desktop installed and running
- Administrator privileges (recommended)

## Troubleshooting the Scripts

If the PowerShell script fails to run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

If Docker commands fail:
- Ensure Docker Desktop is running
- Check if you're in the correct directory
- Verify docker-compose.full.yml exists

## Manual Commands Reference

**Check port usage:**
```bash
netstat -ano | findstr :3000
```

**Kill process by PID:**
```bash
taskkill /PID <PID> /F
```

**Disable Nx Cloud:**
```bash
# Command Prompt
set NX_CLOUD_ACCESS_TOKEN=
set NX_NO_CLOUD=true

# PowerShell
$env:NX_CLOUD_ACCESS_TOKEN=""
$env:NX_NO_CLOUD="true"
```

**Reset Docker environment:**
```bash
docker-compose -f docker-compose.full.yml down -v
docker volume create estimate-service_postgres_data
docker-compose -f docker-compose.full.yml up -d
```
