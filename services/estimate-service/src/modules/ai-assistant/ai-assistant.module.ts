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
import { CacheModule } from '../cache';

@Module({
  imports: [
    ConfigModule,
    CacheModule,
  ],
  controllers: [AiAssistantController],
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
  ],
})
export class AiAssistantModule {}
