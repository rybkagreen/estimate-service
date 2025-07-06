import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GesnController } from './gesn.controller';
import { GesnService } from './gesn.service';

@Module({
  imports: [HttpModule],
  controllers: [GesnController],
  providers: [GesnService],
  exports: [GesnService],
})
export class GesnModule {}
