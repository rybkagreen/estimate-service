-- Test data seeding script
-- This script creates sample data for testing purposes

-- Note: This script assumes Prisma will create the actual tables
-- This is just for initial test data that can be used before Prisma migrations

-- Create temporary tables for test data if main tables don't exist yet
DO $$
BEGIN
    -- Create users table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            role VARCHAR(50) DEFAULT 'user',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Create projects table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        CREATE TABLE projects (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            user_id UUID REFERENCES users(id),
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Create files table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'files') THEN
        CREATE TABLE files (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            filename VARCHAR(255) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            mime_type VARCHAR(100),
            size BIGINT,
            bucket VARCHAR(100),
            key VARCHAR(255),
            user_id UUID REFERENCES users(id),
            project_id UUID REFERENCES projects(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END$$;

-- Insert test users (passwords are hashed versions of 'testpass123')
INSERT INTO users (email, username, password_hash, first_name, last_name, role)
VALUES 
    ('admin@test.com', 'testadmin', '$2b$10$YKUZLdHPgF3XQz5uD0bJYe1k8KxDp8M0qfrFjU3DtWoL6l5yPpFPi', 'Test', 'Admin', 'admin'),
    ('user1@test.com', 'testuser1', '$2b$10$YKUZLdHPgF3XQz5uD0bJYe1k8KxDp8M0qfrFjU3DtWoL6l5yPpFPi', 'Test', 'User One', 'user'),
    ('user2@test.com', 'testuser2', '$2b$10$YKUZLdHPgF3XQz5uD0bJYe1k8KxDp8M0qfrFjU3DtWoL6l5yPpFPi', 'Test', 'User Two', 'user'),
    ('guest@test.com', 'testguest', '$2b$10$YKUZLdHPgF3XQz5uD0bJYe1k8KxDp8M0qfrFjU3DtWoL6l5yPpFPi', 'Test', 'Guest', 'guest')
ON CONFLICT (email) DO NOTHING;

-- Insert test projects
INSERT INTO projects (name, description, user_id, status)
SELECT 
    'Test Project ' || generate_series,
    'This is test project number ' || generate_series || ' for testing purposes',
    u.id,
    CASE 
        WHEN generate_series % 3 = 0 THEN 'completed'
        WHEN generate_series % 3 = 1 THEN 'in_progress'
        ELSE 'active'
    END
FROM generate_series(1, 10),
     (SELECT id FROM users WHERE username = 'testuser1' LIMIT 1) u;

-- Insert test files
INSERT INTO files (filename, original_name, mime_type, size, bucket, key, user_id, project_id)
SELECT 
    'test-file-' || p.id || '-' || generate_series || '.pdf',
    'Test Document ' || generate_series || '.pdf',
    'application/pdf',
    1024 * (100 + random() * 900)::INT,
    'test-files',
    'uploads/' || p.id || '/test-file-' || generate_series || '.pdf',
    u.id,
    p.id
FROM generate_series(1, 3),
     (SELECT id FROM users WHERE username = 'testuser1' LIMIT 1) u,
     (SELECT id FROM projects LIMIT 5) p;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);

-- Log successful seeding
DO $$
DECLARE
    user_count INTEGER;
    project_count INTEGER;
    file_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO project_count FROM projects;
    SELECT COUNT(*) INTO file_count FROM files;
    
    RAISE NOTICE 'Test data seeded successfully:';
    RAISE NOTICE '  - Users: %', user_count;
    RAISE NOTICE '  - Projects: %', project_count;
    RAISE NOTICE '  - Files: %', file_count;
END $$;
