import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TaskPlannerService } from '../services/task-planner.service';

@ApiTags('AI Task Planner')
@Controller('ai/task-planner')
export class TaskPlannerController {
  constructor(private readonly taskPlannerService: TaskPlannerService) {}

  @Post()
  @ApiOperation({ summary: 'Plan a new task' })
  async planTask(@Body() task: any) {
    return this.taskPlannerService.planTask(task);
  }

  @Get(':id/execute')
  @ApiOperation({ summary: 'Execute a planned task' })
  async executeTask(@Param('id') taskId: string) {
    return this.taskPlannerService.executeTask(taskId);
  }
}
