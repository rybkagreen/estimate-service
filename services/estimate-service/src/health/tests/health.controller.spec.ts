import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { HealthController } from '../health-simple.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return health status when database is healthy', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.check();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        checks: {
          database: 'healthy',
          memory: expect.any(String),
          uptime: expect.any(Number),
        },
        details: {
          memory: {
            used: expect.any(String),
            total: expect.any(String),
          },
        },
      });
    });

    it('should return error status when database is unavailable', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.$queryRaw.mockRejectedValue(dbError);

      const result = await controller.check();

      expect(result).toEqual({
        status: 'error',
        timestamp: expect.any(String),
        error: 'Database connection failed',
      });
    });
  });

  describe('ready', () => {
    it('should return ready status when database is accessible', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.ready();

      expect(result).toEqual({
        status: 'ready',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        version: expect.any(String),
      });
    });

    it('should return not ready status when database is inaccessible', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.$queryRaw.mockRejectedValue(dbError);

      const result = await controller.ready();

      expect(result).toEqual({
        status: 'not_ready',
        timestamp: expect.any(String),
        error: 'Database connection failed',
      });
    });
  });

  describe('live', () => {
    it('should return alive status', async () => {
      const result = await controller.live();

      expect(result).toEqual({
        status: 'alive',
        timestamp: expect.any(String),
        pid: expect.any(Number),
        memory: expect.any(Object),
      });
    });
  });
});
