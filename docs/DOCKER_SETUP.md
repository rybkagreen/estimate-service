# Docker Setup for Estimate Service Monorepo

This document describes the Docker setup for all services in the Estimate
Service monorepo.

## Services

The following services have been configured with production-ready Dockerfiles:

1. **estimate-service** (Port 3022) - Main backend service with NestJS
2. **data-collector** (Port 3005) - Data collection and processing service
3. **ai-assistant** (Port 3008) - AI assistant service
4. **ai-assistant-service** (Port 3009) - Enhanced AI assistant service with
   vector store
5. **knowledge-base** (Port 3007) - Knowledge base management service
6. **estimate-frontend** (Port 80) - React frontend application

## Docker Images Features

All Docker images are built with production best practices:

- **Multi-stage builds** for smaller image sizes
- **Non-root user** execution for security
- **Health checks** for container orchestration
- **Proper signal handling** with dumb-init
- **Layer caching** optimization
- **Production dependencies only** in final image

## Building Images

### Build all services:

```bash
./scripts/docker-build.sh all
```

### Build individual service:

```bash
./scripts/docker-build.sh estimate-service
./scripts/docker-build.sh data-collector
./scripts/docker-build.sh ai-assistant
./scripts/docker-build.sh ai-assistant-service
./scripts/docker-build.sh knowledge-base
./scripts/docker-build.sh estimate-frontend
```

### Using Docker Compose:

```bash
# Build all services
docker-compose -f docker-compose.production.yml build

# Build specific service
docker-compose -f docker-compose.production.yml build estimate-service
```

## Running Services

### Development Mode

```bash
# Uses docker-compose.yml and docker-compose.override.yml
docker-compose up

# Run specific services
docker-compose up postgres redis estimate-service
```

### Production Mode

```bash
# Create .env file first
cp .env.production.example .env

# Run all services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop services
docker-compose -f docker-compose.production.yml down
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=estimate_db

# Redis
REDIS_PASSWORD=your-redis-password

# Application
JWT_SECRET=your-jwt-secret
DEEPSEEK_API_KEY=your-deepseek-api-key

# Node Environment
NODE_ENV=production
```

## Docker Image Sizes

Typical production image sizes:

- Backend services: ~150-200MB
- Frontend (nginx): ~50-70MB

## Health Checks

All services include health check endpoints:

- Backend services: `GET /health`
- Frontend: `GET /health`

## Security Considerations

1. All services run as non-root user
2. Minimal base images (Alpine Linux)
3. No development dependencies in production images
4. Proper secret management via environment variables
5. Network isolation between services

## Troubleshooting

### Build Failures

```bash
# Clear Docker cache
docker system prune -a

# Build with no cache
docker-compose build --no-cache
```

### Permission Issues

```bash
# Fix script permissions
chmod +x scripts/docker-build.sh
```

### Port Conflicts

```bash
# Check port usage
netstat -tulpn | grep LISTEN

# Or use different ports in docker-compose.yml
```

## Production Deployment

For production deployment:

1. Use a container orchestration platform (Kubernetes, Docker Swarm)
2. Set up proper monitoring and logging
3. Configure auto-scaling based on load
4. Use secrets management service
5. Set up SSL/TLS termination
6. Configure backup strategies for volumes

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
- name: Build and push Docker images
  run: |
    docker-compose -f docker-compose.production.yml build
    docker tag estimate-service:latest ghcr.io/${{ github.repository }}/estimate-service:latest
    docker push ghcr.io/${{ github.repository }}/estimate-service:latest
```
