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
    const data = (await this.attendanceService.createSession(body)) as Record<
      string,
      unknown
    >;
    return { success: true as const, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':id')
  async mark(@Param('id') id: string, @Body() body: MarkAttendanceDto) {
    const data = (await this.attendanceService.markAttendance(
      Number(id),
      body,
    )) as Record<string, unknown>;
    return { success: true as const, data, error: null };
  }

  @Get('session/:id')
  async getSession(@Param('id') id: string) {
    const sessionId = Number(id);
    const session = (await this.attendanceService.getSession(
      sessionId,
    )) as Record<string, unknown>;
    const attendances = (await this.attendanceService.getAttendancesForSession(
      sessionId,
    )) as Array<Record<string, unknown>>;
    return {
      success: true as const,
      data: { session, attendances },
      error: null,
    };
  }

  @Get('sessions')
  async listSessions(@Query() q: PaginationDto) {
    const sessions = (await this.attendanceService.listSessions(
      q.page,
      q.pageSize,
    )) as Array<Record<string, unknown>>;
    return { success: true as const, data: sessions, error: null };
  }

  @Get()
  async list(@Query() q: PaginationDto) {
    const records = (await this.attendanceService.list(
      q.page,
      q.pageSize,
    )) as Array<Record<string, unknown>>;
    return { success: true, data: records, error: null };
  }
}
