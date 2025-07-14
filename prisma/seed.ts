
import { PrismaClient, RoleType, PermissionResource, PermissionAction, ContextType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Store global variables
let adminUser: any;
let roles: any = {};

async function main() {
  console.log('🌱 Seeding unified RBAC system...');
  
  // Create permissions
  const permissions = await createPermissions();
  console.log('✅ Permissions created');
  
  // Create roles
  roles = await createRoles();
  console.log('✅ Roles created');
  
  // Assign permissions to roles
  await assignPermissionsToRoles(roles, permissions);
  console.log('✅ Permissions assigned to roles');
  
  // Create default admin user
  adminUser = await createAdminUser();
  console.log('✅ Admin user created');
  
  // Assign admin role to user
  await assignRoleToUser(adminUser.id, roles.admin.id);
  console.log('✅ Admin role assigned');
  
  // Create AI agents
  const aiAgents = await createAIAgents();
  console.log('✅ AI agents created');
  
  // Assign AI roles
  await assignAIRoles(aiAgents, roles);
  console.log('✅ AI roles assigned');
  
  // Create Sample Organization
  const org = await createSampleOrganization();
  console.log('✅ Sample organization created');

  // Create Sample Projects and Estimates
  await createSampleProjectsAndEstimates(adminUser, org);
  console.log('✅ Sample projects and estimates created');

  // Create Sample Users
  await createSampleUsers(roles, org);
  console.log('✅ Sample users created');

  // Create Sample AI Conversations
  await createSampleAIConversations(adminUser);
  console.log('✅ Sample AI conversations created');

  // Create FSBTS Sample Data
  await createFSBTSSampleData();
  console.log('✅ FSBTS sample data created');

  // Create Regional Coefficients
  await createRegionalCoefficients();
  console.log('✅ Regional coefficients created');

  console.log('🎉 Seeding completed successfully!');
}

async function createPermissions() {
  const permissions: Record<string, any> = {};
  
  const permissionData = [
    // User management
    { resource: PermissionResource.USER, action: PermissionAction.CREATE },
    { resource: PermissionResource.USER, action: PermissionAction.READ },
    { resource: PermissionResource.USER, action: PermissionAction.UPDATE },
    { resource: PermissionResource.USER, action: PermissionAction.DELETE },
    
    // Role management
    { resource: PermissionResource.ROLE, action: PermissionAction.CREATE },
    { resource: PermissionResource.ROLE, action: PermissionAction.READ },
    { resource: PermissionResource.ROLE, action: PermissionAction.UPDATE },
    { resource: PermissionResource.ROLE, action: PermissionAction.DELETE },
    
    // Document management
    { resource: PermissionResource.DOCUMENT, action: PermissionAction.CREATE },
    { resource: PermissionResource.DOCUMENT, action: PermissionAction.READ },
    { resource: PermissionResource.DOCUMENT, action: PermissionAction.UPDATE },
    { resource: PermissionResource.DOCUMENT, action: PermissionAction.DELETE },
    
    // AI specific permissions
    { resource: PermissionResource.AI_MODEL, action: PermissionAction.READ },
    { resource: PermissionResource.AI_MODEL, action: PermissionAction.EXECUTE },
    { resource: PermissionResource.AI_TASK, action: PermissionAction.CREATE },
    { resource: PermissionResource.AI_TASK, action: PermissionAction.READ },
    { resource: PermissionResource.AI_TASK, action: PermissionAction.UPDATE },
  ];
  
  for (const perm of permissionData) {
    const permission = await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: {
        resource: perm.resource,
        action: perm.action,
        description: `${perm.action} permission for ${perm.resource}`
      }
    });
    
    const key = `${perm.resource}_${perm.action}`.toLowerCase();
    permissions[key] = permission;
  }
  
  return permissions;
}

