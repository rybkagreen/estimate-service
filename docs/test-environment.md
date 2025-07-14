# Test Environment Setup

This document describes the test environment infrastructure for the Estimate Service project.

## Overview

The test environment consists of:
- **PostgreSQL 15** - Database for Prisma ORM
- **Redis 7** - Caching and session management
- **MinIO** - S3-compatible object storage for file uploads

All services are containerized using Docker Compose and configured for isolated testing.

## Quick Start

### 1. Start the test environment
```bash
./scripts/test-env.sh start
```

### 2. Stop the test environment
```bash
./scripts/test-env.sh stop
```

### 3. View logs
```bash
# All services
./scripts/test-env.sh logs

# Specific service
./scripts/test-env.sh logs postgres-test
```

### 4. Reset environment (removes all data)
```bash
./scripts/test-env.sh reset
```

## Configuration

### Environment Variables
Test-specific environment variables are defined in `.env.test`. Key configurations:

- **Database**: PostgreSQL on port 5433 (to avoid conflicts with development DB)
- **Redis**: Redis on port 6380 with password authentication
- **MinIO**: S3-compatible storage on port 9001 (API) and 9002 (Console)

### Network Configuration
All services run on a custom bridge network `test-network` with subnet `172.20.0.0/16` for inter-service communication.

## Services Details

### PostgreSQL
- **Container**: `postgres-test`
- **Port**: 5433
- **Database**: testdb
- **User**: testuser
- **Password**: testpass
- **Connection URL**: `postgresql://testuser:testpass@localhost:5433/testdb`

Features:
- UUID extension enabled
- pgcrypto extension enabled
- Automatic schema initialization
- Test data seeding

### Redis
- **Container**: `redis-test`
- **Port**: 6380
- **Password**: testredispass
- **Connection URL**: `redis://:testredispass@localhost:6380`

Features:
- Persistence enabled (AOF)
- Password authentication
- Health checks

### MinIO
- **Container**: `minio-test`
- **API Port**: 9001
- **Console Port**: 9002
- **Access Key**: minioadmin
- **Secret Key**: minioadmin123
- **Default Bucket**: test-files

Features:
- S3-compatible API
- Web console for management
- Automatic bucket creation
- Public read access for test files

## Database Initialization

The test database is automatically initialized with:

1. **Schema Setup** (`01-init-schema.sql`):
   - Creates required PostgreSQL extensions
   - Sets up test schema
   - Configures permissions

2. **Test Data** (`02-seed-test-data.sql`):
   - Creates test users (admin, user1, user2, guest)
   - Creates sample projects
   - Creates sample file records
   - All test users have password: `testpass123`

## Usage in Tests

### Jest/Vitest Configuration
```javascript
// jest.setup.js or vitest.setup.js
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Ensure test database URL is used
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://testuser:testpass@localhost:5433/testdb';
```

### Prisma Configuration
```javascript
// prisma/seed.test.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

### MinIO Client Configuration
```javascript
import { Client } from 'minio';

const minioClient = new Client({
  endPoint: 'localhost',
  port: 9001,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin123',
});
```

## Troubleshooting

### Services not starting
```bash
# Check Docker daemon is running
docker ps

# Check for port conflicts
netstat -tulpn | grep -E '(5433|6380|9001|9002)'

# View detailed logs
docker-compose -f docker-compose.test.yml logs
```

### Database connection issues
```bash
# Test PostgreSQL connection
docker-compose -f docker-compose.test.yml exec postgres-test psql -U testuser -d testdb

# Check if database is ready
docker-compose -f docker-compose.test.yml exec postgres-test pg_isready
```

### MinIO issues
```bash
# Access MinIO console
open http://localhost:9002

# Check MinIO health
curl http://localhost:9001/minio/health/live
```

## Best Practices

1. **Isolation**: Test environment uses different ports to avoid conflicts with development
2. **Data Reset**: Always reset test data between test suites for consistency
3. **Health Checks**: Wait for all services to be healthy before running tests
4. **Resource Cleanup**: Stop services after testing to free resources

## CI/CD Integration

For GitHub Actions or other CI systems:

```yaml
# .github/workflows/test.yml
services:
  postgres:
    image: postgres:15-alpine
    env:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpass
      POSTGRES_DB: testdb
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5

  redis:
    image: redis:7-alpine
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5

  minio:
    image: minio/minio:latest
    env:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    options: >-
      --health-cmd "curl -f http://localhost:9000/minio/health/live"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```
