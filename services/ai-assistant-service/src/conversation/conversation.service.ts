import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeepSeekService, DeepSeekMessage } from '../deepseek/deepseek.service';

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deepSeekService: DeepSeekService
  ) {}

  async getConversations(userId: string) {
    return await this.prisma.conversation.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        messages: true,
      },
      take: 10, // Limit results for performance
    });
  }

  async startConversation(userId: string, initialPrompt: string) {
    const conversation = await this.prisma.conversation.create({
      data: {
        userId: userId,
        messages: {
          create: [{
            role: 'user',
            content: initialPrompt,
          }],
        },
      },
    });

    const responseContent = await this.sendToDeepSeek(initialPrompt);

    // Save response into the conversation
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: responseContent,
      },
    });

    return this.getConversation(conversation.id);
  }

  async sendMessage(conversationId: string, prompt: string) {
    // Save user message
    await this.prisma.message.create({
      data: {
        conversationId: conversationId,
        role: 'user',
        content: prompt,
      },
    });

    const responseContent = await this.sendToDeepSeek(prompt);

    // Save assistant response
    await this.prisma.message.create({
      data: {
        conversationId: conversationId,
        role: 'assistant',
        content: responseContent,
      },
    });

    return this.getConversation(conversationId);
  }

async getConversation(conversationId: string) {
    return await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  private async sendToDeepSeek(prompt: string) {
    const response = await this.deepSeekService.chat([
      {
        role: 'system',
        content: this.deepSeekService.getDefaultSystemPrompt(),
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);
    return response.choices[0]?.message.content || '';
  }
}
