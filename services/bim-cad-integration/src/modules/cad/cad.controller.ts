import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CadService } from './cad.service';
import { ParseCadResponseDto } from './dto/parse-cad-response.dto';
import { CadElementDto } from './dto/cad-element.dto';

@ApiTags('cad')
@Controller('cad')
export class CadController {
  constructor(private readonly cadService: CadService) {}

  @Post('parse/dwg')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Parse DWG file and extract CAD elements' })
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
    description: 'DWG file parsed successfully',
    type: ParseCadResponseDto 
  })
  async parseDwgFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ParseCadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.toLowerCase().endsWith('.dwg')) {
      throw new BadRequestException('File must be in DWG format');
    }

    return this.cadService.parseDwgFile(file);
  }

  @Post('parse/pdf')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Parse PDF file and extract CAD drawings' })
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
    name: 'extractText', 
    required: false, 
    type: Boolean,
    description: 'Extract text from PDF using OCR'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'PDF file parsed successfully',
    type: ParseCadResponseDto 
  })
  async parsePdfFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('extractText') extractText?: boolean,
  ): Promise<ParseCadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('File must be in PDF format');
    }

    return this.cadService.parsePdfFile(file, extractText);
  }

  @Get('elements/:drawingId')
  @ApiOperation({ summary: 'Get all CAD elements for a drawing' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'CAD elements retrieved successfully',
    type: [CadElementDto] 
  })
  async getCadElements(
    @Param('drawingId') drawingId: string,
  ): Promise<CadElementDto[]> {
    return this.cadService.getDrawingElements(drawingId);
  }

  @Post('recognize-drawing/:drawingId')
  @ApiOperation({ summary: 'Apply AI recognition to identify drawing elements' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Drawing recognition completed',
  })
  async recognizeDrawing(
    @Param('drawingId') drawingId: string,
  ) {
    return this.cadService.recognizeDrawingElements(drawingId);
  }

  @Post('extract-dimensions/:drawingId')
  @ApiOperation({ summary: 'Extract dimensions and measurements from CAD drawing' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Dimensions extracted successfully',
  })
  async extractDimensions(
    @Param('drawingId') drawingId: string,
  ) {
    return this.cadService.extractDimensions(drawingId);
  }
}
