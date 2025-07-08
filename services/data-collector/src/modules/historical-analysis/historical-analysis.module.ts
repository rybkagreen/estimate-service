import { Module } from '@nestjs/common';
import { HistoricalAnalysisService } from './historical-analysis.service';
import { HistoricalAnalysisController } from './historical-analysis.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HistoricalAnalysisController],
  providers: [HistoricalAnalysisService],
  exports: [HistoricalAnalysisService]
})
export class HistoricalAnalysisModule {}
