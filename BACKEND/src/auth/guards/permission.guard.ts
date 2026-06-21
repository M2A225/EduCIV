import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SCOPE_SCHOOL_KEY } from '../decorators/scope-school.decorator';
import { PrismaService } from '../../core/prisma.service';
import { RequestWithUser } from '../types';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Non authentifié');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Permissions insuffisantes');
    }

    if (user.role === 'BACKOFFICE') {
      return true;
    }

    const scopeSchoolMeta = this.reflector.getAllAndOverride<{ source: string; key?: string } | undefined>(
      SCOPE_SCHOOL_KEY,
      [context.getHandler(), context.getClass()],
    );

    let targetSchoolId: number | null = null;

    if (scopeSchoolMeta) {
      const { source, key } = scopeSchoolMeta;
      if (source === 'param' && key) {
        targetSchoolId = parseInt(request.params[key], 10);
      } else if (source === 'query' && key) {
        targetSchoolId = parseInt(request.query[key], 10);
      } else if (source === 'body' && key) {
        targetSchoolId = parseInt(request.body[key] as string, 10);
      } else if (source === 'user') {
        targetSchoolId = user.primary_school_id ?? user.currentSchoolId ?? null;
      } else {
        targetSchoolId = user.currentSchoolId ?? null;
      }
    } else {
      targetSchoolId = user.currentSchoolId ?? null;
    }

    if (targetSchoolId != null && !isNaN(targetSchoolId)) {
      if (user.school_ids?.includes(targetSchoolId)) {
        return true;
      }

      const activeScope = user.scope_by_role?.[user.role];
      const hasGroupScope = activeScope === 'GROUP';
      if (hasGroupScope) {
        const school = await this.prisma.school.findUnique({
          where: { id: targetSchoolId },
          select: { school_group_id: true },
        });

        if (school?.school_group_id) {
          const groupSchools = await this.prisma.school.findMany({
            where: { school_group_id: school.school_group_id },
            select: { id: true },
          });
          const groupSchoolIds = groupSchools.map((s) => s.id);

          if (groupSchoolIds.includes(targetSchoolId)) {
            user.school_ids = [
              ...new Set([...(user.school_ids || []), ...groupSchoolIds]),
            ];
            return true;
          }
        }
      }

      throw new ForbiddenException('Accès refusé à cette école');
    }

    return true;
  }
}
