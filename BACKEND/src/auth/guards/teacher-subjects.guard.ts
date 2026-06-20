import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';
import { getCurrentSchoolId } from '../../common/school-context';

@Injectable()
export class TeacherSubjectsGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    const school_id = getCurrentSchoolId(request);
    const class_id = request.body?.class_id || request.query?.class_id;
    const subject_id = request.body?.subject_id || request.query?.subject_id;

    if (!class_id || !subject_id) return true;

    const assignment = await this.prisma.teacherSubject.findFirst({
      where: {
        teacher_id: Number(user.userId),
        class_id: Number(class_id),
        subject_id: Number(subject_id),
        school_id,
      },
    });

    if (!assignment) {
      throw new ForbiddenException(
        "L'enseignant n'est pas assigné à cette classe et matière.",
      );
    }

    return true;
  }
}