async function createRoles() {
  const roles: Record<string, any> = {};
  
  const roleData = [
    {
      name: RoleType.ADMIN,
      displayName: 'Administrator',
      description: 'Full system access',
      category: 'admin',
      isSystemRole: true
    },
    {
      name: RoleType.MANAGER,
      displayName: 'Manager',
      description: 'Project and team management',
      category: 'user'
    },
    {
      name: RoleType.EDITOR,
      displayName: 'Editor',
      description: 'Content creation and editing',
      category: 'user'
    },
    {
      name: RoleType.VIEWER,
      displayName: 'Viewer',
      description: 'Read-only access',
      category: 'user'
    },
    {
      name: RoleType.AI_OPERATOR,
      displayName: 'AI Operator',
      description: 'AI system management and operation',
      category: 'ai',
      isSystemRole: true,
      aiConfig: {
        capabilities: ['document_analysis', 'task_management'],
        maxConcurrentTasks: 10
      }
    },
    {
      name: RoleType.AI_ASSISTANT,
      displayName: 'AI Assistant',
      description: 'General AI assistance and support',
      category: 'ai',
      isSystemRole: true,
      aiConfig: {
        capabilities: ['general_assistance', 'data_processing'],
        maxConcurrentTasks: 5
      }
    }
  ];
  
  for (const roleInfo of roleData) {
    const role = await prisma.role.upsert({
      where: { name: roleInfo.name },
      update: {},
      create: roleInfo
    });
    
    roles[roleInfo.name.toLowerCase()] = role;
  }
  
  return roles;
}

async function assignPermissionsToRoles(roles: Record<string, any>, permissions: Record<string, any>) {
  // Admin gets all permissions
  const allPermissions = Object.values(permissions);
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId_contextType_contextId: {
          roleId: roles.admin.id,
          permissionId: permission.id,
          contextType: ContextType.GLOBAL,
          contextId: ''
        }
      },
      update: {},
      create: {
        roleId: roles.admin.id,
        permissionId: permission.id,
        contextType: ContextType.GLOBAL,
        contextId: ''
      }
    });
  }
}

async function createAdminUser() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  return await prisma.user.upsert({
    where: { email: 'admin@ai-construction.com' },
    update: {},
    create: {
      email: 'admin@ai-construction.com',
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      passwordHash: hashedPassword,
      emailVerified: new Date(),
      status: 'ACTIVE'
    }
  });
}

async function createAIAgents() {
  const agents = [];
  
  const agentData = [
    {
      email: 'ai-operator@ai-construction.com',
      username: 'ai-operator',
      firstName: 'AI',
      lastName: 'Operator',
      isAI: true,
      aiConfig: {
        type: 'operator',
        capabilities: ['document_processing', 'task_management', 'system_monitoring'],
        version: '1.0.0'
      }
    },
    {
      email: 'ai-assistant@ai-construction.com',
      username: 'ai-assistant',
      firstName: 'AI',
      lastName: 'Assistant',
      isAI: true,
      aiConfig: {
        type: 'assistant',
        capabilities: ['user_support', 'data_analysis', 'reporting'],
        version: '1.0.0'
      }
    }
  ];
  
  for (const agentInfo of agentData) {
    const agent = await prisma.user.upsert({
      where: { email: agentInfo.email },
      update: {},
      create: {
        ...agentInfo,
        status: 'ACTIVE',
        emailVerified: new Date()
      }
    });
    
    agents.push(agent);
  }
  
  return agents;
}

async function assignRoleToUser(userId: string, roleId: string) {
  return await prisma.userRoleContext.upsert({
    where: {
      userId_roleId_contextType_contextId: {
        userId,
        roleId,
        contextType: ContextType.GLOBAL,
        contextId: ''
      }
    },
    update: {},
    create: {
      userId,
      roleId,
      contextType: ContextType.GLOBAL,
      contextId: '',
      grantedBy: userId // Self-granted for initial setup
    }
  });
}

async function createSampleOrganization() {
  return await prisma.organization.create({
    data: {
      name: 'Sample Construction Company',
      slug: 'sample-construction',
      description: 'A leading construction company specializing in commercial and residential projects',
      website: 'https://sample-construction.com'
    }
  });
}

