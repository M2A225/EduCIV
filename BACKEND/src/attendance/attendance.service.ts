import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceSessionRepository } from './attendance-session.repository';
import { AttendanceRepository } from './attendance.repository';
import { TimetablesRepository } from '../timetables/timetables.repository';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly sessionsRepo: AttendanceSessionRepository,
    private readonly attendanceRepo: AttendanceRepository,
    private readonly timetableRepo: TimetablesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createSession(dto: CreateSessionDto) {
    const timetable = await this.timetableRepo.findOne({
      where: { id: dto.timetable_id },
    });
    if (!timetable) throw new NotFoundException('Créneau horaire introuvable');

    const existing = await this.sessionsRepo.findOne({
      where: {
        class_id: dto.class_id,
        subject_id: dto.subject_id,
        date: dto.date,
        ...(dto.school_id && { school_id: dto.school_id }),
      },
    });
    if (existing) return existing;

    return this.sessionsRepo.create({
      ...dto,
      date: dto.date,
      teacher_id: timetable.teacher_id,
    });
  }

  async markAttendance(sessionId: number, dto: MarkAttendanceDto) {
    const session = await this.sessionsRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session introuvable');

    const existing = await this.attendanceRepo.findOne({
      where: { session_id: sessionId, student_id: dto.student_id },
    });

    if (existing) {
      const updated = await this.prisma.attendance.updateMany({
        where: { id: existing.id, version: existing.version },
        data: { status: dto.status, version: existing.version + 1 },
      });
      if (updated.count === 0) {
        throw new ConflictException('Présence modifiée par une autre requête');
      }
      return this.attendanceRepo.findOne({ where: { id: existing.id } });
    }

    return this.attendanceRepo.create({
      student_id: dto.student_id,
      status: dto.status,
      session_id: sessionId,
      version: 1,
    });
  }

  async getSession(id: number) {
    return this.sessionsRepo.findOne({ where: { id } });
  }

  async getAttendancesForSession(sessionId: number) {
    return this.attendanceRepo.find({
      where: { session_id: sessionId },
    });
  }

  async listSessions(page = 1, pageSize = 20) {
    return this.sessionsRepo.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { class: true, subject: true, teacher: true },
      orderBy: { date: 'desc' },
    });
  }

  async list(page = 1, pageSize = 20) {
    return this.attendanceRepo.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { session: true },
      orderBy: { created_at: 'desc' },
    });
  }
}
