import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
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
