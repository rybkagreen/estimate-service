import { ApiProperty } from '@nestjs/swagger';

export class CriticalTaskDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  status: string;
}

export class DashboardStatsDto {
  @ApiProperty()
  activeProjects: number;

  @ApiProperty()
  estimatesInProgress: number;

  @ApiProperty()
  completedEstimates: number;

  @ApiProperty()
  savings: number;

  @ApiProperty({ type: [CriticalTaskDto] })
  criticalTasks: CriticalTaskDto[];
}
