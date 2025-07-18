import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from '../../../../src/modules/redis/redis.service';

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      },
    },
    RedisService,
  ],
  exports: [RedisService, 'REDIS_CLIENT'],
})
export class RedisTestModule {}
