import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithUser } from '../types';

export const CurrentSchool = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const school_id = request.user?.school_id;
    if (!school_id) {
      throw new UnauthorizedException('School ID not found in token');
    }
    return school_id;
  },
);
