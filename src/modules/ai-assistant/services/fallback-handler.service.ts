import { Injectable, Logger } from '@nestjs/common';
import { FallbackAction, ResponseValidation } from './response-builder.service';
import { AIAssistantService } from '../ai-assistant.service';

export interface FallbackResult {
  success: boolean;
  action: FallbackAction;
  newResponse?: any;
  error?: string;
  metadata?: {
    retryAttempt?: number;
    alternativeModel?: string;
    degradedConfidence?: number;
  };
}

@Injectable()
export class FallbackHandlerService {
  private readonly logger = new Logger(FallbackHandlerService.name);

  constructor(
    private readonly aiAssistantService: AIAssistantService,
  ) {}

  /**
   * Handle fallback action based on validation results
   */
  async handleFallback(
    validation: ResponseValidation,
    originalRequest: any,
    originalResponse: any,
  ): Promise<FallbackResult> {
    if (!validation.requiresFallback || !validation.fallbackAction) {
      return {
        success: true,
        action: { type: 'degraded_response', reason: 'No fallback required' },
      };
    }

    const { fallbackAction } = validation;
    
    this.logger.log(
      `Executing fallback action: ${fallbackAction.type} - ${fallbackAction.reason}`,
    );

    switch (fallbackAction.type) {
      case 'retry':
        return await this.handleRetry(
          fallbackAction,
          originalRequest,
          validation,
        );
      
      case 'alternative_model':
        return await this.handleAlternativeModel(
          fallbackAction,
          originalRequest,
          validation,
        );
      
      case 'human_review':
        return await this.handleHumanReview(
          fallbackAction,
          originalResponse,
          validation,
        );
      
      case 'degraded_response':
        return await this.handleDegradedResponse(
          fallbackAction,
          originalResponse,
          validation,
        );
      
      default:
        return {
          success: false,
          action: fallbackAction,
          error: 'Unknown fallback action type',
        };
    }
  }

  /**
   * Handle retry with enhanced context
   */
  private async handleRetry(
    action: FallbackAction,
    originalRequest: any,
    validation: ResponseValidation,
  ): Promise<FallbackResult> {
    try {
      // Enhance the request with validation feedback
      const enhancedRequest = {
        ...originalRequest,
        retryContext: {
          attempt: (action.retryCount || 0) + 1,
          previousIssues: this.extractIssues(validation),
          recommendations: validation.recommendations,
        },
        // Add more specific instructions based on what failed
        enhancedPrompt: this.generateEnhancedPrompt(validation),
      };

      this.logger.debug(
        `Retrying request with enhanced context (attempt ${enhancedRequest.retryContext.attempt})`,
      );

      // Call AI assistant with enhanced request
      const newResponse = await this.aiAssistantService.generateEstimate(
        enhancedRequest,
      );

      return {
        success: true,
        action,
        newResponse,
        metadata: {
          retryAttempt: enhancedRequest.retryContext.attempt,
        },
      };
    } catch (error) {
      this.logger.error('Retry fallback failed', error.stack);
      return {
        success: false,
        action,
        error: error.message,
      };
    }
  }

  /**
   * Handle alternative model fallback
   */
  private async handleAlternativeModel(
    action: FallbackAction,
    originalRequest: any,
    validation: ResponseValidation,
  ): Promise<FallbackResult> {
    try {
      // Determine which model to use based on what failed
      const alternativeModel = this.selectAlternativeModel(validation);
      
      const enhancedRequest = {
        ...originalRequest,
        modelOverride: alternativeModel,
        validationContext: {
          reason: action.reason,
          previousConfidence: validation.overallConfidence,
        },
      };

      this.logger.debug(
        `Switching to alternative model: ${alternativeModel}`,
      );

      const newResponse = await this.aiAssistantService.generateEstimate(
        enhancedRequest,
      );

      return {
        success: true,
        action,
        newResponse,
        metadata: {
          alternativeModel,
        },
      };
    } catch (error) {
      this.logger.error('Alternative model fallback failed', error.stack);
      return {
        success: false,
        action,
        error: error.message,
      };
    }
  }

