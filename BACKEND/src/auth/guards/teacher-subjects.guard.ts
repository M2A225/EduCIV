import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TeacherSubject } from '../../entities/teacher_subject.entity';

@Injectable()
export class TeacherSubjectsGuard implements CanActivate {
  constructor(private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // We expect class_id and subject_id in the body for POST requests 
    // or as query params for GET requests.
    const class_id = request.body?.class_id || request.query?.class_id;
    const subject_id = request.body?.subject_id || request.query?.subject_id;

    if (!user) return false;
    
    // If no class/subject info is provided, we might be on a general endpoint.
    // For specific attendance actions, they must be provided.
    if (!class_id || !subject_id) return true; 

    const assignment = await this.dataSource.getRepository(TeacherSubject).findOne({
      where: {
        teacher_id: String(user.userId),
        class_id: String(class_id),
        subject_id: String(subject_id),
        school_id: user.school_id,
      },
    });

    if (!assignment) {
      throw new ForbiddenException('Teacher is not assigned to this class and subject.');
    }

    return true;
  }
}
