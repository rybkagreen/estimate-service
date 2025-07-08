import { Injectable, Logger } from '@nestjs/common';
import { BuildingType } from '@ez-eco/shared-contracts';

/**
 * Represents a deviation from historical norms
 */
export interface HistoricalDeviation {
  metric: string;
  expected: number;
  actual: number;
  deviation: number; // Percentage deviation
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Statistical range for historical data
 */
export interface HistoricalRange {
  min: number;
  max: number;
  average: number;
  median: number;
  standardDeviation?: number;
  percentiles?: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  sampleSize?: number;
  lastUpdated?: Date;
}

/**
 * Represents a similar historical project
 */
export interface SimilarProject {
  id: string;
  name: string;
  type: BuildingType;
  similarity: number; // 0-1 similarity score
  value: number;
  completedDate?: Date;
  location?: string;
  area?: number;
  duration?: number;
  keyMetrics?: Record<string, number>;
}

/**
 * Result of historical comparison
 */
export interface HistoricalComparison {
  isWithinRange: boolean;
  confidence: number;
  deviations?: HistoricalDeviation[];
  historicalRange?: HistoricalRange;
  similarProjects?: SimilarProject[];
  analysisMetadata?: {
    dataPoints: number;
    dateRange: { start: Date; end: Date };
    geographicScope: string;
    adjustedForInflation: boolean;
  };
}

/**
 * Options for historical comparison
 */
export interface HistoricalComparisonOptions {
  includeInflationAdjustment?: boolean;
  locationFilter?: string;
  dateRangeYears?: number;
  minSimilarityScore?: number;
  maxSimilarProjects?: number;
}

/**
 * Historical trend data
 */
export interface HistoricalTrend {
  metric: string;
  dataPoints: Array<{
    date: Date;
    value: number;
  }>;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  averageChange: number; // Percentage per period
  forecast?: Array<{
    date: Date;
    value: number;
    confidenceInterval: { lower: number; upper: number };
  }>;
}

@Injectable()
export class HistoricalEstimateService {
  private readonly logger = new Logger(HistoricalEstimateService.name);

  // Stub historical data for different types of estimates
  private readonly historicalData = {
    construction: {
      residential: {
        costPerSqm: { min: 800, max: 2500, average: 1500, median: 1400 },
        duration: { min: 6, max: 24, average: 12, median: 10 }, // months
        laborCost: { min: 30, max: 50, average: 40, median: 38 }, // percentage of total
      },
      commercial: {
        costPerSqm: { min: 1200, max: 4000, average: 2500, median: 2300 },
        duration: { min: 12, max: 36, average: 24, median: 22 },
        laborCost: { min: 25, max: 45, average: 35, median: 34 },
      },
      infrastructure: {
        costPerKm: { min: 1000000, max: 5000000, average: 2500000, median: 2200000 },
        duration: { min: 12, max: 60, average: 36, median: 30 },
        laborCost: { min: 20, max: 40, average: 30, median: 28 },
      },
    },
    materials: {
      concrete: { min: 100, max: 200, average: 150, median: 145 }, // per m³
      steel: { min: 800, max: 1500, average: 1100, median: 1050 }, // per ton
      glass: { min: 50, max: 200, average: 120, median: 110 }, // per m²
    },
  };

  /**
   * Compare response with historical estimates
   * @param response - The AI response to validate
   * @param context - Additional context about the project
   * @param options - Comparison options
   * @returns Historical comparison result with confidence score
   */
  async compareWithHistorical(
    response: any,
    context?: any,
    options?: HistoricalComparisonOptions,
  ): Promise<HistoricalComparison> {
    this.logger.log('Comparing with historical estimates');

    try {
      // Extract numerical values from response
      const extractedValues = this.extractNumericalValues(response);

      // Determine project type from context
      const projectType = this.determineProjectType(context);

      // Get relevant historical data
      const historicalRange = this.getHistoricalRange(projectType, extractedValues);

      // Compare values
      const comparison = this.performComparison(
        extractedValues,
        historicalRange,
        projectType,
      );

      // Find similar projects (stub data)
      const similarProjects = this.findSimilarProjects(projectType, extractedValues);

      return {
        ...comparison,
        historicalRange,
        similarProjects,
      };
    } catch (error) {
      this.logger.error('Error in historical comparison', error.stack);
      return {
        isWithinRange: true,
        confidence: 0.5,
        deviations: [],
      };
    }
  }

