import { Injectable } from '@nestjs/common';
import { AIAnalysisRequest } from '@ez-eco/shared-contracts'; // Assuming shared contracts

@Injectable()
export class InteractionAnalyzerService {
  analyzeInteractions(interactions: AIAnalysisRequest[]): Record<string, any> {
    // Implement logic to collect and analyze usage patterns
    const patternStats: Record<string, number> = {};
    interactions.forEach(interaction => {
      if (patternStats[interaction.analysisType]) {
        patternStats[interaction.analysisType]++;
      } else {
        patternStats[interaction.analysisType] = 1;
      }
    });
    return patternStats;
  }

  identifyFrequentQuestions(interactions: AIAnalysisRequest[]): string[] {
    // Implement logic to identify frequent questions and problems
    const questionCount: Record<string, number> = {};
    interactions.forEach(interaction => {
      const question = interaction.inputData.documents?.join(', ') || 'Unknown';
      if (questionCount[question]) {
        questionCount[question]++;
      } else {
        questionCount[question] = 1;
      }
    });
    const frequentQuestions = Object.keys(questionCount).filter(
      question => questionCount[question] > 10 // Arbitrary threshold
    );
    return frequentQuestions;
  }

  responseEfficiencyStats(interactions: AIAnalysisRequest[]): Record<string, any> {
    // Implement logic to generate response efficiency statistics
    const efficiencyStats: Record<string, { total: number; success: number }> = {};
    interactions.forEach(interaction => {
      if (!efficiencyStats[interaction.analysisType]) {
        efficiencyStats[interaction.analysisType] = { total: 0, success: 0 };
      }
      efficiencyStats[interaction.analysisType].total++;
      if (interaction.configuration?.includeVisualization) {
        efficiencyStats[interaction.analysisType].success++;
      }
    });
    return efficiencyStats;
  }
}
