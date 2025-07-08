import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.userRoleContexts) {
      return false;
    }

    const userPermissions = user.userRoleContexts.flatMap((urc: any) =>
      urc.role.rolePermissions.map((rp: any) => `${rp.permission.resource}:${rp.permission.action}`)
    );

    return requiredPermissions.every((permission) => userPermissions.includes(permission));
  }
}
