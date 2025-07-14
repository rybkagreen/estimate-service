import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Req,
  HttpException,
  HttpStatus,
  UseInterceptors 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiBody 
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConversationService } from './conversation.service';

class StartConversationDto {
  prompt: string;
}

class SendMessageDto {
  message: string;
}

@ApiTags('Conversations')
@Controller('conversations')
@UseGuards(ThrottlerGuard)
@ApiBearerAuth()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  /**
   * Get user's conversation history
   */
  @Get()
  @ApiOperation({ summary: 'Get user conversation history' })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  async getConversations(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    return this.conversationService.getConversations(userId);
  }

  /**
   * Start a new conversation
   */
  @Post()
  @ApiOperation({ summary: 'Start a new conversation' })
  @ApiBody({ type: StartConversationDto })
  @ApiResponse({ status: 201, description: 'Conversation started successfully' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async startConversation(
    @Body() body: StartConversationDto,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    if (!body.prompt || body.prompt.trim().length === 0) {
      throw new HttpException('Prompt is required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.conversationService.startConversation(userId, body.prompt);
    } catch (error) {
      if (error.status === 429) {
        throw new HttpException('AI service rate limit exceeded. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
      }
      throw error;
    }
  }

  /**
   * Send a message in an existing conversation
   */
  @Post(':conversationId/messages')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: SendMessageDto,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    if (!body.message || body.message.trim().length === 0) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const conversation = await this.conversationService.sendMessage(conversationId, body.message);
      if (!conversation) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }
      return conversation;
    } catch (error) {
      if (error.status === 429) {
        throw new HttpException('AI service rate limit exceeded. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
      }
      throw error;
    }
  }

  /**
   * Get a specific conversation
   */
  @Get(':conversationId')
  @ApiOperation({ summary: 'Get a specific conversation' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Conversation details' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(
    @Param('conversationId') conversationId: string,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    // In a real implementation, you would verify the conversation belongs to the user
    const conversation = await this.conversationService.getConversation(conversationId);
    if (!conversation) {
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    }
    return conversation;
  }
}
