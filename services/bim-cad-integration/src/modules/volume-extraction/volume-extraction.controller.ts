import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VolumeExtractionService } from './volume-extraction.service';
import { ExtractVolumesDto } from './dto/extract-volumes.dto';
import { QuantityTakeoffResponseDto } from './dto/quantity-takeoff-response.dto';

@ApiTags('volume')
@Controller('volume-extraction')
export class VolumeExtractionController {
  constructor(private readonly volumeExtractionService: VolumeExtractionService) {}

  @Post('extract/:projectId')
  @ApiOperation({ summary: 'Extract volumes from BIM/CAD project' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Volumes extracted successfully',
    type: QuantityTakeoffResponseDto 
  })
  async extractVolumes(
    @Param('projectId') projectId: string,
    @Body() extractVolumesDto: ExtractVolumesDto,
  ): Promise<QuantityTakeoffResponseDto> {
    return this.volumeExtractionService.extractVolumes(projectId, extractVolumesDto);
  }

  @Get('quantity-takeoff/:projectId')
  @ApiOperation({ summary: 'Get quantity takeoff report for a project' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Quantity takeoff retrieved successfully',
    type: QuantityTakeoffResponseDto 
  })
  async getQuantityTakeoff(
    @Param('projectId') projectId: string,
  ): Promise<QuantityTakeoffResponseDto> {
    return this.volumeExtractionService.getQuantityTakeoff(projectId);
  }

  @Post('map-to-fsbc/:projectId')
  @ApiOperation({ summary: 'Map extracted quantities to ФСБЦ codes' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Mapping completed successfully',
  })
  async mapToFsbc(
    @Param('projectId') projectId: string,
  ) {
    return this.volumeExtractionService.mapToFsbcCodes(projectId);
  }
}
