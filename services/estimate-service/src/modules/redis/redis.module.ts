import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import redisConfig from '../../config/redis.config';

/**
 * Глобальный модуль для работы с Redis
 * Предоставляет подключение к Redis и Bull Queue
 */
@Global()
@Module({
  imports: [
    ConfigModule.forFeature(redisConfig),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('redis');
        return {
          redis: config.bull.redis,
          defaultJobOptions: config.bull.defaultJobOptions,
          settings: config.bull.settings,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('redis');
        
        let client: Redis;
        
        switch (config.mode) {
          case 'cluster':
            const { Cluster } = await import('ioredis');
            client = new Cluster(config.connection.nodes, {
              redisOptions: config.connection.clusterOptions,
            });
            break;
            
          case 'sentinel':
            client = new Redis({
              sentinels: config.connection.sentinels,
              name: config.connection.name,
              password: config.connection.password,
              db: config.connection.db,
              sentinelPassword: config.connection.sentinelPassword,
              sentinelRetryStrategy: config.connection.sentinelRetryStrategy,
              role: config.connection.role,
              preferredSlaves: config.connection.preferredSlaves,
              sentinelCommandTimeout: config.connection.sentinelCommandTimeout,
              ...config.connection,
            });
            break;
            
          default: // standalone
            client = new Redis(config.connection);
        }
        
        // Обработка событий
        client.on('connect', () => {
          console.log(`Redis ${config.mode} connected`);
        });
        
        client.on('error', (err) => {
          console.error(`Redis ${config.mode} error:`, err);
        });
        
        client.on('ready', () => {
          console.log(`Redis ${config.mode} ready`);
        });
        
        if (config.mode === 'cluster') {
          client.on('node error', (err, node) => {
            console.error(`Redis cluster node error on ${node}:`, err);
          });
          
          client.on('+node', (node) => {
            console.log(`Redis cluster node added: ${node}`);
          });
          
          client.on('-node', (node) => {
            console.log(`Redis cluster node removed: ${node}`);
          });
        }
        
        if (config.mode === 'sentinel') {
          client.on('failover', (from, to) => {
            console.log(`Redis Sentinel failover from ${from} to ${to}`);
          });
        }
        
        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService, BullModule],
})
export class RedisModule {}
