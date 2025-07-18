import { Injectable } from '@nestjs/common';
import { Estimate } from '@ez-eco/shared-contracts';

@Injectable()
export class QualityAssessorService {
  calculateRecommendationQualityMetrics(estimate: Estimate): number {
    // Calculate recommendation quality metrics based on estimate data
    const qualityMetric = estimate.tags.includes('high-priority') ? 0.9 : 0.7;
    return qualityMetric;
  }

  validateFSBCData(data: any): boolean {
    // Validate FSBC data
    return data && typeof data === 'object' && data.valid ? true : false;
  }

  monitorSystemAccuracy(accuracyLogs: { timestamp: Date; accuracy: number }[]): number {
    // Monitor system accuracy
    const totalAccuracy = accuracyLogs.reduce((sum, log) => sum + log.accuracy, 0);
    return totalAccuracy / accuracyLogs.length;
  }
}
