import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { RedisService } from '../../../../src/modules/redis/redis.service';
import { RedisTestModule } from './redis.test.module';

describe('RedisService Transactions', () => {
  let service: RedisService;
  let redisClient: Redis;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisTestModule],
    }).compile();

    service = module.get<RedisService>(RedisService);
    redisClient = module.get<Redis>('REDIS_CLIENT');
  });

  afterEach(async () => {
    await redisClient.flushdb();
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  describe('transaction()', () => {
    it('should execute a successful transaction', async () => {
      const result = await service.transaction([
        ['set', 'key1', 'value1'],
        ['set', 'key2', 'value2'],
        ['get', 'key1'],
      ]);

      expect(result).toEqual(['OK', 'OK', 'value1']);
    });

    it('should rollback transaction on error', async () => {
      await expect(
        service.transaction([
          ['set', 'key1', 'value1'],
          ['incrby', 'key1', 'invalid'], // Invalid argument for INCRBY
          ['set', 'key2', 'value2'],
        ]),
      ).rejects.toThrow('RedisTransactionError');

      const value1 = await redisClient.get('key1');
      const value2 = await redisClient.get('key2');
      expect(value1).toBeNull();
      expect(value2).toBeNull();
    });

    it('should handle connection timeout during transaction', async () => {
      jest.spyOn(redisClient, 'multi').mockImplementationOnce(() => {
        throw new Redis.ConnectionTimeoutError('Connection timeout');
      });

      await expect(service.transaction([['set', 'key1', 'value1']])).rejects.toThrow(
        'RedisConnectionError: Redis connection timeout',
      );
    });

    it('should handle max connections error during transaction', async () => {
      jest.spyOn(redisClient, 'multi').mockImplementationOnce(() => {
        throw new Redis.MaxRetriesPerRequestError('Max retries exceeded');
      });

      await expect(service.transaction([['set', 'key1', 'value1']])).rejects.toThrow(
        'RedisConnectionError: Redis max connections exceeded',
      );
    });
  });
});
