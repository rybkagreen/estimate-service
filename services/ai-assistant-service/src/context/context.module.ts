import { Module } from '@nestjs/common';
import { ContextService } from './context.service';
import { ContextController } from './context.controller';

@Module({
  controllers: [ContextController],
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {}
