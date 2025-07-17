import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { KnowledgeService, KnowledgeItem } from './knowledge.service';

@ApiTags('AI Assistant Knowledge Base')
@Controller('ai-assistant/knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search knowledge base' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  searchKnowledge(
    @Query('query') query: string,
    @Query('category') category: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    return this.knowledgeService.searchKnowledge(
      query,
      category,
      parseInt(page),
      parseInt(pageSize),
    );
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all knowledge categories' })
  getCategories() {
    return this.knowledgeService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get knowledge item by ID' })
  getKnowledgeItem(@Param('id') id: string) {
    return this.knowledgeService.getKnowledgeItem(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add new knowledge item' })
  addKnowledgeItem(
    @Body() data: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    return this.knowledgeService.addKnowledgeItem(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update knowledge item' })
  updateKnowledgeItem(
    @Param('id') id: string,
    @Body() updates: Partial<Omit<KnowledgeItem, 'id' | 'createdAt'>>,
  ) {
    return this.knowledgeService.updateKnowledgeItem(id, updates);
  }
}
