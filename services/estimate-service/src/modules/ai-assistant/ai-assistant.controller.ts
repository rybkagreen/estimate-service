import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantResponse, GrandSmetaItem } from '@ez-eco/shared-contracts';

@Controller('ai-assistant')
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  /**
   * Получение рекомендаций от ИИ-ассистента
   */
  @Post('suggest')
  async suggest(@Body() item: GrandSmetaItem): Promise<AiAssistantResponse> {
    return this.aiAssistantService.getSuggestions(item);
  }

  /**
   * Получение статистики правил
   */
  @Get('rules/stats')
  async getRulesStatistics(): Promise<{ totalRules: number; rulesStats: any }> {
    return this.aiAssistantService.getRulesStatistics();
  }
}
