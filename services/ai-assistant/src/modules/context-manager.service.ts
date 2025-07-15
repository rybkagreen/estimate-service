import { Injectable, Logger } from '@nestjs/common';
import * as redis from 'redis';

@Injectable()
export class ContextManagerService {
  private readonly logger = new Logger(ContextManagerService.name);
  private readonly redisClient: redis.RedisClientType;

  constructor() {
    this.redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.redisClient.connect().catch((err) => {
      this.logger.error('Failed to connect to Redis', err);
    });
  }

  /**
   * Save chat context for a session
   */
  async saveContext(sessionId: string, context: any) {
    this.logger.log(`Saving context for session ${sessionId}`);
    await this.redisClient.set(`session:${sessionId}`, JSON.stringify(context), {
      EX: 3600, // set expiry to 1 hour
    });
  }

  /**
   * Retrieve chat context for a session
   */
  async getContext(sessionId: string): Promise<any | null> {
    this.logger.log(`Retrieving context for session ${sessionId}`);
    const context = await this.redisClient.get(`session:${sessionId}`);
    return context ? JSON.parse(context) : null;
  }

  /**
   * Clear chat context for a session
   */
  async clearContext(sessionId: string) {
    this.logger.log(`Clearing context for session ${sessionId}`);
    await this.redisClient.del(`session:${sessionId}`);
  }

  /**
   * Manage session interactions and update context
   */
  async manageSession(sessionId: string, interaction: any) {
    this.logger.log(`Managing session ${sessionId}`);
    const context = await this.getContext(sessionId);
    // Simplifying the context update logic
    const updatedContext = {
      ...context,
      lastInteraction: interaction,
    };
    await this.saveContext(sessionId, updatedContext);
  }
}
