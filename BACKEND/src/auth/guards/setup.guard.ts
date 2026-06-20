import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';

@Injectable()
export class SetupGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user || !['DIRECTOR', 'ACCOUNTANT'].includes(user.role)) {
      return true;
    }

    const path: string = req.route?.path || '';
    const whitelist = [
      '/auth/',
      '/setup',
      '/cities',
      '/schools/setup-status',
      '/schools/complete-setup',
      '/schools/levels',
      '/schools/levels/defaults',
    ];
    if (whitelist.some((w) => path.includes(w))) {
      return true;
    }

    const schoolId =
      user.currentSchoolId || user.primary_school_id || user.school_ids?.[0];
    if (!schoolId) return true;

    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { director_setup_at: true, accountant_setup_at: true },
    });

    if (!school) return true;

    if (user.role === 'DIRECTOR' && !school.director_setup_at) {
      throw new ForbiddenException(
        "Configuration initiale requise. Veuillez finaliser la configuration de votre école via l'assistant de configuration.",
      );
    }

    if (
      user.role === 'ACCOUNTANT' &&
      (!school.director_setup_at || !school.accountant_setup_at)
    ) {
      throw new ForbiddenException(
        'Configuration initiale requise. Veuillez finaliser la configuration financière.',
      );
    }

    return true;
  }
}
