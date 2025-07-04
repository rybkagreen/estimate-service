import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

// Modules
import { EstimateModule } from './modules/estimate/estimate.module';
import { ClassificationModule } from './modules/classification/classification.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { GrandSmetaModule } from './modules/grand-smeta/grand-smeta.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { ValidationModule } from './modules/validation/validation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

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
