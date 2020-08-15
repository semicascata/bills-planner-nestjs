import {
  Injectable,
  CanActivate,
  Logger,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../modules/user/interface/user.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  private logger = new Logger('RoleGuard');

  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('role', ctx.getHandler());

    if (!roles || roles.length === 0) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    const matchUserRole = this.matchRole(roles, user.role);
    if (matchUserRole) {
      this.logger.verbose('User role authorized');
      return matchUserRole;
    } else {
      this.logger.error('User role not authorized');
      throw new UnauthorizedException('User role not authorized');
    }
  }

  // check user role
  private matchRole(roles: string[], userRole: Role) {
    return roles.includes(userRole);
  }
}
