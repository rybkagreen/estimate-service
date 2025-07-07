import { Module } from '@nestjs/common';
import { TaskPlannerService } from './services/task-planner.service';
import { TaskPlannerController } from './controllers/task-planner.controller';
import { ResponseBuilderService } from './services/response-builder.service';
import { HistoricalEstimateService } from './services/historical-estimate.service';
import { ClaudeValidatorService } from './services/claude-validator.service';
import { FallbackHandlerService } from './services/fallback-handler.service';
import { EstimateCalculatorModule } from '../estimate-calculator/estimate-calculator.module';
import { MaterialsModule } from '../materials/materials.module';
import { NormsModule } from '../norms/norms.module';

@Module({
  imports: [
    EstimateCalculatorModule,
    MaterialsModule,
    NormsModule,
  ],
  controllers: [TaskPlannerController],
  providers: [
    TaskPlannerService,
    ResponseBuilderService,
    HistoricalEstimateService,
    ClaudeValidatorService,
    FallbackHandlerService,
  ],
  exports: [
    TaskPlannerService,
    ResponseBuilderService,
    HistoricalEstimateService,
    ClaudeValidatorService,
    FallbackHandlerService,
  ],
})
export class AiAssistantModule {}
