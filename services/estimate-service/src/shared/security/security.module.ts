import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyService } from './api-key.service';

@Module({
  imports: [PrismaModule, MonitoringModule],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ApiKeyGuard],
  exports: [ApiKeyService, ApiKeyGuard],
})
export class SecurityModule {}
