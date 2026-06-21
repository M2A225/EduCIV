import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { TimetablesRepository } from './timetables.repository';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class TimetablesService {
  constructor(
    private readonly timetablesRepo: TimetablesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateTimetableDto) {
    const [subject, teacher, class_] = await Promise.all([
      this.prisma.subject.findUnique({ where: { id: dto.subject_id } }),
      this.prisma.teacher.findUnique({ where: { id: dto.teacher_id } }),
      this.prisma.class.findUnique({ where: { id: dto.class_id } }),
    ]);
    if (!subject)
      throw new NotFoundException(`Matière #${dto.subject_id} introuvable`);
    if (!teacher)
      throw new NotFoundException(`Enseignant #${dto.teacher_id} introuvable`);
    if (!class_)
      throw new NotFoundException(`Classe #${dto.class_id} introuvable`);

    const conflicts = await this.timetablesRepo.findMany({
      where: { slot: dto.slot },
    });
    const conflict = conflicts.find(
      (c) =>
        Number(c.teacher_id) === Number(dto.teacher_id) ||
        Number(c.class_id) === Number(dto.class_id),
    );
    if (conflict) {
      throw new ConflictException("Conflit d'emploi du temps");
    }
    return this.timetablesRepo.create(dto);
  }

  async list(page = 1, pageSize = 100, classId?: number, teacherId?: number) {
    const where: Record<string, number> = {};
    if (classId) where.class_id = classId;
    if (teacherId) where.teacher_id = teacherId;

    return this.timetablesRepo.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        class: true,
        teacher: true,
        subject: true,
      },
    });
  }
}
