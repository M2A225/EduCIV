import { Injectable, NotFoundException } from '@nestjs/common';
import { TeacherSubjectsRepository } from './teacher-subjects.repository';
import { CreateTeacherSubjectDto } from './dto/create-teacher-subject.dto';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class TeacherSubjectsService {
  constructor(
    private readonly repo: TeacherSubjectsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateTeacherSubjectDto) {
    const [teacher, subject, class_] = await Promise.all([
      this.prisma.teacher.findUnique({ where: { id: dto.teacher_id } }),
      this.prisma.subject.findUnique({ where: { id: dto.subject_id } }),
      this.prisma.class.findUnique({ where: { id: dto.class_id } }),
    ]);
    if (!teacher)
      throw new NotFoundException(`Enseignant #${dto.teacher_id} introuvable`);
    if (!subject)
      throw new NotFoundException(`Matière #${dto.subject_id} introuvable`);
    if (!class_)
      throw new NotFoundException(`Classe #${dto.class_id} introuvable`);
    return this.repo.create(dto);
  }

  async list() {
    return this.repo.find({
      include: { teacher: true, subject: true, class: true },
      orderBy: [{ teacher_id: 'asc' }, { subject_id: 'asc' }],
    });
  }

  async getByTeacher(teacherId: number) {
    return this.repo.find({
      where: { teacher_id: teacherId },
      include: { subject: true, class: true },
      orderBy: { subject_id: 'asc' },
    });
  }

  async getMyAssignments(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user?.email) return [];

    const teacher = await this.prisma.teacher.findFirst({
      where: { email: user.email },
    });
    if (!teacher) return [];

    return this.repo.find({
      where: { teacher_id: teacher.id },
      include: { subject: true, class: true },
      orderBy: { subject_id: 'asc' },
    });
  }

  async delete(id: number) {
    const assignment = await this.repo.findOne({ where: { id } });
    if (!assignment)
      throw new NotFoundException('Affectation matière-enseignant introuvable');
    return this.repo.delete(id);
  }
}
