#!/bin/bash

# Database Restore Script for Estimate Service
# This script restores a PostgreSQL database from a backup file

# Configuration
DB_NAME="estimate_service_dev"
DB_USER="belin"
DB_HOST="localhost"
DB_PORT="5433"
BACKUP_DIR="/home/belin/estimate-service/backups"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lht "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | head -20
    echo ""
    echo -e "${BLUE}Usage: $0 <backup_file.sql.gz>${NC}"
    echo "Example: $0 $BACKUP_DIR/backup_estimate_service_dev_20240101_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}✗ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will restore the database from a backup.${NC}"
echo -e "${YELLOW}⚠️  All current data in the database '$DB_NAME' will be lost!${NC}"
echo ""
echo "Backup file: $BACKUP_FILE"
echo "Target database: $DB_NAME"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Restore cancelled.${NC}"
    exit 0
fi

# Create temporary directory for extraction
TEMP_DIR=$(mktemp -d)
TEMP_SQL="$TEMP_DIR/restore.sql"

echo -e "${YELLOW}Extracting backup file...${NC}"
gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to extract backup file!${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo -e "${YELLOW}Dropping existing database...${NC}"
dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null

echo -e "${YELLOW}Creating new database...${NC}"
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to create database!${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo -e "${YELLOW}Restoring database from backup...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$TEMP_SQL"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database restored successfully!${NC}"
    
    # Run Prisma migrations to ensure schema is up to date
    echo -e "${YELLOW}Running Prisma migrations...${NC}"
    cd /home/belin/estimate-service
    npx prisma migrate deploy
    
    echo -e "${GREEN}✓ Restore completed!${NC}"
else
    echo -e "${RED}✗ Restore failed!${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Clean up temporary files
rm -rf "$TEMP_DIR"

echo -e "${BLUE}You may want to run 'npm run prisma:generate' to regenerate the Prisma client.${NC}"
