import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: number;
  role: string;
  school_ids?: number[];
  primary_school_id?: number;
  roles?: string[];
  scope_by_role?: Record<string, string>;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    const systemRoles = ['BACKOFFICE'];
    const isSystemRole = systemRoles.includes(payload.role);
    if (
      !isSystemRole &&
      (!payload.school_ids || payload.school_ids.length === 0)
    ) {
      throw new UnauthorizedException('Invalid token: no schools assigned');
    }
    return {
      userId: payload.sub,
      school_ids: payload.school_ids,
      primary_school_id: payload.primary_school_id,
      role: payload.role,
      roles: payload.roles || [payload.role],
      scope_by_role: payload.scope_by_role || { [payload.role]: 'SCHOOL' },
    };
  }
}
