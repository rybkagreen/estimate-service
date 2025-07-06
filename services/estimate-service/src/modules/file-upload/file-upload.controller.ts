import {
    BadRequestException,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Res,
    StreamableFile,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    FileInterceptor,
    FilesInterceptor,
} from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileFilter, FileUploadService } from './file-upload.service';

@ApiTags('File Upload')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить один файл' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Файл успешно загружен' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации файла' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('estimateId') estimateId?: string,
    @GetUser('id') userId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    // Валидируем файл
    this.fileUploadService.validateFile(file);

    // Сохраняем информацию о файле
    const fileInfo = await this.fileUploadService.saveFileInfo(
      file,
      userId,
      estimateId,
    );

    return {
      success: true,
      message: 'Файл успешно загружен',
      file: fileInfo,
    };
  }

  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // До 10 файлов
  @ApiOperation({ summary: 'Загрузить несколько файлов' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Файлы успешно загружены' })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('estimateId') estimateId?: string,
    @GetUser('id') userId?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Файлы не предоставлены');
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of files) {
      try {
        this.fileUploadService.validateFile(file);
        const fileInfo = await this.fileUploadService.saveFileInfo(
          file,
          userId,
          estimateId,
        );
        uploadedFiles.push(fileInfo);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: true,
      message: `Загружено ${uploadedFiles.length} из ${files.length} файлов`,
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  @Post('upload/estimate-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить и распарсить Excel файл сметы' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Excel файл обработан' })
  async uploadEstimateExcel(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    // Проверяем, что это Excel файл
    const allowedMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Поддерживаются только Excel файлы (.xls, .xlsx)');
    }

    this.fileUploadService.validateFile(file);

    // Парсим Excel файл
    const estimateData = await this.fileUploadService.parseEstimateExcel(file);

    // Сохраняем информацию о файле
    const fileInfo = await this.fileUploadService.saveFileInfo(file, userId);

    return {
      success: true,
      message: 'Excel файл успешно обработан',
      file: fileInfo,
      estimateData,
      itemsCount: estimateData.length,
    };
  }

  @Get('list')
  @ApiOperation({ summary: 'Получить список файлов' })
  @ApiQuery({ name: 'estimateId', required: false, description: 'ID сметы' })
  @ApiQuery({ name: 'mimetype', required: false, description: 'Тип файла' })
  @ApiQuery({ name: 'limit', required: false, description: 'Количество файлов' })
  @ApiQuery({ name: 'offset', required: false, description: 'Смещение' })
  @ApiResponse({ status: 200, description: 'Список файлов' })
  async getFileList(
    @Query() query: FileFilter,
    @GetUser('id') userId?: string,
  ) {
    const filter: FileFilter = {
      ...query,
      userId,
    };

    const files = await this.fileUploadService.getFiles(filter);

    return {
      success: true,
      files,
      count: files.length,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику загруженных файлов' })
  @ApiResponse({ status: 200, description: 'Статистика файлов' })
  async getUploadStats() {
    const stats = await this.fileUploadService.getUploadStats();

    return {
      success: true,
      data: stats,
    };
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Скачать файл' })
  @ApiParam({ name: 'filename', description: 'Имя файла' })
  @ApiResponse({ status: 200, description: 'Файл для скачивания' })
  async downloadFile(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { path, mimetype, originalName } = await this.fileUploadService.downloadFile(filename);

    const file = createReadStream(path);

    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${originalName}"`,
    });

    return new StreamableFile(file);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить информацию о файле' })
  @ApiParam({ name: 'id', description: 'ID файла' })
  @ApiResponse({ status: 200, description: 'Информация о файле' })
  @ApiResponse({ status: 404, description: 'Файл не найден' })
  async getFileInfo(@Param('id') fileId: string) {
    const fileInfo = await this.fileUploadService.getFileInfo(fileId);

    if (!fileInfo) {
      throw new BadRequestException('Файл не найден');
    }

    return {
      success: true,
      file: fileInfo,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить файл' })
  @ApiParam({ name: 'id', description: 'ID файла' })
  @ApiResponse({ status: 200, description: 'Файл удален' })
  @ApiResponse({ status: 404, description: 'Файл не найден' })
  async deleteFile(@Param('id') fileId: string) {
    const result = await this.fileUploadService.deleteFile(fileId);

    return {
      success: result,
      message: result ? 'Файл успешно удален' : 'Ошибка удаления файла',
    };
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Очистить старые файлы' })
  @ApiQuery({ name: 'days', required: false, description: 'Возраст файлов в днях (по умолчанию 30)' })
  @ApiResponse({ status: 200, description: 'Очистка выполнена' })
  async cleanupOldFiles(@Query('days') days?: number) {
    const olderThanDays = days ? parseInt(days.toString(), 10) : 30;
    const deletedCount = await this.fileUploadService.cleanupOldFiles(olderThanDays);

    return {
      success: true,
      message: `Удалено ${deletedCount} старых файлов`,
      deletedCount,
      olderThanDays,
    };
  }
}
