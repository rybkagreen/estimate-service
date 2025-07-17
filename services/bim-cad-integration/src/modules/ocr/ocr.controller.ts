import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { OcrService } from './ocr.service';
import { ExtractTextResponseDto } from './dto/extract-text-response.dto';

@ApiTags('ocr')
@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('extract-text')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Extract text from image or PDF using OCR' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiQuery({ 
    name: 'language', 
    required: false, 
    type: String,
    description: 'Language for OCR (default: rus+eng)'
  })
  @ApiQuery({ 
    name: 'processNlp', 
    required: false, 
    type: Boolean,
    description: 'Apply NLP processing to extract structured information'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Text extracted successfully',
    type: ExtractTextResponseDto 
  })
  async extractText(
    @UploadedFile() file: Express.Multer.File,
    @Query('language') language?: string,
    @Query('processNlp') processNlp?: boolean,
  ): Promise<ExtractTextResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const supportedFormats = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp'];
    const fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    
    if (!supportedFormats.includes(fileExtension)) {
      throw new BadRequestException('File must be in PDF or image format (PNG, JPG, JPEG, TIFF, BMP)');
    }

    return this.ocrService.extractText(file, language, processNlp);
  }

  @Post('extract-specifications')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Extract equipment specifications from documents' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Specifications extracted successfully',
  })
  async extractSpecifications(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.ocrService.extractSpecifications(file);
  }
}