async function createSampleProjectsAndEstimates(adminUser: any, org: any) {
  // Create projects with different statuses
  const projects = [
    {
      name: 'Office Building Renovation',
      description: 'Complete renovation of a 5-story office building',
      type: 'COMMERCIAL' as const,
      status: 'ACTIVE' as const,
      location: 'Moscow, Russia',
      regionCode: 'MSK',
      organizationId: org.id,
      createdById: adminUser.id
    },
    {
      name: 'Residential Complex Phase 1',
      description: 'Construction of 200-unit residential complex',
      type: 'RESIDENTIAL' as const,
      status: 'PLANNING' as const,
      location: 'St. Petersburg, Russia',
      regionCode: 'SPB',
      organizationId: org.id,
      createdById: adminUser.id
    }
  ];

  for (const projectData of projects) {
    const project = await prisma.project.create({
      data: {
        ...projectData,
        estimates: {
          create: [
            {
              name: 'Initial Cost Estimate',
              description: 'Preliminary cost estimation based on FSBTS-2022',
              status: 'DRAFT',
              currency: 'RUB',
              laborCostPerHour: 1500,
              overheadPercentage: 15,
              profitPercentage: 10,
              createdById: adminUser.id,
              items: {
                create: [
                  {
                    name: 'Earthworks and Foundation',
                    description: 'Site preparation and foundation construction',
                    unit: 'm3',
                    quantity: 850,
                    unitPrice: 2500,
                    totalPrice: 2125000,
                    laborHours: 340,
                    category: 'Foundation',
                    fsbtsCode: 'E01-01-001-01',
                    sortOrder: 1
                  },
                  {
                    name: 'Concrete Frame Construction',
                    description: 'Reinforced concrete columns and beams',
                    unit: 'm3',
                    quantity: 450,
                    unitPrice: 8500,
                    totalPrice: 3825000,
                    laborHours: 900,
                    category: 'Structural',
                    fsbtsCode: 'E06-01-001-01',
                    sortOrder: 2
                  },
                  {
                    name: 'Brick Masonry Work',
                    description: 'External and internal walls',
                    unit: 'm2',
                    quantity: 2400,
                    unitPrice: 3200,
                    totalPrice: 7680000,
                    laborHours: 1920,
                    category: 'Masonry',
                    fsbtsCode: 'E08-01-002-01',
                    sortOrder: 3
                  },
                  {
                    name: 'Roofing Installation',
                    description: 'Metal roofing with insulation',
                    unit: 'm2',
                    quantity: 1200,
                    unitPrice: 4500,
                    totalPrice: 5400000,
                    laborHours: 480,
                    category: 'Roofing',
                    fsbtsCode: 'E12-01-001-02',
                    sortOrder: 4
                  },
                  {
                    name: 'Interior Finishing',
                    description: 'Plastering, painting, and flooring',
                    unit: 'm2',
                    quantity: 5000,
                    unitPrice: 2800,
                    totalPrice: 14000000,
                    laborHours: 2500,
                    category: 'Finishing',
                    fsbtsCode: 'E15-01-001-01',
                    sortOrder: 5
                  }
                ]
              }
            }
          ]
        }
      }
    });
    console.log(`Project "${project.name}" created with estimate`);
  }
}

async function createSampleUsers(roles: any, org: any) {
  const hashedPassword = await bcrypt.hash('user123', 10);

  const users = [
    { 
      email: 'manager@sample-construction.com', 
      username: 'project_manager', 
      firstName: 'Ivan', 
      lastName: 'Petrov', 
      phone: '+7 495 123-45-67',
      passwordHash: hashedPassword,
      role: 'manager',
      organizationId: org.id
    },
    { 
      email: 'estimator@sample-construction.com', 
      username: 'chief_estimator', 
      firstName: 'Maria', 
      lastName: 'Ivanova',
      phone: '+7 495 123-45-68', 
      passwordHash: hashedPassword,
      role: 'editor',
      organizationId: org.id
    },
    { 
      email: 'viewer@sample-construction.com', 
      username: 'accountant', 
      firstName: 'Sergey', 
      lastName: 'Sidorov',
      phone: '+7 495 123-45-69', 
      passwordHash: hashedPassword,
      role: 'viewer',
      organizationId: org.id
    }
  ];

  for (const userData of users) {
    const { role, ...userCreateData } = userData;
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userCreateData,
        emailVerified: new Date(),
        status: 'ACTIVE',
        profile: {
          create: {
            position: role === 'manager' ? 'Project Manager' : role === 'editor' ? 'Chief Estimator' : 'Accountant',
            department: role === 'manager' ? 'Project Management' : role === 'editor' ? 'Estimation Department' : 'Finance',
            experience: role === 'manager' ? 10 : role === 'editor' ? 8 : 5,
            skills: role === 'editor' ? ['Cost Estimation', 'FSBTS', 'Grand Smeta', 'AutoCAD'] : []
          }
        }
      }
    });
    await assignRoleToUser(user.id, roles[role].id);
    console.log(`User ${user.username} created with role ${role}`);
  }
}

