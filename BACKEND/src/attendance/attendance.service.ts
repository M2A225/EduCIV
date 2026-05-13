import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceSessionRepository } from './attendance-session.repository';
import { AttendanceRepository } from './attendance.repository';
import { TimetablesRepository } from '../timetables/timetables.repository';

@Injectable()
export class AttendanceService {
	constructor(
		private readonly sessionsRepo: AttendanceSessionRepository,
		private readonly attendanceRepo: AttendanceRepository,
		private readonly timetableRepo: TimetablesRepository,
	) {}

	async createSession(dto: CreateSessionDto) {
		const timetable = await this.timetableRepo.findOne({
			where: { id: dto.timetable_id }
		});
		if (!timetable) throw new NotFoundException('Timetable slot not found');

		const existing = await this.sessionsRepo.findOne({
			where: {
				class_id: dto.class_id,
				subject_id: dto.subject_id,
				date: dto.date,
			} as any
		});
		if (existing) return existing;

		return this.sessionsRepo.create({
			...dto,
			date: dto.date,
			teacher_id: timetable.teacher_id,
		});
	}

	async markAttendance(sessionId: number, dto: MarkAttendanceDto) {
		const session = await this.sessionsRepo.findOne({ where: { id: sessionId } as any });
		if (!session) throw new NotFoundException('Session not found');

		const existing = await this.attendanceRepo.findOne({
			where: { session_id: sessionId, student_id: dto.student_id } as any
		});

		if (existing) {
			return this.attendanceRepo.update(existing.id, {
				status: dto.status,
				version: existing.version + 1
			});
		}

		return this.attendanceRepo.create({
			student_id: dto.student_id,
			status: dto.status,
			session_id: sessionId,
			version: 1
		});
	}

	async getSession(id: number) {
		return this.sessionsRepo.findOne({ where: { id } as any });
	}

	async getAttendancesForSession(sessionId: number) {
		return this.attendanceRepo.find({ where: { session_id: sessionId } as any });
	}
}
