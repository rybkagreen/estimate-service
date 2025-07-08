import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('AI Assistant Chat')
@Controller('ai-assistant/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('session')
  @ApiOperation({ summary: 'Create new chat session' })
  @ApiBody({ schema: { properties: { userId: { type: 'string' } } } })
  createSession(@Body('userId') userId: string) {
    return this.chatService.createSession(userId);
  }

  @Post('session/:sessionId/message')
  @ApiOperation({ summary: 'Send message to AI' })
  @ApiBody({ schema: { properties: { message: { type: 'string' } } } })
  async sendMessage(
    @Param('sessionId') sessionId: string,
    @Body('message') message: string,
  ) {
    return this.chatService.sendMessage(sessionId, message);
  }

  @Get('session/:sessionId/history')
  @ApiOperation({ summary: 'Get chat history' })
  getChatHistory(@Param('sessionId') sessionId: string) {
    return this.chatService.getChatHistory(sessionId);
  }
}
