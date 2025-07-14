#!/bin/bash

# Test environment management script
# Usage: ./scripts/test-env.sh [start|stop|restart|reset|logs|status]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.test.yml"
ENV_FILE=".env.test"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: docker-compose is not installed${NC}"
    exit 1
fi

# Function to print colored output
print_status() {
    echo -e "${GREEN}[TEST ENV]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if services are running
check_services() {
    docker-compose -f "$COMPOSE_FILE" ps --services --filter "status=running" | grep -E "(postgres-test|redis-test|minio-test)" > /dev/null 2>&1
}

# Function to wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for PostgreSQL
    echo -n "  PostgreSQL: "
    while ! docker-compose -f "$COMPOSE_FILE" exec -T postgres-test pg_isready -U testuser -d testdb > /dev/null 2>&1; do
        echo -n "."
        sleep 1
    done
    echo " Ready!"
    
    # Wait for Redis
    echo -n "  Redis: "
    while ! docker-compose -f "$COMPOSE_FILE" exec -T redis-test redis-cli ping > /dev/null 2>&1; do
        echo -n "."
        sleep 1
    done
    echo " Ready!"
    
    # Wait for MinIO
    echo -n "  MinIO: "
    while ! curl -sf http://localhost:9001/minio/health/live > /dev/null 2>&1; do
        echo -n "."
        sleep 1
    done
    echo " Ready!"
}

# Start services
start_services() {
    if check_services; then
        print_warning "Test services are already running"
        return 0
    fi
    
    print_status "Starting test environment..."
    
    # Check if .env.test exists
    if [ ! -f "$ENV_FILE" ]; then
        print_error "$ENV_FILE not found!"
        exit 1
    fi
    
    # Start services
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    # Wait for services to be ready
    wait_for_services
    
    print_status "Test environment started successfully!"
    print_status "Service URLs:"
    echo "  - PostgreSQL: localhost:5433"
    echo "  - Redis: localhost:6380"
    echo "  - MinIO API: http://localhost:9001"
    echo "  - MinIO Console: http://localhost:9002"
}

# Stop services
stop_services() {
    print_status "Stopping test environment..."
    docker-compose -f "$COMPOSE_FILE" down
    print_status "Test environment stopped"
}

# Restart services
restart_services() {
    stop_services
    sleep 2
    start_services
}

# Reset services (remove volumes)
reset_services() {
    print_warning "This will remove all test data!"
    read -p "Are you sure you want to reset the test environment? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting test environment..."
        docker-compose -f "$COMPOSE_FILE" down -v
        print_status "Test environment reset complete"
    else
        print_status "Reset cancelled"
    fi
}

# Show logs
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        docker-compose -f "$COMPOSE_FILE" logs -f
    else
        docker-compose -f "$COMPOSE_FILE" logs -f "$service"
    fi
}

# Show status
show_status() {
    print_status "Test environment status:"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Main script logic
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    reset)
        reset_services
        ;;
    logs)
        show_logs "$2"
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|reset|logs|status}"
        echo ""
        echo "Commands:"
        echo "  start    - Start test environment"
        echo "  stop     - Stop test environment"
        echo "  restart  - Restart test environment"
        echo "  reset    - Reset test environment (removes all data)"
        echo "  logs     - Show logs (optionally specify service: postgres-test, redis-test, minio-test)"
        echo "  status   - Show status of test services"
        exit 1
        ;;
esac
