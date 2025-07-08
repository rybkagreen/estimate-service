import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { HealthController } from './health-simple.controller';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
})
export class HealthModule {}
