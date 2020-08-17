import { Role } from '../../modules/user/interface/user.interface';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../guards/role.guard';

export function AuthRole(...roles: Role[]) {
  return applyDecorators(SetMetadata('role', roles), UseGuards(RoleGuard));
}
