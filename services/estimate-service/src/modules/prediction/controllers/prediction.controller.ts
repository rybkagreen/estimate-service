import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PredictionService } from '../services/prediction.service';
import { PredictCostDto } from '../dto/predict-cost.dto';
import {
  PredictionResult,
  RiskAnalysis,
  BudgetOptimization,
} from '../interfaces/prediction.interface';

@ApiTags('Prediction')
@Controller('prediction')
@ApiBearerAuth()
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Post('predict/cost')
  @ApiOperation({ summary: 'Predict project cost based on parameters' })
  @ApiResponse({
    status: 200,
    description: 'Cost prediction successful',
    type: Object,
  })
  async predictCost(@Body() predictCostDto: PredictCostDto): Promise<PredictionResult> {
    return this.predictionService.predictCost(predictCostDto);
  }

  @Get('analyze/risks')
  @ApiOperation({ summary: 'Analyze project risks and potential overruns' })
  @ApiResponse({
    status: 200,
    description: 'Risk analysis completed',
    type: Object,
  })
  async analyzeRisks(): Promise<RiskAnalysis> {
    return this.predictionService.analyzeRisks();
  }

  @Get('optimize/budget')
  @ApiOperation({ summary: 'Optimize project budget' })
  @ApiResponse({
    status: 200,
    description: 'Budget optimization completed',
    type: Object,
  })
  async optimizeBudget(): Promise<BudgetOptimization> {
    return this.predictionService.optimizeBudget();
  }
}

