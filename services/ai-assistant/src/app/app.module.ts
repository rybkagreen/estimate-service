import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import new modules
import { CoreModule } from './modules/core/core.module';
import { ChatModule } from './modules/chat/chat.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PrismaModule } from '../prisma/prisma.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { DeepseekModule } from '../deepseek/deepseek.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    CoreModule,
    ChatModule,
    KnowledgeModule,
    AnalyticsModule,
    VectorStoreModule,
    DeepseekModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
