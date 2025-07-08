import { Injectable, Logger } from '@nestjs/common';
import { HistoricalEstimateService } from './historical-estimate.service';
import { ClaudeValidatorService } from './claude-validator.service';

export interface ValidationResult {
  level: number;
  passed: boolean;
  confidence: number;
  issues?: string[];
  details?: any;
}

export interface ResponseValidation {
  isValid: boolean;
  overallConfidence: number;
  levels: {
    level1: ValidationResult;
    level2: ValidationResult;
    level3: ValidationResult;
  };
  recommendations?: string[];
  requiresFallback?: boolean;
  fallbackAction?: FallbackAction;
}

export interface FallbackAction {
  type: 'retry' | 'alternative_model' | 'human_review' | 'degraded_response';
  reason: string;
  retryCount?: number;
  maxRetries?: number;
}

@Injectable()
export class ResponseBuilderService {
  private readonly logger = new Logger(ResponseBuilderService.name);

  constructor(
    private readonly historicalEstimateService: HistoricalEstimateService,
    private readonly claudeValidatorService: ClaudeValidatorService,
  ) {}

  /**
   * Validates the response through 3 levels of validation
   * Level 1: Internal contradiction checker
   * Level 2: Historical estimate comparison
   * Level 3: Claude 3.5 Sonnet validation
   * 
   * Implements fallback strategy if confidence < 0.8
   */
  async validateResponse(
    response: any,
    context?: any,
    retryCount: number = 0,
  ): Promise<ResponseValidation> {
    this.logger.log('Starting response validation');

    // Level 1: Internal contradiction checker
    const level1Result = await this.performLevel1Validation(response);

    // Level 2: Historical estimate comparison
    const level2Result = await this.performLevel2Validation(response, context);

    // Level 3: Claude validator
    const level3Result = await this.performLevel3Validation(response, context);

    // Calculate overall validation
    const overallConfidence = this.calculateOverallConfidence([
      level1Result,
      level2Result,
      level3Result,
    ]);

    const isValid =
      level1Result.passed && level2Result.passed && level3Result.passed;

    // Determine if fallback is needed (confidence < 0.8)
    const requiresFallback = overallConfidence < 0.8;
    let fallbackAction: FallbackAction | undefined;

    if (requiresFallback) {
      fallbackAction = this.determineFallbackAction(
        overallConfidence,
        [level1Result, level2Result, level3Result],
        retryCount,
      );
      
      this.logger.warn(
        `Low confidence (${overallConfidence.toFixed(2)}) detected. Fallback action: ${fallbackAction.type}`,
      );
    }

    const validation: ResponseValidation = {
      isValid: isValid && !requiresFallback,
      overallConfidence,
      levels: {
        level1: level1Result,
        level2: level2Result,
        level3: level3Result,
      },
      recommendations: this.generateRecommendations([
        level1Result,
        level2Result,
        level3Result,
      ]),
      requiresFallback,
      fallbackAction,
    };

    this.logger.log(
      `Validation completed: ${validation.isValid ? 'PASSED' : 'FAILED'} with confidence ${overallConfidence}`,
    );

    return validation;
  }

  /**
   * Level 1: Internal contradiction checker
   * Performs basic logic checks and fact self-consistency validation
   */
  private async performLevel1Validation(
    response: any,
  ): Promise<ValidationResult> {
    this.logger.debug('Performing Level 1 validation: Internal contradiction check');

    const issues: string[] = [];
    let confidence = 1.0;

    try {
      // Check for null or undefined response
      if (!response) {
        return {
          level: 1,
          passed: false,
          confidence: 0,
          issues: ['Response is null or undefined'],
        };
      }

      // Convert response to string for analysis
      const responseText = this.extractTextFromResponse(response);

      // Check for contradictory numbers
      const numberContradictions = this.checkNumberContradictions(responseText);
      if (numberContradictions.length > 0) {
        issues.push(...numberContradictions);
        confidence *= 0.7;
      }

      // Check for logical inconsistencies
      const logicalIssues = this.checkLogicalConsistency(responseText);
      if (logicalIssues.length > 0) {
        issues.push(...logicalIssues);
        confidence *= 0.8;
      }

      // Check for date/time contradictions
      const dateIssues = this.checkDateConsistency(responseText);
      if (dateIssues.length > 0) {
        issues.push(...dateIssues);
        confidence *= 0.85;
      }

      // Check for unit consistency (e.g., mixing meters and feet)
      const unitIssues = this.checkUnitConsistency(responseText);
      if (unitIssues.length > 0) {
        issues.push(...unitIssues);
        confidence *= 0.9;
      }

      return {
        level: 1,
        passed: issues.length === 0,
        confidence,
        issues: issues.length > 0 ? issues : undefined,
        details: {
          checksPerformed: [
            'number_contradictions',
            'logical_consistency',
            'date_consistency',
            'unit_consistency',
          ],
        },
      };
    } catch (error) {
      this.logger.error('Error in Level 1 validation', error.stack);
      return {
        level: 1,
        passed: false,
        confidence: 0,
        issues: [`Validation error: ${error.message}`],
      };
    }
  }

