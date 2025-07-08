import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { AuthService } from '../../src/modules/auth/auth.service';
import { CreateUserDto } from '../../src/modules/auth/dto/create-user.dto';
import { LoginDto } from '../../src/modules/auth/dto/login.dto';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('AuthModule Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let prismaService: PrismaService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        PrismaModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET') || 'test-secret',
            signOptions: { expiresIn: '15m' },
          }),
          inject: [ConfigService],
        }),
        AuthModule,
      ],
    }).compile();

    moduleRef = module;
    app = module.createNestApplication();
    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);

    await app.init();
  });

  beforeEach(async () => {
    // Очистка тестовых данных
    await prismaService.refreshToken.deleteMany();
    await prismaService.userRoleContext.deleteMany();
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    // Финальная очистка
    await prismaService.refreshToken.deleteMany();
    await prismaService.userRoleContext.deleteMany();
    await prismaService.user.deleteMany();
    await app.close();
    await moduleRef.close();
  });

  describe('User Registration & Authentication', () => {
    it('should successfully register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await authService.register(createUserDto);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(createUserDto.email);
      expect(result.user.firstName).toBe(createUserDto.firstName);
      expect(result.user.lastName).toBe(createUserDto.lastName);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      // Проверяем, что пользователь создан в БД
      const dbUser = await prismaService.user.findUnique({
        where: { email: createUserDto.email },
      });
      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe(createUserDto.email);
    });

    it('should fail to register user with duplicate email', async () => {
      const createUserDto: CreateUserDto = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Первая регистрация должна пройти успешно
      await authService.register(createUserDto);

      // Вторая регистрация с тем же email должна провалиться
      await expect(authService.register(createUserDto)).rejects.toThrow();
    });

    it('should successfully login with correct credentials', async () => {
      const createUserDto: CreateUserDto = {
        email: 'login@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      // Сначала регистрируем пользователя
      await authService.register(createUserDto);

      // Затем логинимся
      const loginDto: LoginDto = {
        email: createUserDto.email,
        password: createUserDto.password,
      };

      const result = await authService.login(loginDto);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(loginDto.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should fail to login with incorrect password', async () => {
      const createUserDto: CreateUserDto = {
        email: 'wrongpass@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await authService.register(createUserDto);

      const loginDto: LoginDto = {
        email: createUserDto.email,
        password: 'wrongpassword',
      };

      await expect(authService.login(loginDto)).rejects.toThrow();
    });
  });

  describe('Token Management', () => {
    let userId: string;
    let refreshToken: string;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        email: 'tokentest@example.com',
        password: 'password123',
        firstName: 'Token',
        lastName: 'Test',
      };

      const result = await authService.register(createUserDto);
      userId = result.user.id;
      refreshToken = result.refreshToken;
    });

    it('should successfully refresh access token', async () => {
      const result = await authService.refreshToken(refreshToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.id).toBe(userId);
    });

    it('should fail to refresh with invalid token', async () => {
      const invalidToken = 'invalid-refresh-token';

      await expect(authService.refreshToken(invalidToken)).rejects.toThrow();
    });

    it('should successfully logout and invalidate refresh token', async () => {
      await authService.logout(refreshToken);

      // Попытка использовать токен после logout должна провалиться
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow();
    });
  });

  describe('User Profile Management', () => {
    let userId: string;
    let accessToken: string;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        email: 'profile@example.com',
        password: 'password123',
        firstName: 'Profile',
        lastName: 'Test',
      };

      const result = await authService.register(createUserDto);
      userId = result.user.id;
      accessToken = result.accessToken;
    });

    it('should successfully get user profile', async () => {
      const profile = await authService.getProfile(userId);

      expect(profile).toBeDefined();
      expect(profile.id).toBe(userId);
      expect(profile.email).toBe('profile@example.com');
      expect(profile.firstName).toBe('Profile');
      expect(profile.lastName).toBe('Test');
    });

    it('should successfully update user profile', async () => {
      const updateData = {
        firstName: 'UpdatedProfile',
        lastName: 'UpdatedTest',
        bio: 'Updated bio',
      };

      const updatedProfile = await authService.updateProfile(userId, updateData);

      expect(updatedProfile.firstName).toBe(updateData.firstName);
      expect(updatedProfile.lastName).toBe(updateData.lastName);

      // Проверяем, что изменения сохранились в БД
      const dbUser = await prismaService.user.findUnique({
        where: { id: userId },
      });
      expect(dbUser.firstName).toBe(updateData.firstName);
      expect(dbUser.lastName).toBe(updateData.lastName);
    });
  });

  describe('Database Constraints & Validation', () => {
    it('should enforce email uniqueness at database level', async () => {
      const email = 'unique@example.com';

      // Создаем пользователя напрямую через Prisma
      await prismaService.user.create({
        data: {
          email,
          passwordHash: 'hashed-password',
          firstName: 'First',
          lastName: 'User',
        },
      });

      // Попытка создать второго пользователя с тем же email
      await expect(
        prismaService.user.create({
          data: {
            email,
            passwordHash: 'another-hash',
            firstName: 'Second',
            lastName: 'User',
          },
        })
      ).rejects.toThrow();
    });

    it('should handle concurrent registrations gracefully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'concurrent@example.com',
        password: 'password123',
        firstName: 'Concurrent',
        lastName: 'Test',
      };

      // Запускаем две одновременные регистрации
      const promises = [
        authService.register(createUserDto),
        authService.register(createUserDto),
      ];

      const results = await Promise.allSettled(promises);

      // Одна должна пройти успешно, другая - провалиться
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
    });
  });

  describe('Performance & Resource Management', () => {
    it('should handle bulk user creation efficiently', async () => {
      const startTime = Date.now();
      const userCount = 10;

      const createPromises = Array.from({ length: userCount }, (_, i) =>
        authService.register({
          email: `bulk${i}@example.com`,
          password: 'password123',
          firstName: `User${i}`,
          lastName: 'Bulk',
        })
      );

      await Promise.all(createPromises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Проверяем, что операция завершилась за разумное время
      expect(duration).toBeLessThan(5000); // 5 секунд для 10 пользователей

      // Проверяем, что все пользователи созданы
      const usersCount = await prismaService.user.count({
        where: {
          email: {
            startsWith: 'bulk',
          },
        },
      });
      expect(usersCount).toBe(userCount);
    });

    it('should clean up expired refresh tokens', async () => {
      // Создаем пользователя
      const result = await authService.register({
        email: 'cleanup@example.com',
        password: 'password123',
        firstName: 'Cleanup',
        lastName: 'Test',
      });

      // Искусственно создаем просроченный токен
      await prismaService.refreshToken.create({
        data: {
          token: 'expired-token',
          userId: result.user.id,
          expiresAt: new Date(Date.now() - 1000), // Просрочен на 1 секунду
        },
      });

      // Проверяем, что метод очистки работает
      await authService.cleanupExpiredTokens();

      const expiredToken = await prismaService.refreshToken.findFirst({
        where: { token: 'expired-token' },
      });

      expect(expiredToken).toBeNull();
    });
  });
});
