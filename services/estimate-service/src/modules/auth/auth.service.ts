import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoleContexts: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (user && user.passwordHash && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.userRoleContexts.map((urc: any) => urc.role.name),
      permissions: user.userRoleContexts.flatMap((urc: any) =>
        urc.role.rolePermissions.map((rp: any) => `${rp.permission.resource}:${rp.permission.action}`)
      ),
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.userRoleContexts.map((urc: any) => urc.role.name),
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      },
    });

    // Назначаем базовую роль пользователю
    const userRole = await this.prisma.role.findUnique({
      where: { name: 'VIEWER' },
    });

    if (userRole) {
      await this.prisma.userRoleContext.create({
        data: {
          userId: user.id,
          roleId: userRole.id,
        },
      });
    }

    return this.login({ email: user.email, password: registerDto.password });
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Проверяем refresh token в БД
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          expiresAt: { gt: new Date() },
          revokedAt: null,
        },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Недействительный refresh token');
      }

      // Верифицируем JWT refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET') + '_refresh',
      });

      if (payload.type !== 'refresh' || payload.sub !== storedToken.userId) {
        throw new UnauthorizedException('Недействительный refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userRoleContexts: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: user.userRoleContexts.map((urc: any) => urc.role.name),
        permissions: user.userRoleContexts.flatMap((urc: any) =>
          urc.role.rolePermissions.map((rp: any) => `${rp.permission.resource}:${rp.permission.action}`)
        ),
      };

      const accessToken = await this.jwtService.signAsync(newPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Недействительный refresh token');
    }
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
        secret: this.configService.get<string>('JWT_SECRET') + '_refresh',
      }
    );

    // Сохраняем refresh token в БД
    await this.saveRefreshToken(userId, refreshToken);
    return refreshToken;
  }

  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });
  }

  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoleContexts: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return user;
  }
}
