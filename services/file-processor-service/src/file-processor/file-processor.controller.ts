import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Express } from 'express';
import { FileProcessorService } from './file-processor.service';

@ApiTags('Files')
@Controller('files')
@ApiBearerAuth()
export class FileProcessorController {
  constructor(private readonly fileProcessorService: FileProcessorService) {}

  /**
   * Upload and process a file
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    },
  }))
  @ApiOperation({ summary: 'Upload and process a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (.xlsx, .pdf, .gge, .gsfx)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or infected file' })
  @ApiResponse({ status: 413, description: 'File too large' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.fileProcessorService.processFile(file);
      return {
        success: true,
        data: result,
        message: 'File processed successfully',
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(
        'Failed to process file',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get file information
   */
  @Get(':fileId')
  @ApiOperation({ summary: 'Get file information' })
  @ApiParam({ name: 'fileId', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File information' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFile(@Param('fileId') fileId: string) {
    try {
      const file = await this.fileProcessorService.getFile(fileId);
      if (!file) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }
      return file;
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(
        'Failed to get file',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete a file
   */
  @Delete(':fileId')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'fileId', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Param('fileId') fileId: string) {
    try {
      await this.fileProcessorService.deleteFile(fileId);
      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete file',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Process multiple files
   */
  @Post('upload/batch')
  @UseInterceptors(FileInterceptor('files'))
  @ApiOperation({ summary: 'Upload and process multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Files to upload',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Files processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format' })
  async uploadMultipleFiles(
    @UploadedFile() files: Express.Multer.File[],
    @Req() req: any
  ) {
    if (!files || files.length === 0) {
      throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const results = await Promise.all(
        files.map(file => this.fileProcessorService.processFile(file))
      );
      
      return {
        success: true,
        data: results,
        message: `${results.length} files processed successfully`,
      };
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new HttpException(
        'Failed to process files',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
