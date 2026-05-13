import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';

@Injectable()
export class TeacherSubjectsGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    const class_id = request.body?.class_id || request.query?.class_id;
    const subject_id = request.body?.subject_id || request.query?.subject_id;

    if (!user) return false;
    if (!class_id || !subject_id) return true; 

    const assignment = await this.prisma.teacherSubject.findFirst({
      where: {
        teacher_id: Number(user.sub),
        class_id: Number(class_id),
        subject_id: Number(subject_id),
        school_id: Number(user.school_id),
      },
    });

    if (!assignment) {
      throw new ForbiddenException('Teacher is not assigned to this class and subject.');
    }

    return true;
  }
}
