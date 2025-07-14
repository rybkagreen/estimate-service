-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'MANAGER', 'EDITOR', 'VIEWER', 'GUEST', 'AI_OPERATOR', 'AI_ASSISTANT', 'AI_ANALYZER', 'AI_CONTENT_MANAGER', 'AI_DOCUMENT_PROCESSOR', 'AI_PREDICTOR', 'AI_SECURITY_ANALYST', 'SERVICE_AUTH', 'SERVICE_NOTIFICATION', 'SERVICE_DOCUMENT', 'SERVICE_AI_OPERATOR', 'SERVICE_MONITORING');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'APPROVE', 'REJECT', 'MANAGE');

-- CreateEnum
CREATE TYPE "PermissionResource" AS ENUM ('USER', 'ROLE', 'PERMISSION', 'ORGANIZATION', 'PROJECT', 'DOCUMENT', 'NOTIFICATION', 'CONSTRUCTION_OBJECT', 'CONTRACT', 'REPORT', 'AI_MODEL', 'AI_TASK', 'SERVICE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ContextType" AS ENUM ('GLOBAL', 'ORGANIZATION', 'PROJECT', 'SERVICE', 'RESOURCE');

-- CreateEnum
CREATE TYPE "AuthLogType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'TOKEN_REFRESH', 'PASSWORD_CHANGE', 'EMAIL_VERIFICATION', 'TWO_FACTOR_ENABLE', 'TWO_FACTOR_DISABLE', 'PERMISSION_DENIED', 'ROLE_ASSIGNED', 'ROLE_REVOKED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'SYSTEM', 'AI_REPORT');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CONTRACT', 'BLUEPRINT', 'SPECIFICATION', 'REPORT', 'CERTIFICATE', 'INVOICE', 'PHOTO', 'VIDEO', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'INFRASTRUCTURE', 'OTHER');

-- CreateEnum
CREATE TYPE "ConstructionObjectType" AS ENUM ('RESIDENTIAL_BUILDING', 'COMMERCIAL_BUILDING', 'INDUSTRIAL_BUILDING', 'INFRASTRUCTURE', 'RENOVATION', 'DEMOLITION');

-- CreateEnum
CREATE TYPE "ConstructionObjectStatus" AS ENUM ('PLANNING', 'DESIGN', 'PERMITS_PENDING', 'CONSTRUCTION', 'QUALITY_CONTROL', 'COMMISSIONING', 'COMPLETED', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WEBHOOK', 'SLACK', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ARRAY');

-- CreateEnum
CREATE TYPE "ComplianceType" AS ENUM ('SAFETY', 'QUALITY', 'ENVIRONMENTAL', 'LEGAL', 'FINANCIAL', 'TECHNICAL');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ComplianceResult" AS ENUM ('PASS', 'FAIL', 'WARNING', 'PENDING');

-- CreateEnum
CREATE TYPE "KnowledgeStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "KnowledgeCategory" AS ENUM ('TECHNICAL', 'PROCESS', 'SAFETY', 'QUALITY', 'REGULATORY', 'BEST_PRACTICE', 'TROUBLESHOOTING', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatar" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "emailVerified" TIMESTAMP(3),
    "phoneVerified" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLogin" TIMESTAMP(3),
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "blockedUntil" TIMESTAMP(3),
    "bio" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "language" TEXT NOT NULL DEFAULT 'ru',
    "theme" TEXT NOT NULL DEFAULT 'system',
    "preferences" JSONB,
    "isAI" BOOLEAN NOT NULL DEFAULT false,
    "aiConfig" JSONB,
    "aiCapabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" TEXT,
    "department" TEXT,
    "experience" INTEGER,
    "specialization" TEXT,
    "certifications" JSONB,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "workPhone" TEXT,
    "personalPhone" TEXT,
    "address" JSONB,
    "notificationPreferences" JSONB,
    "privacySettings" JSONB,
    "workingHours" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" "RoleType" NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentRoleId" TEXT,
    "aiConfig" JSONB,
    "maxConcurrentTasks" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "resource" "PermissionResource" NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "description" TEXT,
    "conditions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "contextType" "ContextType",
    "contextId" TEXT,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role_contexts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "contextType" "ContextType" NOT NULL DEFAULT 'GLOBAL',
    "contextId" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTemporary" BOOLEAN NOT NULL DEFAULT false,
    "roleContextId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_role_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contexts" (
    "id" TEXT NOT NULL,
    "type" "ContextType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_contexts" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "contextType" "ContextType" NOT NULL DEFAULT 'GLOBAL',
    "contextId" TEXT,
    "parentRoleContextId" TEXT,
    "inheritedRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 0,
    "activationConditions" JSONB,
    "restrictions" JSONB,
    "displayName" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isInheritable" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_role_configs" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "serviceType" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "roleContextId" TEXT,
    "allowedResources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deniedResources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deniedActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customPermissions" JSONB,
    "rateLimits" JSONB,
    "resourceQuotas" JSONB,
    "requiredTLS" BOOLEAN NOT NULL DEFAULT true,
    "allowedIPs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blockedIPs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jwtConfig" JSONB,
    "apiKeys" JSONB,
    "serviceTokens" JSONB,
    "enableAuditLog" BOOLEAN NOT NULL DEFAULT true,
    "auditLevel" TEXT NOT NULL DEFAULT 'standard',
    "aiCapabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "maxConcurrentTasks" INTEGER,
    "aiModelAccess" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "externalIntegrations" JSONB,
    "notificationConfig" JSONB,
    "backupConfig" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "configVersion" TEXT NOT NULL DEFAULT '1.0',
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "lastUsed" TIMESTAMP(3),
    "lastConfigUpdate" TIMESTAMP(3),
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_role_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delegations" (
    "id" TEXT NOT NULL,
    "delegatorId" TEXT NOT NULL,
    "delegateeId" TEXT NOT NULL,
    "roleId" TEXT,
    "permissions" JSONB,
    "contextType" "ContextType",
    "contextId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delegations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temporary_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resource" "PermissionResource" NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "contextType" "ContextType",
    "contextId" TEXT,
    "grantedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "maxUsage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temporary_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "settings" JSONB,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "ProjectType" NOT NULL DEFAULT 'RESIDENTIAL',
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "location" VARCHAR(500),
    "regionCode" VARCHAR(10),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "managerId" TEXT,
    "organizationId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimates" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "projectId" TEXT NOT NULL,
    "status" "EstimateStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'RUB',
    "laborCostPerHour" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "overheadPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "profitPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "materialCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "laborCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "overheadCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "profitCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate_items" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "unit" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(15,2) NOT NULL,
    "laborHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fsbtsCode" VARCHAR(50),
    "category" VARCHAR(100),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "groupName" VARCHAR(200),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimate_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fsbts_items" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" TEXT NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "laborCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "machineCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "materialCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "category" VARCHAR(100) NOT NULL,
    "section" VARCHAR(200) NOT NULL,
    "regionCode" VARCHAR(10) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" VARCHAR(20) NOT NULL DEFAULT '1.0',
    "source" VARCHAR(500),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fsbts_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regional_coefficients" (
    "id" TEXT NOT NULL,
    "regionCode" VARCHAR(10) NOT NULL,
    "regionName" VARCHAR(200) NOT NULL,
    "materialCoeff" DECIMAL(6,3) NOT NULL DEFAULT 1.0,
    "laborCoeff" DECIMAL(6,3) NOT NULL DEFAULT 1.0,
    "machineCoeff" DECIMAL(6,3) NOT NULL DEFAULT 1.0,
    "climateZone" VARCHAR(50),
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regional_coefficients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "senderId" TEXT,
    "recipientId" TEXT,
    "channels" TEXT[] DEFAULT ARRAY['web']::TEXT[],
    "metadata" JSONB,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextRetryAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "checksum" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "projectId" TEXT,
    "constructionObjectId" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "parentDocId" TEXT,
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false,
    "aiMetadata" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "contextType" "ContextType",
    "contextId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "AuthLogType" NOT NULL,
    "success" BOOLEAN NOT NULL,
    "email" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_objects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ConstructionObjectType" NOT NULL,
    "status" "ConstructionObjectStatus" NOT NULL DEFAULT 'PLANNING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Russia',
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ownerId" TEXT,
    "managerId" TEXT,
    "contractorId" TEXT,
    "architectId" TEXT,
    "startDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "budgetPlanned" DECIMAL(65,30),
    "budgetActual" DECIMAL(65,30),
    "totalArea" DOUBLE PRECISION,
    "builtArea" DOUBLE PRECISION,
    "floors" INTEGER,
    "height" DOUBLE PRECISION,
    "overallProgress" DOUBLE PRECISION DEFAULT 0,
    "metadata" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "construction_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_phases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "plannedStart" TIMESTAMP(3),
    "plannedEnd" TIMESTAMP(3),
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "constructionObjectId" TEXT NOT NULL,
    "dependencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_permits" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "permitNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "applicationDate" TIMESTAMP(3) NOT NULL,
    "approvalDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "issuingAuthority" TEXT NOT NULL,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "constructionObjectId" TEXT NOT NULL,
    "documentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_inspections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "result" TEXT,
    "inspectorName" TEXT,
    "inspectorLicense" TEXT,
    "inspectorContact" TEXT,
    "findings" TEXT,
    "recommendations" TEXT,
    "deficiencies" JSONB,
    "constructionObjectId" TEXT NOT NULL,
    "documentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_reports" (
    "id" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "reportPeriod" TEXT NOT NULL,
    "overallProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "phaseProgress" JSONB,
    "workCompleted" TEXT,
    "workPlanned" TEXT,
    "issues" JSONB,
    "risks" JSONB,
    "workersOnSite" INTEGER,
    "equipmentOnSite" JSONB,
    "materialsUsed" JSONB,
    "costsThisPeriod" DECIMAL(65,30),
    "costsCumulative" DECIMAL(65,30),
    "weatherConditions" TEXT,
    "workingDays" INTEGER,
    "delayedDays" INTEGER,
    "constructionObjectId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvalDate" TIMESTAMP(3),
    "imageIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_assignments" (
    "id" TEXT NOT NULL,
    "workerName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "specialization" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,
    "email" TEXT,
    "certifications" JSONB,
    "licenses" JSONB,
    "constructionObjectId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_assignments" (
    "id" TEXT NOT NULL,
    "equipmentName" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "model" TEXT,
    "serialNumber" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "hoursUsed" DOUBLE PRECISION DEFAULT 0,
    "fuelConsumption" DOUBLE PRECISION,
    "operatorName" TEXT,
    "operatorLicense" TEXT,
    "constructionObjectId" TEXT NOT NULL,
    "lastMaintenance" TIMESTAMP(3),
    "nextMaintenance" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_usage" (
    "id" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "materialType" TEXT NOT NULL,
    "specification" TEXT,
    "unit" TEXT NOT NULL,
    "quantityPlanned" DOUBLE PRECISION NOT NULL,
    "quantityDelivered" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantityUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantityWasted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitCost" DECIMAL(65,30),
    "totalCost" DECIMAL(65,30),
    "supplierName" TEXT,
    "supplierContact" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "usageDate" TIMESTAMP(3),
    "constructionObjectId" TEXT NOT NULL,
    "qualityCheck" TEXT,
    "qualityNotes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_images" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" TEXT,
    "phase" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "takenAt" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "constructionObjectId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvalDate" TIMESTAMP(3),
    "aiAnalyzed" BOOLEAN NOT NULL DEFAULT false,
    "aiMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tasks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "assignedTo" TEXT,
    "inputData" JSONB NOT NULL,
    "outputData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "modelPath" TEXT,
    "parameters" JSONB,
    "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY['ru', 'en']::TEXT[],
    "accuracy" DOUBLE PRECISION,
    "latency" INTEGER,
    "throughput" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isLoaded" BOOLEAN NOT NULL DEFAULT false,
    "lastUsed" TIMESTAMP(3),
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "SettingType" NOT NULL DEFAULT 'STRING',
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "validation" JSONB,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "channel" "ChannelType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'immediate',
    "filters" JSONB,
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultPriority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "userId" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_notification_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_entries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "category" "KnowledgeCategory" NOT NULL DEFAULT 'OTHER',
    "subCategory" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "KnowledgeStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "projectId" TEXT,
    "attachments" JSONB,
    "externalLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false,
    "aiSummary" TEXT,
    "aiTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confidence" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_feedbacks" (
    "id" TEXT NOT NULL,
    "knowledgeEntryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "suggestion" TEXT,
    "rating" INTEGER NOT NULL,
    "isHelpful" BOOLEAN NOT NULL DEFAULT true,
    "feedbackType" TEXT NOT NULL DEFAULT 'general',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolutionNotes" TEXT,
    "sentiment" TEXT,
    "aiAnalyzed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expert_validations" (
    "id" TEXT NOT NULL,
    "knowledgeEntryId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL,
    "validationScore" DOUBLE PRECISION,
    "comment" TEXT,
    "corrections" JSONB,
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accuracyScore" DOUBLE PRECISION,
    "completenessScore" DOUBLE PRECISION,
    "clarityScore" DOUBLE PRECISION,
    "relevanceScore" DOUBLE PRECISION,
    "expertiseArea" TEXT,
    "yearsExperience" INTEGER,
    "reviewStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewCompletedAt" TIMESTAMP(3),
    "timeSpentMinutes" INTEGER,
    "requiresRevision" BOOLEAN NOT NULL DEFAULT false,
    "revisionDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expert_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data" JSONB NOT NULL,
    "authorId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contextType" TEXT,
    "contextId" TEXT,
    "title" TEXT,
    "summary" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT,
    "sessionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DECIMAL(10,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "functionName" TEXT,
    "functionArgs" JSONB,
    "functionResult" JSONB,
    "metadata" JSONB,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalTokens" INTEGER,
    "processingTime" INTEGER,
    "error" TEXT,
    "errorDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_attachments" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "filePath" TEXT NOT NULL,
    "storageType" TEXT NOT NULL DEFAULT 'local',
    "bucketName" TEXT,
    "objectKey" TEXT,
    "checksum" TEXT NOT NULL,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "accessToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "uploadedById" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "aiMessageId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "processingError" TEXT,
    "isScanned" BOOLEAN NOT NULL DEFAULT false,
    "scanResult" TEXT,
    "scannedAt" TIMESTAMP(3),
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false,
    "aiMetadata" JSONB,
    "aiProcessedAt" TIMESTAMP(3),
    "hasPreview" BOOLEAN NOT NULL DEFAULT false,
    "previewPath" TEXT,
    "thumbnailPath" TEXT,
    "metadata" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_isAI_idx" ON "users"("isAI");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_refreshToken_key" ON "user_sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "user_sessions_token_idx" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "user_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "roles_name_idx" ON "roles"("name");

-- CreateIndex
CREATE INDEX "roles_category_idx" ON "roles"("category");

-- CreateIndex
CREATE INDEX "roles_isActive_idx" ON "roles"("isActive");

-- CreateIndex
CREATE INDEX "permissions_resource_idx" ON "permissions"("resource");

-- CreateIndex
CREATE INDEX "permissions_action_idx" ON "permissions"("action");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_contextType_contextId_key" ON "role_permissions"("roleId", "permissionId", "contextType", "contextId");

-- CreateIndex
CREATE INDEX "user_role_contexts_userId_idx" ON "user_role_contexts"("userId");

-- CreateIndex
CREATE INDEX "user_role_contexts_roleId_idx" ON "user_role_contexts"("roleId");

-- CreateIndex
CREATE INDEX "user_role_contexts_contextType_contextId_idx" ON "user_role_contexts"("contextType", "contextId");

-- CreateIndex
CREATE INDEX "user_role_contexts_expiresAt_idx" ON "user_role_contexts"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_contexts_userId_roleId_contextType_contextId_key" ON "user_role_contexts"("userId", "roleId", "contextType", "contextId");

-- CreateIndex
CREATE INDEX "contexts_type_idx" ON "contexts"("type");

-- CreateIndex
CREATE INDEX "contexts_parentId_idx" ON "contexts"("parentId");

-- CreateIndex
CREATE INDEX "role_contexts_roleId_idx" ON "role_contexts"("roleId");

-- CreateIndex
CREATE INDEX "role_contexts_contextType_contextId_idx" ON "role_contexts"("contextType", "contextId");

-- CreateIndex
CREATE INDEX "role_contexts_priority_idx" ON "role_contexts"("priority");

-- CreateIndex
CREATE INDEX "role_contexts_validFrom_validUntil_idx" ON "role_contexts"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "role_contexts_isActive_idx" ON "role_contexts"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "role_contexts_roleId_contextType_contextId_key" ON "role_contexts"("roleId", "contextType", "contextId");

-- CreateIndex
CREATE INDEX "service_role_configs_serviceName_idx" ON "service_role_configs"("serviceName");

-- CreateIndex
CREATE INDEX "service_role_configs_serviceType_idx" ON "service_role_configs"("serviceType");

-- CreateIndex
CREATE INDEX "service_role_configs_roleId_idx" ON "service_role_configs"("roleId");

-- CreateIndex
CREATE INDEX "service_role_configs_isActive_idx" ON "service_role_configs"("isActive");

-- CreateIndex
CREATE INDEX "service_role_configs_configVersion_idx" ON "service_role_configs"("configVersion");

-- CreateIndex
CREATE INDEX "service_role_configs_validFrom_validUntil_idx" ON "service_role_configs"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "service_role_configs_tags_idx" ON "service_role_configs"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "service_role_configs_serviceName_roleId_serviceVersion_key" ON "service_role_configs"("serviceName", "roleId", "serviceVersion");

-- CreateIndex
CREATE INDEX "delegations_delegatorId_idx" ON "delegations"("delegatorId");

-- CreateIndex
CREATE INDEX "delegations_delegateeId_idx" ON "delegations"("delegateeId");

-- CreateIndex
CREATE INDEX "delegations_expiresAt_idx" ON "delegations"("expiresAt");

-- CreateIndex
CREATE INDEX "temporary_access_userId_idx" ON "temporary_access"("userId");

-- CreateIndex
CREATE INDEX "temporary_access_expiresAt_idx" ON "temporary_access"("expiresAt");

-- CreateIndex
CREATE INDEX "temporary_access_resource_action_idx" ON "temporary_access"("resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_isActive_idx" ON "organizations"("isActive");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_type_idx" ON "projects"("type");

-- CreateIndex
CREATE INDEX "projects_createdById_idx" ON "projects"("createdById");

-- CreateIndex
CREATE INDEX "projects_managerId_idx" ON "projects"("managerId");

-- CreateIndex
CREATE INDEX "projects_regionCode_idx" ON "projects"("regionCode");

-- CreateIndex
CREATE INDEX "projects_createdAt_idx" ON "projects"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "projects_status_type_idx" ON "projects"("status", "type");

-- CreateIndex
CREATE INDEX "projects_createdById_status_idx" ON "projects"("createdById", "status");

-- CreateIndex
CREATE INDEX "estimates_projectId_idx" ON "estimates"("projectId");

-- CreateIndex
CREATE INDEX "estimates_status_idx" ON "estimates"("status");

-- CreateIndex
CREATE INDEX "estimates_createdById_idx" ON "estimates"("createdById");

-- CreateIndex
CREATE INDEX "estimates_approvedById_idx" ON "estimates"("approvedById");

-- CreateIndex
CREATE INDEX "estimates_createdAt_idx" ON "estimates"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "estimates_updatedAt_idx" ON "estimates"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "estimates_projectId_status_idx" ON "estimates"("projectId", "status");

-- CreateIndex
CREATE INDEX "estimates_createdById_status_idx" ON "estimates"("createdById", "status");

-- CreateIndex
CREATE INDEX "estimates_status_approvedAt_idx" ON "estimates"("status", "approvedAt");

-- CreateIndex
CREATE INDEX "estimates_totalCost_idx" ON "estimates"("totalCost" DESC);

-- CreateIndex
CREATE INDEX "estimates_version_parentId_idx" ON "estimates"("version", "parentId");

-- CreateIndex
CREATE INDEX "estimate_items_estimateId_idx" ON "estimate_items"("estimateId");

-- CreateIndex
CREATE INDEX "estimate_items_fsbtsCode_idx" ON "estimate_items"("fsbtsCode");

-- CreateIndex
CREATE INDEX "estimate_items_category_idx" ON "estimate_items"("category");

-- CreateIndex
CREATE INDEX "estimate_items_estimateId_sortOrder_idx" ON "estimate_items"("estimateId", "sortOrder");

-- CreateIndex
CREATE INDEX "estimate_items_groupName_idx" ON "estimate_items"("groupName");

-- CreateIndex
CREATE INDEX "estimate_items_totalPrice_idx" ON "estimate_items"("totalPrice" DESC);

-- CreateIndex
CREATE INDEX "estimate_items_laborHours_idx" ON "estimate_items"("laborHours" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "fsbts_items_code_key" ON "fsbts_items"("code");

-- CreateIndex
CREATE INDEX "fsbts_items_code_idx" ON "fsbts_items"("code");

-- CreateIndex
CREATE INDEX "fsbts_items_category_idx" ON "fsbts_items"("category");

-- CreateIndex
CREATE INDEX "fsbts_items_section_idx" ON "fsbts_items"("section");

-- CreateIndex
CREATE INDEX "fsbts_items_regionCode_idx" ON "fsbts_items"("regionCode");

-- CreateIndex
CREATE INDEX "fsbts_items_isActive_idx" ON "fsbts_items"("isActive");

-- CreateIndex
CREATE INDEX "fsbts_items_validFrom_validTo_idx" ON "fsbts_items"("validFrom", "validTo");

-- CreateIndex
CREATE INDEX "fsbts_items_category_regionCode_idx" ON "fsbts_items"("category", "regionCode");

-- CreateIndex
CREATE INDEX "fsbts_items_basePrice_idx" ON "fsbts_items"("basePrice" DESC);

-- CreateIndex
CREATE INDEX "regional_coefficients_regionCode_idx" ON "regional_coefficients"("regionCode");

-- CreateIndex
CREATE INDEX "regional_coefficients_isActive_idx" ON "regional_coefficients"("isActive");

-- CreateIndex
CREATE INDEX "regional_coefficients_validFrom_validTo_idx" ON "regional_coefficients"("validFrom", "validTo");

-- CreateIndex
CREATE INDEX "regional_coefficients_regionCode_isActive_idx" ON "regional_coefficients"("regionCode", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "regional_coefficients_regionCode_validFrom_key" ON "regional_coefficients"("regionCode", "validFrom");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_scheduledFor_idx" ON "notifications"("scheduledFor");

-- CreateIndex
CREATE INDEX "user_notifications_userId_idx" ON "user_notifications"("userId");

-- CreateIndex
CREATE INDEX "user_notifications_isRead_idx" ON "user_notifications"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "user_notifications_userId_notificationId_key" ON "user_notifications"("userId", "notificationId");

-- CreateIndex
CREATE INDEX "notification_deliveries_notificationId_idx" ON "notification_deliveries"("notificationId");

-- CreateIndex
CREATE INDEX "notification_deliveries_channel_idx" ON "notification_deliveries"("channel");

-- CreateIndex
CREATE INDEX "notification_deliveries_status_idx" ON "notification_deliveries"("status");

-- CreateIndex
CREATE INDEX "notification_deliveries_nextRetryAt_idx" ON "notification_deliveries"("nextRetryAt");

-- CreateIndex
CREATE INDEX "documents_uploadedBy_idx" ON "documents"("uploadedBy");

-- CreateIndex
CREATE INDEX "documents_projectId_idx" ON "documents"("projectId");

-- CreateIndex
CREATE INDEX "documents_type_idx" ON "documents"("type");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_tags_idx" ON "documents"("tags");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "auth_logs_userId_idx" ON "auth_logs"("userId");

-- CreateIndex
CREATE INDEX "auth_logs_type_idx" ON "auth_logs"("type");

-- CreateIndex
CREATE INDEX "auth_logs_success_idx" ON "auth_logs"("success");

-- CreateIndex
CREATE INDEX "auth_logs_createdAt_idx" ON "auth_logs"("createdAt");

-- CreateIndex
CREATE INDEX "auth_logs_ipAddress_idx" ON "auth_logs"("ipAddress");

-- CreateIndex
CREATE INDEX "construction_objects_type_idx" ON "construction_objects"("type");

-- CreateIndex
CREATE INDEX "construction_objects_status_idx" ON "construction_objects"("status");

-- CreateIndex
CREATE INDEX "construction_objects_priority_idx" ON "construction_objects"("priority");

-- CreateIndex
CREATE INDEX "construction_objects_city_idx" ON "construction_objects"("city");

-- CreateIndex
CREATE INDEX "construction_objects_region_idx" ON "construction_objects"("region");

-- CreateIndex
CREATE INDEX "construction_objects_ownerId_idx" ON "construction_objects"("ownerId");

-- CreateIndex
CREATE INDEX "construction_objects_managerId_idx" ON "construction_objects"("managerId");

-- CreateIndex
CREATE INDEX "construction_objects_latitude_longitude_idx" ON "construction_objects"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "construction_phases_constructionObjectId_idx" ON "construction_phases"("constructionObjectId");

-- CreateIndex
CREATE INDEX "construction_phases_status_idx" ON "construction_phases"("status");

-- CreateIndex
CREATE INDEX "construction_phases_order_idx" ON "construction_phases"("order");

-- CreateIndex
CREATE INDEX "construction_permits_constructionObjectId_idx" ON "construction_permits"("constructionObjectId");

-- CreateIndex
CREATE INDEX "construction_permits_status_idx" ON "construction_permits"("status");

-- CreateIndex
CREATE INDEX "construction_permits_type_idx" ON "construction_permits"("type");

-- CreateIndex
CREATE INDEX "construction_inspections_constructionObjectId_idx" ON "construction_inspections"("constructionObjectId");

-- CreateIndex
CREATE INDEX "construction_inspections_status_idx" ON "construction_inspections"("status");

-- CreateIndex
CREATE INDEX "construction_inspections_type_idx" ON "construction_inspections"("type");

-- CreateIndex
CREATE INDEX "construction_inspections_scheduledDate_idx" ON "construction_inspections"("scheduledDate");

-- CreateIndex
CREATE INDEX "progress_reports_constructionObjectId_idx" ON "progress_reports"("constructionObjectId");

-- CreateIndex
CREATE INDEX "progress_reports_reportDate_idx" ON "progress_reports"("reportDate");

-- CreateIndex
CREATE INDEX "progress_reports_reportedBy_idx" ON "progress_reports"("reportedBy");

-- CreateIndex
CREATE INDEX "worker_assignments_constructionObjectId_idx" ON "worker_assignments"("constructionObjectId");

-- CreateIndex
CREATE INDEX "worker_assignments_isActive_idx" ON "worker_assignments"("isActive");

-- CreateIndex
CREATE INDEX "worker_assignments_specialization_idx" ON "worker_assignments"("specialization");

-- CreateIndex
CREATE INDEX "equipment_assignments_constructionObjectId_idx" ON "equipment_assignments"("constructionObjectId");

-- CreateIndex
CREATE INDEX "equipment_assignments_status_idx" ON "equipment_assignments"("status");

-- CreateIndex
CREATE INDEX "equipment_assignments_equipmentType_idx" ON "equipment_assignments"("equipmentType");

-- CreateIndex
CREATE INDEX "material_usage_constructionObjectId_idx" ON "material_usage"("constructionObjectId");

-- CreateIndex
CREATE INDEX "material_usage_materialType_idx" ON "material_usage"("materialType");

-- CreateIndex
CREATE INDEX "material_usage_deliveryDate_idx" ON "material_usage"("deliveryDate");

-- CreateIndex
CREATE INDEX "construction_images_constructionObjectId_idx" ON "construction_images"("constructionObjectId");

-- CreateIndex
CREATE INDEX "construction_images_category_idx" ON "construction_images"("category");

-- CreateIndex
CREATE INDEX "construction_images_uploadedAt_idx" ON "construction_images"("uploadedAt");

-- CreateIndex
CREATE INDEX "construction_images_isApproved_idx" ON "construction_images"("isApproved");

-- CreateIndex
CREATE INDEX "ai_tasks_assignedTo_idx" ON "ai_tasks"("assignedTo");

-- CreateIndex
CREATE INDEX "ai_tasks_status_idx" ON "ai_tasks"("status");

-- CreateIndex
CREATE INDEX "ai_tasks_type_idx" ON "ai_tasks"("type");

-- CreateIndex
CREATE INDEX "ai_tasks_priority_idx" ON "ai_tasks"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "ai_models_name_key" ON "ai_models"("name");

-- CreateIndex
CREATE INDEX "ai_models_name_idx" ON "ai_models"("name");

-- CreateIndex
CREATE INDEX "ai_models_type_idx" ON "ai_models"("type");

-- CreateIndex
CREATE INDEX "ai_models_provider_idx" ON "ai_models"("provider");

-- CreateIndex
CREATE INDEX "ai_models_isActive_idx" ON "ai_models"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "notification_subscriptions_userId_eventType_channel_key" ON "notification_subscriptions"("userId", "eventType", "channel");

-- CreateIndex
CREATE INDEX "notification_templates_type_idx" ON "notification_templates"("type");

-- CreateIndex
CREATE INDEX "notification_templates_isActive_idx" ON "notification_templates"("isActive");

-- CreateIndex
CREATE INDEX "knowledge_entries_status_idx" ON "knowledge_entries"("status");

-- CreateIndex
CREATE INDEX "knowledge_entries_category_idx" ON "knowledge_entries"("category");

-- CreateIndex
CREATE INDEX "knowledge_entries_authorId_idx" ON "knowledge_entries"("authorId");

-- CreateIndex
CREATE INDEX "knowledge_entries_tags_idx" ON "knowledge_entries"("tags");

-- CreateIndex
CREATE INDEX "knowledge_entries_createdAt_idx" ON "knowledge_entries"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_feedbacks_knowledgeEntryId_idx" ON "user_feedbacks"("knowledgeEntryId");

-- CreateIndex
CREATE INDEX "user_feedbacks_userId_idx" ON "user_feedbacks"("userId");

-- CreateIndex
CREATE INDEX "user_feedbacks_isResolved_idx" ON "user_feedbacks"("isResolved");

-- CreateIndex
CREATE INDEX "user_feedbacks_priority_idx" ON "user_feedbacks"("priority");

-- CreateIndex
CREATE INDEX "user_feedbacks_createdAt_idx" ON "user_feedbacks"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "expert_validations_knowledgeEntryId_idx" ON "expert_validations"("knowledgeEntryId");

-- CreateIndex
CREATE INDEX "expert_validations_expertId_idx" ON "expert_validations"("expertId");

-- CreateIndex
CREATE INDEX "expert_validations_isValid_idx" ON "expert_validations"("isValid");

-- CreateIndex
CREATE INDEX "expert_validations_createdAt_idx" ON "expert_validations"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "expert_validations_knowledgeEntryId_expertId_key" ON "expert_validations"("knowledgeEntryId", "expertId");

-- CreateIndex
CREATE INDEX "estimate_templates_authorId_idx" ON "estimate_templates"("authorId");

-- CreateIndex
CREATE INDEX "estimate_templates_isPublic_idx" ON "estimate_templates"("isPublic");

-- CreateIndex
CREATE INDEX "ai_conversations_userId_idx" ON "ai_conversations"("userId");

-- CreateIndex
CREATE INDEX "ai_conversations_contextType_contextId_idx" ON "ai_conversations"("contextType", "contextId");

-- CreateIndex
CREATE INDEX "ai_conversations_sessionId_idx" ON "ai_conversations"("sessionId");

-- CreateIndex
CREATE INDEX "ai_conversations_isActive_idx" ON "ai_conversations"("isActive");

-- CreateIndex
CREATE INDEX "ai_conversations_createdAt_idx" ON "ai_conversations"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ai_messages_conversationId_idx" ON "ai_messages"("conversationId");

-- CreateIndex
CREATE INDEX "ai_messages_role_idx" ON "ai_messages"("role");

-- CreateIndex
CREATE INDEX "ai_messages_createdAt_idx" ON "ai_messages"("createdAt");

-- CreateIndex
CREATE INDEX "file_attachments_uploadedById_idx" ON "file_attachments"("uploadedById");

-- CreateIndex
CREATE INDEX "file_attachments_entityType_entityId_idx" ON "file_attachments"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "file_attachments_aiMessageId_idx" ON "file_attachments"("aiMessageId");

-- CreateIndex
CREATE INDEX "file_attachments_status_idx" ON "file_attachments"("status");

-- CreateIndex
CREATE INDEX "file_attachments_mimeType_idx" ON "file_attachments"("mimeType");

-- CreateIndex
CREATE INDEX "file_attachments_createdAt_idx" ON "file_attachments"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "file_attachments_deletedAt_idx" ON "file_attachments"("deletedAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_parentRoleId_fkey" FOREIGN KEY ("parentRoleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_contexts" ADD CONSTRAINT "user_role_contexts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_contexts" ADD CONSTRAINT "user_role_contexts_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_contexts" ADD CONSTRAINT "user_role_contexts_roleContextId_fkey" FOREIGN KEY ("roleContextId") REFERENCES "role_contexts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contexts" ADD CONSTRAINT "contexts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "contexts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_contexts" ADD CONSTRAINT "role_contexts_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_contexts" ADD CONSTRAINT "role_contexts_parentRoleContextId_fkey" FOREIGN KEY ("parentRoleContextId") REFERENCES "role_contexts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_role_configs" ADD CONSTRAINT "service_role_configs_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_role_configs" ADD CONSTRAINT "service_role_configs_roleContextId_fkey" FOREIGN KEY ("roleContextId") REFERENCES "role_contexts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_delegatorId_fkey" FOREIGN KEY ("delegatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_delegateeId_fkey" FOREIGN KEY ("delegateeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temporary_access" ADD CONSTRAINT "temporary_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "estimates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "estimates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_constructionObjectId_fkey" FOREIGN KEY ("constructionObjectId") REFERENCES "construction_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_parentDocId_fkey" FOREIGN KEY ("parentDocId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_logs" ADD CONSTRAINT "auth_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_phases" ADD CONSTRAINT "construction_phases_constructionObjectId_fkey" FOREIGN KEY ("constructionObjectId") REFERENCES "construction_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_permits" ADD CONSTRAINT "construction_permits_constructionObjectId_fkey" FOREIGN KEY ("constructionObjectId") REFERENCES "construction_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_inspections" ADD CONSTRAINT "construction_inspections_constructionObjectId_fkey" FOREIGN KEY ("constructionObjectId") REFERENCES "construction_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_reports" ADD CONSTRAINT "progress_reports_constructionObjectId_fkey" FOREIGN KEY ("constructionObjectId") REFERENCES "construction_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_assignments" ADD CONSTRAINT "worker_assignments_constructionObjectId_fkey" FOREIGN KEY ("constructionObjectId") REFERENCES "construction_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignments" ADD CONSTRAINT "equipment_assignments_constructionObjectId_fkey" FOREIGN KEY ("constructionObjectId") REFERENCES "construction_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_usage" ADD CONSTRAINT "material_usage_constructionObjectId_fkey" FOREIGN KEY ("constructionObjectId") REFERENCES "construction_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_images" ADD CONSTRAINT "construction_images_constructionObjectId_fkey" FOREIGN KEY ("constructionObjectId") REFERENCES "construction_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_subscriptions" ADD CONSTRAINT "notification_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_subscriptions" ADD CONSTRAINT "user_notification_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_entries" ADD CONSTRAINT "knowledge_entries_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_entries" ADD CONSTRAINT "knowledge_entries_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "knowledge_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_entries" ADD CONSTRAINT "knowledge_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_feedbacks" ADD CONSTRAINT "user_feedbacks_knowledgeEntryId_fkey" FOREIGN KEY ("knowledgeEntryId") REFERENCES "knowledge_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_feedbacks" ADD CONSTRAINT "user_feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expert_validations" ADD CONSTRAINT "expert_validations_knowledgeEntryId_fkey" FOREIGN KEY ("knowledgeEntryId") REFERENCES "knowledge_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expert_validations" ADD CONSTRAINT "expert_validations_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_templates" ADD CONSTRAINT "estimate_templates_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_aiMessageId_fkey" FOREIGN KEY ("aiMessageId") REFERENCES "ai_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