async function createSampleAIConversations(adminUser: any) {
  // Create multiple AI conversations with different contexts
  const conversations = [
    {
      userId: adminUser.id,
      contextType: 'estimate',
      title: 'Cost Optimization Discussion',
      modelName: 'deepseek-chat',
      modelVersion: 'v1',
      messages: [
        {
          role: 'user',
          content: 'How can I optimize costs for foundation work in my current estimate?'
        },
        {
          role: 'assistant',
          content: 'To optimize foundation work costs, consider these strategies:\n\n1. **Material Selection**: Review alternative foundation types (pile vs. strip foundation) based on soil conditions\n2. **Bulk Purchasing**: Negotiate volume discounts for concrete and rebar\n3. **Seasonal Timing**: Schedule work during optimal weather to avoid delays\n4. **Local Suppliers**: Use regional suppliers to reduce transportation costs\n5. **Work Efficiency**: Implement proper planning to minimize labor hours\n\nBased on FSBTS-2022, you might save 10-15% by optimizing these factors.'
        },
        {
          role: 'user',
          content: 'What about using prefabricated foundation elements?'
        },
        {
          role: 'assistant',
          content: 'Prefabricated foundation elements can be cost-effective:\n\n**Advantages**:\n- Reduced labor time by 30-40%\n- Better quality control\n- Weather-independent installation\n- Lower overall project timeline\n\n**Cost Comparison** (per m3):\n- Traditional: 8,500-9,500 RUB\n- Prefabricated: 7,800-8,800 RUB\n\n**Considerations**:\n- Higher transportation costs\n- Need for crane equipment\n- Limited design flexibility\n\nFor projects over 500m3, prefabricated elements typically provide 8-12% cost savings.'
        }
      ]
    },
    {
      userId: adminUser.id,
      contextType: 'general',
      title: 'FSBTS Code Inquiry',
      modelName: 'deepseek-chat',
      modelVersion: 'v1',
      messages: [
        {
          role: 'user',
          content: 'Explain the FSBTS code structure and how to use it in estimates'
        },
        {
          role: 'assistant',
          content: 'FSBTS (Federal Reference Base of Construction Prices) uses a hierarchical coding system:\n\n**Code Structure (E##-##-###-##)**:\n- **E##**: Main section (e.g., E01 - Earthworks)\n- **##**: Subsection (e.g., 01 - Excavation)\n- **###**: Work type (e.g., 001 - Manual excavation)\n- **##**: Specification (e.g., 01 - In normal soil)\n\n**Common Sections**:\n- E01-E04: Earthworks and foundations\n- E05-E09: Structural works\n- E10-E14: Roofing and facades\n- E15-E19: Interior finishing\n- E20-E24: Engineering systems\n\n**Usage in Estimates**:\n1. Identify the work type\n2. Find the appropriate FSBTS code\n3. Apply base price from the database\n4. Apply regional coefficients\n5. Calculate with current market adjustments\n\nThis ensures standardized and accurate cost estimation across projects.'
        }
      ]
    }
  ];

  for (const convData of conversations) {
    const { messages, ...conversationData } = convData;
    const conversation = await prisma.aIConversation.create({
      data: {
        ...conversationData,
        totalTokens: messages.reduce((sum, m) => sum + m.content.length, 0),
        messages: {
          create: messages.map((msg, index) => ({
            ...msg,
            totalTokens: msg.content.length,
            processingTime: index === 0 ? 0 : Math.floor(Math.random() * 2000) + 500
          }))
        }
      }
    });
    console.log(`AI Conversation "${conversation.title || 'Untitled'}" created`);
  }
}

