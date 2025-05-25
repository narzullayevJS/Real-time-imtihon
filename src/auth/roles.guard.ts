import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/entities/User.entity';

@Injectable()
export class UserRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const gqlContext = GqlExecutionContext.create(context);
    const allowedRoles =
      this.reflector.get<string[]>('roles', gqlContext.getHandler()) ?? [];

    if (!allowedRoles.length) return true;

    const requestContext = gqlContext.getContext();
    const user: User = requestContext.req?.user;

    if (!user) {
      throw new ForbiddenException('Authentication required to proceed.');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}.`,
      );
    }

    return true;
  }
}
