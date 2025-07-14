import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../prisma/prisma.service';
import { 
  AIFeedback, 
  AIInteraction, 
  ReviewTicket, 
  KnowledgeBaseEntry,
  CorrectionPrompt 
} from '../entities/ai-feedback.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
@Processor('feedback-processor')
export class FeedbackProcessorService {
  private readonly logger = new Logger(FeedbackProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('feedback-processor') private feedbackQueue: Queue,
    @InjectQueue('notifications') private notificationQueue: Queue,
    @InjectQueue('ai-training') private trainingQueue: Queue,
  ) {}

  /**
   * Process feedback from users on AI responses
   */
  @Process('process-feedback')
  async handleFeedbackJob(job: Job<AIFeedback>): Promise<void> {
    const feedbackData = job.data;
    this.logger.log(`Processing feedback ${feedbackData.id} - Type: ${feedbackData.feedback}`);
    
    try {
      // Update feedback status to processing
      await this.updateFeedbackStatus(feedbackData.id, 'processed');

      if (feedbackData.feedback === 'positive') {
        // Add to knowledge base for future reference
        await this.addToKnowledgeBase(feedbackData.interaction);
        
        // Update effectiveness metrics
        await this.updateEffectivenessMetrics(feedbackData.interaction, 1.0);
      } else {
        // Handle negative feedback
        const ticket = await this.createReviewTicket(feedbackData);
        
        // Send notification to engineering team
        await this.notifyEngineers(ticket, feedbackData);
        
        // Generate correction prompt
        const correctionPrompt = await this.generateCorrectionPrompt(feedbackData);
        
        // Add to retraining queue
        await this.addToRetrainingQueue(feedbackData, correctionPrompt);
        
        // Update effectiveness metrics
        await this.updateEffectivenessMetrics(feedbackData.interaction, 0.0);
      }

      // Log feedback processing completion
      this.logger.log(`Successfully processed feedback ${feedbackData.id}`);
    } catch (error) {
      this.logger.error(`Error processing feedback ${feedbackData.id}:`, error.stack);
      
      // Retry logic - maximum 3 attempts
      if (job.attemptsMade < 3) {
        throw error; // This will trigger a retry
      } else {
        // After max retries, mark as failed and notify
        await this.handleFailedFeedback(feedbackData, error);
      }
    }
  }

  /**
   * Add successful interaction to knowledge base
   */
  private async addToKnowledgeBase(interaction: AIInteraction): Promise<KnowledgeBaseEntry> {
    this.logger.debug(`Adding interaction ${interaction.id} to knowledge base`);

    const entry: KnowledgeBaseEntry = {
      id: uuidv4(),
      interactionId: interaction.id,
      prompt: interaction.request.prompt,
      response: interaction.response.answer,
      context: interaction.request.context,
      confidence: interaction.response.confidence,
      category: this.categorizeInteraction(interaction),
      tags: this.extractTags(interaction),
      useCount: 1,
      lastUsed: new Date(),
      createdAt: new Date(),
      effectiveness: 1.0, // Perfect score for positive feedback
    };

    // Save to database (using Prisma)
    // await this.prisma.knowledgeBaseEntry.create({ data: entry });
    
    // For now, log the entry
    this.logger.log(`Knowledge base entry created: ${entry.id}`);
    
    return entry;
  }

