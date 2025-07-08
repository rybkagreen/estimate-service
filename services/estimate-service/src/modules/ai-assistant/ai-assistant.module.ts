import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { RuleEngineService } from './rule-engine.service';
import { PriceAnalysisService } from './price-analysis.service';
import { RiskAssessmentService } from './risk-assessment.service';
import { ResponseBuilderService } from './services/response-builder.service';
import { HistoricalEstimateService } from './services/historical-estimate.service';
import { ClaudeValidatorService } from './services/claude-validator.service';
import { ModelManagerService } from './services/model-manager.service';
import { TaskPlannerService } from './services/task-planner.service';
import { FallbackHandlerService } from './services/fallback-handler.service';
import { TaskPlannerController } from './controllers/task-planner.controller';
import { CacheModule } from '../cache';
import { CoreModule } from './modules/core/core.module';
import { ChatModule } from './modules/chat/chat.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    CoreModule,
    ChatModule,
    KnowledgeModule,
    AnalyticsModule,
  ],
  controllers: [
    AiAssistantController,
    TaskPlannerController,
  ],
  providers: [
    AiAssistantService,
    RuleEngineService,
    PriceAnalysisService,
    RiskAssessmentService,
    PrismaService,
    ResponseBuilderService,
    HistoricalEstimateService,
    ClaudeValidatorService,
    ModelManagerService,
    TaskPlannerService,
    FallbackHandlerService,
  ],
  exports: [
    AiAssistantService,
    RuleEngineService,
    ResponseBuilderService,
    HistoricalEstimateService,
    ClaudeValidatorService,
    ModelManagerService,
    PriceAnalysisService,
    RiskAssessmentService,
    TaskPlannerService,
    FallbackHandlerService,
  ],
})
export class AiAssistantModule {}
