import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { SendMessageDto, AnalyzeEstimateDto, GenerateEstimateDto } from './dto';

@ApiTags('AI Chat')
@Controller('api/v1/ai/chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Send message to AI assistant' })
  @ApiResponse({ status: 200, description: 'Message processed successfully' })
  async sendMessage(
    @Body() dto: SendMessageDto,
    @Req() req: Request & { user: any },
  ) {
    return this.chatService.processMessage({
      ...dto,
      userId: req.user.id,
    });
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Get chat history' })
  @ApiResponse({ status: 200, description: 'Chat history retrieved' })
  async getChatHistory(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.chatService.getChatHistory(sessionId, limit, offset);
  }

  @Post('analyze-estimate')
  @ApiOperation({ summary: 'Analyze construction estimate' })
  @ApiResponse({ status: 200, description: 'Estimate analyzed successfully' })
  async analyzeEstimate(
    @Body() dto: AnalyzeEstimateDto,
    @Req() req: Request & { user: any },
  ) {
    return this.chatService.analyzeEstimate({
      ...dto,
      userId: req.user.id,
    });
  }

  @Post('generate-estimate')
  @ApiOperation({ summary: 'Generate construction estimate' })
  @ApiResponse({ status: 200, description: 'Estimate generated successfully' })
  async generateEstimate(
    @Body() dto: GenerateEstimateDto,
    @Req() req: Request & { user: any },
  ) {
    return this.chatService.generateEstimate({
      ...dto,
      userId: req.user.id,
    });
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get AI suggestions' })
  @ApiResponse({ status: 200, description: 'Suggestions retrieved' })
  async getSuggestions(
    @Query('context') context: string,
    @Query('type') type?: 'rates' | 'materials' | 'works',
  ) {
    return this.chatService.getSuggestions(context, type);
  }
}
