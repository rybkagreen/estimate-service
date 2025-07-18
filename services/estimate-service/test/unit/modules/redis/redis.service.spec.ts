import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { RedisService } from '../../../../src/modules/redis/redis.service';

describe('RedisService', () => {
  let service: RedisService;
  let mockRedis: jest.Mocked<Redis>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      exists: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
      incrby: jest.fn(),
      decrby: jest.fn(),
      hget: jest.fn(),
      hset: jest.fn(),
      hgetall: jest.fn(),
      lpush: jest.fn(),
      rpop: jest.fn(),
      lrange: jest.fn(),
      sadd: jest.fn(),
      srem: jest.fn(),
      smembers: jest.fn(),
      sismember: jest.fn(),
      flushdb: jest.fn(),
      info: jest.fn(),
      ping: jest.fn(),
      quit: jest.fn(),
    } as unknown as jest.Mocked<Redis>;

    mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    mockLogger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);

    describe('get', () => {
      it('должен возвращать значение при успешном получении', async () => {
        const key = 'testKey';
        const value = { data: 'testValue' };
        mockRedis.get.mockResolvedValue(JSON.stringify(value));

        const result = await service.get(key);
        expect(result).toEqual(value);
        expect(mockRedis.get).toHaveBeenCalledWith(key);
      });

      it('должен возвращать null при отсутствии значения', async () => {
        const key = 'testKey';
        mockRedis.get.mockResolvedValue(null);

        const result = await service.get(key);
        expect(result).toBeNull();
      });
      describe('set', () => {
        it('должен устанавливать значение с TTL при успешной операции', async () => {
          const key = 'testKey';
          const value = { data: 'testValue' };
          const ttl = 60;

          const result = await service.set(key, value, ttl);
          expect(result).toBe(true);
          expect(mockRedis.setex).toHaveBeenCalledWith(key, ttl, JSON.stringify(value));
        });

        it('должен использовать TTL по умолчанию если не указан', async () => {
          const key = 'testKey';
          const value = { data: 'testValue' };

          const result = await service.set(key, value);
          expect(result).toBe(true);
          expect(mockRedis.setex).toHaveBeenCalledWith(key, 300, JSON.stringify(value));
        });

        it('должен использовать set без TTL если TTL=0', async () => {
          const key = 'testKey';
          const value = { data: 'testValue' };

          const result = await service.set(key, value, 0);
          expect(result).toBe(true);
          expect(mockRedis.set).toHaveBeenCalledWith(key, JSON.stringify(value));
        });

        it('должен логировать ошибку и возвращать false при ошибке', async () => {
          const key = 'testKey';
          const value = { data: 'testValue' };
          describe('delete', () => {
            it('должен удалять ключ и возвращать true при успешном удалении', async () => {
              const key = 'testKey';
              mockRedis.del.mockResolvedValue(1);

              const result = await service.delete(key);
              expect(result).toBe(true);
              expect(mockRedis.del).toHaveBeenCalledWith(key);
            });

            it('должен возвращать false если ключ не существует', async () => {
              const key = 'testKey';
              mockRedis.del.mockResolvedValue(0);

              const result = await service.delete(key);
              expect(result).toBe(false);
            });

            it('должен логировать ошибку и возвращать false при ошибке', async () => {
              const key = 'testKey';
              const error = new Error('Redis error');
              mockRedis.del.mockRejectedValue(error);
              describe('deletePattern', () => {
                it('должен удалять ключи по паттерну и возвращать количество удаленных', async () => {
                  const pattern = 'test:*';
                  const keys = ['test:1', 'test:2'];
                  mockRedis.keys.mockResolvedValue(keys);
                  mockRedis.del.mockResolvedValue(2);

                  const result = await service.deletePattern(pattern);
                  expect(result).toBe(2);
                  expect(mockRedis.keys).toHaveBeenCalledWith(pattern);
                  expect(mockRedis.del).toHaveBeenCalledWith(...keys);
                });

                it('должен возвращать 0 если ключи не найдены', async () => {
                  const pattern = 'test:*';
                  mockRedis.keys.mockResolvedValue([]);

                  const result = await service.deletePattern(pattern);
                  expect(result).toBe(0);
                });

                it('должен логировать ошибку и возвращать 0 при ошибке', async () => {
                  const pattern = 'test:*';
                  const error = new Error('Redis error');
                  describe('exists', () => {
                    it('должен возвращать true если ключ существует', async () => {
                      const key = 'testKey';
                      mockRedis.exists.mockResolvedValue(1);

                      const result = await service.exists(key);
                      expect(result).toBe(true);
                      expect(mockRedis.exists).toHaveBeenCalledWith(key);
                    });

                    it('должен возвращать false если ключ не существует', async () => {
                      const key = 'testKey';
                      mockRedis.exists.mockResolvedValue(0);

                      const result = await service.exists(key);
                      expect(result).toBe(false);
                    });

                    it('должен логировать ошибку и возвращать false при ошибке', async () => {
                      const key = 'testKey';
                      const error = new Error('Redis error');
                      mockRedis.exists.mockRejectedValue(error);
                      describe('expire', () => {
                        it('должен устанавливать TTL для ключа и возвращать true при успехе', async () => {
                          const key = 'testKey';
                          const seconds = 60;
                          mockRedis.expire.mockResolvedValue(1);

                          const result = await service.expire(key, seconds);
                          expect(result).toBe(true);
                          expect(mockRedis.expire).toHaveBeenCalledWith(key, seconds);
                        });

                        it('должен возвращать false если ключ не существует', async () => {
                          const key = 'testKey';
                          const seconds = 60;
                          mockRedis.expire.mockResolvedValue(0);

                          const result = await service.expire(key, seconds);
                          expect(result).toBe(false);
                        });

                        it('должен логировать ошибку и возвращать false при ошибке', async () => {
                          const key = 'testKey';
                          const seconds = 60;
                          const error = new Error('Redis error');
                          mockRedis.expire.mockRejectedValue(error);

                          const result = await service.expire(key, seconds);
                          expect(result).toBe(false);
                          expect(mockLogger.error).toHaveBeenCalledWith(
                            `Error setting expiry for key ${key}:`,
                            error,
                          );
                        });
                      });

                      describe('ttl', () => {
                        it('должен возвращать TTL ключа', async () => {
                          const key = 'testKey';
                          const ttlValue = 100;
                          describe('increment', () => {
                            it('должен увеличивать значение ключа', async () => {
                              const key = 'testKey';
                              const value = 5;
                              mockRedis.incrby.mockResolvedValue(10);

                              const result = await service.increment(key, value);
                              expect(result).toBe(10);
                              expect(mockRedis.incrby).toHaveBeenCalledWith(key, value);
                            });

                            it('должен использовать значение по умолчанию 1', async () => {
                              const key = 'testKey';
                              mockRedis.incrby.mockResolvedValue(2);

                              const result = await service.increment(key);
                              expect(result).toBe(2);
                              expect(mockRedis.incrby).toHaveBeenCalledWith(key, 1);
                            });

                            it('должен пробрасывать ошибку при неудаче', async () => {
                              const key = 'testKey';
                              const error = new Error('Redis error');
                              mockRedis.incrby.mockRejectedValue(error);

                              await expect(service.increment(key)).rejects.toThrow(error);
                              expect(mockLogger.error).toHaveBeenCalledWith(
                                `Error incrementing key ${key}:`,
                                error,
                              );
                            });
                          });

                          describe('decrement', () => {
                            it('должен уменьшать значение ключа', async () => {
                              const key = 'testKey';
                              describe('hget', () => {
                                it('должен возвращать значение поля в хеше', async () => {
                                  const key = 'testKey';
                                  const field = 'field1';
                                  const value = { data: 'testValue' };
                                  mockRedis.hget.mockResolvedValue(JSON.stringify(value));

                                  const result = await service.hget(key, field);
                                  expect(result).toEqual(value);
                                  expect(mockRedis.hget).toHaveBeenCalledWith(key, field);
                                });

                                it('должен возвращать null если поле отсутствует', async () => {
                                  const key = 'testKey';
                                  const field = 'field1';
                                  mockRedis.hget.mockResolvedValue(null);

                                  const result = await service.hget(key, field);
                                  expect(result).toBeNull();
                                });

                                it('должен логировать ошибку и возвращать null при ошибке', async () => {
                                  const key = 'testKey';
                                  const field = 'field1';
                                  const error = new Error('Redis error');
                                  mockRedis.hget.mockRejectedValue(error);

                                  const result = await service.hget(key, field);
                                  expect(result).toBeNull();
                                  expect(mockLogger.error).toHaveBeenCalledWith(
                                    `Error getting hash field ${field} from key ${key}:`,
                                    error,
                                  );
                                });
                              });

                              describe('hset', () => {
                                it('должен устанавливать значение поля в хеше', async () => {
                                  const key = 'testKey';
                                  const field = 'field1';
                                  const value = 'testValue';
                                  mockRedis.hset.mockResolvedValue(1);

                                  const result = await service.hset(key, field, value);
                                  expect(result).toBe(true);
                                  expect(mockRedis.hset).toHaveBeenCalledWith(key, field, value);
                                });

                                it('должен возвращать false при ошибке', async () => {
                                  const key = 'testKey';
                                  const field = 'field1';
                                  const value = 'testValue';
                                  const error = new Error('Redis error');
                                  mockRedis.hset.mockRejectedValue(error);

                                  const result = await service.hset(key, field, value);
                                  expect(result).toBe(false);
                                  expect(mockLogger.error).toHaveBeenCalledWith(
                                    `Error setting hash field ${field} in key ${key}:`,
                                    error,
                                  );
                                });
                              });

                              describe('hgetall', () => {
                                it('должен возвращать все поля хеша', async () => {
                                  const key = 'testKey';
                                  const hash = {
  describe('lpush', () => {
    it('должен добавлять элемент в список', async () => {
      const key = 'testKey';
      const value = 'testValue';
      mockRedis.lpush.mockResolvedValue(1);

      const result = await service.lpush(key, value);
      expect(result).toBe(1);
      expect(mockRedis.lpush).toHaveBeenCalledWith(key, value);
    });

    it('должен пробрасывать ошибку при неудаче', async () => {
      const key = 'testKey';
      const value = 'testValue';
      const error = new Error('Redis error');
      mockRedis.lpush.mockRejectedValue(error);

      await expect(service.lpush(key, value)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(`Error pushing to list ${key}:`, error);
    });
  });

  describe('rpop', () => {
    it('должен извлекать элемент из конца списка', async () => {
      const key = 'testKey';
      const value = { data: 'testValue' };
      mockRedis.rpop.mockResolvedValue(JSON.stringify(value));

      const result = await service.rpop(key);
      expect(result).toEqual(value);
      expect(mockRedis.rpop).toHaveBeenCalledWith(key);
    });

    it('должен возвращать null при пустом списке', async () => {
      const key = 'testKey';
      mockRedis.rpop.mockResolvedValue(null);

      const result = await service.rpop(key);
      expect(result).toBeNull();
    });

    it('должен логировать ошибку и возвращать null при ошибке', async () => {
      const key = 'testKey';
      const error = new Error('Redis error');
      mockRedis.rpop.mockRejectedValue(error);

      const result = await service.rpop(key);
      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(`Error popping from list ${key}:`, error);
    });
  });

  describe('lrange', () => {
    it('должен возвращать элементы списка', async () => {
      const key = 'testKey';
      const values = [JSON.stringify({ data: 'value1' }), JSON.stringify({ data: 'value2' })];
      const expected = [{ data: 'value1' }, { data: 'value2' }];
      mockRedis.lrange.mockResolvedValue(values);

      const result = await service.lrange(key, 0, -1);
      expect(result).toEqual(expected);
      expect(mockRedis.lrange).toHaveBeenCalledWith(key, 0, -1);
    });

    it('должен возвращать пустой массив при ошибке', async () => {
      const key = 'testKey';
      const error = new Error('Redis error');
      mockRedis.lrange.mockRejectedValue(error);

      const result = await service.lrange(key, 0, -1);
      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith(`Error getting list range for ${key}:`, error);
    });
  });

  describe('sadd', () => {
    it('должен добавлять элемент в множество', async () => {
      const key = 'testKey';
      const value = 'testValue';
      mockRedis.sadd.mockResolvedValue(1);

      const result = await service.sadd(key, value);
      expect(result).toBe(1);
      expect(mockRedis.sadd).toHaveBeenCalledWith(key, value);
    });

    it('должен пробрасывать ошибку при неудаче', async () => {
      const key = 'testKey';
      const value = 'testValue';
      const error = new Error('Redis error');
      mockRedis.sadd.mockRejectedValue(error);

      await expect(service.sadd(key, value)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(`Error adding to set ${key}:`, error);
    });
  });

  describe('srem', () => {
    it('должен удалять элемент из множества', async () => {
      const key = 'testKey';
      const value = { data: 'testValue' };
      mockRedis.srem.mockResolvedValue(1);

      const result = await service.srem(key, value);
      expect(result).toBe(1);
      expect(mockRedis.srem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });

    it('должен возвращать 0 если элемент отсутствует', async () => {
      const key = 'testKey';
      const value = { data: 'testValue' };
      mockRedis.srem.mockResolvedValue(0);

      const result = await service.srem(key, value);
      expect(result).toBe(0);
    });

    it('должен логировать ошибку и возвращать 0 при ошибке', async () => {
      const key = 'testKey';
      const value = { data: 'testValue' };
      const error = new Error('Redis error');
      mockRedis.srem.mockRejectedValue(error);

      const result = await service.srem(key, value);
      expect(result).toBe(0);
      expect(mockLogger.error).toHaveBeenCalledWith(`Error removing from set ${key}:`, error);
    });
  });

  describe('smembers', () => {
    it('должен возвращать все элементы множества', async () => {
      const key = 'testKey';
      const values = [JSON.stringify({ data: 'value1' }), JSON.stringify({ data: 'value2' })];
      const expected = [{ data: 'value1' }, { data: 'value2' }];
      mockRedis.smembers.mockResolvedValue(values);

      const result = await service.smembers(key);
      expect(result).toEqual(expected);
      expect(mockRedis.smembers).toHaveBeenCalledWith(key);
    });

    it('должен возвращать пустой массив при ошибке', async () => {
      const key = 'testKey';
      const error = new Error('Redis error');
      mockRedis.smembers.mockRejectedValue(error);

      const result = await service.smembers(key);
      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith(`Error getting set members for ${key}:`, error);
    });
  });

  describe('flushdb', () => {
    it('должен очищать базу данных', async () => {
      mockRedis.flushdb.mockResolvedValue('OK');

      await service.flushdb();
      expect(mockRedis.flushdb).toHaveBeenCalled();
    });

    it('должен логировать ошибку при неудаче', async () => {
      const error = new Error('Redis error');
      mockRedis.flushdb.mockRejectedValue(error);

      await expect(service.flushdb()).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error flushing database:', error);
    });
  });

  describe('info', () => {
    it('должен возвращать информацию о сервере', async () => {
      const serverInfo = '# Server\nredis_version:6.2.5';
      mockRedis.info.mockResolvedValue(serverInfo);

      const result = await service.info();
      expect(result).toBe(serverInfo);
    });

    it('должен пробрасывать ошибку при неудаче', async () => {
      const error = new Error('Redis error');
      mockRedis.info.mockRejectedValue(error);

      await expect(service.info()).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error getting Redis info:', error);
    });
  });

  describe('ping', () => {
    it('должен возвращать PONG при успешном подключении', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const result = await service.ping();
      expect(result).toBe('PONG');
    });

    it('должен пробрасывать ошибку при неудаче', async () => {
      const error = new Error('Redis error');
      mockRedis.ping.mockRejectedValue(error);

      await expect(service.ping()).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error pinging Redis:', error);
    });
  });

  describe('disconnect', () => {
    it('должен закрывать соединение', async () => {
      mockRedis.quit.mockResolvedValue('OK');

      await service.disconnect();
      expect(mockRedis.quit).toHaveBeenCalled();
    });

    it('должен пробрасывать ошибку при неудаче', async () => {
      const error = new Error('Redis error');
      mockRedis.quit.mockRejectedValue(error);

      await expect(service.disconnect()).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error closing Redis connection:', error);
    });
  });
});
  describe('sismember', () => {
    it('должен возвращать true если элемент в множестве', async () => {
      const key = 'testKey';
      const value = 'testValue';
      mockRedis.sismember.mockResolvedValue(1);

      const result = await service.sismember(key, value);
      expect(result).toBe(true);
      expect(mockRedis.sismember).toHaveBeenCalledWith(key, value);
    });

    it('должен возвравать false если элемент отсутствует', async () => {
      const key = 'testKey';
      const value = 'testValue';
      mockRedis.sismember.mockResolvedValue(0);

      const result = await service.sismember(key, value);
      expect(result).toBe(false);
    });

    it('должен логировать ошибку и возвращать false при ошибке', async () => {
      const key = 'testKey';
      const value = 'testValue';
      const error = new Error('Redis error');
      mockRedis.sismember.mockRejectedValue(error);

      const result = await service.sismember(key, value);
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(`Error checking set membership for ${key}:`, error);
    });
  });
                                    field1: JSON.stringify({ data: 'value1' }),
                                    field2: JSON.stringify({ data: 'value2' }),
                                  };
                                  const expected = {
                                    field1: { data: 'value1' },
                                    field2: { data: 'value2' },
                                  };
                                  mockRedis.hgetall.mockResolvedValue(hash);

                                  const result = await service.hgetall(key);
                                  expect(result).toEqual(expected);
                                  expect(mockRedis.hgetall).toHaveBeenCalledWith(key);
                                });

                                it('должен возвращать пустой объект если хеш пуст', async () => {
                                  const key = 'testKey';
                                  mockRedis.hgetall.mockResolvedValue({});

                                  const result = await service.hgetall(key);
                                  expect(result).toEqual({});
                                });

                                it('должен возвращать пустой объект при ошибке', async () => {
                                  const key = 'testKey';
                                  const error = new Error('Redis error');
                                  mockRedis.hgetall.mockRejectedValue(error);

                                  const result = await service.hgetall(key);
                                  expect(result).toEqual({});
                                  expect(mockLogger.error).toHaveBeenCalledWith(
                                    `Error getting all hash fields from key ${key}:`,
                                    error,
                                  );
                                });
                              });
                              const value = 3;
                              mockRedis.decrby.mockResolvedValue(7);

                              const result = await service.decrement(key, value);
                              expect(result).toBe(7);
                              expect(mockRedis.decrby).toHaveBeenCalledWith(key, value);
                            });

                            it('должен использовать значение по умолчанию 1', async () => {
                              const key = 'testKey';
                              mockRedis.decrby.mockResolvedValue(1);

                              const result = await service.decrement(key);
                              expect(result).toBe(1);
                              expect(mockRedis.decrby).toHaveBeenCalledWith(key, 1);
                            });

                            it('должен пробрасывать ошибку при неудаче', async () => {
                              const key = 'testKey';
                              const error = new Error('Redis error');
                              mockRedis.decrby.mockRejectedValue(error);

                              await expect(service.decrement(key)).rejects.toThrow(error);
                              expect(mockLogger.error).toHaveBeenCalledWith(
                                `Error decrementing key ${key}:`,
                                error,
                              );
                            });
                          });
                          mockRedis.ttl.mockResolvedValue(ttlValue);

                          const result = await service.ttl(key);
                          expect(result).toBe(ttlValue);
                          expect(mockRedis.ttl).toHaveBeenCalledWith(key);
                        });

                        it('должен возвращать -1 при ошибке', async () => {
                          const key = 'testKey';
                          const error = new Error('Redis error');
                          mockRedis.ttl.mockRejectedValue(error);

                          const result = await service.ttl(key);
                          expect(result).toBe(-1);
                          expect(mockLogger.error).toHaveBeenCalledWith(
                            `Error getting TTL for key ${key}:`,
                            error,
                          );
                        });
                      });

                      const result = await service.exists(key);
                      expect(result).toBe(false);
                      expect(mockLogger.error).toHaveBeenCalledWith(
                        `Error checking key ${key}:`,
                        error,
                      );
                    });
                  });
                  mockRedis.keys.mockRejectedValue(error);

                  const result = await service.deletePattern(pattern);
                  expect(result).toBe(0);
                  expect(mockLogger.error).toHaveBeenCalledWith(
                    `Error deleting pattern ${pattern}:`,
                    error,
                  );
                });
              });

              const result = await service.delete(key);
              expect(result).toBe(false);
              expect(mockLogger.error).toHaveBeenCalledWith(`Error deleting key ${key}:`, error);
            });
          });
          const error = new Error('Redis error');
          mockRedis.setex.mockRejectedValue(error);

          const result = await service.set(key, value);
          expect(result).toBe(false);
          expect(mockLogger.error).toHaveBeenCalledWith(`Error setting key ${key}:`, error);
        });
      });

      it('должен логировать ошибку и возвращать null при ошибке', async () => {
        const key = 'testKey';
        const error = new Error('Redis error');
        mockRedis.get.mockRejectedValue(error);

        const result = await service.get(key);
        expect(result).toBeNull();
        expect(mockLogger.error).toHaveBeenCalledWith(`Error getting key ${key}:`, error);
      });
    });
    // Настройка конфига
    mockConfigService.get.mockReturnValue({
      ttl: 300,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Тесты будут добавлены здесь
});
