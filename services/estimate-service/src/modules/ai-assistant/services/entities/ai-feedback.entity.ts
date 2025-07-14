/**
 * AI Feedback Related Entities and Types
 */

export interface AIInteraction {
  id: string;
  request: {
    prompt: string;
    context?: any;
  };
  response: {
    answer: string;
    confidence: number;
    model: string;
    processingTime?: number;
  };
  timestamp: Date;
}

export interface AIFeedback {
  id: string;
  userId: string;
  interaction: AIInteraction;
  feedback: 'positive' | 'negative';
  feedbackType?: 'accuracy' | 'relevance' | 'completeness' | 'clarity' | 'other';
  comment?: string;
  createdAt: Date;
}

export interface ReviewTicket {
  id: string;
  feedbackId: string;
  interaction: AIInteraction;
  feedback: AIFeedback;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolution?: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  interactionId: string;
  prompt: string;
  response: string;
  context?: any;
  confidence: number;
  category: string;
  tags: string[];
  useCount: number;
  lastUsed: Date;
  createdAt: Date;
  effectiveness: number;
}

export interface CorrectionPrompt {
  originalPrompt: string;
  originalResponse: string;
  feedbackReason: string;
  suggestedPrompt: string;
  suggestedResponse?: string;
  confidence: number;
  generatedAt: Date;
}
