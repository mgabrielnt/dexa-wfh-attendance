import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { JwtPayload, Role } from '@app/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => context.switchToHttp().getRequest().user,
);
