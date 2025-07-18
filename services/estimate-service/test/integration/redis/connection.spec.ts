import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { RedisService } from '../../../../src/modules/redis/redis.service';
import { RedisTestModule } from './redis.test.module';

describe('Redis Connection', () => {
  let module: TestingModule;
  let redisService: RedisService;
  let redisClient: Redis;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [RedisTestModule],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
    redisClient = module.get<Redis>('REDIS_CLIENT');
  });

  afterAll(async () => {
    await module.close();
    redisClient.disconnect();
  });

  it('should connect to Redis', async () => {
    const response = await redisClient.ping();
    expect(response).toEqual('PONG');
  });

  it('should set and get value', async () => {
    await redisClient.set('test-key', 'test-value');
    const value = await redisClient.get('test-key');
    expect(value).toEqual('test-value');
  });
});
