import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DeepSeekModule } from '../deepseek/deepseek.module';

@Module({
  imports: [TerminusModule, DeepSeekModule],
  controllers: [HealthController],
})
export class HealthModule {}