  /**
   * Level 2: Compare against historical estimates
   */
  private async performLevel2Validation(
    response: any,
    context?: any,
  ): Promise<ValidationResult> {
    this.logger.debug('Performing Level 2 validation: Historical estimate comparison');

    try {
      const result = await this.historicalEstimateService.compareWithHistorical(
        response,
        context,
      );

      return {
        level: 2,
        passed: result.isWithinRange,
        confidence: result.confidence,
        issues: result.deviations?.map((d) => d.description),
        details: result,
      };
    } catch (error) {
      this.logger.error('Error in Level 2 validation', error.stack);
      return {
        level: 2,
        passed: true, // Pass by default if historical data unavailable
        confidence: 0.5,
        issues: ['Historical comparison unavailable'],
        details: { error: error.message },
      };
    }
  }

  /**
   * Level 3: Cross-check with Claude 3.5 Sonnet
   */
  private async performLevel3Validation(
    response: any,
    context?: any,
  ): Promise<ValidationResult> {
    this.logger.debug('Performing Level 3 validation: Claude validator');

    try {
      const result = await this.claudeValidatorService.validateWithClaude(
        response,
        context,
      );

      return {
        level: 3,
        passed: result.isValid,
        confidence: result.confidence,
        issues: result.issues,
        details: result,
      };
    } catch (error) {
      this.logger.error('Error in Level 3 validation', error.stack);
      return {
        level: 3,
        passed: true, // Pass by default if Claude unavailable
        confidence: 0.5,
        issues: ['Claude validation unavailable'],
        details: { error: error.message },
      };
    }
  }

  /**
   * Helper method to extract text from various response formats
   */
  private extractTextFromResponse(response: any): string {
    if (typeof response === 'string') {
      return response;
    }
    if (typeof response === 'object') {
      return JSON.stringify(response, null, 2);
    }
    return String(response);
  }

  /**
   * Check for contradictory numbers in the response
   */
  private checkNumberContradictions(text: string): string[] {
    const issues: string[] = [];

    // Regex patterns for common number patterns
    const numberPatterns = [
      /(\d+(?:\.\d+)?)\s*(?:m²|sqm|square meters?)/gi,
      /(\d+(?:\.\d+)?)\s*(?:m|meters?)/gi,
      /\$(\d+(?:,\d{3})*(?:\.\d+)?)/gi,
      /(\d+(?:\.\d+)?)\s*%/gi,
    ];

    // Extract all numbers with their contexts
    const numberContexts: Map<string, number[]> = new Map();

    numberPatterns.forEach((pattern) => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach((match) => {
        const context = match[0];
        const value = parseFloat(match[1].replace(/,/g, ''));
        const key = context.replace(/[\d.,]/g, '').trim();

        if (!numberContexts.has(key)) {
          numberContexts.set(key, []);
        }
        numberContexts.get(key)!.push(value);
      });
    });

    // Check for contradictions within same context
    numberContexts.forEach((values, context) => {
      if (values.length > 1) {
        const uniqueValues = [...new Set(values)];
        if (uniqueValues.length > 1) {
          const variance = Math.max(...values) / Math.min(...values);
          if (variance > 1.2) {
            // 20% variance threshold
            issues.push(
              `Contradictory values found for ${context}: ${uniqueValues.join(', ')}`,
            );
          }
        }
      }
    });

