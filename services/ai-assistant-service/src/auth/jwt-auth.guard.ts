import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // В development режиме можно временно отключить проверку
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
      const request = context.switchToHttp().getRequest();
      // Добавляем фиктивного пользователя для разработки
      request.user = {
        id: 'dev-user-id',
        email: 'dev@example.com',
        role: 'admin',
      };
      return true;
    }

    return super.canActivate(context);
  }
}