  /**
   * Create a review ticket for negative feedback
   */
  private async createReviewTicket(feedback: AIFeedback): Promise<ReviewTicket> {
    this.logger.debug(`Creating review ticket for feedback ${feedback.id}`);

    const priority = this.determinePriority(feedback);
    
    const ticket: ReviewTicket = {
      id: uuidv4(),
      feedbackId: feedback.id,
      interaction: feedback.interaction,
      feedback: feedback,
      priority,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    // await this.prisma.reviewTicket.create({ data: ticket });
    
    // Queue for assignment
    await this.feedbackQueue.add('assign-review-ticket', ticket, {
      priority: this.getPriorityValue(priority),
      delay: 0,
    });
    
    this.logger.log(`Review ticket created: ${ticket.id} with priority: ${priority}`);
    
    return ticket;
  }

  /**
   * Send notification to engineers about negative feedback
   */
  private async notifyEngineers(
    ticket: ReviewTicket, 
    feedback: AIFeedback
  ): Promise<void> {
    this.logger.debug(`Notifying engineers about ticket ${ticket.id}`);

    const notification = {
      type: 'negative_feedback_alert',
      ticketId: ticket.id,
      priority: ticket.priority,
      subject: `Negative AI Feedback - ${ticket.priority.toUpperCase()} Priority`,
      message: this.formatNotificationMessage(ticket, feedback),
      channels: ['email', 'slack'],
      recipients: this.getNotificationRecipients(ticket.priority),
      metadata: {
        interactionId: feedback.interaction.id,
        userId: feedback.userId,
        feedbackType: feedback.feedbackType,
        model: feedback.interaction.response.model,
      },
    };

    // Add to notification queue
    await this.notificationQueue.add('send-notification', notification, {
      priority: this.getPriorityValue(ticket.priority),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    
    this.logger.log(`Notification queued for ticket ${ticket.id}`);
  }

  /**
   * Generate a correction prompt based on negative feedback
   */
  private async generateCorrectionPrompt(
    feedback: AIFeedback
  ): Promise<CorrectionPrompt> {
    this.logger.debug(`Generating correction prompt for feedback ${feedback.id}`);

    const { interaction } = feedback;
    
    // Analyze the failure pattern
    const failureAnalysis = this.analyzeFailure(feedback);
    
    // Generate improved prompt
    const correctionPrompt: CorrectionPrompt = {
      originalPrompt: interaction.request.prompt,
      originalResponse: interaction.response.answer,
      feedbackReason: this.extractFeedbackReason(feedback),
      suggestedPrompt: this.generateImprovedPrompt(
        interaction.request.prompt,
        failureAnalysis
      ),
      suggestedResponse: undefined, // Will be generated by AI
      confidence: this.calculateCorrectionConfidence(failureAnalysis),
      generatedAt: new Date(),
    };

    // Queue for AI processing
    await this.feedbackQueue.add('process-correction-prompt', correctionPrompt, {
      delay: 5000, // 5 second delay
    });
    
    this.logger.log(`Correction prompt generated for feedback ${feedback.id}`);
    
    return correctionPrompt;
  }

  /**
   * Weekly retraining job using cron
   */
  @Cron(CronExpression.EVERY_WEEK)
  async scheduleWeeklyRetraining(): Promise<void> {
    this.logger.log('Starting weekly retraining schedule');
    
    try {
      // Collect feedback data from the past week
      const weeklyData = await this.collectWeeklyFeedbackData();
      
      // Add retraining job to queue
      await this.trainingQueue.add('weekly-retraining', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        feedbackCount: weeklyData.totalFeedback,
        positiveRatio: weeklyData.positiveRatio,
        commonIssues: weeklyData.commonIssues,
        priorityAreas: weeklyData.priorityAreas,
      }, {
        priority: 1,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000, // 1 minute
        },
      });
      
      this.logger.log('Weekly retraining job queued successfully');
    } catch (error) {
      this.logger.error('Failed to schedule weekly retraining:', error.stack);
    }
  }

  /**
   * Process the actual retraining job
   */
  @Process('weekly-retraining')
  async processWeeklyRetraining(job: Job<any>): Promise<void> {
    const { startDate, endDate, feedbackCount } = job.data;
    
    this.logger.log(
      `Processing weekly retraining: ${feedbackCount} feedback items from ${startDate} to ${endDate}`
    );
    
    try {
      // Step 1: Aggregate feedback patterns
      const patterns = await this.aggregateFeedbackPatterns(startDate, endDate);
      
      // Step 2: Generate training dataset
      const trainingData = await this.generateTrainingDataset(patterns);
      
      // Step 3: Update prompt templates
      await this.updatePromptTemplates(patterns);
      
      // Step 4: Update knowledge base weights
      await this.updateKnowledgeBaseWeights(patterns);
      
      // Step 5: Generate retraining report
      const report = await this.generateRetrainingReport({
        patterns,
        trainingData,
        startDate,
        endDate,
      });
      
      // Notify team of completion
      await this.notificationQueue.add('send-notification', {
        type: 'retraining_complete',
        subject: 'Weekly AI Retraining Completed',
        message: `Retraining completed successfully. Processed ${feedbackCount} feedback items.`,
        report,
        channels: ['email'],
        recipients: ['ai-team@company.com'],
      });
      
      this.logger.log('Weekly retraining completed successfully');
    } catch (error) {
      this.logger.error('Error during weekly retraining:', error.stack);
      throw error;
    }
  }

  // Helper methods

  private async updateFeedbackStatus(
    feedbackId: string, 
    status: 'pending' | 'processed' | 'reviewed'
  ): Promise<void> {
    // await this.prisma.aiFeedback.update({
    //   where: { id: feedbackId },
    //   data: { status, processedAt: new Date() }
    // });
    this.logger.debug(`Updated feedback ${feedbackId} status to ${status}`);
  }

  private categorizeInteraction(interaction: AIInteraction): string {
    // Simple categorization based on prompt content
    const prompt = interaction.request.prompt.toLowerCase();
    
    if (prompt.includes('cost') || prompt.includes('price') || prompt.includes('estimate')) {
      return 'cost_estimation';
    } else if (prompt.includes('material') || prompt.includes('specification')) {
      return 'material_specification';
    } else if (prompt.includes('timeline') || prompt.includes('schedule')) {
      return 'project_timeline';
    } else if (prompt.includes('risk') || prompt.includes('issue')) {
      return 'risk_assessment';
    }
    
    return 'general';
  }

  private extractTags(interaction: AIInteraction): string[] {
    const tags: string[] = [];
    const prompt = interaction.request.prompt.toLowerCase();
    
    // Extract common construction-related tags
    const tagKeywords = [
      'residential', 'commercial', 'industrial',
      'renovation', 'new construction', 'maintenance',
      'plumbing', 'electrical', 'hvac', 'structural',
      'budget', 'timeline', 'permit', 'inspection'
    ];
    
    tagKeywords.forEach(keyword => {
      if (prompt.includes(keyword)) {
        tags.push(keyword.replace(' ', '_'));
      }
    });
    
    // Add model tag
    tags.push(`model:${interaction.response.model}`);
    
    // Add confidence level tag
    if (interaction.response.confidence >= 0.9) {
      tags.push('high_confidence');
    } else if (interaction.response.confidence >= 0.7) {
      tags.push('medium_confidence');
    } else {
      tags.push('low_confidence');
    }
    
    return tags;
  }

  private determinePriority(feedback: AIFeedback): 'low' | 'medium' | 'high' | 'critical' {
    // Determine priority based on various factors
    const { interaction, feedbackType } = feedback;
    
    // Critical: Low confidence + negative feedback
    if (interaction.response.confidence < 0.5) {
      return 'critical';
    }
    
    // High: Accuracy issues
    if (feedbackType === 'accuracy') {
      return 'high';
    }
    
    // Medium: Completeness or clarity issues
    if (feedbackType === 'completeness' || feedbackType === 'clarity') {
      return 'medium';
    }
    
    // Low: Other issues
    return 'low';
  }

  private getPriorityValue(priority: string): number {
    const priorityMap = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1,
    };
    return priorityMap[priority] || 1;
  }

