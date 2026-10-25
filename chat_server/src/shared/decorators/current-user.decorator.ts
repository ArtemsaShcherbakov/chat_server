import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface AuthUser {
  id: number;
  name: string;
}

type AuthRequest = Request & { user: AuthUser };

function getCurrentUser(_data: unknown, context: ExecutionContext): AuthUser {
  return context.switchToHttp().getRequest<AuthRequest>().user;
}

// Reads the user attached by JwtStrategy; use only behind JwtAuthGuard
export const CurrentUser = createParamDecorator(getCurrentUser);
