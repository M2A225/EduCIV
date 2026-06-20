import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeacherSubjectsGuard } from '../auth/guards/teacher-subjects.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard, TeacherSubjectsGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('session')
  async createSession(@Body() body: CreateSessionDto) {
    return { success: true as const, data: await this.attendanceService.createSession(body), error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':id')
  async mark(@Param('id') id: string, @Body() body: MarkAttendanceDto) {
    return { success: true as const, data: await this.attendanceService.markAttendance(Number(id), body), error: null };
  }

  @Get('session/:id')
  async getSession(@Param('id') id: string) {
    const sessionId = Number(id);
    const [s, at] = await Promise.all([
      this.attendanceService.getSession(sessionId),
      this.attendanceService.getAttendancesForSession(sessionId),
    ]);
    return {
      success: true as const,
      data: { session: s, attendances: at },
      error: null,
    };
  }

  @Get('sessions')
  async listSessions(@Query() q: PaginationDto) {
    const sessions = await this.attendanceService.listSessions(
      q.page,
      q.pageSize,
    );
    return { success: true as const, data: sessions, error: null };
  }

  @Get()
  async list(@Query() q: PaginationDto) {
    const records = await this.attendanceService.list(q.page, q.pageSize);
    return { success: true, data: records, error: null };
  }
}
