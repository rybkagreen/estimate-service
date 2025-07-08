import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

export interface ApiKeyData {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  userId: string;
}

@Injectable()
export class ApiKeyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate a new API key
   */
  generateApiKey(): string {
    const prefix = 'est_';
    const keyLength = 32;
    const randomBytes = crypto.randomBytes(keyLength);
    return prefix + randomBytes.toString('hex');
  }

  /**
   * Create a new API key
   */
  async createApiKey(data: {
    name: string;
    permissions: string[];
    userId: string;
    expiresAt?: Date;
  }): Promise<ApiKeyData> {
    const key = this.generateApiKey();
    const hashedKey = this.hashApiKey(key);

    // For now, we'll store in memory or config since we don't have ApiKey table
    // In production, this should be stored in database
    const apiKeyData: ApiKeyData = {
      id: crypto.randomUUID(),
      name: data.name,
      key, // Return plain key only on creation
      permissions: data.permissions,
      isActive: true,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      userId: data.userId,
    };

    // TODO: Store in database when ApiKey model is added to schema
    // await this.prisma.apiKey.create({
    //   data: {
    //     id: apiKeyData.id,
    //     name: data.name,
    //     keyHash: hashedKey,
    //     permissions: data.permissions,
    //     isActive: true,
    //     expiresAt: data.expiresAt,
    //     userId: data.userId,
    //   },
    // });

    return apiKeyData;
  }

  /**
   * Validate API key
   */
  async validateApiKey(key: string): Promise<ApiKeyData | null> {
    if (!key || !key.startsWith('est_')) {
      return null;
    }

    // For now, check against environment variables
    const masterApiKey = this.configService.get('MASTER_API_KEY');
    if (key === masterApiKey) {
      return {
        id: 'master',
        name: 'Master API Key',
        key,
        permissions: ['*'], // Full permissions
        isActive: true,
        createdAt: new Date(),
        userId: 'system',
      };
    }

    // TODO: Check in database when ApiKey model is available
    // const hashedKey = this.hashApiKey(key);
    // const apiKey = await this.prisma.apiKey.findFirst({
    //   where: {
    //     keyHash: hashedKey,
    //     isActive: true,
    //     OR: [
    //       { expiresAt: null },
    //       { expiresAt: { gt: new Date() } }
    //     ]
    //   },
    //   include: {
    //     user: true,
    //   },
    // });

    // if (apiKey) {
    //   // Update last used timestamp
    //   await this.prisma.apiKey.update({
    //     where: { id: apiKey.id },
    //     data: { lastUsedAt: new Date() },
    //   });
    //
    //   return {
    //     id: apiKey.id,
    //     name: apiKey.name,
    //     key: '***', // Never return actual key
    //     permissions: apiKey.permissions,
    //     isActive: apiKey.isActive,
    //     expiresAt: apiKey.expiresAt,
    //     lastUsedAt: new Date(),
    //     createdAt: apiKey.createdAt,
    //     userId: apiKey.userId,
    //   };
    // }

    return null;
  }

  /**
   * Hash API key for secure storage
   */
  private hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Check if API key has permission
   */
  hasPermission(apiKey: ApiKeyData, permission: string): boolean {
    if (!apiKey.isActive) {
      return false;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return false;
    }

    // Check wildcard permission
    if (apiKey.permissions.includes('*')) {
      return true;
    }

    // Check specific permission
    return apiKey.permissions.includes(permission);
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: string): Promise<void> {
    // TODO: Implement when database model is available
    // await this.prisma.apiKey.update({
    //   where: { id: keyId },
    //   data: { isActive: false },
    // });
  }

  /**
   * List API keys for user
   */
  async getUserApiKeys(userId: string): Promise<Omit<ApiKeyData, 'key'>[]> {
    // TODO: Implement when database model is available
    // const apiKeys = await this.prisma.apiKey.findMany({
    //   where: { userId },
    //   select: {
    //     id: true,
    //     name: true,
    //     permissions: true,
    //     isActive: true,
    //     expiresAt: true,
    //     lastUsedAt: true,
    //     createdAt: true,
    //     userId: true,
    //   },
    // });
    //
    // return apiKeys;

    return [];
  }
}
