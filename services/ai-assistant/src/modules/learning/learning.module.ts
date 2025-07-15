import { Module } from '@nestjs/common';
import { InteractionAnalyzerService } from './interaction-analyzer.service';
import { FeedbackProcessorService } from './feedback-processor.service';
import { KnowledgeUpdaterService } from './knowledge-updater.service';
import { PatternDetectorService } from './pattern-detector.service';
import { QualityAssessorService } from './quality-assessor.service';

@Module({
  providers: [
    InteractionAnalyzerService,
    FeedbackProcessorService,
    KnowledgeUpdaterService,
    PatternDetectorService,
    QualityAssessorService,
  ],
  exports: [
    InteractionAnalyzerService,
    FeedbackProcessorService,
    KnowledgeUpdaterService,
    PatternDetectorService,
    QualityAssessorService,
  ],
})
export class LearningModule {}
