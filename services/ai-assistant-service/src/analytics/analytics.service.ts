import { Injectable, Logger } from '@nestjs/common';

export interface AnalyticsData {
  id: string;
  description: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private analyticsStore: Map<string, AnalyticsData> = new Map();

  /**
   * Add analytics data
   */
  addAnalytics(description: string, data: any): AnalyticsData {
    const analytics: AnalyticsData = {
      id: `analytics_${Date.now()}`,
      description,
      data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.analyticsStore.set(analytics.id, analytics);
    return analytics;
  }

  /**
   * Get analytics data by ID
   */
  getAnalyticsData(id: string): AnalyticsData | undefined {
    return this.analyticsStore.get(id);
  }

  /**
   * List all analytics data
   */
  listAnalytics(): AnalyticsData[] {
    return Array.from(this.analyticsStore.values());
  }
}
