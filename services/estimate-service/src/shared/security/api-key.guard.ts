import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ApiKeyData, ApiKeyService } from './api-key.service';

export const API_KEY_PERMISSIONS = 'api_key_permissions';

/**
 * Decorator to set required API key permissions
 */
export const RequireApiKeyPermissions = (...permissions: string[]) =>
  Reflector.createDecorator<string[]>({ key: API_KEY_PERMISSIONS });

export interface RequestWithApiKey extends Request {
  apiKey?: ApiKeyData;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithApiKey>();

    // Get API key from header
    const apiKey = this.extractApiKey(request);
    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    // Validate API key
    const validApiKey = await this.apiKeyService.validateApiKey(apiKey);
    if (!validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Check required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      API_KEY_PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every(permission =>
        this.apiKeyService.hasPermission(validApiKey, permission)
      );

      if (!hasPermission) {
        throw new UnauthorizedException('Insufficient API key permissions');
      }
    }

    // Add API key to request
    request.apiKey = validApiKey;

    return true;
  }

  private extractApiKey(request: any): string | null {
    // Check Authorization header (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check X-API-Key header
    const apiKeyHeader = request.headers['x-api-key'];
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    // Check query parameter
    const queryApiKey = request.query.api_key;
    if (queryApiKey) {
      return queryApiKey;
    }

    return null;
  }
}
