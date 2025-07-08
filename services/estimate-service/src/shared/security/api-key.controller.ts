import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { MonitoringService } from '../monitoring/monitoring.service';
import { ApiKeyService } from './api-key.service';

export class CreateApiKeyDto {
  name: string;
  permissions: string[];
  expiresAt?: Date;
}

export class ApiKeyResponseDto {
  id: string;
  name: string;
  key?: string; // Only returned on creation
  permissions: string[];
  isActive: boolean;
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
}

@ApiTags('api-keys')
@Controller('api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiKeyController {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly monitoringService: MonitoringService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new API key' })
  @ApiResponse({
    status: 201,
    description: 'API key created successfully',
    type: ApiKeyResponseDto,
  })
  async createApiKey(
    @Body() createApiKeyDto: CreateApiKeyDto,
    @Request() req: any,
  ): Promise<ApiKeyResponseDto> {
    const userId = req.user.id;
    const correlationId = req.correlationId;

    this.monitoringService.logEvent('api_key_creation_started', {
      correlationId,
      userId,
      action: 'create_api_key',
      metadata: {
        keyName: createApiKeyDto.name,
        permissions: createApiKeyDto.permissions,
      },
    });

    const apiKey = await this.apiKeyService.createApiKey({
      ...createApiKeyDto,
      userId,
    });

    this.monitoringService.logEvent('api_key_created', {
      correlationId,
      userId,
      action: 'create_api_key',
      metadata: {
        keyId: apiKey.id,
        keyName: apiKey.name,
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key, // Return key only on creation
      permissions: apiKey.permissions,
      isActive: apiKey.isActive,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List user API keys' })
  @ApiResponse({
    status: 200,
    description: 'List of API keys',
    type: [ApiKeyResponseDto],
  })
  async getUserApiKeys(@Request() req: any): Promise<Omit<ApiKeyResponseDto, 'key'>[]> {
    const userId = req.user.id;
    const correlationId = req.correlationId;

    this.monitoringService.logEvent('api_keys_list_requested', {
      correlationId,
      userId,
      action: 'list_api_keys',
    });

    const apiKeys = await this.apiKeyService.getUserApiKeys(userId);

    return apiKeys.map(apiKey => ({
      id: apiKey.id,
      name: apiKey.name,
      permissions: apiKey.permissions,
      isActive: apiKey.isActive,
      expiresAt: apiKey.expiresAt,
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt,
    }));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke API key' })
  @ApiResponse({
    status: 204,
    description: 'API key revoked successfully'
  })
  async revokeApiKey(
    @Param('id') keyId: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.id;
    const correlationId = req.correlationId;

    this.monitoringService.logEvent('api_key_revocation_started', {
      correlationId,
      userId,
      action: 'revoke_api_key',
      metadata: { keyId },
    });

    await this.apiKeyService.revokeApiKey(keyId);

    this.monitoringService.logEvent('api_key_revoked', {
      correlationId,
      userId,
      action: 'revoke_api_key',
      metadata: { keyId },
    });
  }
}
