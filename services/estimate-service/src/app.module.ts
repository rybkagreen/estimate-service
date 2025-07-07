import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from './prisma/prisma.service';

// Modules
import { EstimateModule } from './modules/estimate/estimate.module';
import { ClassificationModule } from './modules/classification/classification.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { GrandSmetaModule } from './modules/grand-smeta/grand-smeta.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { ValidationModule } from './modules/validation/validation.module';
import { CacheModule } from './modules/cache/cache.module';
import { PriorityQueueModule } from './modules/priority-queue/priority-queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    EventEmitterModule.forRoot(),

    // Global modules
    CacheModule,
    PriorityQueueModule,

    // Core modules
    EstimateModule,
    ClassificationModule,
    TemplatesModule,
    GrandSmetaModule,
    AiAssistantModule,
    ValidationModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
