import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Инициализация RBAC данных...');

  // Создание базовых контекстов
  const contexts = [
    {
      id: 'root_context',
      type: 'organization',
      name: 'AI Construction Ecosystem',
      parentId: null,
    },
    {
      id: 'api_gateway_context',
      type: 'service',
      name: 'API Gateway',
      parentId: 'root_context',
    },
    {
      id: 'auth_context',
      type: 'service',
      name: 'Auth Service',
      parentId: 'root_context',
    },
    {
      id: 'documents_context',
      type: 'service',
      name: 'Document Management',
      parentId: 'root_context',
    },
    {
      id: 'ai_operator_context',
      type: 'service',
      name: 'AI Operator Service',
      parentId: 'root_context',
    },
    {
      id: 'vector_db_context',
      type: 'service',
      name: 'Vector DB Service',
      parentId: 'root_context',
    },
    {
      id: 'control_hub_context',
      type: 'service',
      name: 'Control Hub UI',
      parentId: 'root_context',
    },
  ];

  for (const context of contexts) {
    await prisma.roleContext.upsert({
      where: { id: context.id },
      update: {},
      create: context,
    });
  }

  // Конфигурация разрешений для пользовательских ролей
  const roleConfigs = [
    // API Gateway
    {
      serviceName: 'api-gateway',
      role: 'admin',
      permissions: [
        'read',
        'create',
        'update',
        'delete',
        'manage_system',
        'view_logs',
      ],
      customPermissions: [],
    },
    {
      serviceName: 'api-gateway',
      role: 'editor',
      permissions: ['read', 'create', 'update'],
      customPermissions: [],
    },
    {
      serviceName: 'api-gateway',
      role: 'viewer',
      permissions: ['read'],
      customPermissions: [],
    },

    // Auth Service
    {
      serviceName: 'auth-service',
      role: 'admin',
      permissions: [
        'read',
        'create',
        'update',
        'delete',
        'manage_users',
        'manage_roles',
        'manage_settings',
      ],
      customPermissions: [],
    },
    {
      serviceName: 'auth-service',
      role: 'editor',
      permissions: ['read', 'create', 'update'],
      customPermissions: [],
    },
    {
      serviceName: 'auth-service',
      role: 'viewer',
      permissions: ['read'],
      customPermissions: [],
    },

    // Document Management
    {
      serviceName: 'document-management-service',
      role: 'admin',
      permissions: [
        'read',
        'create',
        'update',
        'delete',
        'approve',
        'reject',
        'assign',
        'export',
        'import',
      ],
      customPermissions: [],
    },
    {
      serviceName: 'document-management-service',
      role: 'editor',
      permissions: ['read', 'create', 'update', 'export'],
      customPermissions: [],
    },
    {
      serviceName: 'document-management-service',
      role: 'viewer',
      permissions: ['read'],
      customPermissions: [],
    },

    // AI Operator Service
    {
      serviceName: 'ai-operator-service',
      role: 'ai_operator',
      permissions: [
        'ai_model_deploy',
        'ai_model_train',
        'ai_model_inference',
        'ai_data_access',
        'read',
        'update',
        'manage_system',
      ],
      customPermissions: [],
      aiSpecificConfig: {
        modelAccess: ['*'],
        datasetAccess: ['training-data', 'production-data'],
        resourceLimits: {
          maxConcurrentInferences: 100,
          maxTrainingJobs: 5,
          memoryLimit: '16Gi',
          cpuLimit: '8',
        },
      },
    },
    {
      serviceName: 'ai-operator-service',
      role: 'ai_assistant',
      permissions: [
        'read',
        'ai_model_inference',
        'ai_knowledge_read',
        'ai_content_generation',
        'ai_workflow_automation',
      ],
      customPermissions: [],
      aiSpecificConfig: {
        modelAccess: ['gpt-4', 'assistant-model', 'knowledge-qa'],
        datasetAccess: ['user-context', 'knowledge-base'],
        resourceLimits: {
          maxConcurrentInferences: 50,
          memoryLimit: '8Gi',
          cpuLimit: '4',
        },
      },
    },

    // Vector DB Service
    {
      serviceName: 'vector-db-service',
      role: 'ai_content_manager',
      permissions: [
        'create',
        'read',
        'update',
        'delete',
        'ai_knowledge_write',
        'ai_knowledge_read',
        'ai_vector_search',
        'ai_content_generation',
      ],
      customPermissions: [],
      aiSpecificConfig: {
        modelAccess: ['embedding-model', 'content-generator'],
        datasetAccess: ['knowledge-base', 'documents', 'metadata'],
        resourceLimits: {
          maxConcurrentInferences: 30,
          memoryLimit: '10Gi',
          cpuLimit: '4',
        },
      },
    },
    {
      serviceName: 'vector-db-service',
      role: 'ai_analyzer',
      permissions: [
        'read',
        'ai_document_analysis',
        'ai_predictive_analysis',
        'ai_anomaly_detection',
        'ai_model_inference',
      ],
      customPermissions: [],
      aiSpecificConfig: {
        modelAccess: ['document-analyzer', 'anomaly-detector', 'bim-analyzer'],
        datasetAccess: ['documents', 'historical-data'],
        resourceLimits: {
          maxConcurrentInferences: 20,
          memoryLimit: '12Gi',
          cpuLimit: '6',
        },
      },
    },

    // Control Hub UI
    {
      serviceName: 'control-hub-ui',
      role: 'admin',
      permissions: [
        'read',
        'create',
        'update',
        'delete',
        'manage_system',
        'manage_users',
        'manage_settings',
        'view_logs',
      ],
      customPermissions: [
        'dashboard_access',
        'reports_access',
        'analytics_access',
      ],
    },
    {
      serviceName: 'control-hub-ui',
      role: 'editor',
      permissions: ['read', 'create', 'update', 'export'],
      customPermissions: ['dashboard_access', 'reports_access'],
    },
    {
      serviceName: 'control-hub-ui',
      role: 'viewer',
      permissions: ['read'],
      customPermissions: ['dashboard_access'],
    },
  ];

  for (const config of roleConfigs) {
    await prisma.serviceRoleConfig.upsert({
      where: {
        serviceName_role: {
          serviceName: config.serviceName,
          role: config.role,
        },
      },
      update: {},
      create: {
        serviceName: config.serviceName,
        role: config.role,
        permissions: config.permissions,
        customPermissions: config.customPermissions || [],
        aiSpecificConfig: config.aiSpecificConfig || null,
        isActive: true,
      },
    });
  }

  // Создание демо-пользователя админа
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ez-eco.com' },
    update: {},
    create: {
      id: 'demo_admin_user',
      email: 'admin@ez-eco.com',
      firstName: 'Demo',
      lastName: 'Admin',
      status: 'ACTIVE',
      isAI: false,
    },
  });

  // Назначение роли админа демо-пользователю
  await prisma.userRole.upsert({
    where: {
      userId_contextId_role: {
        userId: adminUser.id,
        contextId: 'root_context',
        role: 'admin',
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      role: 'admin',
      contextId: 'root_context',
      contextType: 'organization',
      grantedBy: 'system',
      isActive: true,
      isAI: false,
    },
  });

  // Создание демо ИИ-агентов
  const aiAgents = [
    {
      id: 'ai_operator_agent',
      email: 'ai-operator@ai.system',
      firstName: 'AI Operator',
      lastName: 'Agent',
      role: 'ai_operator',
      contextId: 'ai_operator_context',
      aiConfig: {
        type: 'ai_operator',
        capabilities: ['model_deployment', 'training', 'inference'],
        endpoint: 'http://ai-operator-service:3010',
      },
    },
    {
      id: 'ai_assistant_agent',
      email: 'ai-assistant@ai.system',
      firstName: 'AI Assistant',
      lastName: 'Agent',
      role: 'ai_assistant',
      contextId: 'root_context',
      aiConfig: {
        type: 'ai_assistant',
        capabilities: [
          'user_assistance',
          'content_generation',
          'workflow_automation',
        ],
        endpoint: 'http://ai-assistant-service:3011',
      },
    },
    {
      id: 'ai_content_manager',
      email: 'ai-content@ai.system',
      firstName: 'AI Content Manager',
      lastName: 'Agent',
      role: 'ai_content_manager',
      contextId: 'vector_db_context',
      aiConfig: {
        type: 'ai_content_manager',
        capabilities: [
          'knowledge_management',
          'vector_search',
          'content_analysis',
        ],
        endpoint: 'http://vector-db-service:3012',
      },
    },
  ];

  for (const agent of aiAgents) {
    const aiUser = await prisma.user.upsert({
      where: { email: agent.email },
      update: {},
      create: {
        id: agent.id,
        email: agent.email,
        firstName: agent.firstName,
        lastName: agent.lastName,
        status: 'ACTIVE',
        isAI: true,
        aiConfig: agent.aiConfig,
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_contextId_role: {
          userId: aiUser.id,
          contextId: agent.contextId,
          role: agent.role,
        },
      },
      update: {},
      create: {
        userId: aiUser.id,
        role: agent.role,
        contextId: agent.contextId,
        contextType: 'service',
        grantedBy: 'system',
        isActive: true,
        isAI: true,
      },
    });
  }

  console.log('✅ RBAC данные успешно инициализированы!');
  console.log('👤 Создан демо-админ: admin@ez-eco.com');
  console.log('🤖 Созданы ИИ-агенты: 3');
  console.log('🛡️ Конфигурации ролей: ' + roleConfigs.length);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка инициализации RBAC данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
