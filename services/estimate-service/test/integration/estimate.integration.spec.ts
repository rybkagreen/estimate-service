import { CacheModule } from '@nestjs/cache-manager';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateEstimateDto } from '../../src/modules/estimate/dto/create-estimate.dto';
import { UpdateEstimateDto } from '../../src/modules/estimate/dto/update-estimate.dto';
import { EstimateModule } from '../../src/modules/estimate/estimate.module';
import { EstimateService } from '../../src/modules/estimate/estimate.service';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('EstimateModule Integration Tests', () => {
  let app: INestApplication;
  let estimateService: EstimateService;
  let prismaService: PrismaService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        CacheModule.register({
          isGlobal: true,
        }),
        PrismaModule,
        EstimateModule,
      ],
    }).compile();

    moduleRef = module;
    app = module.createNestApplication();
    estimateService = module.get<EstimateService>(EstimateService);
    prismaService = module.get<PrismaService>(PrismaService);

    await app.init();
  });

  beforeEach(async () => {
    // Очистка тестовых данных
    await prismaService.estimateItem.deleteMany();
    await prismaService.estimate.deleteMany();
    await prismaService.project.deleteMany();
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    // Финальная очистка
    await prismaService.estimateItem.deleteMany();
    await prismaService.estimate.deleteMany();
    await prismaService.project.deleteMany();
    await prismaService.user.deleteMany();
    await app.close();
    await moduleRef.close();
  });

  describe('Estimate CRUD Operations', () => {
    let userId: string;
    let projectId: string;

    beforeEach(async () => {
      // Создаем тестового пользователя
      const user = await prismaService.user.create({
        data: {
          email: 'estimate-test@example.com',
          passwordHash: 'hash',
          firstName: 'Estimate',
          lastName: 'Tester',
        },
      });
      userId = user.id;

      // Создаем тестовый проект
      const project = await prismaService.project.create({
        data: {
          name: 'Test Construction Project',
          description: 'Integration test project',
          status: 'PLANNING',
          createdById: userId,
        },
      });
      projectId = project.id;
    });

    it('should successfully create a new estimate', async () => {
      const createEstimateDto: CreateEstimateDto = {
        name: 'Test Estimate',
        description: 'Integration test estimate',
        projectId,
        currency: 'RUB',
        laborCostPerHour: 1500,
        overheadPercentage: 15,
        profitPercentage: 10,
      };

      const estimate = await estimateService.create(createEstimateDto, userId);

      expect(estimate).toBeDefined();
      expect(estimate.name).toBe(createEstimateDto.name);
      expect(estimate.description).toBe(createEstimateDto.description);
      expect(estimate.projectId).toBe(projectId);
      expect(estimate.currency).toBe('RUB');
      expect(estimate.createdById).toBe(userId);

      // Проверяем, что смета создана в БД
      const dbEstimate = await prismaService.estimate.findUnique({
        where: { id: estimate.id },
      });
      expect(dbEstimate).toBeDefined();
      expect(dbEstimate.name).toBe(createEstimateDto.name);
    });

    it('should retrieve all estimates with pagination', async () => {
      // Создаем несколько тестовых смет
      const estimateCount = 5;
      const createPromises = Array.from({ length: estimateCount }, (_, i) =>
        estimateService.create(
          {
            name: `Test Estimate ${i + 1}`,
            description: `Test description ${i + 1}`,
            projectId,
            currency: 'RUB',
            laborCostPerHour: 1500,
            overheadPercentage: 15,
            profitPercentage: 10,
          },
          userId
        )
      );

      await Promise.all(createPromises);

      // Получаем сметы с пагинацией
      const page1 = await estimateService.findAll({
        page: 1,
        limit: 3
      });

      expect(page1.estimates).toHaveLength(3);
      expect(page1.total).toBe(estimateCount);
      expect(page1.page).toBe(1);
      expect(page1.totalPages).toBe(2);

      const page2 = await estimateService.findAll({
        page: 2,
        limit: 3
      });

      expect(page2.estimates).toHaveLength(2);
      expect(page2.page).toBe(2);
    });

    it('should successfully update an estimate', async () => {
      // Создаем смету
      const estimate = await estimateService.create(
        {
          name: 'Original Estimate',
          description: 'Original description',
          projectId,
          currency: 'RUB',
          laborCostPerHour: 1500,
          overheadPercentage: 15,
          profitPercentage: 10,
        },
        userId
      );

      const updateDto: UpdateEstimateDto = {
        name: 'Updated Estimate',
        description: 'Updated description',
        laborCostPerHour: 2000,
        overheadPercentage: 20,
      };

      const updatedEstimate = await estimateService.update(
        estimate.id,
        updateDto
      );

      expect(updatedEstimate.name).toBe(updateDto.name);
      expect(updatedEstimate.description).toBe(updateDto.description);
      expect(updatedEstimate.laborCostPerHour).toBe(2000);
      expect(updatedEstimate.overheadPercentage).toBe(20);
      expect(updatedEstimate.profitPercentage).toBe(10); // Не изменилось

      // Проверяем в БД
      const dbEstimate = await prismaService.estimate.findUnique({
        where: { id: estimate.id },
      });
      expect(dbEstimate.name).toBe(updateDto.name);
    });

    it('should successfully delete an estimate', async () => {
      // Создаем смету
      const estimate = await estimateService.create(
        {
          name: 'To Delete Estimate',
          description: 'Will be deleted',
          projectId,
          currency: 'RUB',
          laborCostPerHour: 1500,
          overheadPercentage: 15,
          profitPercentage: 10,
        },
        userId
      );

      // Удаляем смету
      await estimateService.remove(estimate.id);

      // Проверяем, что смета удалена
      const deletedEstimate = await prismaService.estimate.findUnique({
        where: { id: estimate.id },
      });
      expect(deletedEstimate).toBeNull();
    });

    it('should handle non-existent estimate gracefully', async () => {
      const nonExistentId = 'non-existent-id';

      await expect(estimateService.findOne(nonExistentId)).rejects.toThrow();
      await expect(
        estimateService.update(nonExistentId, { name: 'Updated' })
      ).rejects.toThrow();
      await expect(estimateService.remove(nonExistentId)).rejects.toThrow();
    });
  });

  describe('Estimate Calculations & Business Logic', () => {
    let userId: string;
    let projectId: string;
    let estimateId: string;

    beforeEach(async () => {
      // Создаем тестовые данные
      const user = await prismaService.user.create({
        data: {
          email: 'calc-test@example.com',
          passwordHash: 'hash',
          firstName: 'Calc',
          lastName: 'Tester',
        },
      });
      userId = user.id;

      const project = await prismaService.project.create({
        data: {
          name: 'Calculation Test Project',
          description: 'Test project for calculations',
          status: 'PLANNING',
          createdById: userId,
        },
      });
      projectId = project.id;

      const estimate = await estimateService.create(
        {
          name: 'Calculation Test Estimate',
          description: 'Test estimate for calculations',
          projectId,
          currency: 'RUB',
          laborCostPerHour: 2000,
          overheadPercentage: 15,
          profitPercentage: 10,
        },
        userId
      );
      estimateId = estimate.id;
    });

    it('should calculate total costs correctly', async () => {
      // Добавляем позиции в смету
      await prismaService.estimateItem.createMany({
        data: [
          {
            estimateId,
            name: 'Бетонные работы',
            unit: 'м³',
            quantity: 100,
            unitPrice: 5000,
            laborHours: 200,
          },
          {
            estimateId,
            name: 'Арматурные работы',
            unit: 'т',
            quantity: 10,
            unitPrice: 50000,
            laborHours: 150,
          },
        ],
      });

      const estimateWithCalculations = await estimateService.findOne(estimateId);

      // Проверяем расчеты
      const expectedMaterialCost = 100 * 5000 + 10 * 50000; // 1,000,000
      const expectedLaborCost = (200 + 150) * 2000; // 700,000
      const expectedSubtotal = expectedMaterialCost + expectedLaborCost; // 1,700,000
      const expectedOverhead = expectedSubtotal * 0.15; // 255,000
      const expectedProfit = (expectedSubtotal + expectedOverhead) * 0.10; // 195,500
      const expectedTotal = expectedSubtotal + expectedOverhead + expectedProfit; // 2,150,500

      expect(estimateWithCalculations.materialCost).toBe(expectedMaterialCost);
      expect(estimateWithCalculations.laborCost).toBe(expectedLaborCost);
      expect(estimateWithCalculations.overheadCost).toBe(expectedOverhead);
      expect(estimateWithCalculations.profitCost).toBe(expectedProfit);
      expect(estimateWithCalculations.totalCost).toBe(expectedTotal);
    });

    it('should handle zero quantities and prices', async () => {
      await prismaService.estimateItem.create({
        data: {
          estimateId,
          name: 'Zero cost item',
          unit: 'шт',
          quantity: 0,
          unitPrice: 1000,
          laborHours: 0,
        },
      });

      const estimate = await estimateService.findOne(estimateId);

      expect(estimate.materialCost).toBe(0);
      expect(estimate.laborCost).toBe(0);
      expect(estimate.totalCost).toBe(0);
    });
  });

  describe('Performance & Caching', () => {
    let userId: string;
    let projectId: string;

    beforeEach(async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'perf-test@example.com',
          passwordHash: 'hash',
          firstName: 'Perf',
          lastName: 'Tester',
        },
      });
      userId = user.id;

      const project = await prismaService.project.create({
        data: {
          name: 'Performance Test Project',
          description: 'Test project for performance',
          status: 'PLANNING',
          createdById: userId,
        },
      });
      projectId = project.id;
    });

    it('should handle bulk estimate creation efficiently', async () => {
      const startTime = Date.now();
      const estimateCount = 20;

      const createPromises = Array.from({ length: estimateCount }, (_, i) =>
        estimateService.create(
          {
            name: `Bulk Estimate ${i + 1}`,
            description: `Bulk test estimate ${i + 1}`,
            projectId,
            currency: 'RUB',
            laborCostPerHour: 1500,
            overheadPercentage: 15,
            profitPercentage: 10,
          },
          userId
        )
      );

      await Promise.all(createPromises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Проверяем производительность
      expect(duration).toBeLessThan(10000); // 10 секунд для 20 смет

      // Проверяем, что все сметы созданы
      const estimatesCount = await prismaService.estimate.count({
        where: { projectId },
      });
      expect(estimatesCount).toBe(estimateCount);
    });

    it('should cache estimate calculations', async () => {
      const estimate = await estimateService.create(
        {
          name: 'Cache Test Estimate',
          description: 'Test caching',
          projectId,
          currency: 'RUB',
          laborCostPerHour: 2000,
          overheadPercentage: 15,
          profitPercentage: 10,
        },
        userId
      );

      // Добавляем позицию для расчетов
      await prismaService.estimateItem.create({
        data: {
          estimateId: estimate.id,
          name: 'Cache test item',
          unit: 'шт',
          quantity: 100,
          unitPrice: 1000,
          laborHours: 50,
        },
      });

      // Первый запрос (должен вычислить и закешировать)
      const startTime1 = Date.now();
      const result1 = await estimateService.findOne(estimate.id);
      const duration1 = Date.now() - startTime1;

      // Второй запрос (должен вернуть из кеша)
      const startTime2 = Date.now();
      const result2 = await estimateService.findOne(estimate.id);
      const duration2 = Date.now() - startTime2;

      // Результаты должны быть одинаковыми
      expect(result1.totalCost).toBe(result2.totalCost);
      expect(result1.materialCost).toBe(result2.materialCost);
      expect(result1.laborCost).toBe(result2.laborCost);

      // Второй запрос должен быть быстрее (из кеша)
      expect(duration2).toBeLessThanOrEqual(duration1);
    });
  });

  describe('Database Constraints & Relationships', () => {
    let userId: string;
    let projectId: string;

    beforeEach(async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'constraint-test@example.com',
          passwordHash: 'hash',
          firstName: 'Constraint',
          lastName: 'Tester',
        },
      });
      userId = user.id;

      const project = await prismaService.project.create({
        data: {
          name: 'Constraint Test Project',
          description: 'Test project for constraints',
          status: 'PLANNING',
          createdById: userId,
        },
      });
      projectId = project.id;
    });

    it('should enforce foreign key constraints', async () => {
      const nonExistentProjectId = 'non-existent-project-id';

      await expect(
        estimateService.create(
          {
            name: 'Invalid Project Estimate',
            description: 'Should fail',
            projectId: nonExistentProjectId,
            currency: 'RUB',
            laborCostPerHour: 1500,
            overheadPercentage: 15,
            profitPercentage: 10,
          },
          userId
        )
      ).rejects.toThrow();
    });

    it('should cascade delete estimate items when estimate is deleted', async () => {
      // Создаем смету
      const estimate = await estimateService.create(
        {
          name: 'Cascade Test Estimate',
          description: 'Test cascade delete',
          projectId,
          currency: 'RUB',
          laborCostPerHour: 1500,
          overheadPercentage: 15,
          profitPercentage: 10,
        },
        userId
      );

      // Добавляем позиции
      await prismaService.estimateItem.createMany({
        data: [
          {
            estimateId: estimate.id,
            name: 'Item 1',
            unit: 'шт',
            quantity: 10,
            unitPrice: 100,
            laborHours: 5,
          },
          {
            estimateId: estimate.id,
            name: 'Item 2',
            unit: 'м',
            quantity: 20,
            unitPrice: 50,
            laborHours: 10,
          },
        ],
      });

      // Проверяем, что позиции созданы
      const itemsBefore = await prismaService.estimateItem.count({
        where: { estimateId: estimate.id },
      });
      expect(itemsBefore).toBe(2);

      // Удаляем смету
      await estimateService.remove(estimate.id);

      // Проверяем, что позиции тоже удалились
      const itemsAfter = await prismaService.estimateItem.count({
        where: { estimateId: estimate.id },
      });
      expect(itemsAfter).toBe(0);
    });

    it('should handle concurrent estimate operations', async () => {
      const estimateName = 'Concurrent Test Estimate';

      // Создаем смету
      const estimate = await estimateService.create(
        {
          name: estimateName,
          description: 'Test concurrent operations',
          projectId,
          currency: 'RUB',
          laborCostPerHour: 1500,
          overheadPercentage: 15,
          profitPercentage: 10,
        },
        userId
      );

      // Запускаем одновременные обновления
      const updatePromises = [
        estimateService.update(estimate.id, { name: 'Updated Name 1' }),
        estimateService.update(estimate.id, { name: 'Updated Name 2' }),
        estimateService.update(estimate.id, { description: 'Updated Description' }),
      ];

      const results = await Promise.allSettled(updatePromises);

      // Все операции должны завершиться (успешно или с ошибкой)
      expect(results).toHaveLength(3);

      // Проверяем финальное состояние в БД
      const finalEstimate = await prismaService.estimate.findUnique({
        where: { id: estimate.id },
      });
      expect(finalEstimate).toBeDefined();
      expect(finalEstimate.name).toBeDefined();
    });
  });
});