  /**
   * Handle human review requirement
   */
  private async handleHumanReview(
    action: FallbackAction,
    originalResponse: any,
    validation: ResponseValidation,
  ): Promise<FallbackResult> {
    // Flag response for human review
    const reviewRequest = {
      response: originalResponse,
      validation,
      reason: action.reason,
      priority: validation.overallConfidence < 0.3 ? 'high' : 'medium',
      timestamp: new Date(),
      issues: this.extractIssues(validation),
    };

    this.logger.warn(
      `Response flagged for human review: ${action.reason}`,
      reviewRequest,
    );

    // In a real implementation, this would:
    // 1. Store the review request in a queue
    // 2. Notify human reviewers
    // 3. Track review status
    
    return {
      success: true,
      action,
      metadata: {
        degradedConfidence: validation.overallConfidence,
      },
    };
  }

  /**
   * Handle degraded response
   */
  private async handleDegradedResponse(
    action: FallbackAction,
    originalResponse: any,
    validation: ResponseValidation,
  ): Promise<FallbackResult> {
    // Add warnings and caveats to the response
    const degradedResponse = {
      ...originalResponse,
      warnings: [
        `Response confidence: ${(validation.overallConfidence * 100).toFixed(1)}%`,
        action.reason,
        ...validation.recommendations || [],
      ],
      validationDetails: {
        level1: {
          passed: validation.levels.level1.passed,
          confidence: validation.levels.level1.confidence,
          issues: validation.levels.level1.issues,
        },
        level2: {
          passed: validation.levels.level2.passed,
          confidence: validation.levels.level2.confidence,
          issues: validation.levels.level2.issues,
        },
        level3: {
          passed: validation.levels.level3.passed,
          confidence: validation.levels.level3.confidence,
          issues: validation.levels.level3.issues,
        },
      },
      requiresReview: true,
    };

    this.logger.warn(
      `Returning degraded response with confidence ${validation.overallConfidence}`,
    );

    return {
      success: true,
      action,
      newResponse: degradedResponse,
      metadata: {
        degradedConfidence: validation.overallConfidence,
      },
    };
  }

  /**
   * Extract all issues from validation results
   */
  private extractIssues(validation: ResponseValidation): string[] {
    const issues: string[] = [];
    
    if (validation.levels.level1.issues) {
      issues.push(...validation.levels.level1.issues);
    }
    if (validation.levels.level2.issues) {
      issues.push(...validation.levels.level2.issues);
    }
    if (validation.levels.level3.issues) {
      issues.push(...validation.levels.level3.issues);
    }
    
    return [...new Set(issues)];
  }

  /**
   * Generate enhanced prompt based on validation failures
   */
  private generateEnhancedPrompt(validation: ResponseValidation): string {
    const issues = this.extractIssues(validation);
    const recommendations = validation.recommendations || [];
    
    let enhancedPrompt = 'Please regenerate the response with the following improvements:\n';
    
    if (issues.length > 0) {
      enhancedPrompt += '\nAddress these specific issues:\n';
      issues.forEach((issue, index) => {
        enhancedPrompt += `${index + 1}. ${issue}\n`;
      });
    }
    
    if (recommendations.length > 0) {
      enhancedPrompt += '\nConsider these recommendations:\n';
      recommendations.forEach((rec, index) => {
        enhancedPrompt += `${index + 1}. ${rec}\n`;
      });
    }
    
    // Add specific guidance based on which level failed
    if (!validation.levels.level1.passed) {
      enhancedPrompt += '\nEnsure internal consistency and avoid contradictions.\n';
    }
    if (!validation.levels.level2.passed) {
      enhancedPrompt += '\nAlign estimates with historical data patterns.\n';
    }
    if (!validation.levels.level3.passed) {
      enhancedPrompt += '\nImprove accuracy and provide more detailed justifications.\n';
    }
    
    return enhancedPrompt;
  }

  /**
   * Select appropriate alternative model based on failure type
   */
  private selectAlternativeModel(validation: ResponseValidation): string {
    // Logic to select best alternative model
    if (!validation.levels.level3.passed) {
      // If Claude validation failed, try DeepSeek
      return 'deepseek-chat';
    } else if (!validation.levels.level2.passed) {
      // If historical comparison failed, try a model with better domain knowledge
      return 'gpt-4-turbo';
    } else {
      // Default alternative
      return 'claude-3-opus';
    }
  }
}
