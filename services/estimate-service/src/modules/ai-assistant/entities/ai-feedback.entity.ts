export interface AIInteraction {
  id: string;
  userId: string;
  projectId?: string;
  timestamp: Date;
  request: {
    prompt: string;
    context?: any;
    parameters?: Record<string, any>;
  };
  response: {
    answer: string;
    confidence: number;
    model: string;
    processingTime: number;
    validationResult?: any;
  };
  metadata?: {
    sessionId?: string;
    version?: string;
    tags?: string[];
  };
}

export interface AIFeedback {
  id: string;
  interactionId: string;
  interaction: AIInteraction;
  feedback: 'positive' | 'negative';
  feedbackType?: 'accuracy' | 'relevance' | 'completeness' | 'clarity' | 'other';
  comment?: string;
  userId: string;
  createdAt: Date;
  processedAt?: Date;
  status: 'pending' | 'processed' | 'reviewed';
  reviewNotes?: string;
  correctionApplied?: boolean;
}

export interface ReviewTicket {
  id: string;
  feedbackId: string;
  interaction: AIInteraction;
  feedback: AIFeedback;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  resolution?: {
    action: 'prompt_updated' | 'model_retrained' | 'documentation_updated' | 'no_action';
    description: string;
    implementedAt: Date;
  };
}

export interface KnowledgeBaseEntry {
  id: string;
  interactionId: string;
  prompt: string;
  response: string;
  context?: any;
  confidence: number;
  category?: string;
  tags: string[];
  useCount: number;
  lastUsed: Date;
  createdAt: Date;
  effectiveness: number; // 0-1 score based on feedback
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
