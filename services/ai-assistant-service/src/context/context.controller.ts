import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param,
  HttpException,
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiParam,
  ApiBody 
} from '@nestjs/swagger';
import { ContextService } from './context.service';

class SetContextDto {
  term: string;
  description: string;
}

@ApiTags('Context')
@Controller('context')
export class ContextController {
  constructor(private readonly contextService: ContextService) {}

  /**
   * Get context for a specific term
   */
  @Get(':term')
  @ApiOperation({ summary: 'Get context for a construction term' })
  @ApiParam({ name: 'term', description: 'Construction term to get context for' })
  @ApiResponse({ status: 200, description: 'Context found' })
  @ApiResponse({ status: 404, description: 'Context not found' })
  getContext(@Param('term') term: string) {
    const context = this.contextService.getContext(term);
    if (!context) {
      throw new HttpException(`Context for term "${term}" not found`, HttpStatus.NOT_FOUND);
    }
    return { term, context };
  }

  /**
   * Set context for a specific term
   */
  @Post()
  @ApiOperation({ summary: 'Set context for a construction term' })
  @ApiBody({ type: SetContextDto })
  @ApiResponse({ status: 201, description: 'Context set successfully' })
  setContext(@Body() body: SetContextDto) {
    if (!body.term || !body.description) {
      throw new HttpException('Both term and description are required', HttpStatus.BAD_REQUEST);
    }
    this.contextService.setContext(body.term, body.description);
    return { success: true, message: 'Context set successfully' };
  }
}