  /**
   * Extract numerical values from the response
   */
  private extractNumericalValues(response: any): Map<string, number> {
    const values = new Map<string, number>();

    const responseText =
      typeof response === 'string' ? response : JSON.stringify(response);

    // Extract cost per square meter
    const costPerSqmMatch = responseText.match(
      /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:USD|EUR|$)?\s*(?:per|\/)\s*(?:m²|sqm|square\s*meter)/i,
    );
    if (costPerSqmMatch) {
      values.set('costPerSqm', parseFloat(costPerSqmMatch[1].replace(/,/g, '')));
    }

    // Extract total cost
    const totalCostMatch = responseText.match(
      /total\s*(?:cost|price|budget)[\s:]*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
    );
    if (totalCostMatch) {
      values.set('totalCost', parseFloat(totalCostMatch[1].replace(/,/g, '')));
    }

    // Extract duration
    const durationMatch = responseText.match(
      /(\d+(?:\.\d+)?)\s*(?:months?|years?)/i,
    );
    if (durationMatch) {
      let duration = parseFloat(durationMatch[1]);
      if (responseText.toLowerCase().includes('year')) {
        duration *= 12; // Convert to months
      }
      values.set('duration', duration);
    }

    // Extract area
    const areaMatch = responseText.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:m²|sqm)/i);
    if (areaMatch) {
      values.set('area', parseFloat(areaMatch[1].replace(/,/g, '')));
    }

    // Extract labor cost percentage
    const laborMatch = responseText.match(/labor\s*(?:cost)?[\s:]*(\d+(?:\.\d+)?)\s*%/i);
    if (laborMatch) {
      values.set('laborCostPercentage', parseFloat(laborMatch[1]));
    }

    return values;
  }

  /**
   * Determine project type from context
   */
  private determineProjectType(context?: any): string {
    if (!context) return 'construction.residential'; // default

    const contextStr = typeof context === 'string' ? context : JSON.stringify(context);
    const lowerContext = contextStr.toLowerCase();

    if (lowerContext.includes('residential') || lowerContext.includes('house') || 
        lowerContext.includes('apartment')) {
      return 'construction.residential';
    }
    if (lowerContext.includes('commercial') || lowerContext.includes('office') || 
        lowerContext.includes('retail')) {
      return 'construction.commercial';
    }
    if (lowerContext.includes('infrastructure') || lowerContext.includes('road') || 
        lowerContext.includes('bridge')) {
      return 'construction.infrastructure';
    }

    return 'construction.residential'; // default
  }

  /**
   * Get historical range for the project type
   */
  private getHistoricalRange(
    projectType: string,
    extractedValues: Map<string, number>,
  ): any {
    const [category, subCategory] = projectType.split('.');

    if (category === 'construction') {
      const data = this.historicalData.construction[subCategory];
      
      // Select appropriate metric based on extracted values
      if (extractedValues.has('costPerSqm')) {
        return data.costPerSqm;
      }
      if (extractedValues.has('duration')) {
        return data.duration;
      }
      if (extractedValues.has('laborCostPercentage')) {
        return data.laborCost;
      }
    }

    // Default range
    return { min: 0, max: 10000000, average: 5000000, median: 4500000 };
  }

  /**
   * Perform comparison between extracted values and historical data
   */
  private performComparison(
    extractedValues: Map<string, number>,
    historicalRange: any,
    projectType: string,
  ): { isWithinRange: boolean; confidence: number; deviations?: any[] } {
    const deviations: any[] = [];
    let totalDeviation = 0;
    let comparisonCount = 0;

    // Compare cost per sqm
    if (extractedValues.has('costPerSqm')) {
      const value = extractedValues.get('costPerSqm')!;
      const deviation = this.calculateDeviation(value, historicalRange);
      
      if (Math.abs(deviation) > 0.3) { // 30% threshold
        deviations.push({
          metric: 'Cost per m²',
          expected: historicalRange.average,
          actual: value,
          deviation: deviation * 100,
          description: `Cost per m² is ${Math.abs(deviation * 100).toFixed(1)}% ${
            deviation > 0 ? 'above' : 'below'
          } historical average`,
          severity: Math.abs(deviation) > 0.5 ? 'critical' : Math.abs(deviation) > 0.3 ? 'high' : 'medium',
        });
      }
      
      totalDeviation += Math.abs(deviation);
      comparisonCount++;
    }

    // Compare duration
    if (extractedValues.has('duration')) {
      const value = extractedValues.get('duration')!;
      const durationRange = this.historicalData.construction[projectType.split('.')[1]]?.duration;
      
      if (durationRange) {
        const deviation = this.calculateDeviation(value, durationRange);
        
        if (Math.abs(deviation) > 0.25) { // 25% threshold
          deviations.push({
          metric: 'Project duration',
          expected: durationRange.average,
          actual: value,
          deviation: deviation * 100,
          description: `Duration is ${Math.abs(deviation * 100).toFixed(1)}% ${
            deviation > 0 ? 'longer' : 'shorter'
          } than historical average`,
          severity: Math.abs(deviation) > 0.4 ? 'high' : Math.abs(deviation) > 0.25 ? 'medium' : 'low',
          });
        }
        
        totalDeviation += Math.abs(deviation);
        comparisonCount++;
      }
    }

    // Calculate overall confidence
    const averageDeviation = comparisonCount > 0 ? totalDeviation / comparisonCount : 0;
    const confidence = Math.max(0, 1 - averageDeviation);
    const isWithinRange = deviations.length === 0 || averageDeviation < 0.4;

    return {
      isWithinRange,
      confidence,
      deviations: deviations.length > 0 ? deviations : undefined,
    };
  }

  /**
   * Calculate deviation from historical range
   */
  private calculateDeviation(value: number, range: any): number {
    const { min, max, average } = range;
    
    if (value < min) {
      return (value - min) / average;
    }
    if (value > max) {
      return (value - max) / average;
    }
    
    return (value - average) / average;
  }

  /**
   * Find similar historical projects (stub implementation)
   */
  private findSimilarProjects(
    projectType: string,
    extractedValues: Map<string, number>,
  ): any[] {
    // Stub implementation - return mock similar projects
    const similarProjects = [
      {
      id: 'proj-001',
      name: 'Downtown Office Complex',
      type: BuildingType.COMMERCIAL,
      similarity: 0.85,
      value: extractedValues.get('totalCost') || 5000000,
      },
      {
      id: 'proj-002',
      name: 'Suburban Residential Development',
      type: BuildingType.RESIDENTIAL,
      similarity: 0.78,
      value: (extractedValues.get('totalCost') || 5000000) * 0.9,
      },
      {
      id: 'proj-003',
      name: 'Mixed-Use Building Project',
      type: BuildingType.MIXED_USE,
      similarity: 0.72,
      value: (extractedValues.get('totalCost') || 5000000) * 1.1,
      },
    ];

    // Filter based on project type
    if (projectType.includes('residential')) {
      return similarProjects.filter((p) => p.name.includes('Residential'));
    }
    if (projectType.includes('commercial')) {
      return similarProjects.filter((p) => p.name.includes('Office') || p.name.includes('Commercial'));
    }

    return similarProjects.slice(0, 2);
  }

  /**
   * Get historical statistics for a specific metric
   * @param metric - The metric to get statistics for (e.g., 'costPerSqm', 'duration')
   * @param projectType - Optional project type filter
   * @param options - Additional filtering options
   * @returns Detailed statistical analysis
   */
  async getHistoricalStatistics(
    metric: string,
    projectType?: string,
    options?: {
      location?: string;
      dateRange?: { start: Date; end: Date };
      buildingType?: BuildingType;
    },
  ): Promise<{
    metric: string;
    projectType: string;
    statistics: HistoricalRange;
    dataQuality: {
      sampleSize: number;
      confidence: number;
      limitations: string[];
    };
    lastUpdated: string;
  }> {
    this.logger.log(`Getting historical statistics for ${metric}`);

    // Stub implementation
    return {
      metric,
      projectType: projectType || 'all',
      statistics: {
        min: 1000,
        max: 10000,
        average: 5500,
        median: 5200,
        standardDeviation: 1200,
        percentiles: {
          p10: 3000,
          p25: 4500,
          p50: 5200,
          p75: 6500,
          p90: 8000,
        },
        sampleSize: 150,
        lastUpdated: new Date(),
      },
      dataQuality: {
        sampleSize: 150,
        confidence: 0.85,
        limitations: [
          'Limited to projects completed in last 5 years',
          'Regional variations may apply',
        ],
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get historical trends for a metric over time
   * @param metric - The metric to analyze
   * @param timeframe - Time period for trend analysis
   * @returns Trend analysis with optional forecast
   */
  async getHistoricalTrends(
    metric: string,
    timeframe: {
      start: Date;
      end: Date;
      granularity: 'monthly' | 'quarterly' | 'yearly';
    },
  ): Promise<HistoricalTrend> {
    this.logger.log(`Getting historical trends for ${metric}`);

    // Stub implementation
    const dataPoints = [];
    const startDate = new Date(timeframe.start);
    const endDate = new Date(timeframe.end);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dataPoints.push({
        date: new Date(currentDate),
        value: 1500 + Math.random() * 500, // Simulated values
      });

      // Increment based on granularity
      switch (timeframe.granularity) {
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'quarterly':
          currentDate.setMonth(currentDate.getMonth() + 3);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
      }
    }

    return {
      metric,
      dataPoints,
      trendDirection: 'increasing',
      averageChange: 2.5, // 2.5% per period
      forecast: [
        {
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          value: 1850,
          confidenceInterval: { lower: 1700, upper: 2000 },
        },
      ],
    };
  }

  /**
   * Validate if a value is an outlier based on historical data
   * @param metric - The metric to check
   * @param value - The value to validate
   * @param context - Project context
   * @returns Outlier analysis result
   */
  async checkForOutliers(
    metric: string,
    value: number,
    context?: any,
  ): Promise<{
    isOutlier: boolean;
    zScore: number;
    percentile: number;
    recommendation?: string;
  }> {
    this.logger.log(`Checking if ${value} is an outlier for ${metric}`);

    const stats = await this.getHistoricalStatistics(metric, context?.projectType);
    const { average, standardDeviation } = stats.statistics;
    
    const zScore = Math.abs((value - average) / (standardDeviation || 1));
    const isOutlier = zScore > 2; // More than 2 standard deviations
    
    // Calculate approximate percentile
    const percentile = this.calculatePercentile(value, stats.statistics);

    return {
      isOutlier,
      zScore,
      percentile,
      recommendation: isOutlier 
        ? `Value is ${zScore.toFixed(1)} standard deviations from mean. Consider reviewing.`
        : undefined,
    };
  }

  /**
   * Get benchmark data for specific project type and location
   * @param projectType - Type of construction project
   * @param location - Geographic location
   * @returns Benchmark data for comparison
   */
  async getBenchmarkData(
    projectType: BuildingType,
    location?: string,
  ): Promise<{
    benchmarks: Record<string, HistoricalRange>;
    metadata: {
      source: string;
      lastUpdated: Date;
      sampleSize: number;
    };
  }> {
    this.logger.log(`Getting benchmark data for ${projectType} in ${location || 'all locations'}`);

    // Stub implementation with typical benchmarks
    return {
      benchmarks: {
        costPerSqm: {
          min: 800,
          max: 2500,
          average: 1500,
          median: 1400,
          standardDeviation: 300,
        },
        duration: {
          min: 6,
          max: 24,
          average: 12,
          median: 10,
          standardDeviation: 3,
        },
        laborCostPercentage: {
          min: 30,
          max: 50,
          average: 40,
          median: 38,
          standardDeviation: 5,
        },
      },
      metadata: {
        source: 'Historical Project Database',
        lastUpdated: new Date(),
        sampleSize: 250,
      },
    };
  }

  /**
   * Calculate percentile rank for a value
   * @param value - The value to rank
   * @param range - Historical range data
   * @returns Percentile rank (0-100)
   */
  private calculatePercentile(value: number, range: HistoricalRange): number {
    if (value <= range.min) return 0;
    if (value >= range.max) return 100;
    
    // Simple linear interpolation for stub
    const position = (value - range.min) / (range.max - range.min);
    return Math.round(position * 100);
  }
}
