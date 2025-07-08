import { Controller, Post, Body } from '@nestjs/common';
import { HistoricalAnalysisService } from './historical-analysis.service';
import { IAnalysisRequest, IAnalysisResult } from './analysis.interface';

@Controller('historical-analysis')
export class HistoricalAnalysisController {
  constructor(private readonly analysisService: HistoricalAnalysisService) {}

  @Post('analyze')
  async analyze(@Body() request: IAnalysisRequest): Promise<IAnalysisResult> {
    return this.analysisService.analyzeHistoricalData(request);
  }
}
