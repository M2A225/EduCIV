import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeacherSubjectsGuard } from '../auth/guards/teacher-subjects.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard, TeacherSubjectsGuard)
export class AttendanceController {
	constructor(private readonly attendanceService: AttendanceService) {}

	@Post('session')
	async createSession(@Body() body: CreateSessionDto) {
		const s = await this.attendanceService.createSession(body);
		return { success: true, data: s, error: null };
	}

	@Post(':id')
	async mark(@Param('id') id: string, @Body() body: MarkAttendanceDto) {
		const a = await this.attendanceService.markAttendance(Number(id), body);
		return { success: true, data: a, error: null };
	}

	@Get('session/:id')
	async getSession(@Param('id') id: string) {
		const s = await this.attendanceService.getSession(Number(id));
		const at = await this.attendanceService.getAttendancesForSession(Number(id));
		return { success: true, data: { session: s, attendances: at }, error: null };
	}
}
