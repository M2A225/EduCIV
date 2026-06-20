import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';
import { RequestWithUser } from '../types';

@Injectable()
export class SchoolContextGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) throw new ForbiddenException('Non authentifié');

    if (user.role === 'BACKOFFICE') {
      const headerSchoolId = request.headers['x-school-id'];
      if (headerSchoolId) {
        const schoolId = Number(headerSchoolId);
        if (!isNaN(schoolId)) {
          user.currentSchoolId = schoolId;
        }
      }
      return true;
    }

    const headerSchoolId = request.headers['x-school-id'];
    let schoolId: number | null = null;

    if (headerSchoolId) {
      schoolId = Number(headerSchoolId);
      if (isNaN(schoolId)) {
        throw new ForbiddenException('En-tête x-school-id invalide');
      }

      if (user.school_ids && user.school_ids.includes(schoolId)) {
        user.currentSchoolId = schoolId;
        return true;
      }

      const userSchools = await this.prisma.userSchool.findMany({
        where: { user_id: user.userId },
        select: { scope: true },
      });

      const hasGroupScope = userSchools.some((us) => us.scope === 'GROUP');
      if (hasGroupScope) {
        const school = await this.prisma.school.findUnique({
          where: { id: schoolId },
          select: { school_group_id: true },
        });

        if (school?.school_group_id) {
          const groupSchools = await this.prisma.school.findMany({
            where: { school_group_id: school.school_group_id },
            select: { id: true },
          });
          const groupSchoolIds = groupSchools.map((s) => s.id);

          if (groupSchoolIds.includes(schoolId)) {
            user.school_ids = [
              ...new Set([...(user.school_ids || []), ...groupSchoolIds]),
            ];
            user.currentSchoolId = schoolId;
            return true;
          }
        }
      }

      throw new ForbiddenException('Accès refusé à cette école');
    } else {
      schoolId = user.primary_school_id ?? null;
      if (!schoolId) {
        throw new ForbiddenException("Aucun contexte d'école disponible");
      }
      user.currentSchoolId = schoolId;
      return true;
    }
  }
}
