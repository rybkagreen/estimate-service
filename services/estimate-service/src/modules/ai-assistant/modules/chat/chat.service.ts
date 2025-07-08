import { Injectable, Logger } from '@nestjs/common';
import { CoreService } from '../core/core.service';

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response?: string;
  timestamp: Date;
  context?: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private sessions: Map<string, ChatSession> = new Map();

  constructor(private coreService: CoreService) {}

  /**
   * Create a new chat session
   */
  createSession(userId: string): ChatSession {
    const session: ChatSession = {
      id: `session_${Date.now()}`,
      userId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get chat session by ID
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Send message to AI and get response
   */
  async sendMessage(sessionId: string, message: string): Promise<ChatMessage> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: session.userId,
      message,
      timestamp: new Date(),
    };

    // Here you would integrate with actual AI service
    // For now, we'll return a mock response
    chatMessage.response = `AI Response to: "${message}"`;

    session.messages.push(chatMessage);
    session.updatedAt = new Date();

    return chatMessage;
  }

  /**
   * Get chat history for a session
   */
  getChatHistory(sessionId: string): ChatMessage[] {
    const session = this.getSession(sessionId);
    return session ? session.messages : [];
  }
}
