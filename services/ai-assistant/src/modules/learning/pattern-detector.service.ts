import { Injectable } from '@nestjs/common';
import { AIAnalysisRequest } from '@ez-eco/shared-contracts';

@Injectable()
export class PatternDetectorService {
  detectTypicalUsageScenarios(interactions: AIAnalysisRequest[]): string[] {
    // Detect typical usage scenarios
    const scenarios: Record<string, number> = {};
    interactions.forEach(interaction => {
      const scenario = `${interaction.analysisType}_${interaction.priority}`;
      if (scenarios[scenario]) {
        scenarios[scenario]++;
      } else {
        scenarios[scenario] = 1;
      }
    });
    return Object.keys(scenarios).filter(scenario => scenarios[scenario] > 5);
  }

  clusterSimilarQueries(queries: string[]): Record<string, string[]> {
    // Cluster similar queries
    const clusters: Record<string, string[]> = {};
    queries.forEach(query => {
      const keyword = query.split(' ')[0]; // Simplified clustering by first word
      if (!clusters[keyword]) {
        clusters[keyword] = [];
      }
      clusters[keyword].push(query);
    });
    return clusters;
  }

  formBestPractices(patterns: string[]): string[] {
    // Form best practices from patterns
    return patterns.map(pattern => `Best practice for ${pattern}: Analyze, optimize, and validate results.`);
  }
}