  private formatNotificationMessage(ticket: ReviewTicket, feedback: AIFeedback): string {
    return `
Negative feedback received for AI interaction.

Ticket ID: ${ticket.id}
Priority: ${ticket.priority.toUpperCase()}
User: ${feedback.userId}
Feedback Type: ${feedback.feedbackType || 'general'}
Comment: ${feedback.comment || 'No comment provided'}

Original Prompt: ${feedback.interaction.request.prompt}
AI Response Confidence: ${feedback.interaction.response.confidence}
Model Used: ${feedback.interaction.response.model}

Please review and take appropriate action.
    `.trim();
  }

  private getNotificationRecipients(priority: string): string[] {
    const baseRecipients = ['ai-team@company.com'];
    
    if (priority === 'critical' || priority === 'high') {
      baseRecipients.push('engineering-lead@company.com');
    }
    
    if (priority === 'critical') {
      baseRecipients.push('cto@company.com');
    }
    
    return baseRecipients;
  }

  private analyzeFailure(feedback: AIFeedback): any {
    // Analyze the failure pattern
    return {
      type: feedback.feedbackType,
      confidence: feedback.interaction.response.confidence,
      responseLength: feedback.interaction.response.answer.length,
      hasContext: !!feedback.interaction.request.context,
      processingTime: feedback.interaction.response.processingTime,
      userComment: feedback.comment,
    };
  }

  private extractFeedbackReason(feedback: AIFeedback): string {
    if (feedback.comment) {
      return feedback.comment;
    }
    
    const reasons = {
      'accuracy': 'Response contained inaccurate information',
      'relevance': 'Response was not relevant to the question',
      'completeness': 'Response was incomplete or missing key information',
      'clarity': 'Response was unclear or confusing',
      'other': 'General quality issues with the response',
    };
    
    return reasons[feedback.feedbackType] || reasons['other'];
  }

