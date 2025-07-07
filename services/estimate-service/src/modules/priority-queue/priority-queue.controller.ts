import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PriorityQueueService } from './priority-queue.service';
import { 
  CreateRequestDto, 
  UpdatePriorityDto, 
  RequestPriority,
  QueueStatistics,
  PriorityRequest,
} from './types';

@ApiTags('Priority Queue')
@Controller('priority-queue')
export class PriorityQueueController {
  constructor(private readonly priorityQueueService: PriorityQueueService) {}

  @Post('requests')
  @ApiOperation({ summary: 'Add a new request to the priority queue' })
  @ApiResponse({ status: 201, description: 'Request added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createRequest(@Body() createRequestDto: CreateRequestDto): Promise<{ requestId: string }> {
    const requestId = await this.priorityQueueService.addRequest(createRequestDto);
    return { requestId };
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get pending requests from the queue' })
  @ApiQuery({ 
    name: 'priority', 
    required: false, 
    enum: RequestPriority,
    description: 'Filter by priority level' 
  })
  @ApiResponse({ status: 200, description: 'List of pending requests' })
  async getPendingRequests(
    @Query('priority') priority?: RequestPriority
  ): Promise<PriorityRequest[]> {
    return this.priorityQueueService.getPendingRequests(priority);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  async getStatistics(): Promise<QueueStatistics> {
    return this.priorityQueueService.getStatistics();
  }

  @Put('requests/:requestId/priority')
  @ApiOperation({ summary: 'Update request priority' })
  @ApiParam({ name: 'requestId', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Priority updated successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async updatePriority(
    @Param('requestId') requestId: string,
    @Body() updatePriorityDto: UpdatePriorityDto
  ): Promise<{ success: boolean }> {
    const success = this.priorityQueueService.updatePriority(
      requestId, 
      updatePriorityDto.priority
    );
    
    if (!success) {
      throw new Error('Request not found');
    }
    
    return { success };
  }

  @Delete('requests/:requestId')
  @ApiOperation({ summary: 'Cancel a pending request' })
  @ApiParam({ name: 'requestId', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async cancelRequest(@Param('requestId') requestId: string): Promise<{ success: boolean }> {
    const success = this.priorityQueueService.cancelRequest(requestId);
    
    if (!success) {
      throw new Error('Request not found');
    }
    
    return { success };
  }

  @Post('requests/:requestId/process-immediate')
  @ApiOperation({ summary: 'Process a request immediately (bypass queue)' })
  @ApiParam({ name: 'requestId', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request processed' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @HttpCode(HttpStatus.OK)
  async processImmediate(@Param('requestId') requestId: string): Promise<any> {
    const result = await this.priorityQueueService.processImmediate(requestId);
    
    if (!result) {
      throw new Error('Request not found');
    }
    
    return result;
  }
}