    return issues;
  }

  /**
   * Check for logical consistency in the response
   */
  private checkLogicalConsistency(text: string): string[] {
    const issues: string[] = [];

    // Check for contradictory statements
    const contradictionPatterns = [
      {
        pattern: /both\s+(\w+)\s+and\s+not\s+\1/gi,
        message: 'Contradictory statement: something cannot be both X and not X',
      },
      {
        pattern: /increased.*decreased|decreased.*increased/gi,
        message: 'Contradictory trends mentioned',
      },
      {
        pattern: /always.*never|never.*always/gi,
        message: 'Contradictory absolutes',
      },
    ];

    contradictionPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(text)) {
        issues.push(message);
      }
    });

    // Check for impossible percentages
    const percentages = [...text.matchAll(/(\d+(?:\.\d+)?)\s*%/gi)];
    percentages.forEach((match) => {
      const value = parseFloat(match[1]);
      if (value > 100 && !text.includes('increase') && !text.includes('growth')) {
        issues.push(`Impossible percentage value: ${value}%`);
      }
    });

    return issues;
  }

  /**
   * Check for date consistency
   */
  private checkDateConsistency(text: string): string[] {
    const issues: string[] = [];

    // Simple date extraction patterns
    const datePatterns = [
      /(\d{4})-(\d{2})-(\d{2})/g,
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{1,2}),?\s+(\d{4})/gi,
    ];

    const dates: Date[] = [];

    datePatterns.forEach((pattern) => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach((match) => {
        try {
          const dateStr = match[0];
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            dates.push(date);
          }
        } catch {
          // Ignore parsing errors
        }
      });
    });

    // Check for chronological inconsistencies
    if (dates.length >= 2) {
      // Check if mentioned in wrong order with temporal indicators
      const beforeAfterPattern = /before.*after|after.*before/gi;
      if (beforeAfterPattern.test(text)) {
        issues.push('Potential chronological inconsistency detected');
      }
    }

    // Check for future dates in historical context
    const now = new Date();
    const hasHistoricalContext = /historical|past|previous|was|were/i.test(text);
    if (hasHistoricalContext) {
      dates.forEach((date) => {
        if (date > now) {
          issues.push(`Future date ${date.toISOString().split('T')[0]} mentioned in historical context`);
        }
      });
    }

    return issues;
  }

  /**
   * Check for unit consistency
   */
  private checkUnitConsistency(text: string): string[] {
    const issues: string[] = [];

    // Check for mixed unit systems
    const metricUnits = /\b(meters?|km|kg|celsius|hectares?|m²|cm|mm)\b/gi;
    const imperialUnits = /\b(feet|ft|miles?|pounds?|lbs?|fahrenheit|acres?|inches?|yards?)\b/gi;

    const hasMetric = metricUnits.test(text);
    const hasImperial = imperialUnits.test(text);

    if (hasMetric && hasImperial) {
      issues.push('Mixed unit systems detected (metric and imperial)');
    }

    // Check for area/volume confusion
    const areaPattern = /(\d+)\s*(m²|square\s+meters?|sq\s*ft|square\s+feet)/gi;
    const volumePattern = /(\d+)\s*(m³|cubic\s+meters?|cu\s*ft|cubic\s+feet)/gi;

    const hasArea = areaPattern.test(text);
    const hasVolume = volumePattern.test(text);

    if (hasArea && hasVolume && text.includes('same')) {
      issues.push('Potential confusion between area and volume measurements');
    }

    return issues;
  }

  /**
   * Calculate overall confidence from all validation levels
   * Uses weighted average with penalty for failed validations
   */
  private calculateOverallConfidence(results: ValidationResult[]): number {
    // Weighted average: Level 1 (20%), Level 2 (30%), Level 3 (50%)
    const weights = [0.2, 0.3, 0.5];
    let weightedSum = 0;
    let totalWeight = 0;
    let penaltyFactor = 1.0;

    results.forEach((result, index) => {
      if (result.confidence >= 0) {
        // Apply penalty if validation failed
        if (!result.passed) {
          penaltyFactor *= 0.8; // 20% penalty for each failed validation
        }
        
        weightedSum += result.confidence * weights[index];
        totalWeight += weights[index];
      }
    });

    const baseConfidence = totalWeight > 0 ? weightedSum / totalWeight : 0;
    return Math.max(0, Math.min(1, baseConfidence * penaltyFactor));
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = [];

    results.forEach((result) => {
      if (!result.passed && result.issues) {
        result.issues.forEach((issue) => {
          if (issue.includes('contradiction')) {
            recommendations.push('Review and resolve contradictory statements');
          }
          if (issue.includes('percentage')) {
            recommendations.push('Verify percentage calculations');
          }
          if (issue.includes('unit')) {
            recommendations.push('Standardize measurement units');
          }
          if (issue.includes('historical')) {
            recommendations.push('Cross-reference with historical data');
          }
        });
      }

      if (result.confidence < 0.7) {
        recommendations.push(
          `Improve confidence for Level ${result.level} validation`,
        );
      }
    });

    // Remove duplicates
    return [...new Set(recommendations)];
  }

  /**
   * Determine appropriate fallback action based on confidence and validation results
   */
  private determineFallbackAction(
    confidence: number,
    results: ValidationResult[],
    retryCount: number,
  ): FallbackAction {
    const maxRetries = 3;
    
    // Analyze which levels failed or have low confidence
    const level1Failed = !results[0].passed || results[0].confidence < 0.6;
    const level2Failed = !results[1].passed || results[1].confidence < 0.6;
    const level3Failed = !results[2].passed || results[2].confidence < 0.6;
    
    // Critical failure in Level 1 (internal contradictions)
    if (level1Failed && confidence < 0.5) {
      if (retryCount < maxRetries) {
        return {
          type: 'retry',
          reason: 'Critical internal contradictions detected',
          retryCount,
          maxRetries,
        };
      } else {
        return {
          type: 'human_review',
          reason: 'Multiple retries failed to resolve internal contradictions',
          retryCount,
          maxRetries,
        };
      }
    }
    
    // Historical data significantly deviates (Level 2)
    if (level2Failed && confidence < 0.6) {
      return {
        type: 'alternative_model',
        reason: 'Response deviates significantly from historical patterns',
        retryCount,
        maxRetries,
      };
    }
    
    // Claude validation failed (Level 3)
    if (level3Failed && confidence < 0.7) {
      if (retryCount < 2) {
        return {
          type: 'retry',
          reason: 'External validation failed, attempting retry with enhanced context',
          retryCount,
          maxRetries,
        };
      } else {
        return {
          type: 'degraded_response',
          reason: 'Unable to achieve high confidence, proceeding with warnings',
          retryCount,
          maxRetries,
        };
      }
    }
    
    // General low confidence
    if (confidence < 0.8) {
      if (retryCount === 0) {
        return {
          type: 'retry',
          reason: `Low overall confidence (${confidence.toFixed(2)})`,
          retryCount,
          maxRetries,
        };
      } else if (confidence < 0.6) {
        return {
          type: 'human_review',
          reason: `Persistently low confidence (${confidence.toFixed(2)}) after retries`,
          retryCount,
          maxRetries,
        };
      } else {
        return {
          type: 'degraded_response',
          reason: `Moderate confidence (${confidence.toFixed(2)}), flagging for review`,
          retryCount,
          maxRetries,
        };
      }
    }
    
    // Default fallback (should not reach here if confidence < 0.8)
    return {
      type: 'degraded_response',
      reason: 'Confidence below threshold',
      retryCount,
      maxRetries,
    };
  }

  /**
   * Main method to build a validated response
   * Integrates validation chain with fallback strategies
   */
  async buildResponse(rawAnswer: string, context?: any): Promise<any> {
    this.logger.log('Building response with validation');
    
    try {
      // Validate the raw answer
      const validated = await this.validateResponse(rawAnswer, context);
      
      // Check if fallback is needed (confidence < 0.8)
      if (validated.requiresFallback && validated.fallbackAction) {
        this.logger.warn(
          `Triggering fallback strategy: ${validated.fallbackAction.type}`,
        );
        return await this.fallbackStrategy(rawAnswer, validated, context);
      }
      
      // Format and return the validated response
      return this.formatResponse(rawAnswer, validated);
    } catch (error) {
      this.logger.error('Error building response', error.stack);
      
      // Emergency fallback
      return {
        success: false,
        error: 'Failed to build validated response',
        details: error.message,
        rawAnswer,
        validation: {
          isValid: false,
          overallConfidence: 0,
          requiresFallback: true,
        },
      };
    }
  }

  /**
   * Execute fallback strategy based on validation results
   */
  private async fallbackStrategy(
    rawAnswer: string,
    validation: ResponseValidation,
    context?: any,
  ): Promise<any> {
    const fallbackAction = validation.fallbackAction!;
    
    switch (fallbackAction.type) {
      case 'retry':
        this.logger.log(
          `Retry attempt ${fallbackAction.retryCount + 1}/${fallbackAction.maxRetries}`,
        );
        
        // Add retry context to help improve the response
        const enhancedContext = {
          ...context,
          previousAttempt: rawAnswer,
          validationIssues: validation.recommendations,
          retryReason: fallbackAction.reason,
        };
        
        // Note: In real implementation, this would call the AI service again
        // For now, we'll return a structured response indicating retry needed
        return {
          success: false,
          action: 'retry_required',
          retryCount: fallbackAction.retryCount + 1,
          maxRetries: fallbackAction.maxRetries,
          reason: fallbackAction.reason,
          enhancedContext,
          validation,
        };
        
      case 'alternative_model':
        this.logger.log('Switching to alternative model');
        
        // Note: In real implementation, this would use a different AI model
        return {
          success: false,
          action: 'alternative_model_required',
          reason: fallbackAction.reason,
          originalValidation: validation,
          recommendation: 'Use more specialized or powerful model',
        };
        
      case 'human_review':
        this.logger.log('Flagging for human review');
        
        return {
          success: true,
          requiresReview: true,
          reviewPriority: 'high',
          answer: this.formatDegradedResponse(rawAnswer, validation),
          validation,
          reviewReason: fallbackAction.reason,
          metadata: {
            flaggedAt: new Date().toISOString(),
            confidenceScore: validation.overallConfidence,
            validationDetails: validation.levels,
          },
        };
        
      case 'degraded_response':
        this.logger.log('Returning degraded response with warnings');
        
        return {
          success: true,
          degraded: true,
          answer: this.formatDegradedResponse(rawAnswer, validation),
          warnings: [
            fallbackAction.reason,
            `Confidence score: ${validation.overallConfidence.toFixed(2)}`,
            ...validation.recommendations || [],
          ],
          validation,
          metadata: {
            degradedAt: new Date().toISOString(),
            confidenceScore: validation.overallConfidence,
          },
        };
        
      default:
        this.logger.error(`Unknown fallback action: ${fallbackAction.type}`);
        return {
          success: false,
          error: 'Unknown fallback action',
          rawAnswer,
          validation,
        };
    }
  }

  /**
   * Format a validated response with metadata
   */
  private formatResponse(
    rawAnswer: string,
    validation: ResponseValidation,
  ): any {
    return {
      success: true,
      answer: rawAnswer,
      confidence: validation.overallConfidence,
      validation: {
        passed: validation.isValid,
        confidence: validation.overallConfidence,
        levels: {
          internalConsistency: {
            passed: validation.levels.level1.passed,
            confidence: validation.levels.level1.confidence,
            issues: validation.levels.level1.issues,
          },
          historicalComparison: {
            passed: validation.levels.level2.passed,
            confidence: validation.levels.level2.confidence,
            details: validation.levels.level2.details,
          },
          externalValidation: {
            passed: validation.levels.level3.passed,
            confidence: validation.levels.level3.confidence,
            details: validation.levels.level3.details,
          },
        },
      },
      metadata: {
        processedAt: new Date().toISOString(),
        validationDuration: null, // Could be tracked with timers
      },
    };
  }

  /**
   * Format a degraded response with clear warnings
   */
  private formatDegradedResponse(
    rawAnswer: string,
    validation: ResponseValidation,
  ): any {
    return {
      content: rawAnswer,
      disclaimer: 'This response has lower confidence and should be reviewed carefully',
      confidenceLevel: validation.overallConfidence < 0.5 ? 'low' : 'moderate',
      validationSummary: {
        internalConsistency: validation.levels.level1.passed ? 'passed' : 'failed',
        historicalAlignment: validation.levels.level2.passed ? 'passed' : 'failed',
        externalValidation: validation.levels.level3.passed ? 'passed' : 'failed',
      },
      suggestedActions: validation.recommendations,
    };
  }
}
