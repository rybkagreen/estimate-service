import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { DeepSeekModule } from './deepseek/deepseek.module';
import { ConversationModule } from './conversation/conversation.module';
import { ContextModule } from './context/context.module';
import { PrismaModule } from './prisma/prisma.module';
import { VectorStoreModule } from './vector-store/vector-store.module';
import { ChatModule } from './chat/chat.module';
import { CoreModule } from './core/core.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { LearningModule } from './modules/learning/learning.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    HealthModule,
    DeepSeekModule,
    ConversationModule,
    ContextModule,
    VectorStoreModule,
    ChatModule,
    CoreModule,
    AnalyticsModule,
    KnowledgeModule,
    LearningModule,
  ],
})
export class AppModule {}
