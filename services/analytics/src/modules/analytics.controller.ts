import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HistoricalAnalyzerService } from './historical-analyzer.service';
import { TrendDetectorService } from './trend-detector.service';
import { CostPredictorService } from './cost-predictor.service';
import { RiskAssessorService } from './risk-assessor.service';
import { PerformanceTrackerService } from './performance-tracker.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly historicalAnalyzer: HistoricalAnalyzerService,
    private readonly trendDetector: TrendDetectorService,
    private readonly costPredictor: CostPredictorService,
    private readonly riskAssessor: RiskAssessorService,
    private readonly performanceTracker: PerformanceTrackerService,
  ) {}

  @Get('history')
  @ApiOperation({ summary: 'Analyze historical estimates' })
  analyzeHistory() {
    return this.historicalAnalyzer.analyzeHistory();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Detect price trends' })
  detectTrends() {
    return this.trendDetector.detectTrends();
  }

  @Get('predict-cost')
  @ApiOperation({ summary: 'Predict project costs' })
  predictCost() {
    return this.costPredictor.predictCost();
  }

  @Get('assess-risk')
  @ApiOperation({ summary: 'Assess project risks' })
  assessRisk() {
    return this.riskAssessor.assessRisk();
  }

  @Get('performance')
  @ApiOperation({ summary: 'Track performance metrics' })
  trackPerformance() {
    return this.performanceTracker.trackPerformance();
  }
}
