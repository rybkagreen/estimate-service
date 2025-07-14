-- Database initialization script for test environment
-- This script runs automatically when PostgreSQL container starts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'user', 'guest');
    END IF;
END$$;

-- Create test schema
CREATE SCHEMA IF NOT EXISTS test_schema;

-- Set search path
SET search_path TO public, test_schema;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO testuser;
GRANT ALL PRIVILEGES ON SCHEMA test_schema TO testuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO testuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO testuser;

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'Database schema initialized successfully';
END $$;
