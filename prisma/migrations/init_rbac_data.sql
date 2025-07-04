-- Миграция для инициализации базовых данных RBAC
-- Создание базовых контекстов и конфигураций ролей

-- Вставка базовых контекстов
INSERT INTO "role_contexts" (id, type, name, "parentId", "createdAt", "updatedAt") VALUES
  ('root_context', 'organization', 'AI Construction Ecosystem', NULL, NOW(), NOW()),
  ('api_gateway_context', 'service', 'API Gateway', 'root_context', NOW(), NOW()),
  ('auth_context', 'service', 'Auth Service', 'root_context', NOW(), NOW()),
  ('documents_context', 'service', 'Document Management', 'root_context', NOW(), NOW()),
  ('ai_operator_context', 'service', 'AI Operator Service', 'root_context', NOW(), NOW()),
  ('vector_db_context', 'service', 'Vector DB Service', 'root_context', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Конфигурация разрешений для пользовательских ролей
INSERT INTO "service_role_configs" (id, "serviceName", role, permissions, "customPermissions", "aiSpecificConfig", "isActive", "createdAt", "updatedAt") VALUES
  -- API Gateway
  (gen_random_uuid(), 'api-gateway', 'admin', ARRAY['read', 'create', 'update', 'delete', 'manage_system', 'view_logs'], ARRAY[]::text[], NULL, true, NOW(), NOW()),
  (gen_random_uuid(), 'api-gateway', 'editor', ARRAY['read', 'create', 'update'], ARRAY[]::text[], NULL, true, NOW(), NOW()),
  (gen_random_uuid(), 'api-gateway', 'viewer', ARRAY['read'], ARRAY[]::text[], NULL, true, NOW(), NOW()),

  -- Auth Service
  (gen_random_uuid(), 'auth-service', 'admin', ARRAY['read', 'create', 'update', 'delete', 'manage_users', 'manage_roles', 'manage_settings'], ARRAY[]::text[], NULL, true, NOW(), NOW()),
  (gen_random_uuid(), 'auth-service', 'editor', ARRAY['read', 'create', 'update'], ARRAY[]::text[], NULL, true, NOW(), NOW()),
  (gen_random_uuid(), 'auth-service', 'viewer', ARRAY['read'], ARRAY[]::text[], NULL, true, NOW(), NOW()),

  -- Document Management
  (gen_random_uuid(), 'document-management-service', 'admin', ARRAY['read', 'create', 'update', 'delete', 'approve', 'reject', 'assign', 'export', 'import'], ARRAY[]::text[], NULL, true, NOW(), NOW()),
  (gen_random_uuid(), 'document-management-service', 'editor', ARRAY['read', 'create', 'update', 'export'], ARRAY[]::text[], NULL, true, NOW(), NOW()),
  (gen_random_uuid(), 'document-management-service', 'viewer', ARRAY['read'], ARRAY[]::text[], NULL, true, NOW(), NOW()),

  -- AI Operator Service
  (gen_random_uuid(), 'ai-operator-service', 'ai_operator', ARRAY['ai_model_deploy', 'ai_model_train', 'ai_model_inference', 'ai_data_access', 'read', 'update', 'manage_system'], ARRAY[]::text[], '{"modelAccess": ["*"], "datasetAccess": ["training-data", "production-data"], "resourceLimits": {"maxConcurrentInferences": 100, "maxTrainingJobs": 5, "memoryLimit": "16Gi", "cpuLimit": "8"}}', true, NOW(), NOW()),
  (gen_random_uuid(), 'ai-operator-service', 'ai_assistant', ARRAY['read', 'ai_model_inference', 'ai_knowledge_read', 'ai_content_generation', 'ai_workflow_automation'], ARRAY[]::text[], '{"modelAccess": ["gpt-4", "assistant-model", "knowledge-qa"], "datasetAccess": ["user-context", "knowledge-base"], "resourceLimits": {"maxConcurrentInferences": 50, "memoryLimit": "8Gi", "cpuLimit": "4"}}', true, NOW(), NOW()),

  -- Vector DB Service
  (gen_random_uuid(), 'vector-db-service', 'ai_content_manager', ARRAY['create', 'read', 'update', 'delete', 'ai_knowledge_write', 'ai_knowledge_read', 'ai_vector_search', 'ai_content_generation'], ARRAY[]::text[], '{"modelAccess": ["embedding-model", "content-generator"], "datasetAccess": ["knowledge-base", "documents", "metadata"], "resourceLimits": {"maxConcurrentInferences": 30, "memoryLimit": "10Gi", "cpuLimit": "4"}}', true, NOW(), NOW()),
  (gen_random_uuid(), 'vector-db-service', 'ai_analyzer', ARRAY['read', 'ai_document_analysis', 'ai_predictive_analysis', 'ai_anomaly_detection', 'ai_model_inference'], ARRAY[]::text[], '{"modelAccess": ["document-analyzer", "anomaly-detector", "bim-analyzer"], "datasetAccess": ["documents", "historical-data"], "resourceLimits": {"maxConcurrentInferences": 20, "memoryLimit": "12Gi", "cpuLimit": "6"}}', true, NOW(), NOW()),

  -- Control Hub UI
  (gen_random_uuid(), 'control-hub-ui', 'admin', ARRAY['read', 'create', 'update', 'delete', 'manage_system', 'manage_users', 'manage_settings', 'view_logs'], ARRAY['dashboard_access', 'reports_access', 'analytics_access'], NULL, true, NOW(), NOW()),
  (gen_random_uuid(), 'control-hub-ui', 'editor', ARRAY['read', 'create', 'update', 'export'], ARRAY['dashboard_access', 'reports_access'], NULL, true, NOW(), NOW()),
  (gen_random_uuid(), 'control-hub-ui', 'viewer', ARRAY['read'], ARRAY['dashboard_access'], NULL, true, NOW(), NOW())
ON CONFLICT ("serviceName", role) DO NOTHING;

-- Создание демо-пользователя админа
INSERT INTO "users" (id, email, "firstName", "lastName", "isActive", "isAI", "createdAt", "updatedAt") VALUES
  ('demo_admin_user', 'admin@ez-eco.com', 'Demo', 'Admin', true, false, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Назначение роли админа демо-пользователю
INSERT INTO "user_roles" (id, "userId", role, "contextId", "contextType", "grantedAt", "grantedBy", "isActive", "isAI") VALUES
  (gen_random_uuid(), 'demo_admin_user', 'admin', 'root_context', 'organization', NOW(), 'system', true, false)
ON CONFLICT ("userId", "contextId", role) DO NOTHING;

-- Создание демо ИИ-агентов
INSERT INTO "users" (id, email, "firstName", "lastName", "isActive", "isAI", "aiConfig", "createdAt", "updatedAt") VALUES
  ('ai_operator_agent', 'ai-operator@ai.system', 'AI Operator', 'Agent', true, true, '{"type": "ai_operator", "capabilities": ["model_deployment", "training", "inference"], "endpoint": "http://ai-operator-service:3010"}', NOW(), NOW()),
  ('ai_assistant_agent', 'ai-assistant@ai.system', 'AI Assistant', 'Agent', true, true, '{"type": "ai_assistant", "capabilities": ["user_assistance", "content_generation", "workflow_automation"], "endpoint": "http://ai-assistant-service:3011"}', NOW(), NOW()),
  ('ai_content_manager', 'ai-content@ai.system', 'AI Content Manager', 'Agent', true, true, '{"type": "ai_content_manager", "capabilities": ["knowledge_management", "vector_search", "content_analysis"], "endpoint": "http://vector-db-service:3012"}', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Назначение ролей ИИ-агентам
INSERT INTO "user_roles" (id, "userId", role, "contextId", "contextType", "grantedAt", "grantedBy", "isActive", "isAI") VALUES
  (gen_random_uuid(), 'ai_operator_agent', 'ai_operator', 'ai_operator_context', 'service', NOW(), 'system', true, true),
  (gen_random_uuid(), 'ai_assistant_agent', 'ai_assistant', 'root_context', 'organization', NOW(), 'system', true, true),
  (gen_random_uuid(), 'ai_content_manager', 'ai_content_manager', 'vector_db_context', 'service', NOW(), 'system', true, true)
ON CONFLICT ("userId", "contextId", role) DO NOTHING;
