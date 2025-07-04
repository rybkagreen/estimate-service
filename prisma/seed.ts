
import { PrismaClient, RoleType, PermissionResource, PermissionAction, ContextType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding unified RBAC system...');
  
  // Create permissions
  const permissions = await createPermissions();
  console.log('✅ Permissions created');
  
  // Create roles
  const roles = await createRoles();
  console.log('✅ Roles created');
  
  // Assign permissions to roles
  await assignPermissionsToRoles(roles, permissions);
  console.log('✅ Permissions assigned to roles');
  
  // Create default admin user
  const adminUser = await createAdminUser();
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
  
  console.log('🎉 Seeding completed successfully!');
}

async function createPermissions() {
  const permissions = {};
  
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
  const roles = {};
  
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

async function assignPermissionsToRoles(roles, permissions) {
  // Admin gets all permissions
  const allPermissions = Object.values(permissions);
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId_contextType_contextId: {
          roleId: roles.admin.id,
          permissionId: permission.id,
          contextType: ContextType.GLOBAL,
          contextId: null
        }
      },
      update: {},
      create: {
        roleId: roles.admin.id,
        permissionId: permission.id,
        contextType: ContextType.GLOBAL
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

async function assignRoleToUser(userId, roleId) {
  return await prisma.userRoleContext.upsert({
    where: {
      userId_roleId_contextType_contextId: {
        userId,
        roleId,
        contextType: ContextType.GLOBAL,
        contextId: null
      }
    },
    update: {},
    create: {
      userId,
      roleId,
      contextType: ContextType.GLOBAL,
      grantedBy: userId // Self-granted for initial setup
    }
  });
}

async function assignAIRoles(aiAgents, roles) {
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
