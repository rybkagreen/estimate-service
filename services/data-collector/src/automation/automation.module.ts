/**
 * Модуль автоматизации
 */

import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AutomationController } from './automation.controller';

@Module({
  imports: [SharedModule],
  controllers: [AutomationController],
})
export class AutomationModule {}
