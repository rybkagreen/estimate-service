import { Module } from '@nestjs/common';
import { HistoricalAnalyzerService } from './historical-analyzer.service';
import { TrendDetectorService } from './trend-detector.service';
import { CostPredictorService } from './cost-predictor.service';
import { RiskAssessorService } from './risk-assessor.service';
import { PerformanceTrackerService } from './performance-tracker.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  providers: [
    HistoricalAnalyzerService,
    TrendDetectorService,
    CostPredictorService,
    RiskAssessorService,
    PerformanceTrackerService,
  ],
  controllers: [AnalyticsController],
  exports: [
    HistoricalAnalyzerService,
    TrendDetectorService,
    CostPredictorService,
    RiskAssessorService,
    PerformanceTrackerService,
  ],
})
export class AnalyticsModule {}
