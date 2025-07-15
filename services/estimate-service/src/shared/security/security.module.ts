import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyService } from './api-key.service';
import { SecurityConfigService } from './security-config.service';

@Module({
  imports: [PrismaModule, MonitoringModule, ConfigModule],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ApiKeyGuard, SecurityConfigService],
  exports: [ApiKeyService, ApiKeyGuard, SecurityConfigService],
})
export class SecurityModule {}
