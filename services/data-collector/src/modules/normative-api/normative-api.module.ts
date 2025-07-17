import { Module } from '@nestjs/common';
import { NormativeApiController } from './normative-api.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NormativeApiController],
})
export class NormativeApiModule {}
