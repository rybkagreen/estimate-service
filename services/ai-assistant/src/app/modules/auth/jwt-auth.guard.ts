import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // В development режиме можно временно отключить проверку
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      return true;
    }
    
    return super.canActivate(context);
  }
}
