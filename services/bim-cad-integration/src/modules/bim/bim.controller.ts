import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { BimService } from './bim.service';
import { ParseBimResponseDto } from './dto/parse-bim-response.dto';
import { BimElementDto } from './dto/bim-element.dto';

@ApiTags('bim')
@Controller('bim')
export class BimController {
  constructor(private readonly bimService: BimService) {}

  @Post('parse/ifc')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Parse IFC file and extract building elements' })
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
    description: 'IFC file parsed successfully',
    type: ParseBimResponseDto 
  })
  async parseIfcFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ParseBimResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.toLowerCase().endsWith('.ifc')) {
      throw new BadRequestException('File must be in IFC format');
    }

    return this.bimService.parseIfcFile(file);
  }

  @Post('parse/rvt')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Parse Revit file and extract building elements' })
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
    description: 'Revit file parsed successfully',
    type: ParseBimResponseDto 
  })
  async parseRvtFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ParseBimResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.toLowerCase().endsWith('.rvt')) {
      throw new BadRequestException('File must be in RVT format');
    }

    return this.bimService.parseRvtFile(file);
  }

  @Get('elements/:projectId')
  @ApiOperation({ summary: 'Get all BIM elements for a project' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'BIM elements retrieved successfully',
    type: [BimElementDto] 
  })
  async getBimElements(
    @Param('projectId') projectId: string,
  ): Promise<BimElementDto[]> {
    return this.bimService.getProjectElements(projectId);
  }

  @Post('extract-quantities/:projectId')
  @ApiOperation({ summary: 'Extract quantities from BIM model' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Quantities extracted successfully',
  })
  async extractQuantities(
    @Param('projectId') projectId: string,
  ) {
    return this.bimService.extractQuantities(projectId);
  }
}