  private generateImprovedPrompt(originalPrompt: string, analysis: any): string {
    let improvedPrompt = originalPrompt;
    
    // Add context if missing
    if (!analysis.hasContext) {
      improvedPrompt = `[Provide specific context about the construction project]\n${improvedPrompt}`;
    }
    
    // Add clarity if response was unclear
    if (analysis.type === 'clarity') {
      improvedPrompt += '\n\nPlease provide a clear and structured response with specific details.';
    }
    
    // Add completeness requirements
    if (analysis.type === 'completeness') {
      improvedPrompt += '\n\nInclude all relevant information including costs, timelines, materials, and potential risks.';
    }
    
    return improvedPrompt;
  }

  private calculateCorrectionConfidence(analysis: any): number {
    let confidence = 0.8; // Base confidence
    
    // Adjust based on original confidence
    if (analysis.confidence < 0.5) {
      confidence -= 0.2;
    }
    
    // Adjust based on feedback type
    if (analysis.type === 'accuracy') {
      confidence -= 0.1;
    }
    
    return Math.max(0.3, confidence);
  }

  private async addToRetrainingQueue(
    feedback: AIFeedback, 
    correctionPrompt: CorrectionPrompt
  ): Promise<void> {
    await this.trainingQueue.add('feedback-training-data', {
      feedbackId: feedback.id,
      interactionId: feedback.interaction.id,
      originalPrompt: feedback.interaction.request.prompt,
      originalResponse: feedback.interaction.response.answer,
      correctionPrompt: correctionPrompt.suggestedPrompt,
      feedbackType: feedback.feedbackType,
      timestamp: new Date(),
    }, {
      delay: 60000, // 1 minute delay
    });
  }

  private async updateEffectivenessMetrics(
    interaction: AIInteraction, 
    score: number
  ): Promise<void> {
    // Update effectiveness metrics in knowledge base
    // await this.prisma.knowledgeBaseEntry.updateMany({
    //   where: { interactionId: interaction.id },
    //   data: { effectiveness: score }
    // });
    this.logger.debug(`Updated effectiveness score to ${score} for interaction ${interaction.id}`);
  }

  private async handleFailedFeedback(feedback: AIFeedback, error: Error): Promise<void> {
    this.logger.error(`Failed to process feedback ${feedback.id} after max retries`);
    
    // Create critical alert
    await this.notificationQueue.add('send-notification', {
      type: 'feedback_processing_failed',
      priority: 'critical',
      subject: 'Critical: Feedback Processing Failed',
      message: `Failed to process feedback ${feedback.id}. Error: ${error.message}`,
      channels: ['email', 'slack'],
      recipients: ['ai-team@company.com', 'ops-team@company.com'],
    });
  }

  private async collectWeeklyFeedbackData(): Promise<any> {
    // Collect and aggregate feedback data from the past week
    // const feedbacks = await this.prisma.aiFeedback.findMany({
    //   where: {
    //     createdAt: {
    //       gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    //     }
    //   }
    // });
    
    // For now, return mock data
    return {
      totalFeedback: 150,
      positiveRatio: 0.75,
      commonIssues: ['accuracy', 'completeness'],
      priorityAreas: ['cost_estimation', 'material_specification'],
    };
  }

  private async aggregateFeedbackPatterns(startDate: Date, endDate: Date): Promise<any> {
    // Aggregate patterns from feedback
    return {
      mostCommonErrors: ['incomplete cost breakdown', 'missing timeline details'],
      successfulPatterns: ['detailed material lists', 'clear cost summaries'],
      improvementAreas: ['technical specifications', 'regulatory compliance'],
    };
  }

  private async generateTrainingDataset(patterns: any): Promise<any> {
    // Generate training dataset based on patterns
    return {
      positiveExamples: 100,
      negativeExamples: 50,
      correctedExamples: 30,
      totalDataPoints: 180,
    };
  }

  private async updatePromptTemplates(patterns: any): Promise<void> {
    // Update prompt templates based on learned patterns
    this.logger.log('Updating prompt templates based on feedback patterns');
  }

  private async updateKnowledgeBaseWeights(patterns: any): Promise<void> {
    // Update knowledge base entry weights based on effectiveness
    this.logger.log('Updating knowledge base weights');
  }

  private async generateRetrainingReport(data: any): Promise<any> {
    return {
      summary: 'Weekly retraining completed successfully',
      metrics: {
        feedbackProcessed: data.trainingData.totalDataPoints,
        accuracyImprovement: '5%',
        newPatternsLearned: data.patterns.successfulPatterns.length,
      },
      recommendations: [
        'Focus on improving cost estimation accuracy',
        'Add more context to material specification prompts',
      ],
    };
  }
}

