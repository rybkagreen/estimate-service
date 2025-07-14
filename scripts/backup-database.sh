#!/bin/bash

# Database Backup Script for Estimate Service
# This script creates timestamped backups of the PostgreSQL database

# Configuration
DB_NAME="estimate_service_dev"
DB_USER="belin"
DB_HOST="localhost"
DB_PORT="5433"
BACKUP_DIR="/home/belin/estimate-service/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Starting database backup...${NC}"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Perform the backup
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_FILE" --verbose --no-owner --no-acl

# Check if backup was successful
if [ $? -eq 0 ]; then
    # Compress the backup
    gzip "$BACKUP_FILE"
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    
    # Get file size
    FILE_SIZE=$(ls -lh "$COMPRESSED_FILE" | awk '{print $5}')
    
    echo -e "${GREEN}✓ Backup completed successfully!${NC}"
    echo "Compressed backup: $COMPRESSED_FILE"
    echo "Size: $FILE_SIZE"
    
    # Clean up old backups (keep last 7 days)
    echo -e "${YELLOW}Cleaning up old backups...${NC}"
    find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql.gz" -mtime +7 -delete
    
    # List remaining backups
    echo -e "${GREEN}Current backups:${NC}"
    ls -lht "$BACKUP_DIR"/backup_${DB_NAME}_*.sql.gz 2>/dev/null | head -10
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi

# Optional: Copy to remote storage (uncomment and configure as needed)
# echo -e "${YELLOW}Copying to remote storage...${NC}"
# rsync -avz "$COMPRESSED_FILE" user@remote-server:/path/to/backup/
# aws s3 cp "$COMPRESSED_FILE" s3://your-bucket/database-backups/
