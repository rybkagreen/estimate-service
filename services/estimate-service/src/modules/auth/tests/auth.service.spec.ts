import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../../prisma/prisma.service';
import { AuthService } from '../auth.service';

// Mock bcrypt
jest.mock('bcryptjs');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    passwordHash: 'hashed-password',
    userRoleContexts: [
      {
        role: {
          name: 'VIEWER',
          rolePermissions: [
            {
              permission: {
                resource: 'ESTIMATE',
                action: 'READ',
              },
            },
          ],
        },
      },
    ],
    lastLogin: new Date(),
  };

  beforeEach(async () => {
    // Create proper mocks for Prisma methods
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
    } as any;

    const mockJwtService = {
      sign: jest.fn(),
      signAsync: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Setup default config mocks
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '1h',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return config[key] || defaultValue;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
    });

    it('should return null if user does not exist', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({
        id: 'refresh-token-id',
        token: 'refresh-token',
        expiresAt: new Date(),
      });
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await service.login('test@example.com', 'password');

      expect(result).toEqual(mockTokens);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login('test@example.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should create a new user and return tokens', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({
        id: 'refresh-token-id',
        token: 'refresh-token',
        expiresAt: new Date(),
      });
      (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw BadRequestException if user already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens for valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockRefreshToken = {
        id: 'refresh-token-id',
        token: refreshToken,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        user: mockUser,
      };

      prismaService.refreshToken.findFirst.mockResolvedValue(mockRefreshToken);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce('new-access-token').mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshTokens(refreshToken);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      prismaService.refreshToken.findFirst.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should invalidate refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockRefreshToken = {
        id: 'refresh-token-id',
        token: refreshToken,
        userId: mockUser.id,
        expiresAt: new Date(),
      };

      prismaService.refreshToken.findFirst.mockResolvedValue(mockRefreshToken);
      prismaService.refreshToken.delete = jest.fn().mockResolvedValue(mockRefreshToken);

      await service.logout(refreshToken);

      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: mockRefreshToken.id },
      });
    });

    it('should handle invalid refresh token gracefully', async () => {
      prismaService.refreshToken.findFirst.mockResolvedValue(null);

      await expect(service.logout('invalid-token')).resolves.not.toThrow();
    });
  });
});

    const mockJwtService = {
      sign: jest.fn(),
      signAsync: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Setup default config mocks
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '1h',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return config[key] || defaultValue;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeDefined();
      expect(result.passwordHash).toBeUndefined();
      expect(result.email).toBe('test@example.com');
    });

    it('should return null if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return auth response with tokens', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({} as any);
      mockBcrypt.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('access-token');
      jwtService.sign.mockReturnValue('refresh-token');

      const loginDto = { email: 'test@example.com', password: 'password' };
      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          roles: ['VIEWER'],
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const loginDto = { email: 'test@example.com', password: 'wrong-password' };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create new user and return auth response', async () => {
      prismaService.user.findUnique.mockResolvedValue(null); // User doesn't exist
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);
      prismaService.refreshToken.create.mockResolvedValue({} as any);
      mockBcrypt.hash.mockResolvedValue('hashed-password');
      mockBcrypt.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('access-token');
      jwtService.sign.mockReturnValue('refresh-token');

      const registerDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await service.register(registerDto);

      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password', 12);
    });

    it('should throw BadRequestException if user already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const registerDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      };

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshToken', () => {
    it('should return new access token for valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const storedToken = {
        token: refreshToken,
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 86400000), // Tomorrow
        revokedAt: null,
        user: mockUser,
      };

      prismaService.refreshToken.findFirst.mockResolvedValue(storedToken);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      jwtService.verify.mockReturnValue({ sub: 'user-1', type: 'refresh' });
      jwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refreshToken(refreshToken);

      expect(result.accessToken).toBe('new-access-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      prismaService.refreshToken.findFirst.mockResolvedValue(null);

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
