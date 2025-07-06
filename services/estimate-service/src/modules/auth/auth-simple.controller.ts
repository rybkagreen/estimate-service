import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth-simple.service';
import { Public } from './decorators/auth.decorators';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { AuthResponse } from './interfaces/auth-response.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Успешная авторизация',
    type: Object,
  })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: Object,
  })
  @ApiResponse({ status: 400, description: 'Пользователь уже существует' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление access token' })
  @ApiResponse({
    status: 200,
    description: 'Token успешно обновлен',
    type: Object,
  })
  @ApiResponse({ status: 401, description: 'Недействительный refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Получение профиля текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя',
    type: Object,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getProfile() {
    return {
      id: 'demo',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
    };
  }
}
