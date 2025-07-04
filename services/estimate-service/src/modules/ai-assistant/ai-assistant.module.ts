import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { RuleEngineService } from './rule-engine.service';
import { PriceAnalysisService } from './price-analysis.service';
import { RiskAssessmentService } from './risk-assessment.service';

@Module({
  controllers: [AiAssistantController],
  providers: [
    AiAssistantService,
    RuleEngineService,
    PriceAnalysisService,
    RiskAssessmentService,
    PrismaService,
  ],
  exports: [AiAssistantService, RuleEngineService],
})
export class AiAssistantModule {}
