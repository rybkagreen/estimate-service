import { Injectable } from '@nestjs/common';
import { Recommendation } from '@ez-eco/shared-contracts'; // Assuming shared contracts

@Injectable()
export class FeedbackProcessorService {
  private feedbackData: Record<string, number[]> = {};

  collectUserRatings(estimateId: string, rating: number): void {
    // Collect user feedback and ratings
    if (!this.feedbackData[estimateId]) {
      this.feedbackData[estimateId] = [];
    }
    this.feedbackData[estimateId].push(rating);
  }

  analyzeRecommendationQuality(estimateId: string): number {
    // Analyze the quality of recommendations
    const ratings = this.feedbackData[estimateId] || [];
    if (ratings.length === 0) {
      return 0;
    }
    const averageRating = ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length;
    return averageRating;
  }

  adjustModelBasedOnFeedback(recommendations: Recommendation[], threshold: number = 3): Recommendation[] {
    // Adjust models based on feedback
    return recommendations.map(recommendation => {
      if (this.analyzeRecommendationQuality(recommendation.id) < threshold) {
        recommendation.description += ' (Needs Improvement)';
      }
      return recommendation;
    });
  }
}