async function createFSBTSSampleData() {
  const fsbtsItems = [
    {
      code: 'E01-01-001-01',
      name: 'Разработка грунта вручную в траншеях глубиной до 2 м без креплений',
      unit: 'м3',
      basePrice: 2500,
      laborCost: 2200,
      machineCost: 0,
      materialCost: 300,
      category: 'Земляные работы',
      section: 'Разработка грунта',
      regionCode: 'MSK',
      validFrom: new Date('2022-01-01')
    },
    {
      code: 'E06-01-001-01',
      name: 'Устройство бетонной подготовки',
      unit: 'м3',
      basePrice: 8500,
      laborCost: 1500,
      machineCost: 500,
      materialCost: 6500,
      category: 'Бетонные работы',
      section: 'Монолитные конструкции',
      regionCode: 'MSK',
      validFrom: new Date('2022-01-01')
    },
    {
      code: 'E08-01-002-01',
      name: 'Кладка стен из кирпича',
      unit: 'м3',
      basePrice: 3200,
      laborCost: 1800,
      machineCost: 200,
      materialCost: 1200,
      category: 'Каменные работы',
      section: 'Кирпичная кладка',
      regionCode: 'MSK',
      validFrom: new Date('2022-01-01')
    },
    {
      code: 'E12-01-001-02',
      name: 'Устройство кровель из металлочерепицы',
      unit: 'м2',
      basePrice: 4500,
      laborCost: 800,
      machineCost: 200,
      materialCost: 3500,
      category: 'Кровельные работы',
      section: 'Металлические кровли',
      regionCode: 'MSK',
      validFrom: new Date('2022-01-01')
    },
    {
      code: 'E15-01-001-01',
      name: 'Штукатурка стен цементно-песчаным раствором',
      unit: 'м2',
      basePrice: 650,
      laborCost: 400,
      machineCost: 50,
      materialCost: 200,
      category: 'Отделочные работы',
      section: 'Штукатурные работы',
      regionCode: 'MSK',
      validFrom: new Date('2022-01-01')
    }
  ];

  for (const item of fsbtsItems) {
    await prisma.fSBTSItem.create({
      data: item
    });
  }
  console.log(`Created ${fsbtsItems.length} FSBTS reference items`);
}

async function createRegionalCoefficients() {
  const coefficients = [
    {
      regionCode: 'MSK',
      regionName: 'Moscow',
      materialCoeff: 1.15,
      laborCoeff: 1.25,
      machineCoeff: 1.10,
      climateZone: 'Temperate',
      validFrom: new Date('2022-01-01')
    },
    {
      regionCode: 'SPB',
      regionName: 'St. Petersburg',
      materialCoeff: 1.12,
      laborCoeff: 1.20,
      machineCoeff: 1.08,
      climateZone: 'Temperate',
      validFrom: new Date('2022-01-01')
    },
    {
      regionCode: 'NSK',
      regionName: 'Novosibirsk',
      materialCoeff: 1.08,
      laborCoeff: 1.10,
      machineCoeff: 1.05,
      climateZone: 'Continental',
      validFrom: new Date('2022-01-01')
    },
    {
      regionCode: 'EKB',
      regionName: 'Yekaterinburg',
      materialCoeff: 1.10,
      laborCoeff: 1.15,
      machineCoeff: 1.07,
      climateZone: 'Continental',
      validFrom: new Date('2022-01-01')
    }
  ];

  for (const coeff of coefficients) {
    await prisma.regionalCoefficient.create({
      data: coeff
    });
  }
  console.log(`Created ${coefficients.length} regional coefficients`);
}

async function assignAIRoles(aiAgents: any[], roles: Record<string, any>) {
  // Assign AI_OPERATOR role to AI operator
  if (aiAgents[0] && roles.ai_operator) {
    await assignRoleToUser(aiAgents[0].id, roles.ai_operator.id);
  }
  
  // Assign AI_ASSISTANT role to AI assistant
  if (aiAgents[1] && roles.ai_assistant) {
    await assignRoleToUser(aiAgents[1].id, roles.ai_assistant.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
