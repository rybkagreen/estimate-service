import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  Put,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  ParseUUIDPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery,
  ApiParam 
} from '@nestjs/swagger';
import { KnowledgeService } from '../services/knowledge.service';
import { CreateKnowledgeDto } from '../dto/create-knowledge.dto';
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
import { CreateValidationDto } from '../dto/create-validation.dto';
import { KnowledgeStatus, KnowledgeCategory } from '@prisma/client';

@ApiTags('knowledge')
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую запись знаний' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Запись создана успешно' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Неверные данные' })
  async create(@Body() createKnowledgeDto: CreateKnowledgeDto, @Request() req: any) {
    // В реальном приложении userId должен браться из JWT токена
    const userId = req.user?.id || 'default-user-id';
    return this.knowledgeService.create(createKnowledgeDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список записей знаний' })
  @ApiQuery({ name: 'status', enum: KnowledgeStatus, required: false })
  @ApiQuery({ name: 'category', enum: KnowledgeCategory, required: false })
  @ApiQuery({ name: 'tags', type: String, isArray: true, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  async findAll(
    @Query('status') status?: KnowledgeStatus,
    @Query('category') category?: KnowledgeCategory,
    @Query('tags') tags?: string[],
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.knowledgeService.findAll({
      status,
      category,
      tags,
      search,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить запись знаний по ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Запись найдена' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Запись не найдена' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.knowledgeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить запись знаний' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Запись обновлена' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Запись не найдена' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateKnowledgeDto: Partial<CreateKnowledgeDto>,
  ) {
    return this.knowledgeService.update(id, updateKnowledgeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить запись знаний' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Запись удалена' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Запись не найдена' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.knowledgeService.remove(id);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Добавить обратную связь к записи знаний' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Обратная связь добавлена' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Запись не найдена' })
  async addFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() feedbackDto: CreateFeedbackDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'default-user-id';
    return this.knowledgeService.addFeedback(id, feedbackDto, userId);
  }

  @Get(':id/feedback')
  @ApiOperation({ summary: 'Получить обратную связь для записи знаний' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список обратной связи' })
  async getFeedback(@Param('id', ParseUUIDPipe) id: string) {
    return this.knowledgeService.getFeedback(id);
  }

  @Post(':id/validation')
  @ApiOperation({ summary: 'Добавить экспертную валидацию' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Валидация добавлена' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Запись не найдена' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Валидация от этого эксперта уже существует' })
  async addValidation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() validationDto: CreateValidationDto,
    @Request() req: any,
  ) {
    const expertId = req.user?.id || 'default-expert-id';
    return this.knowledgeService.addValidation(id, validationDto, expertId);
  }

  @Get(':id/validations')
  @ApiOperation({ summary: 'Получить валидации для записи знаний' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Список валидаций' })
  async getValidations(@Param('id', ParseUUIDPipe) id: string) {
    return this.knowledgeService.getValidations(id);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Опубликовать запись знаний' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Запись опубликована' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Запись не найдена' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Запись не может быть опубликована' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.knowledgeService.publish(id);
  }

  @Put(':id/archive')
  @ApiOperation({ summary: 'Архивировать запись знаний' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Запись архивирована' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Запись не найдена' })
  async archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.knowledgeService.archive(id);
  }

  @Get('tags/popular')
  @ApiOperation({ summary: 'Получить популярные теги' })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  async getPopularTags(@Query('limit') limit: number = 20) {
    return this.knowledgeService.getPopularTags(limit);
  }

  @Get('categories/statistics')
  @ApiOperation({ summary: 'Получить статистику по категориям' })
  async getCategoryStatistics() {
    return this.knowledgeService.getCategoryStatistics();
  }
}
